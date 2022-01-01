import { parsePanel } from "../src/myst.ts";

function createPanel(cardArray, style) {
  let panel = ``;
  for (const card of cardArray) {
    const createdCard = createCard(card);
    panel = panel.concat(createdCard);
    if (cardArray.indexOf(card) !== cardArray.length - 1) {
      panel = panel.concat("\n---\n");
    }
  }
  if (style) {
    panel = { ...panel, style: style };
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

const defaultStyle = {
  column: "d-flex col-lg-6 col-md-6 col-sm-6 col-xs-12 p-2",
  card: "w-100",
};

describe("create different panel types successfully", () => {
  it("should create a panel with a single header card", async () => {
    expect(
      await parsePanel(
        createPanel([{ body: "body", header: "header", style: defaultStyle }])
      ).cards
    ).toEqual([{ header: "header", body: "body", style: defaultStyle }]);
  });

  it("should create a panel with a header card", async () => {
    expect(
      await parsePanel(
        createPanel([{ body: "body", footer: "footer", style: defaultStyle }])
      ).cards
    ).toEqual([{ footer: "footer", body: "body", style: defaultStyle }]);
  });

  it("should create a panel with a header card", async () => {
    expect(
      await parsePanel(
        createPanel([
          {
            body: "body",
            header: "header",
            footer: "footer",
            style: defaultStyle,
          },
        ])
      ).cards
    ).toEqual([
      { header: "header", body: "body", footer: "footer", style: defaultStyle },
    ]);
  });

  it("should create a panel with a body card", async () => {
    expect(
      await parsePanel(createPanel([{ body: "body", style: defaultStyle }]))
        .cards
    ).toEqual([{ body: "body", style: defaultStyle }]);
  });

  it("should create a panel with two cards", async () => {
    expect(
      await parsePanel(
        createPanel([
          {
            body: "body",
            header: "header",
            footer: "footer",
            style: defaultStyle,
          },
          { body: "body", style: defaultStyle },
        ])
      ).cards
    ).toEqual([
      { header: "header", body: "body", footer: "footer", style: defaultStyle },
      { body: "body", style: defaultStyle },
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

describe("create panels with custom Bootstrap styling", () => {
  it("should create a panel with two cards with the same Bootstrap styles", async () => {
    expect(
      await parsePanel(
        ":body: text-center bg-info\n---\nbody text\n---\nbody 2 text"
      ).style
    ).toEqual({
      ...defaultStyle,
      body: "text-center bg-info",
    });
  });
  it("should create a panel with two cards with different Bootstrap styles", async () => {
    expect(
      await parsePanel(
        ":body: text-center bg-success\n---\n:body: text-justify bg-info\nbody text\n---\nbody text 2"
      ).cards.map((card) => card.style)
    ).toEqual([
      { ...defaultStyle, body: "text-justify bg-info" },
      { ...defaultStyle, body: "text-center bg-success" },
    ]);
  });
  it("should create a panel with two cards with overriding column Bootstrap styles", async () => {
    expect(
      await parsePanel(
        ":column: col-lg-4\n---\nbody text\n---\n:column: col-lg-3\nbody text 2"
      ).cards.map((card) => card.style)
    ).toEqual([
      {
        column: "d-flex col-lg-4 col-md-6 col-sm-6 col-xs-12 p-2",
        card: "w-100",
      },
      {
        column: "d-flex col-lg-3 col-md-6 col-sm-6 col-xs-12 p-2",
        card: "w-100",
      },
    ]);
  });
});
