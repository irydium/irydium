import { mdToSvelte } from "../src/mdToSvelte.ts";

describe("mdToSvelte tests", () => {
  it("can handle the basics", async () => {
    const output = await mdToSvelte("# Hello, world");
    expect(Object.keys(output)).toEqual([
      "rootComponent",
      "subComponents",
      "frontMatter",
    ]);
    // even simple documents use a script tag
    expect(output.rootComponent.code).toEqual(
      expect.stringMatching(/<script>.*<\/script>.*<h1>Hello, world<\/h1>/s)
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

  it("handles inline code chunks", async () => {
    const cellContents = "---\ninline: true\n---\nreturn {}\n";
    const getCodeChunk = (type) => {
      return `\`\`\`${type}\n${cellContents}\`\`\`\n`;
    };
    ["js", "{code-cell} js"].forEach(async (type) => {
      const doc = getCodeChunk(type);
      const output = await mdToSvelte(doc);
      expect(output.rootComponent.code).toEqual(
        expect.stringContaining(
          `<pre>{@html \`<code class="language-js">---\ninline: true\n---\nreturn &#123;&#125;</code>\`}</pre>`
        )
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

  it("escapes HTML reserved characters", async () => {
    const output = await mdToSvelte("# Hello, world &<>\n");
    expect(output.rootComponent.code).toEqual(
      expect.stringContaining("<h1>Hello, world &amp;&lt;&gt;</h1>")
    );
  });

  it("escapes svelte reserved characters", async () => {
    const output = await mdToSvelte("# Hello, world {lol}\n");
    expect(output.rootComponent.code).toEqual(
      expect.stringContaining(`<h1>Hello, world {"{"}lol{"}"}</h1>`)
    );
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
          '<pre>{@html `<code class="language-text"></code>`}</pre>'
        )
      );
    });
  });
});

describe("mdToSvelte (myst: notes and admonitions)", () => {
  it("handles notes and admonitions as expected", async () => {
    const output = await mdToSvelte(
      "```{note}\nThis is an exciting note!\n```"
    );
    expect(output.rootComponent.code).toEqual(
      expect.stringContaining(
        `<Admonition type={"note"}><p>This is an exciting note!</p></Admonition>`
      )
    );
  });
});

describe("mdToSvelte (myst: glue directives)", () => {
  it("processes a glue directive as expected", async () => {
    const output = await mdToSvelte("{glue:}`foo`");
    expect(output.rootComponent.code).toEqual(
      expect.stringContaining(`<Glue variable={foo} />`)
    );
  });

  it("processes a quoted glue directive as expected", async () => {
    const output = await mdToSvelte("`` {glue:}`foo` ``");
    expect(output.rootComponent.code).toEqual(
      expect.stringContaining('<code>{"{"}glue:{"}"}`foo`</code>')
    );
  });
});
