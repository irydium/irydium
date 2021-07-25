ESM_IMPORTS = [
  "bail",
  "is-plain-obj",
  "mdsvex",
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
  transformIgnorePatterns: [`/node_modules/(?!${ESM_IMPORTS.join("|")})`],
};
