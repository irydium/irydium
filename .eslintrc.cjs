module.exports = {
  root: true,
  parser: "@typescript-eslint/parser",
  extends: ["eslint:recommended", "prettier"],
  plugins: ["jest", "svelte3"],
  ignorePatterns: [
    "*.cjs",
    "**/dist/*.js",
    "packages/viewer/build/*.js",
    // FIXME: move most of the below into a proper module which *can* be linted
    "packages/compiler/src/templates/tasks.js",
    "packages/site/__sapper__/**/*",
    "packages/site/src/service-worker.ts",
  ],
  overrides: [
    { files: ["*.svelte"], processor: "svelte3/svelte3" },
    {
      files: ["**/*.ts"],
      plugins: ["@typescript-eslint"],
      extends: ["plugin:@typescript-eslint/recommended"],
      rules: {
        "@typescript-eslint/...": "off",
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
    ecmaVersion: 2019,
  },
  env: {
    browser: true,
    es2017: true,
    node: true,
  },
};
