import { mdToSvelte } from "./mdToSvelte";
import { svelteToHTML } from "./svelteToHTML";

export function compile(input, options = {}) {
  return mdToSvelte(input).then(
    ({ rootComponent, subComponents, frontMatter }) => {
      return options.mode === "mdsvex"
        ? { html: rootComponent.code, frontMatter }
        : svelteToHTML(rootComponent, subComponents, frontMatter, options);
    }
  );
}
