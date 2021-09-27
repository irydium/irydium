import fm from "front-matter";
import mustache from "mustache";
import { micromark } from "micromark";
import { TASK_TYPE, TASK_STATE } from "./taskrunner";
import { Node, Parent, visit } from "unist-util-visit";
import { parse as svelteParse } from "svelte/compiler";

import { parsePanels } from "./myst";
import { taskScriptSource } from "./templates";
import type {
  CodeNode,
  CodeNodeAttributes,
  ParsedDocument,
  ScriptNode,
} from "./types";

// remark plugin: extracts `{code-cell}` and other MyST chunks, removing them from the
// markdown unless they are inline code chunks (actual processing of code chunks is handled
// in ./parseMd.ts)
export const processMyst = () => {
  return (tree: Node): void => {
    let unlabeledIdCounter = 0;

    const getAnonymousNode = () => {
      return {
        type: "html",
        value: `<CellResults value={__cell${unlabeledIdCounter++}} />`,
      };
    };

    visit(tree, ["code"], (node, _index, parent) => {
      const { lang, meta, value } = node as CodeNode;
      const index = _index as number;

      if (lang && lang.startsWith("{") && lang.endsWith("}")) {
        // myst directives are embedded in code chunks, with squiggly braces
        const mystType = lang.substr(1, lang.length - 2);
        if (mystType === "code-cell") {
          // FIXME: assumption that language is the only metadata
          // (should also validate)
          const lang = meta;

          const nodeAttributes = fm(value).attributes as CodeNodeAttributes;

          const isInline = nodeAttributes.inline;
          const anonymousNode = !nodeAttributes.id;

          if (isInline) {
            // inline node: take out the code cell parts, make them a
            // standard ""```foo" code chunk
            (node as CodeNode).lang = lang;
            (node as CodeNode).meta = undefined;

            // if it's an anonymous node, then put its output immediately after
            // and return
            if (anonymousNode) {
              parent &&
                parent.children.splice(index + 1, 0, getAnonymousNode());
              return index;
            }
          } else if (anonymousNode) {
            // a non-inline anonymous node should just replace the code chunk
            (parent as Parent).children[index] = getAnonymousNode();
            return index;
          } else {
            // non-inline node with an id, take it out, we only want to execute
            // it and store the results, not see it
            (parent as Parent).children.splice(index, 1);
            return index;
          }
        } else if (mystType === "note" || mystType === "warning") {
          // a note! we want to replace the code chunk with a svelte component
          const newNode = {
            type: "html",
            value: `<Admonition type={"${mystType}"}>${micromark(
              value
            )}</Admonition>`,
          };
          (parent as Parent).children[index] = newNode;
          return index;
        } else if (mystType === "panels") {
          let cards = parsePanels(value);
          console.log(cards);
          // parse each card
          const newNode = {
            type: "html",
            value: mustache.render(
              `<Panels>
               <ul>
               {{#cards}}
               <li>Card </li>
               <ul>
               <li>{{header}}</li>
               <li>{{body}}</li>
               <li>{{footer}}</li>
               </ul>
               {{/cards}}
               </ul>
               </Panels>`,
              cards
            ),
          };
          (parent as Parent).children[index] = newNode;
          return index;
        } else {
          // the "language" of this code cell is something we don't yet support
          // (e.g. one of the many things in MyST that we don't handle) -- convert
          // it to a normal code cell with no language, at least that way we won't
          // confuse svelte downstream (since tokens with curly braces have special
          // meaning)
          (node as CodeNode).lang = undefined;
        }
      }
    });
  };
};

function createJSTask(id: string, code: string, inputs: Array<string> = []) {
  return {
    id,
    type: TASK_TYPE.JS,
    state: TASK_STATE.PENDING,
    payload: `async (${inputs.join(",")}) => { ${code}\n }`,
    inputs: JSON.stringify([inputs].flat()),
  };
}

// rehype plugin: reconstitutes `{code-cell}` chunks, inserting them inside
// the script block that mdsvex generates (or creating one, in the case
// of a document without one)
export const augmentSvx = ({
  codeCells,
  scripts,
  frontMatter,
}: ParsedDocument) => {
  return () => {
    return function transformer(tree: Node): void {
      // we allow a top-level "scripts" to load arbitrary javascript
      let tasks = scripts.length
        ? [
            {
              id: "scripts",
              type: TASK_TYPE.LOAD_SCRIPTS,
              state: TASK_STATE.PENDING,
              payload: JSON.stringify(scripts),
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
          .map((variable) => {
            return Object.entries(variable).map(([id, value]) => {
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
            const inputs = cn.attributes.inputs || [];
            const deps = [];
            // if there are any scripts, we want to load them
            // before running any code cells
            if (scripts.length) {
              inputs.push("scripts");
            }
            // code cells can have scripts dependencies which apply just to that cell
            // we can assume that we have an id by this point (since they should have
            // been given that property in the initial parsing stage)
            if (cn.attributes.scripts) {
              const id = cn.attributes.id as string;
              const scriptsId = `${id}_scripts`;
              deps.push({
                id: scriptsId,
                type: TASK_TYPE.LOAD_SCRIPTS,
                state: TASK_STATE.PENDING,
                payload: JSON.stringify([cn.attributes.scripts].flat()),
                inputs: JSON.stringify([]),
              });
              inputs.push(scriptsId);
            }
            return [
              ...deps,
              createJSTask(cn.attributes.id, cn.body, [inputs].flat()),
            ];
          })
          .flat()
      );

      //
      // other cells need to be processed through language plugins
      //
      const langPlugins = codeCells.filter(
        (cn) => cn.attributes.type === "language-plugin"
      );
      const customLangCells = codeCells.filter(
        (cn) => !["js", "svelte"].includes(cn.lang)
      );

      // bail if there are any non-js cells without an associated language plugins
      const supportedLanguages = new Set(
        langPlugins.map((cn) => cn.attributes.id)
      );
      customLangCells.forEach((cn) => {
        if (!supportedLanguages.has(cn.lang)) {
          throw new Error(`Unsupported language: ${cn.lang}`);
        }
      });

      tasks = [
        ...tasks,
        ...Object.values(langPlugins)
          .map((langPlugin) => {
            return customLangCells
              .filter((cn) => cn.lang === langPlugin.attributes.id)
              .map((cn) => {
                // we can assume a code cell has an id property by this point
                // language plugins should always have an id
                const id = cn.attributes.id as string;
                const langPluginId = langPlugin.attributes.id as string;
                return createJSTask(
                  id,
                  `return ${langPluginId}([${(cn.attributes.inputs || []).join(
                    ", "
                  )}], \`${cn.body}\`)`,
                  [...(cn.attributes.inputs || []), langPluginId]
                );
              });
          })
          .flat(),
      ];

      const extraScript =
        codeCells
          .filter((cn) => cn.lang === "svelte")
          .map((svelteCell): string => {
            // we *know* this cell has an id (we check for it earlier)
            const id = svelteCell.attributes.id as string;
            return `import ${id} from "./${id}.svelte";`;
          })
          .join("\n") +
        'import Admonition from "./Admonition.svelte";\n' +
        'import Panels from "./Panels.svelte";\n' +
        'import CellResults from "./CellResults.svelte";\n' +
        mustache.render(taskScriptSource, {
          taskVariables: tasks
            .map((task) => task.id)
            .filter(
              (taskVariable) => !Object.keys(frontMatter).includes(taskVariable)
            ),
          tasks,
        });

      visit(tree, "root", (node: Parent) => {
        const moduleIndex = node.children
          .filter((n) => n.type === "raw")
          .findIndex((n: ScriptNode) => {
            return svelteParse(n.value).module;
          });
        const scriptIndex = node.children
          .filter((n) => n.type === "raw")
          .findIndex((n: ScriptNode) => {
            const parsed = svelteParse(n.value);
            return parsed.instance && parsed.instance.type === "Script";
          });

        let scriptNodes, remainderNodes;
        if (scriptIndex >= 0) {
          const script = node.children[scriptIndex] as ScriptNode;
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
              } as ScriptNode,
            ]) as Array<ScriptNode>;
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
