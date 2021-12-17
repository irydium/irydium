import type { YieldExpression } from "@babel/types";
import e from "express";
import type { MystCard, MystPanelStyling, MystCardStyling, MystPanel } from "./types";

export function parsePanel(contents: string): MystPanel {
  const panelDelimiterRegex = /\n-{3,}\n/;
  const headerDelimiterRegex = /\n\^{3,}\n/;
  const footerDelimiterRegex = /\n\+{3,}\n/;

  // get panel styling from beginning of panel if it exists
  const [panelStyling, panelContents] = parsePanelStyling(contents);
  // first retrieve cards
  const cards = panelContents.split(panelDelimiterRegex);
  const splitCards: Array<MystCard> = [];

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

  let myPanel: MystPanel = {cards: splitCards}
  if (Object.keys(panelStyling).length !== 0) {
    myPanel = {...myPanel, style: panelStyling}
  }
  return myPanel
}

export function parsePanelStyling(contents: string) {
  const contentLines = contents.split("\n")
  // TO ASK: This regex was a PITA. 
  // Is there a way to get it to do this without having to split contents by newline?
  const panelStylingRegex = /:[a-z]+:\s[a-z\s\-0-9]+/i;
  let panelContentLine;
  let styles: MystPanelStyling = {} as MystPanelStyling;
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
          // How can you dynamically set a prop only if it's a valid prop according to type?
          styles = {...styles, [elementType]: addtClasses}
          //styles[elementType] = addtClasses; // This will not compile and does not enforce valid props either
        // NOTE: not able to reach this else statement currently?
        } else {
          throw new Error(`Invalid syntax for MyST panel styling`)
        }
      }
    }
  }

  // reconstitute panelContent
  const panelContents = contentLines.slice(panelContentLine).join("\n")  
  const returnPanel: [MystPanelStyling, string] = [styles, panelContents]
  return returnPanel
}
