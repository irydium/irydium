import fm from "front-matter";
import { unified } from "unified";
import markdown from "remark-parse";
import { visit } from "unist-util-visit";
import fetch from "cross-fetch";

function getCodeCells(cells, referenceId) {
  const referencedCell = cells.find((c) => c.attributes.id === referenceId);
  if (!referencedCell) {
    throw new Error(
      `Code cell ${referenceId} referenced, but unable to find cell.`
    );
  }

  return [
    referencedCell,
    ...(referencedCell.inputs || []).flatMap((input) =>
      getCodeCells(cells, input)
    ),
  ].flat();
}

export default async function extractCode(input) {
  const frontMatter = fm(input).attributes;
  let scripts = frontMatter.scripts || [];
  let codeCells = [];

  // go through any imports and extract code cells and scripts that they depend on
  // FIXME: this only goes one level deep, i.e. we can't chase dependencies of dependencies.
  if (frontMatter.imports) {
    for (const importedRef of [frontMatter.imports].flat()) {
      const referenceId = importedRef.split("#")[1];
      if (!referenceId) {
        throw new Error(`Import with no referenced element: ${importedRef}`);
      }

      const importedDoc = await (await fetch(importedRef)).text();
      const imported = await extractCode(importedDoc);
      const extractedCells = getCodeCells(imported.codeCells, referenceId);
      codeCells = [...codeCells, ...extractedCells];
      scripts = [...scripts, ...imported.frontMatter.scripts];
      // include extracted references and their dependencies
    }
  }

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
        }
        codeCells.push({ lang, ...nodeContent });
      }
    }
  });

  return {
    frontMatter: { ...frontMatter, scripts },
    codeCells,
  };
}
