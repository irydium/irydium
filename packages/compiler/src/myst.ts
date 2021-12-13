import type { YieldExpression } from "@babel/types";
import e from "express";
import type { MystCard, MystPanelStyling, MystCardStyling } from "./types";

export function parsePanel(contents: string): Array<MystCard> {
  const panelDelimiterRegex = /\n-{3,}\n/;
  const headerDelimiterRegex = /\n\^{3,}\n/;
  const footerDelimiterRegex = /\n\+{3,}\n/;

  // get panel styling from beginning of panel if it exists
  const [panelStyling, panelContents] = parsePanelStyling(contents);
  // first retrieve cards
  const cards = panelContents.split(panelDelimiterRegex);
  const splitCards = [];

  // retrieve header and footer for each card if exists
  for (const card of cards) {
    let header, footer;
    let body = card;
    const parsedCard = { body: body } as MystCard;
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
  return splitCards;
}

export function parsePanelStyling(contents: string) {
  const contentLines = contents.split("\n")
  // TO ASK: This regex was a PITA. 
  // Is there a way to get it to do this without having to split contents by newline?
  const panelStylingRegex = /:[a-z]+:\s[a-z\s\-0-9]+/i;
  let panelContentLine;
  let matchingLines: MystPanelStyling = ({} as any) as MystPanelStyling;
  // panel styling is only at the beginning of the panels
  for (let i = 0; i < contentLines.length; i++) {
    // stop processing lines once individual cards declared
    if (!contentLines[i].startsWith(":")) {
      panelContentLine = i
      break
    } else {
      const valueMatch = contentLines[i].match(panelStylingRegex)
      if (valueMatch !== null && valueMatch.length === 1) {
        const splitValues: Array<string> = valueMatch[0].split(": ")
        if (splitValues.length === 2) {
          const elementType: string = splitValues[0].substring(1) // remove first :
          const addtClasses: string = splitValues[1]
          // NOTE: This prop assignment does *not* enforce typing...
          matchingLines = {...matchingLines, [elementType]: addtClasses}
        // NOTE: not able to reach this else statement currently?
        } else {
          throw new Error(`Invalid syntax for MyST panel styling`)
        }
      }
    }
  }

  // reconstitute panelContent
  const panelContents = contentLines.slice(panelContentLine).join("\n")  
  console.log(typeof (panelContents))
  const returnPanel: [MystPanelStyling, string] = [matchingLines, panelContents]
  return returnPanel
}

export function parseCardStyling() {

}
