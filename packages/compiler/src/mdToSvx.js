import { compile as mdsvexCompile } from "mdsvex/dist/browser-es.js";
import { processMyst, augmentSvx } from "./plugins";
import extractCode from "./parseMd";

export async function mdToSvx(input) {
  const extracted = await extractCode(input);
  const rootComponent = await mdsvexCompile(input, {
    remarkPlugins: [processMyst],
    rehypePlugins: [augmentSvx(extracted)],
  });

  const subComponents = extracted.svelteCells.map((sc) => [
    `./${sc.id}.svelte`,
    { code: sc.body, map: "" },
  ]);

  return { rootComponent, subComponents, frontMatter: extracted.frontMatter };
}
