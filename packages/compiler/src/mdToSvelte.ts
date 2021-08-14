import { compile as mdsvexCompile } from "mdsvex/dist/browser-es.js";
import { processMyst, augmentSvx } from "./plugins";
import { extractCode } from "./parseMd";
import type { ProcessedDocument, SvelteComponentVFile } from "./types";

export async function mdToSvelte(input: string): Promise<ProcessedDocument> {
  const { frontMatter, scripts, codeCells } = await extractCode(input);

  const rootComponent = await mdsvexCompile(input, {
    remarkPlugins: [processMyst],
    rehypePlugins: [augmentSvx({ frontMatter, scripts, codeCells })],
  });

  const subComponents = codeCells
    .filter((cn) => cn.lang === "svelte")
    .map(
      (sc): SvelteComponentVFile => [
        `./${sc.attributes.id}.svelte`,
        { code: sc.body, map: "" },
      ]
    );

  return { rootComponent, subComponents, frontMatter };
}
