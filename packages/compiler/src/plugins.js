import fm from "front-matter";
import mustache from "mustache";
import { flatten } from "lodash";
import { TASK_TYPE, TASK_STATE } from "./taskrunner";
import { visit } from "unist-util-visit";
import { parse as svelteParse } from "svelte/compiler";

import { taskScriptSource } from "./templates";

// remark plugin: extracts `{code-cell}` and other MyST chunks, removing them from the
// markdown unless they are inline code chunks (actual processing of code chunks is handled
// in ./parseMd.jd)
export const processMyst = () => {
  return (tree) => {
    visit(tree, ["code"], (node, index, parent) => {
      if (node.lang && node.lang.startsWith("{") && node.lang.endsWith("}")) {
        // myst directives are embedded in code chunks, with squiggly braces
        const mystType = node.lang.substr(1, node.lang.length - 2);
        if (mystType === "code-cell") {
          // FIXME: assumption that language is the only metadata
          // (should also validate)
          const lang = node.meta;

          const nodeContent = fm(node.value);

          if (nodeContent && nodeContent.attributes.inline) {
            // inline node: take out the code cell parts, make them a
            // standard ""```foo" code chunk
            node.lang = lang;
            node.meta = undefined;
          } else {
            // non-inline node, take it out, we only want to execute it,
            // not see it
            parent.children.splice(index, 1);
            return index;
          }
        } else if (mystType === "note" || mystType === "warning") {
          // a note! we want to replace the code chunk with a svelte component
          let newNode = {
            type: "html",
            value: `<Admonition type={"${mystType}"}>${node.value}</Admonition>`,
          };
          parent.children[index] = newNode;
          return index;
        } else {
          // the "language" of this code cell is something we don't yet support
          // (e.g. one of the many things in MyST that we don't handle) -- convert
          // it to a normal code cell with no language, at least that way we won't
          // confuse svelte downstream (since tokens with curly braces have special
          // meaning)
          node.lang = undefined;
        }
      }
    });
  };
};

function createJSTask(id, code, inputs = []) {
  return {
    id,
    type: TASK_TYPE.JS,
    state: TASK_STATE.PENDING,
    payload: `async (${inputs.join(",")}) => { ${code}\n }`,
    inputs: JSON.stringify(flatten([inputs])),
  };
}

// rehype plugin: reconstitutes `{code-cell}` chunks, inserting them inside
// the script block that mdsvex generates (or creating one, in the case
// of a document without one)
export const augmentSvx = ({ codeCells, svelteCells, frontMatter }) => {
  return () => {
    return function transformer(tree, _) {
      // we allow a top-level "scripts" to load arbitrary javascript
      const hasScripts = frontMatter.scripts && frontMatter.scripts.length;
      let tasks = hasScripts
        ? [
            {
              id: "scripts",
              type: TASK_TYPE.LOAD_SCRIPTS,
              state: TASK_STATE.PENDING,
              payload: JSON.stringify(flatten([frontMatter.scripts])),
              inputs: JSON.stringify([]),
            },
          ]
        : [];

      // turn data blocks into async tasks
      tasks = tasks.concat(
        (frontMatter.data || [])
          .map((datum) => {
            return Object.entries(datum).map(([id, url]) => {
              return {
                id: id,
                type: TASK_TYPE.DOWNLOAD,
                state: TASK_STATE.PENDING,
                payload: JSON.stringify(url),
                inputs: JSON.stringify([]),
              };
            });
          })
          .flat()
      );

      // variables should likewise get processed as their own type of "task"
      // (FIXME: duplication with ^^^)
      tasks = tasks.concat(
        (frontMatter.variables || [])
          .map((datum) => {
            return Object.entries(datum).map(([id, value]) => {
              return {
                id,
                type: TASK_TYPE.VARIABLE,
                state: TASK_STATE.PENDING,
                payload: JSON.stringify(value),
                inputs: JSON.stringify([]),
              };
            });
          })
          .flat()
      );

      // turn js code cells into async tasks
      tasks = tasks.concat(
        codeCells
          .filter((cn) => cn.lang === "js")
          .map((cn) => {
            let inputs = cn.attributes.inputs || [];
            // if there are any scripts, we want to load them
            // before running any code cells
            if (hasScripts) {
              inputs.push("scripts");
            }
            return createJSTask(cn.attributes.id, cn.body, flatten([inputs]));
          })
      );

      const pyNodes = codeCells.filter((cn) => cn.lang === "python");
      if (pyNodes.length) {
        tasks = tasks.concat([
          {
            id: "pyodide",
            payload: JSON.stringify(""),
            type: TASK_TYPE.LOAD_PYODIDE,
            state: TASK_STATE.PENDING,
            inputs: JSON.stringify([]),
          },
          ...pyNodes.map((pn) => {
            const preamble = (pn.inputs || [])
              .map((i) => `from js import ${i}`)
              .join("\n");
            return createJSTask(
              pn.attributes.id,
              `return (await pyodide.runPythonAsync(\`${preamble}${pn.body}\`)).toJs()`,
              ["pyodide"].concat(pn.inputs || [])
            );
          }),
        ]);
      }

      const extraScript =
        svelteCells
          .map(
            (svelteCell) =>
              `import ${svelteCell.id} from "./${svelteCell.id}.svelte";`
          )
          .join("\n") +
        'import Admonition from "./Admonition.svelte";\n' +
        mustache.render(taskScriptSource, {
          taskVariables: tasks
            .map((task) => task.id)
            .filter(
              (taskVariable) => !Object.keys(frontMatter).includes(taskVariable)
            ),
          tasks,
        });
      visit(tree, "root", (node) => {
        const moduleIndex = node.children
          .filter((n) => n.type === "raw")
          .findIndex((n) => {
            return svelteParse(n.value).module;
          });
        let scriptIndex = node.children
          .filter((n) => n.type === "raw")
          .findIndex((n) => {
            const parsed = svelteParse(n.value);
            return parsed.instance && parsed.instance.type === "Script";
          });

        let scriptNodes, remainderNodes;
        if (scriptIndex >= 0) {
          const script = node.children[scriptIndex];
          // if we have a script tag already, append our stuff to the end
          script.value = script.value.replace(
            new RegExp("(</script>)$"),
            `\n${extraScript}$1`
          );
          scriptNodes = node.children.slice(0, scriptIndex + 1);
          remainderNodes = node.children.slice(scriptIndex + 1);
        } else {
          // we need a new script block, but it must come after the module
          // if it exists
          if (moduleIndex >= 0) {
            scriptNodes = node.children.slice(0, moduleIndex + 1).concat([
              {
                type: "raw",
                value: `<script>\n${extraScript}\n</script>`,
              },
            ]);
            remainderNodes = node.children.slice(moduleIndex + 1);
          } else {
            // neither a script nor a module block
            scriptNodes = [
              {
                type: "raw",
                value: `<script>\n${extraScript}\n</script>`,
              },
            ];
            remainderNodes = node.children;
          }
        }
        // we want to wait for everything to resolve before rendering anything
        // inside the component
        node.children = scriptNodes
          .concat([{ type: "raw", value: "\n{#await __taskPromise}" }])
          .concat([{ type: "raw", value: "\n<p>Loading...</p>\n" }])
          .concat([{ type: "raw", value: "{:then}\n" }])
          .concat(remainderNodes)
          .concat([{ type: "raw", value: "{/await}" }]);
      });
    };
  };
};
