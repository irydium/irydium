import { mdToSvelte } from "./mdToSvelte";
import { svelteToHTML } from "./svelteToHTML";
import type { CompileOptions, CompilerOutput } from "./types";

export function compile(
  input: string,
  options: CompileOptions = {}
): Promise<CompilerOutput> {
  return mdToSvelte(input).then(
    ({ rootComponent, subComponents, frontMatter }) => {
      return options.mode === "mdsvex"
        ? { html: rootComponent.code, frontMatter }
        : svelteToHTML(rootComponent, subComponents, frontMatter, options);
    }
  );
}
