import fm from "front-matter";
import { compile as mdsvexCompile } from "mdsvex/dist/browser-es.js";
import { codeExtractor, codeInserter } from "./plugins";

export async function mdToSvx(input) {
  // mdsvex does its own frontmatter parsing, but we also need it
  const frontMatter = fm(input).attributes;
  let extractedCode = {
    codeCells: [],
    svelteCells: [],
  };

  const rootComponent = await mdsvexCompile(input, {
    remarkPlugins: [codeExtractor(extractedCode)],
    rehypePlugins: [codeInserter(extractedCode, frontMatter)],
  });

  const subComponents = extractedCode.svelteCells.map((sc) => [
    `./${sc.id}.svelte`,
    { code: sc.body, map: "" },
  ]);

  return { rootComponent, subComponents, frontMatter };
}
