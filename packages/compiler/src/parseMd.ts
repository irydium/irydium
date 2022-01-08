import fm from "front-matter";
import { unified } from "unified";
import remarkParse from "remark-parse";
import { visit } from "unist-util-visit";
import fetch from "cross-fetch";

import defaultLanguagePlugins from "./langPluginRegistry";
import type {
  CodeCell,
  CodeCellAttributes,
  CodeNode,
  FrontMatter,
  ParsedDocument,
} from "./types";

function getCodeCells(
  cells: Array<CodeCell>,
  referenceId: string
): Array<CodeCell> {
  const referencedCell = cells.find((c) => c.attributes.id === referenceId);
  if (!referencedCell) {
    throw new Error(
      `Code cell ${referenceId} referenced, but unable to find cell.`
    );
  }

  return [
    referencedCell,
    ...(referencedCell.attributes.inputs || []).flatMap((input) =>
      getCodeCells(cells, input)
    ),
  ].flat();
}

async function importCode(
  doc: string,
  referenceId: string
): Promise<ParsedDocument> {
  const imported = await extractCode(doc, false);
  return {
    frontMatter: {},
    codeCells: getCodeCells(imported.codeCells, referenceId),
    scripts: [imported.frontMatter.scripts || []].flat(),
  };
}

export async function extractCode(
  input: string,
  topLevel = true
): Promise<ParsedDocument> {
  const frontMatter = fm(input).attributes as FrontMatter;
  let scripts: string[] = frontMatter.scripts || [];
  let codeCells: CodeCell[] = [];

  // go through any imports and extract code cells and scripts that they depend on
  // FIXME: this only goes one level deep, i.e. we can't chase dependencies of dependencies.
  if (topLevel && frontMatter.imports) {
    for (const importedRef of [frontMatter.imports].flat()) {
      const referenceId = importedRef.split("#")[1];
      if (!referenceId) {
        throw new Error(`Import with no referenced element: ${importedRef}`);
      }
      const importedDoc = await (await fetch(importedRef)).text();
      const { codeCells: extractedCells, scripts: extractedScripts } =
        await importCode(importedDoc, referenceId);

      codeCells = [...codeCells, ...extractedCells];
      scripts = [...scripts, ...extractedScripts];
      // include extracted references and their dependencies
    }
  }

  const tree = unified().use(remarkParse).parse(input);

  let unlabeledIdCounter = 0;

  visit(tree, ["code"], (node: CodeNode) => {
    // process and extract myst directives
    if (node.lang && node.lang.startsWith("{") && node.lang.endsWith("}")) {
      // myst directives are embedded in code chunks, with squiggly braces
      const mystType = node.lang.substr(1, node.lang.length - 2);
      if (mystType === "code-cell") {
        // FIXME: assumption that language is the only metadata
        // (should also validate)
        const lang = node.meta as string;

        const nodeContent = fm(node.value);
        const attributes = nodeContent.attributes as CodeCellAttributes;

        // svelte cells are parsed kind of specially
        if (lang === "svelte" && attributes.name === "mdsvelte") {
          throw new Error(
            `The mdsvelte name is reserved (line: ${node.position.start.line})`
          );
        }

        // cells without an identifier get rendered directly in the document
        codeCells.push({
          lang,
          ...nodeContent,
          attributes: {
            ...attributes,
            id: attributes.id || `__cell${unlabeledIdCounter++}`,
          },
        });
      }
    }
  });

  if (topLevel) {
    // any cells defined in a svelte plugin need to be imported at top-level
    scripts = [
      ...scripts,
      ...codeCells
        .filter(({ lang }) => lang === "svelte")
        .map(({ attributes }) => [attributes.scripts || []].flat())
        .flat(),
    ];
    // if we have code cells with unsupported language plugins at top-level, possibly
    // import them from default plugins
    const supportedLanguages = new Set([
      "js",
      "svelte",
      ...codeCells
        .filter(({ attributes }) => attributes.type === "language-plugin")
        .map(({ attributes }) => attributes.id),
    ]);
    const requiredLanguages = new Set(
      codeCells
        .filter(({ lang }) => !supportedLanguages.has(lang))
        .map(({ lang }) => lang)
    );
    for (const requiredLanguage of Array.from(requiredLanguages)) {
      if (requiredLanguage in defaultLanguagePlugins) {
        const { codeCells: extractedCells, scripts: extractedScripts } =
          await importCode(
            defaultLanguagePlugins[requiredLanguage],
            requiredLanguage
          );

        codeCells = [...codeCells, ...extractedCells];
        scripts = [...scripts, ...extractedScripts];
      }
    }
    // let problems with unsupported language plugins be reported
    // downstream
  }

  return {
    frontMatter,
    scripts,
    codeCells,
  };
}
