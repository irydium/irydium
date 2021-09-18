// this is very tedious, basically we need to transpile everything we import
// and use via jest that uses either ES modules or TypeScript
ESM_IMPORTS = [
  "bail",
  "character-entities",
  "is-plain-obj",
  "micromark",
  "mdast-util-from-markdown",
  "mdast-util-to-string",
  "mdsvex",
  "parse-entities",
  "remark-parse",
  "trough",
  "unified",
  "unist-util-visit",
  "unist-util-is",
  "unist-util-stringify-position",
  "vfile",
  "vfile-message",
];

module.exports = {
  automock: false,
  setupFiles: ["./test/setupJest.js"],
  transformIgnorePatterns: [`node_modules/.pnpm/(?!${ESM_IMPORTS.join("|")})`],
};
