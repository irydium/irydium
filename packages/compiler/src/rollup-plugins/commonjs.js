// blatantly stolen from the svelte repl: https://github.com/sveltejs/sites/blob/cbff0ecabfe3548bd8a8e15d0b7fe88d365a72bc/packages/repl/src/lib/workers/bundler/plugins/commonjs.js

import * as acorn from "acorn";
import { walk } from "estree-walker";

const require = `function require(id) {
	if (id in __repl_lookup) return __repl_lookup[id];
	throw new Error(\`Cannot require modules dynamically (\${id})\`);
}`;

export default {
  name: "commonjs",

  transform: (code) => {
    if (!/\b(require|module|exports)\b/.test(code)) return;

    try {
      const ast = acorn.parse(code, {
        // for some reason this hangs for some code if you use 'latest'. change with caution
        ecmaVersion: "latest",
      });

      const requires = [];

      walk(ast, {
        enter: (node) => {
          if (
            node.type === "CallExpression" &&
            node.callee.name === "require"
          ) {
            if (node.arguments.length !== 1) return;
            const arg = node.arguments[0];
            if (arg.type !== "Literal" || typeof arg.value !== "string") return;

            requires.push(arg.value);
          }
        },
      });

      const imports = requires
        .map((id, i) => `import __repl_${i} from '${id}';`)
        .join("\n");
      const lookup = `const __repl_lookup = { ${requires
        .map((id, i) => `'${id}': __repl_${i}`)
        .join(", ")} };`;

      const transformed = [
        imports,
        lookup,
        require,
        `const exports = {}; const module = { exports };`,
        code,
        `export default module.exports;`,
      ].join("\n\n");

      return {
        code: transformed,
        map: null,
      };
    } catch (err) {
      return null;
    }
  },
};
