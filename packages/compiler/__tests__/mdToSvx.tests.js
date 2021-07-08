import { mdToSvx } from "../src/mdToSvx.js";

describe("mdToSvx tests", () => {
  it("can handle the basics", async () => {
    const output = await mdToSvx("# Hello, world");
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
    const output = await mdToSvx("---\ntitle: My title\n---\n# Hello, world");
    expect(output.frontMatter.title).toEqual("My title");
  });

  it("handles subcomponents", async () => {
    const output = await mdToSvx(
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
      const output = await mdToSvx(codeChunk);
      expect(output.rootComponent.code).toEqual(
        expect.stringContaining(
          '<pre class="language-undefined">{@html `<code class="language-undefined"></code>`}</pre>'
        )
      );
    });
  });
});
