import { mdToSvelte } from "../src/mdToSvelte.ts";

describe("mdToSvelte tests", () => {
  it("can handle the basics", async () => {
    const output = await mdToSvelte("# Hello, world");
    expect(Object.keys(output)).toEqual([
      "rootComponent",
      "subComponents",
      "frontMatter",
    ]);
    expect(output.rootComponent.code).toEqual(
      expect.stringContaining("<h1>Hello, world</h1>")
    );
  });

  it("handles frontmatter", async () => {
    const output = await mdToSvelte(
      "---\ntitle: My title\n---\n# Hello, world"
    );
    expect(output.frontMatter.title).toEqual("My title");
  });

  it("handles two styles of scripts", async () => {
    const SCRIPT_URL = "http://localhost:1234/foo.js";
    [(SCRIPT_URL, [SCRIPT_URL])].forEach(async (scripts) => {
      const output = await mdToSvelte(
        `---\nscripts: ${JSON.stringify(scripts)}\n---\n# Hello, world`
      );
      expect(output.rootComponent.code).toEqual(
        expect.stringContaining(`payload: ["${SCRIPT_URL}"],`)
      );
    });
  });

  it("handles code chunks with various depdendency specifications", async () => {
    const getCodeChunk = (id, fmExtra, code) => {
      return `\`\`\`{code-cell} js\n---\nid: ${id}\n${
        fmExtra ? fmExtra + "\n" : ""
      }---\n${code}\n\`\`\`\n`;
    };
    const codeChunk = getCodeChunk("foo", undefined, "return 123");
    ["inputs: foo", "inputs: [ foo ]"].forEach(async (fmExtra) => {
      const depChunk = getCodeChunk("bar", fmExtra, "return foo + 123");
      const output = await mdToSvelte(codeChunk + depChunk);
      expect(output.rootComponent.code).toEqual(
        expect.stringContaining('inputs: ["foo"]')
      );
    });
  });

  it("handles subcomponents", async () => {
    const output = await mdToSvelte(
      "# Hello, world\n\n```{code-cell} svelte\n---\nid: MyComponent\n---\n<h1>Hello subcomponent</h1>\n```"
    );
    expect(output.rootComponent.code).toEqual(
      expect.stringContaining("<h1>Hello, world</h1>")
    );
    expect(output.subComponents).toEqual([
      [
        "./MyComponent.svelte",
        { code: "<h1>Hello subcomponent</h1>", map: "" },
      ],
    ]);
  });
});

describe("edge cases for input", () => {
  it("empty code chunk permutations", async () => {
    // both empty code chunks and code chunks with curly braces
    // (e.g. ````{code-cell}`) evaluate to empty code cells
    ["```", "```{code}"].forEach(async (codeChunk) => {
      const output = await mdToSvelte(codeChunk);
      expect(output.rootComponent.code).toEqual(
        expect.stringContaining(
          '<pre class="language-undefined">{@html `<code class="language-undefined"></code>`}</pre>'
        )
      );
    });
  });
});
