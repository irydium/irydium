import { compile as mdsvexCompile } from "mdsvex/dist/browser-es.js";
import { codeExtractor, codeInserter, frontMatterExtractor } from "./plugins";

export async function mdToSvx(input) {
  let state = {
    codeNodes: [],
    frontMatter: {},
    svelteCells: [],
  };
  const rootComponent = await mdsvexCompile(input, {
    remarkPlugins: [codeExtractor(state)],
    rehypePlugins: [codeInserter(state)],
    frontmatter: {
      parse: frontMatterExtractor(state),
      marker: "-",
      type: "yaml",
    },
  });

  const subComponents = state.svelteCells.map((sc) => [
    `./${sc.id}.svelte`,
    { code: sc.body, map: "" },
  ]);

  return { rootComponent, subComponents, frontMatter: state.frontMatter };
}
