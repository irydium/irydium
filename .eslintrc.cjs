module.exports = {
  root: true,
  parser: "@typescript-eslint/parser",
  extends: ["eslint:recommended", "prettier"],
  plugins: ["jest", "svelte3"],
  ignorePatterns: [
    "*.cjs",
    "**/dist/*.js",
    "packages/viewer/build/*.js",
    // rollup is complicated for similar reasons
    "packages/compiler/src/svelteToHTML.ts",
    // not a lintable file (it's a mustache template)
    "packages/compiler/src/templates/tasks.js",
    // sapper files -- generated, not worth linting
    "packages/site/src/client.ts",
    "packages/site/src/server.ts",
    "packages/site/src/service-worker.ts",
    "packages/site/__sapper__/**/*",
  ],
  overrides: [
    { files: ["*.svelte"], processor: "svelte3/svelte3" },
    {
      files: ["**/*.ts"],
      plugins: ["@typescript-eslint"],
      extends: [
        "plugin:@typescript-eslint/recommended",
        "plugin:@typescript-eslint/recommended-requiring-type-checking",
      ],
      rules: {
        "@typescript-eslint/ban-ts-comment": "off",
      },
    },
    {
      files: ["packages/*/__tests__/*.tests.js"],
      plugins: ["jest"],
      extends: ["plugin:jest/recommended", "plugin:jest/style"],
      env: {
        jest: true,
      },
    },
  ],
  settings: {
    "svelte3/typescript": () => require("typescript"),
  },
  parserOptions: {
    sourceType: "module",
    project: "./tsconfig.json",
    ecmaVersion: 2019,
  },
  env: {
    browser: true,
    es2017: true,
    node: true,
  },
};
