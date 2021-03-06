import { parse as tomlParse } from "toml";

export function parseChunks(input) {
  const lines = input.toString().split("\n");
  const chunks = [];

  let parsedFrontMatter = false;
  let currentChunk = {
    type: "header",
    lines: [],
    frontMatterLines: [],
  };
  lines.forEach((line) => {
    if (line === "---" && !parsedFrontMatter) {
      parsedFrontMatter = true;
      currentChunk.frontMatterLines = currentChunk.lines;
      currentChunk.lines = [];
    } else if (line.startsWith("%%")) {
      chunks.push(currentChunk);
      currentChunk = {
        type: line.substr(2).trim(),
        lines: [],
        frontMatterLines: [],
      };
      parsedFrontMatter = false;
    } else {
      currentChunk.lines.push(line);
    }
  });
  if (currentChunk.lines.length) {
    chunks.push(currentChunk);
  }

  return chunks.map((chunk) => {
    let frontMatter = tomlParse(chunk.frontMatterLines.join("\n"));
    // HACK: re-interpret frontmatter "data" in a way that mustache can render
    if (frontMatter.data) {
      frontMatter.data = Object.keys(frontMatter.data).map((k) => ({
        name: k,
        url: frontMatter.data[k],
      }));
    }
    return {
      ...frontMatter,
      content: chunk.lines.join("\n"),
      type: chunk.type,
    };
  });
}
