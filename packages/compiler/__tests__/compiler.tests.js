import { parseChunks } from "../src/parser.js";

describe("chunk tests", () => {
  it("works with markdown, no header", () => {
    expect(parseChunks(`%% md\nHello world`)).toEqual([
      { content: "", type: "header" },
      { content: "Hello world", type: "md" },
    ]);
  });

  it("parses the header with markdown", () => {
    expect(
      parseChunks(`title = "My beautiful notebook"\n---\n%% md\nHello world`)
    ).toEqual([
      {
        content: "",
        title: "My beautiful notebook",
        type: "header",
      },
      { content: "Hello world", type: "md" },
    ]);
  });
});
