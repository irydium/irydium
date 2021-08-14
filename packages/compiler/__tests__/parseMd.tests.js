import { extractCode } from "../src/parseMd.ts";

function createCodeCell(lang, id, inputs, body) {
  return `\`\`\`{code-cell} ${lang}\n---\nid: ${id}\n${
    inputs ? `inputs: ${inputs}\n` : ""
  }---\n${body}\n\`\`\``;
}

describe("extractCode basics", () => {
  it("should extract code from a markdown document", async () => {
    expect(
      await extractCode(createCodeCell("js", "base", undefined, "return 52;"))
    ).toEqual({
      frontMatter: {},
      scripts: [],
      codeCells: [
        {
          attributes: {
            id: "base",
          },
          body: "return 52;",
          bodyBegin: 4,
          frontmatter: "id: base",
          lang: "js",
        },
      ],
    });
  });
});

describe("extractCode imports", () => {
  beforeEach(() => {
    fetch.resetMocks();
  });

  it("should handle getting dependencies recursively", async () => {
    fetch.mockResponse(createCodeCell("js", "foo", undefined, "return 42;"));
    expect(
      await extractCode(
        "---\nimports: http://localhost:8888/foo.md#foo\n---\n```{code-cell} js\n---\nid: bar\ninputs: foo\n---\nreturn foo + 52;\n```"
      )
    ).toEqual({
      frontMatter: {
        imports: "http://localhost:8888/foo.md#foo",
      },
      scripts: [],
      codeCells: [
        {
          attributes: {
            id: "foo",
          },
          body: "return 42;",
          bodyBegin: 4,
          frontmatter: "id: foo",
          lang: "js",
        },
        {
          attributes: {
            id: "bar",
            inputs: "foo",
          },
          body: "return foo + 52;",
          bodyBegin: 5,
          frontmatter: "id: bar\ninputs: foo",
          lang: "js",
        },
      ],
    });
  });
});
