import { parsePanel } from "../src/myst.ts";

function createPanel(cardArray) {
  let panel = ``;
  for (const card of cardArray) {
    const createdCard = createCard(card);
    panel = panel.concat(createdCard);
    if (cardArray.indexOf(card) !== cardArray.length - 1) {
      panel = panel.concat("\n---\n");
    }
  }
  return panel;
}

function createCard(cardObj) {
  if (cardObj.header && cardObj.footer) {
    return `${cardObj.header}\n^^^\n${cardObj.body}\n+++\n${cardObj.footer}`;
  } else if (cardObj.footer) {
    return `${cardObj.body}\n+++\n${cardObj.footer}`;
  } else if (cardObj.header) {
    return `${cardObj.header}\n^^^\n${cardObj.body}`;
  } else {
    return `${cardObj.body}`;
  }
}

describe("create different panel types successfully", () => {
  it("should create a panel with a single header card", async () => {
    expect(
      await parsePanel(createPanel([{ body: "body", header: "header" }]))
    ).toEqual([{ header: "header", body: "body" }]);
  });

  it("should create a panel with a header card", async () => {
    expect(
      await parsePanel(createPanel([{ body: "body", footer: "footer" }]))
    ).toEqual([{ footer: "footer", body: "body" }]);
  });

  it("should create a panel with a header card", async () => {
    expect(
      await parsePanel(
        createPanel([{ body: "body", header: "header", footer: "footer" }])
      )
    ).toEqual([{ header: "header", body: "body", footer: "footer" }]);
  });

  it("should create a panel with a body card", async () => {
    expect(await parsePanel(createPanel([{ body: "body" }]))).toEqual([
      { body: "body" },
    ]);
  });

  it("should create a panel with two cards", async () => {
    expect(
      await parsePanel(
        createPanel([
          { body: "body", header: "header", footer: "footer" },
          { body: "body" },
        ])
      )
    ).toEqual([
      { header: "header", body: "body", footer: "footer" },
      { body: "body" },
    ]);
  });
});

describe("create panel with malformed duplicate panel properties", () => {
  it("should raise an error for a panel with a malformed double header", () => {
    expect(() => {
      parsePanel("header\n^^^\nheader2\n^^^\nbody");
    }).toThrow(`Invalid syntax for MyST panel card header`);
  });
  it("should raise an error for a panel with a malformed double footer", () => {
    expect(() => {
      parsePanel("body\n+++\nfooter\n+++\nfooter2");
    }).toThrow(`Invalid syntax for MyST panel card footer.`);
  });
});
