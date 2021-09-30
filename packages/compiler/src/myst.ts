import type { MystPanel } from "./types";

export function parsePanels(contents: string): Array<MystPanel> {
  const panelDelimiterRegex = /\n-{3,}\n/;
  const headerDelimiterRegex = /\n\^{3,}\n/;
  const footerDelimiterRegex = /\n\+{3,}\n/;

  // first retrieve cards
  const cards = contents.split(panelDelimiterRegex);
  const splitCards = [];

  // retrieve header and footer if exists
  for (const card of cards) {
    // default empty string
    let header = "";
    let body = card;
    let footer = "";
    let contents;

    if (headerDelimiterRegex.test(body)) {
      contents = body.split(headerDelimiterRegex)
      if (contents.length == 2) {
        [header, body]  = contents
      } else {
        throw new Error(`Invalid syntax for MyST panel header.`);
      }
    }
    if (footerDelimiterRegex.test(body)) {
      contents = body.split(footerDelimiterRegex)
      if (contents.length == 2) {
        [body, footer]  = body.split(footerDelimiterRegex)
      } else {
        throw new Error(`Invalid syntax for MyST panel footer.`);
      }
    }
    splitCards.push({'header': header, 'body': body, 'footer': footer});
  }
  return splitCards;
}
