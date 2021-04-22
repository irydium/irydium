import fm from "front-matter";
import mustache from "mustache";
import { TASK_TYPE, TASK_STATE } from "@irydium/taskrunner";
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
          state.codeNodes.push(node);
          parent.children.splice(index, 1);
        }
        return index;
      });

      // we allow defining svelte files inside the the markdown as "code cells":
      // extract them
      state.svelteCells = state.codeNodes
        .filter((cn) => cn.meta === "svelte")
        .map((cn) => {
          const parsed = fm(cn.value);
          if (!parsed.attributes.name) {
            throw new Error(
              `Svelte component defined in markup without name (line: ${cn.position.start.line})`
            );
          }
          if (parsed.attributes.name === "mdsvelte") {
            throw new Error(
              `The mdsvelte name is reserved (line: ${cn.position.start.line})`
            );
          }

          // FIXME: should probably parse out the svelte files to make sure they compile at this stage

          return { name: parsed.attributes.name, body: parsed.body };
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
      // turn js code cells into async tasks
      tasks = tasks.concat(
        state.codeNodes
          .filter((cn) => cn.meta === "js")
          .map((cn) => {
            const parsed = fm(cn.value);
            let inputs = parsed.attributes.inputs || [];
            // if there are any scripts, we want to load them
            // before running any code cells
            if (hasScripts) {
              inputs.push("scripts");
            }
            return {
              id: parsed.attributes.output,
              type: TASK_TYPE.JS,
              state: TASK_STATE.PENDING,
              payload: `async (${(parsed.attributes.inputs || []).join(
                ","
              )}) => { ${parsed.body} }`,
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
        let moduleIndex = node.children
          .filter((n) => n.type === "raw")
          .findIndex((n) => {
            return svelteParse(n.value).module;
          });
        if (moduleIndex >= 0) {
          const module = node.children[moduleIndex];
          // if we have a script tag already, append our stuff to the end
          module.value = module.value.replace(
            new RegExp("(</script>)$"),
            `\n${extraScript}$1`
          );
        } else {
          node.children = [
            {
              type: "raw",
              value: `<script context="module">\n${extraScript}\n</script>`,
            },
          ].concat(node.children);
          moduleIndex = 0;
        }
        // we want to wait for everything to resolve before rendering anything
        // inside the component
        node.children = node.children
          .slice(0, moduleIndex + 1)
          .concat([{ type: "raw", value: "\n{#await __taskPromise}" }])
          .concat([{ type: "raw", value: "\n<p>Loading...</p>\n" }])
          .concat([{ type: "raw", value: "{:then}\n" }])
          .concat(node.children.slice(moduleIndex + 1))
          .concat([{ type: "raw", value: "{/await}" }]);
        // FIXME: insert top-level await for code cells to finish *here*
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
