// src/types.ts
export type PaliReference = {
  paliTitle: string;
  pts: { nikaya: "DN" | "MN" | "SN" | "AN"; volume: number; page: number };
};
export type ChineseReference = {
  chineseTitle: string;
  taisho: { tNumber: number; volume: number; page: number };
};
export type Person = { name: string; paliName?: string; chineseName?: string };
export type Place = { name: string; chineseName?: string; paliName?: string };
export type SegmentContent = { zh: string; en: string; pt: string };
export type CriticalApparatus = {
  paliRefs?: PaliReference[];
  chineseRefs?: ChineseReference[];
  persons?: Person[];
  places?: Place[];
};
export type TextSegment = {
  id: string;
  label?: string;
  content: SegmentContent;
  apparatus?: CriticalApparatus;
};
export type LanguageMode = "zh\u2011en" | "zh\u2011pt" | "en\u2011pt";
export type HanziEntry = { en: string; pt: string; py?: string };
export type HanziDict = Record<string, HanziEntry>;
export type CompoundEntry = { en: string; pt: string };
export type CompoundDict = Record<string, CompoundEntry>;
export type AlignmentEntry = { en: string[]; pt: string[] };
export type AlignmentDict = Record<string, AlignmentEntry>;
export type HighlightTerms = { en: string[]; pt: string[] } | null;
export type Overlay =
  | { type: "none" }
  | { type: "tooltip"; segmentId: string; position: { x: number; y: number } }
  | { type: "hanzi"; char: string; position: { x: number; y: number } }
  | { type: "settings" }
  | { type: "export"; format: "pdf" | "epub" };
export type AppState = Readonly<{
  segments: readonly TextSegment[];
  currentChapter: number;
  languageMode: LanguageMode;
  overlay: Overlay;
  hanziDict: HanziDict;
  compoundDict: CompoundDict;
  alignmentDict: AlignmentDict;
  highlightTerms: HighlightTerms;
}>;
export type Action =
  | { type: "INIT_SEGMENTS"; payload: readonly TextSegment[] }
  | { type: "INIT_HANZI_DICT"; payload: HanziDict }
  | { type: "INIT_COMPOUNDS"; payload: CompoundDict }
  | { type: "INIT_ALIGNMENTS"; payload: AlignmentDict }
  | { type: "SET_LANGUAGE_MODE"; payload: LanguageMode }
  | { type: "GO_TO_CHAPTER"; payload: number }
  | { type: "SET_HIGHLIGHT"; payload: HighlightTerms }
  | { type: "SHOW_TOOLTIP"; payload: { segmentId: string; position: { x: number; y: number } } }
  | { type: "SHOW_HANZI_TOOLTIP"; payload: { char: string; position: { x: number; y: number } } }
  | { type: "SHOW_SETTINGS" }
  | { type: "HIDE_OVERLAY" }
  | { type: "START_EXPORT"; payload: { format: "pdf" | "epub" } };
