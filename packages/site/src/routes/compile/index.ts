// sapper docs suggest this, but it doesn't work:
// import { SapperRequest, SapperResponse } from '@sapper/server';
import type { Request } from "polka";
import type { ServerResponse } from "http";
import { compile } from "../../../../compiler/src/compile.js";

const fs = require("fs");

export async function post(req, res: ServerResponse, next: () => void) {
  res.setHeader("Content-Type", "text/html");
  const data = req.body;
  res.end(await compile(data.irmd));
}
