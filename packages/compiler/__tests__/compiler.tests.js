import { parseChunks } from "../src/parser.js";

describe("chunk tests", () => {
  it("works with markdown, no header", () => {
    expect(parseChunks(`%% md\nHello world`)).toEqual([
      { content: "", frontMatter: {}, type: "header" },
      { content: "Hello world", frontMatter: {}, type: "md" },
    ]);
  });

  it("parses the header with markdown", () => {
    expect(
      parseChunks(`title = "My beautiful notebook"\n---\n%% md\nHello world`)
    ).toEqual([
      {
        content: "",
        frontMatter: { title: "My beautiful notebook" },
        type: "header",
      },
      { content: "Hello world", frontMatter: {}, type: "md" },
    ]);
  });
});
