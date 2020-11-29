const express = require("express");
const compiler = require("./compile.js");
const app = express();
const port = 3000;

app.get("/", async (req, res) => {
  const compiled = await compiler.compile("document-pyodide.irmd");
  res.send(compiled);
});

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
