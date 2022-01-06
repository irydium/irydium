import type { MystCard, MystPanel, MystStyling } from "./types";

export function parsePanel(contents: string): MystPanel {
  const panelDelimiterRegex = /\n-{3,}\n/;
  const headerDelimiterRegex = /\n\^{3,}\n/;
  const footerDelimiterRegex = /\n\+{3,}\n/;

  // get panel styling from beginning of panel if it exists
  const [rawBlock, panelContents] = splitDirective(contents);
  let panelStyle;
  if (rawBlock.length !== 0) {
    panelStyle = parseDirectiveProperties(rawBlock);
  }
  // first retrieve cards
  const cards = panelContents.startsWith("---\n")
    ? panelContents.substring(4).split(panelDelimiterRegex)
    : panelContents.split(panelDelimiterRegex);
  const splitCards: Array<MystCard> = [];

  const defaultCardStyle = {
    column: "d-flex col-lg-6 col-md-6 col-sm-6 col-xs-12 p-2",
    card: "w-100",
  } as MystStyling;

  // retrieve header and footer for each card if exists
  for (const card of cards) {
    let header, footer;
    const cardComponents = splitDirective(card);
    const rawBlock = cardComponents[0];
    let body = cardComponents[1];
    const parsedCard = { body: body } as MystCard;
    parsedCard.style = defaultCardStyle;
    if (panelStyle) {
      parsedCard.style = mergeStyles(defaultCardStyle, panelStyle);
    }
    // card style merges with panel style
    if (rawBlock.length !== 0) {
      const cardStyle = parseDirectiveProperties(rawBlock);
      parsedCard.style = mergeStyles(parsedCard.style, cardStyle);
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

  let myPanel: MystPanel = { cards: splitCards };
  if (panelStyle) {
    myPanel = { ...myPanel, style: panelStyle };
  }
  return myPanel;
}

export function splitDirective(contents: string): [string, string] {
  // Takes raw string and extracts block of directive text (demarcated by beginning with ':')
  // and returns directive separated from content
  // see: https://www.sphinx-doc.org/en/master/usage/restructuredtext/directives.html
  let block = "";
  let returnContents = "";
  const contentLines = contents.split("\n");
  if (contents.startsWith(":")) {
    const blockLines: Array<string> = [];
    while (contentLines) {
      if (!contentLines[0].trimStart().startsWith(":")) {
        break;
      } else if (contentLines.length > 0) {
        blockLines.push(contentLines.shift().trimStart());
      }
    }
    block = blockLines.join("\n");
  }

  returnContents = contentLines.join("\n").trim();
  return [block, returnContents];
}

export function parseDirectiveProperties(
  block: string
): Record<string, unknown> {
  const styleContents = block.split("\n");
  const stylingRegex = /^:([a-z0-9]+):\s*([a-z\s\-0-9]+)/i;
  // return object with key value pairs
  let styles = {};
  for (const line of styleContents) {
    const stylingArray: RegExpExecArray | null = stylingRegex.exec(line);
    if (stylingArray && stylingArray.length > 2) {
      const key: string = stylingArray[1];
      const value: string = stylingArray[2];
      styles = { ...styles, [key]: value };
    }
  }
  return styles;
}

export function mergeStyles(
  initialStyle: MystStyling,
  overridingStyle: MystStyling
): MystStyling {
  let finalStyle = {} as MystStyling;
  const allProps = new Set(
    Object.keys(overridingStyle).concat(Object.keys(initialStyle))
  );
  let k: keyof MystStyling
  for (k of Array.from(allProps)) {
    // Common keys: overridingStyle per key merged over initialStyle
    if (initialStyle[k] !== undefined && overridingStyle[k] !== undefined) {
      const initialPropDict = classesStringToKeyValues(initialStyle[k]);
      const overridingPropDict = classesStringToKeyValues(overridingStyle[k]);
      // merge Dicts
      const mergedProps = { ...initialPropDict, ...overridingPropDict };
      finalStyle = { ...finalStyle, [k]: propDictToString(mergedProps) };
    } else if (initialStyle[k] !== undefined) {
      // key unique to initialStyle (added to finalStyle as is)
      finalStyle = { ...finalStyle, [k]: initialStyle[k] };
    } else if (overridingStyle[k] !== undefined) {
      // key unique to overridingStyle (added to finalStyle as is)
      finalStyle = { ...finalStyle, [k]: overridingStyle[k] };
    }
  }
  return finalStyle;
}

export function classesStringToKeyValues(
  classesString: string
): Record<string, string> {
  let classDictionary = {};
  for (const htmlClass of classesString.split(/\s+/)) {
    const classArray = htmlClass.split("-");
    const [value, key] = [
      classArray.length === 1 ? "" : classArray.pop(),
      classArray.join("-"),
    ];
    classDictionary = { ...classDictionary, [key]: value };
  }
  return classDictionary;
}

function propDictToString(classObject: Record<string, string>): string {
  const returnArray = Object.keys(classObject).map((key) => {
    if (classObject[key] === "") {
      return key;
    } else {
      return [key, classObject[key]].join("-");
    }
  });
  return returnArray.join(" ").trimStart();
}