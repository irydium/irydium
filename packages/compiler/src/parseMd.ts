import {Parser as acornParser} from "acorn"
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
  CompileOptions,
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
  referenceId: string,
  options: CompileOptions,
): Promise<ParsedDocument> {
  const imported = await extractCode(doc, options, false);
  return {
    frontMatter: {},
    codeCells: getCodeCells(imported.codeCells, referenceId),
    scripts: [imported.frontMatter.scripts || []].flat(),
  };
}

export async function extractCode(
  input: string,
  options: CompileOptions = {},
  topLevel = true
): Promise<ParsedDocument> {
  const frontMatter = fm(input).attributes as FrontMatter;
  let scripts: string[] = frontMatter.scripts || [];
  let codeCells: CodeCell[] = [];
  const server = options.server || "";

  // go through any imports and extract code cells and scripts that they depend on
  // FIXME: this only goes one level deep, i.e. we can't chase dependencies of dependencies.
  if (topLevel && frontMatter.imports) {
    for (const importedRef of [frontMatter.imports].flat()) {
      const referenceId = importedRef.split("#")[1];
      if (!referenceId) {
        throw new Error(`Import with no referenced element: ${importedRef}`);
      }
      // if URL is relative *and* we have a server passed in, prepend the server URL
      // (this doesn't make a difference on irydium.dev, but is handy for the viewer,
      // where compilation happens in nodejs land and doesn't have a concept of a root
      // domain)
      // FIXME: for the latter case, we should also allow loading resources from the filesystem
      const ref = (importedRef.search(/https?:\/\//) === 0) ? importedRef : `${server}${importedRef}`;
      const importedDoc = await (await fetch(ref)).text();
      const { codeCells: extractedCells, scripts: extractedScripts } =
        await importCode(importedDoc, referenceId, options);

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

        // we pre-process js cells to make sure the syntax is valid
        if (lang === "js") {
          try {
            acornParser.parse(nodeContent.body, {ecmaVersion: 2021, allowReturnOutsideFunction: true});
          } catch (e) {
            if (e instanceof SyntaxError) {
              // Renumber syntax error, since the code we're parsing is part of a much larger document
              const revisedMessage = e.message.replace(/\ \([0-9]+:[0-9]+\)$/, '') + ` (line: ${node.position.start.line + nodeContent.bodyBegin + e.loc.line - 1})`;
              throw new Error(`Syntax error in js cell: ${revisedMessage}`);
            }
            // unknown error, shouldn't happen, just rethrow I guess
            throw e;
          }
        }

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
            requiredLanguage,
            options
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
