import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkRehype from "remark-rehype";
import rehypeStringify from "rehype-stringify";
import extract_frontmatter from "remark-frontmatter";
import { processMyst, escapeCode, escapeText, augmentSvx } from "./plugins";
import { extractCode } from "./parseMd";
import type {
  ProcessedDocument,
  SvelteCodeCell,
  SvelteComponentDefinition,
  SvelteComponentVFile,
} from "./types";

export async function mdToSvelte(input: string): Promise<ProcessedDocument> {
  const { frontMatter, scripts, codeCells } = await extractCode(input);
  // heavily inspired by mdsvex
  const parser = unified()
    .use(remarkParse)
    .use(processMyst)
    .use(escapeCode)
    .use(extract_frontmatter)
    // @ts-ignore
    .use(remarkRehype, {
      allowDangerousHtml: true,
      allowDangerousCharacters: true,
    })
    .use(augmentSvx({ frontMatter, scripts, codeCells }))
    .use(escapeText)
    .use(rehypeStringify, {
      allowDangerousHtml: true,
      allowDangerousCharacters: true,
    });

  const parsed = await parser.process(input);
  const rootComponent = {
    code: parsed.value as string,
    map: "",
  } as SvelteComponentDefinition;

  const subComponents = codeCells
    .filter((cn) => cn.lang === "svelte")
    .map(
      (sc): SvelteComponentVFile => [
        `./${(sc as SvelteCodeCell).attributes.id || ""}.svelte`,
        { code: sc.body, map: "" },
      ]
    );

  return { rootComponent, subComponents, frontMatter };
}
