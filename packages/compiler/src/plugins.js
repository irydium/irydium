import fm from "front-matter";
import mustache from "mustache";
import { TASK_TYPE, TASK_STATE } from "./taskrunner";
import visit from "unist-util-visit";
import Message from "vfile-message";
import { parse as svelteParse } from "svelte/compiler";
import yaml from "js-yaml";

// this is a template
import taskScript from "./templates/tasks.js";

// remark plugin: extracts `{code-cell}` chunks, removing them from the
// markdown (the plugin below will re-insert them)
export const codeExtractor = (state) => {
  return () => {
    return function transformer(tree, _) {
      visit(tree, ["code"], (node, index, parent) => {
        if (node.lang === "{code-cell}") {
          // FIXME: assumption that language is the only metadata
          // (should also validate)
          const lang = node.meta;

          const nodeContent = fm(node.value);

          // svelte cells are parsed kind of specially
          if (lang === "svelte") {
            if (!nodeContent.attributes.name) {
              throw new Error(
                `Svelte component defined in markup without name (line: ${cn.position.start.line})`
              );
            }
            if (nodeContent.attributes.name === "mdsvelte") {
              throw new Error(
                `The mdsvelte name is reserved (line: ${cn.position.start.line})`
              );
            }

            // FIXME: should probably parse out the svelte files to make sure they compile at this stage
            state.svelteCells.push({
              name: nodeContent.attributes.name,
              body: nodeContent.body,
            });
          } else {
            state.codeNodes.push({ lang, ...nodeContent });
          }

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
        }
      });
    };
  };
};

// rehype plugin: reconstitutes `{code-cell}` chunks, inserting them inside
// the script block that mdsvex generates (or creating one, in the case
// of a document without one)
export const codeInserter = (state) => {
  return () => {
    return function transformer(tree, _) {
      // we allow a top-level "scripts" to load arbitrary javascript
      const hasScripts =
        state.frontMatter.scripts && state.frontMatter.scripts.length;
      let tasks = hasScripts
        ? [
            {
              id: "scripts",
              type: TASK_TYPE.LOAD_SCRIPTS,
              state: TASK_STATE.PENDING,
              payload: JSON.stringify(state.frontMatter.scripts),
              inputs: JSON.stringify([]),
            },
          ]
        : [];

      // turn data blocks into async tasks
      tasks = tasks.concat(
        (state.frontMatter.data || [])
          .map((datum) => {
            return Object.entries(datum).map(([id, url]) => {
              return {
                type: TASK_TYPE.DOWNLOAD,
                state: TASK_STATE.PENDING,
                payload: JSON.stringify(url),
                id: id,
                inputs: JSON.stringify([]),
              };
            });
          })
          .flat()
      );

      // variables should likewise get processed as their own type of "task"
      // (FIXME: duplication with ^^^)
      tasks = tasks.concat(
        (state.frontMatter.variables || [])
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
        state.codeNodes
          .filter((cn) => cn.lang === "js")
          .map((cn) => {
            let inputs = cn.attributes.inputs || [];
            // if there are any scripts, we want to load them
            // before running any code cells
            if (hasScripts) {
              inputs.push("scripts");
            }
            return {
              id: cn.attributes.output,
              type: TASK_TYPE.JS,
              state: TASK_STATE.PENDING,
              payload: `async (${(cn.attributes.inputs || []).join(
                ","
              )}) => { ${cn.body}\n }`,
              inputs: JSON.stringify(inputs),
            };
          })
      );

      const extraScript =
        state.svelteCells
          .map(
            (svelteCell) =>
              `import ${svelteCell.name} from "./${svelteCell.name}.svelte";`
          )
          .join("\n") +
        mustache.render(taskScript, {
          taskVariables: tasks
            .map((task) => task.id)
            .filter(
              (taskVariable) =>
                !Object.keys(state.frontMatter).includes(taskVariable)
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

// we define our own yaml-based frontmatter extractor which is basically
// identical to that which mdsvex provides but lets us peek at what the
// front matter will be, which helps us generate our task list
export const frontMatterExtractor = (state) => {
  return (src, messages) => {
    try {
      state.frontMatter = yaml.load(src);
      return state.frontMatter;
    } catch (e) {
      messages.push(new Message("YAML failed to parse", e));
    }
  };
};
