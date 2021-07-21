import sirv from "sirv";
import polka from "polka";
import compression from "compression";
import * as sapper from "@sapper/server";

const { json } = require("body-parser");

const { PORT, NODE_ENV } = process.env;
const dev = NODE_ENV === "development";

polka() // You can also use Express
  .use(json())
  .use(
    // @ts-ignore
    compression({ threshold: 0 }),
    sirv("static", { dev }),
    sapper.middleware()
  )
  .listen(PORT);
