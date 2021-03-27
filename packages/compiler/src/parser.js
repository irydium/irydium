import { parse as tomlParse } from "toml";

export class ParseError extends Error {
  constructor(message, type, lineNumber) {
    super(message);
    this.message = message;
    this.type = type;
    this.lineNumber = lineNumber;
  }
}

export function parseChunks(input) {
  const lines = input.toString().split("\n");
  const chunks = [];

  let parsedFrontMatter = false;
  let currentChunk = {
    type: "header",
    lines: [],
    frontMatterLines: [],
    lineNumber: 0,
  };
  lines.forEach((line, lineNumber) => {
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
        lineNumber,
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
    const frontMatterContent = chunk.frontMatterLines.join("\n");
    try {
      const frontMatter = tomlParse(frontMatterContent);
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
    } catch (err) {
      throw new ParseError(
        err.message,
        "TomlParseError",
        chunk.lineNumber + err.line
      );
    }
  });
}
