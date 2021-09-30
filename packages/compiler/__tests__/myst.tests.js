import { parsePanels } from "../src/myst.ts";

function createPanel() {
  let panel = `\`\`\`{panels}\n`;
  const card1 = createCard("body", "header", "footer");
  const card2 = createCard("body");
  const card3 = createCard("body", footer="footer");
  const cards = [card1, card2, card3];
  for (var i = 0; i < cards.length; i++) {
    panel = panel.concat(cards[i])
    if (cards.indexOf(cards[i]) !== cards.length - 1) {
    panel = panel.concat("\n---\n")
    }
  }
  return panel;
}
function createCard(body, header, footer) {
  if (header && footer) {
    return (`${header}\n^^^\n${body}\n+++\n${footer}`)
  }
  else if (footer) {
    return (`${body}\n+++\n${footer}`)
  }
  else if (header) {
    return (`${header}\n^^^\n${body}`)
  }
  else {
    return (`${body}`)
  }
}

describe("create basic panel", () => {
  it("should create a panel with three cards", async () => {
    expect(
      await parsePanels(createPanel())
    ).toEqual(
      [{"header": "header", "body": "body", "footer": "footer"},
       {"body": "body"},
       {"body": "body", "footer": "footer"}]
    )
  })
})
