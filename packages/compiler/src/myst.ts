import type { MystCard } from "./types";

export function parsePanel(contents: string): Array<MystCard> {
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

    const parsedCard = {'body': body} as MystCard;
    if (headerDelimiterRegex.test(body)) {
      contents = body.split(headerDelimiterRegex)
      if (contents.length == 2) {
        [header, body]  = contents;
        parsedCard.header = header;
      } else {
        throw new Error(`Invalid syntax for MyST panel card header.`);
      }
    }
    if (footerDelimiterRegex.test(body)) {
      contents = body.split(footerDelimiterRegex)
      if (contents.length == 2) {
        [body, footer]  = body.split(footerDelimiterRegex)
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
