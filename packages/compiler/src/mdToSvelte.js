import { compile as mdsvexCompile } from "mdsvex/dist/browser-es.js";
import { processMyst, augmentSvx } from "./plugins";
import extractCode from "./parseMd";

export async function mdToSvelte(input) {
  const { frontMatter, codeCells } = await extractCode(input);

  const rootComponent = await mdsvexCompile(input, {
    remarkPlugins: [processMyst],
    rehypePlugins: [augmentSvx({ frontMatter, codeCells })],
  });

  const subComponents = codeCells
    .filter((cn) => cn.lang === "svelte")
    .map((sc) => [`./${sc.attributes.id}.svelte`, { code: sc.body, map: "" }]);

  return { rootComponent, subComponents, frontMatter };
}
