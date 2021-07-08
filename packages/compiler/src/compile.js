import { mdToSvx } from "./mdToSvx";
import { svxToHTML } from "./svxToHTML";

export function compile(input, options = {}) {
  return mdToSvx(input)
    .then(({ rootComponent, subComponents, frontMatter }) => {
      return options.mode === "mdsvex"
        ? { html: rootComponent.code, frontMatter }
        : svxToHTML(rootComponent, subComponents, frontMatter, options);
    })
    .catch((err) => {
      console.error(err);
      throw err;
    });
}
