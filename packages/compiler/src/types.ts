import type { Node } from "unist";

export interface CodeCellAttributes {
  id?: string;
  inputs: string[];
  scripts: string[];
  type: string;
}

export interface CodeCell {
  lang: string;
  attributes: CodeCellAttributes;
  body: string;
}

export interface CodeNode extends Node {
  lang?: string;
  type: string;
  value: string;
  meta?: string;
}

export interface CodeNodeAttributes {
  id?: string;
  inline?: boolean;
}

export interface ScriptNode extends Node {
  value: string;
}

export interface FrontMatter {
  title?: string;
  data?: Record<string, string>[];
  variables?: Record<string, string>[];
  imports?: string[];
  scripts?: string[];
}

export interface ParsedDocument {
  frontMatter: FrontMatter;
  scripts: Array<string>;
  codeCells: Array<CodeCell>;
}

export interface MystCard {
  header?: string;
  body: string;
  footer?: string;
}

export interface SvelteComponentDefinition {
  code: string;
  map: string;
}

export type SvelteComponentVFile = [string, SvelteComponentDefinition];

export interface ProcessedDocument {
  frontMatter: FrontMatter;
  rootComponent: SvelteComponentDefinition;
  subComponents: Array<SvelteComponentVFile>;
}

export interface CompileOptions {
  mode?: string;
}

export interface CompilerOutput {
  html: string;
  frontMatter: FrontMatter;
}
