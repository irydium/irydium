import { micromark } from "micromark";

export function parsePanels (contents) {
   const panelDelimiterRegex = /\n\-{3,}\n/;
  const headerDelimiterRegex = /\n\^{3,}\n/;
  const footerDelimiterRegex = /\n\+{3,}\n/;

  // first retrieve cards
  const cards = contents.split(panelDelimiterRegex);
  let splitCards = [];

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
        console.log("Invalid syntax for panel header.");
        return;
      }
    }
    if (footerDelimiterRegex.test(body)) {
      contents = body.split(footerDelimiterRegex)
      if (contents.length == 2) {
        [body, footer]  = body.split(footerDelimiterRegex)
      } else {
        console.log("Invalid syntax for panel footer.");
        return;
      }
    }
    splitCards.push({'header': micromark(header), 'body': micromark(body), 'footer': micromark(footer)});
  }
  return {'cards': splitCards};
}
