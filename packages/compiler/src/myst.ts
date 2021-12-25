import type { YieldExpression } from "@babel/types";
import e from "express";
import type { MystCard, MystPanel } from "./types";

export function parsePanel(contents: string): MystPanel {
  const panelDelimiterRegex = /\n-{3,}\n/;
  const headerDelimiterRegex = /\n\^{3,}\n/;
  const footerDelimiterRegex = /\n\+{3,}\n/;

  // get panel styling from beginning of panel if it exists
  const [yamlBlock, panelContents] = parseStyling(contents);
  // first retrieve cards
  const cards = panelContents.split(panelDelimiterRegex);
  const splitCards: Array<MystCard> = [];

  // retrieve header and footer for each card if exists
  for (const card of cards) {
    let header, footer;
    let [bodyYaml, body] = parseStyling(card);
    const parsedCard = { body: body } as MystCard;
    if (bodyYaml.length !== 0) {
      parsedCard.style = bodyYaml;
    }
    if (headerDelimiterRegex.test(body)) {
      const contents = body.split(headerDelimiterRegex);
      if (contents.length == 2) {
        [header, body] = contents;
        parsedCard.header = header;
      } else {
        throw new Error(`Invalid syntax for MyST panel card header.`);
      }
    }
    if (footerDelimiterRegex.test(body)) {
      const contents = body.split(footerDelimiterRegex);
      if (contents.length == 2) {
        [body, footer] = body.split(footerDelimiterRegex);
        parsedCard.footer = footer;
      } else {
        throw new Error(`Invalid syntax for MyST panel card footer.`);
      }
    }
    parsedCard.body = body;
    splitCards.push(parsedCard);
  }

  let myPanel: MystPanel = {cards: splitCards}
  if (yamlBlock.length !== 0) {
    myPanel = {...myPanel, style: yamlBlock}
  }
  return myPanel
}

export function parseStyling(contents: string) {
  let yamlBlock = '';
  let returnContents = '';
  let contentLines = contents.split("\n") 
  if (contents.startsWith(":")) {
    let yamlLines: Array<string> = []
    while (contentLines) {
      if (!ltrim(contentLines[0]).startsWith(":")) {
        break
      } else {
        yamlLines.push(ltrim(contentLines.shift()!).substring(1))
      }
    }
    yamlBlock = yamlLines.join("\n")
  }

  returnContents = contentLines.join("\n")  
  const returnPanel: [string, string] = [yamlBlock, returnContents]
  return returnPanel
}

function ltrim(rawString: string) {
  return rawString.replace(/^\s+/gm,'');
}
