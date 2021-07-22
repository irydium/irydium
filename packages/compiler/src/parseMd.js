import fm from "front-matter";
import { unified } from "unified";
import markdown from "remark-parse";
import { visit } from "unist-util-visit";

export default async function extractCode(input) {
  const frontMatter = fm(input).attributes;
  let extracted = {
    codeCells: [],
    svelteCells: [],
  };

  const tree = unified().use(markdown).parse(input);

  visit(tree, ["code"], (node) => {
    // process and extract myst directives
    if (node.lang && node.lang.startsWith("{") && node.lang.endsWith("}")) {
      // myst directives are embedded in code chunks, with squiggly braces
      const mystType = node.lang.substr(1, node.lang.length - 2);
      if (mystType === "code-cell") {
        // FIXME: assumption that language is the only metadata
        // (should also validate)
        const lang = node.meta;

        const nodeContent = fm(node.value);

        if (!nodeContent.attributes.id) {
          throw new Error(
            `Code chunk defined without id (line: ${node.position.start.line})`
          );
        }

        // svelte cells are parsed kind of specially
        if (lang === "svelte") {
          if (nodeContent.attributes.name === "mdsvelte") {
            throw new Error(
              `The mdsvelte name is reserved (line: ${node.position.start.line})`
            );
          }

          // FIXME: should probably parse out the svelte files to make sure they compile at this stage
          extracted.svelteCells.push({
            id: nodeContent.attributes.id,
            body: nodeContent.body,
          });
        } else {
          extracted.codeCells.push({ lang, ...nodeContent });
        }
      }
    }
  });

  return {
    frontMatter,
    ...extracted,
  };
}
