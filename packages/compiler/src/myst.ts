import type { MystCard, MystPanel } from "./types";

export function parsePanel(contents: string): MystPanel {
  const panelDelimiterRegex = /\n-{3,}\n/;
  const headerDelimiterRegex = /\n\^{3,}\n/;
  const footerDelimiterRegex = /\n\+{3,}\n/;

  // get panel styling from beginning of panel if it exists
  const [yamlBlock, panelContents] = parseStyling(contents);
  const panelStyle = parseYamlBlock(yamlBlock);
  // first retrieve cards
  const cards = panelContents.split(panelDelimiterRegex);
  const splitCards: Array<MystCard> = [];

  // retrieve header and footer for each card if exists
  for (const card of cards) {
    let header, footer;
    const cardComponents = parseStyling(card);
    const bodyYaml = cardComponents[0];
    let body = cardComponents[1]
    const parsedCard = { body: body } as MystCard;
    if (panelStyle) {
      parsedCard.style = panelStyle
    }
    // card style will override panel style currently for same prop
    if (bodyYaml.length !== 0) {
      const cardStyle = parseYamlBlock(bodyYaml)
      parsedCard.style = {...parsedCard.style, ...cardStyle}
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
    myPanel = {...myPanel, style: panelStyle}
  }
  return myPanel
}

export function parseStyling(contents: string): [string, string] {
  let yamlBlock = '';
  let returnContents = '';
  const contentLines = contents.split("\n") 
  if (contents.startsWith(":")) {
    const yamlLines: Array<string> = []
    while (contentLines) {
      if (!ltrim(contentLines[0]).startsWith(":")) {
        break
      } else {
        yamlLines.push(ltrim(contentLines.shift()!)) // TODO: Find way to fix non-null assertion warning
      }
    }
    yamlBlock = yamlLines.join("\n")
  }

  returnContents = contentLines.join("\n")  
  const returnPanel: [string, string] = [yamlBlock, returnContents]
  return returnPanel
}

export function parseYamlBlock(yamlBlock: string) : Record<string, unknown> {
  const styleContents = yamlBlock.split("\n")
  const stylingRegex = /^:([a-z0-9]+):\s*([a-z\s\-0-9]+)/i;
  // return object with key value pairs
  let styles = {}
  for (const line of styleContents) {
    const stylingArray : RegExpExecArray | null = stylingRegex.exec(line)
    if (stylingArray && stylingArray.length > 2) {
      const key : string = stylingArray[1]
      const value : string = stylingArray[2]
      styles = {...styles, [key]: value}
    }
  }
  return styles
}

function ltrim(rawString: string) {
  return rawString.replace(/^\s+/gm,'');
}
