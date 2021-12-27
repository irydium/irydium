import type { MystCard, MystPanel, MystStyling } from "./types";

export function parsePanel(contents: string): MystPanel {
  const panelDelimiterRegex = /\n-{3,}\n/;
  const headerDelimiterRegex = /\n\^{3,}\n/;
  const footerDelimiterRegex = /\n\+{3,}\n/;

  // get panel styling from beginning of panel if it exists
  const [yamlBlock, panelContents] = parseStyling(contents);
  let panelStyle;
  if (yamlBlock.length !== 0) {
    panelStyle = parseYamlBlock(yamlBlock);
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
    const cardComponents = parseStyling(card);
    const bodyYaml = cardComponents[0];
    let body = cardComponents[1];
    const parsedCard = { body: body } as MystCard;
    parsedCard.style = defaultCardStyle;
    if (panelStyle) {
      parsedCard.style = mergeStyles(panelStyle, defaultCardStyle);
    }
    // card style merges with panel style
    if (bodyYaml.length !== 0) {
      const cardStyle = parseYamlBlock(bodyYaml);
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

export function parseStyling(contents: string): [string, string] {
  let yamlBlock = "";
  let returnContents = "";
  const contentLines = contents.split("\n");
  if (contents.startsWith(":")) {
    const yamlLines: Array<string> = [];
    while (contentLines) {
      if (!ltrim(contentLines[0]).startsWith(":")) {
        break;
      } else {
        // TODO: Find way to fix non-null assertion warning
        yamlLines.push(ltrim(contentLines.shift()!));
      }
    }
    yamlBlock = yamlLines.join("\n");
  }

  returnContents = contentLines.join("\n");
  const returnPanel: [string, string] = [yamlBlock, returnContents];
  return returnPanel;
}

export function parseYamlBlock(yamlBlock: string): Record<string, unknown> {
  const styleContents = yamlBlock.split("\n");
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

function ltrim(rawString: string) {
  return rawString.replace(/^\s+/gm, "");
}

export function mergeStyles(
  panelStyle: MystStyling,
  cardStyle: MystStyling
): MystStyling {
  let k: keyof MystStyling;
  for (k in panelStyle) {
    if (k in cardStyle) {
      const panelPropDict = classesStringToKeyValues(panelStyle[k]!);
      const cardPropDict = classesStringToKeyValues(cardStyle[k]!);
      // merge Dicts
      const mergedProps = { ...panelPropDict, ...cardPropDict };
      cardStyle[k] = propDictToString(mergedProps);
    } else {
      cardStyle[k] = panelStyle[k];
    }
  }
  return cardStyle;
}

export function classesStringToKeyValues(
  classesString: string
): Record<string, string> {
  const htmlClasses = classesString.split(/\s+/);
  let classDictionary = {};
  for (const htmlClass of htmlClasses) {
    const classArray = htmlClass.split("-");
    let key, value;
    // deal with single prop like "shadow"
    if (classArray.length === 1) {
      key = classArray[0];
      value = "";
    } else {
      value = classArray.pop();
      key = classArray.join("-");
    }
    classDictionary = { ...classDictionary, [key]: value };
  }
  return classDictionary;
}

function propDictToString(classObject: Record<string, string>): string {
  let returnString = "";
  for (const key in classObject) {
    let concatValue;
    if (classObject[key] === "") {
      concatValue = key;
    } else {
      concatValue = [key, classObject[key]].join("-");
    }
    returnString = returnString + " " + concatValue;
  }
  return ltrim(returnString);
}
