import { describe, expect, it } from "vitest";
import { FileItem, SearchReplaceRule } from "@/types";
import {
  applySearchReplace,
  getHighlightSegmentsFromMatchers,
  getNonCueHighlightMatchers,
  getSearchReplacePreviewNameMap,
  getSearchReplacePreview,
} from "./fileHelpers";

const makeFile = (
  overrides: Partial<FileItem> = {},
): FileItem => ({
  id: "1",
  originalName: "original.pdf",
  currentName: "Sample Name",
  file: {} as File,
  characterCount: "Sample Name".length,
  status: "valid",
  lastModified: new Date(0),
  ...overrides,
});

const makeRule = (
  overrides: Partial<SearchReplaceRule> = {},
): SearchReplaceRule => ({
  id: "rule-1",
  searchPattern: " ",
  replaceWith: "_",
  isRegex: false,
  isCaseInsensitive: false,
  isEnabled: true,
  ...overrides,
});

describe("applySearchReplace", () => {
  it("ignores enabled non-template rules with empty search patterns", () => {
    const files = [makeFile({ currentName: "ABC", characterCount: 3 })];
    const rules = [makeRule({ searchPattern: "", replaceWith: "-" })];

    const [updated] = applySearchReplace(files, rules);
    expect(updated.currentName).toBe("ABC");
    expect(updated.status).toBe("valid");
  });

  it("marks file status as modified when replacement changes the filename", () => {
    const files = [makeFile({ currentName: "A B", characterCount: 3 })];
    const rules = [makeRule({ searchPattern: " ", replaceWith: "_" })];

    const [updated] = applySearchReplace(files, rules);
    expect(updated.currentName).toBe("A_B");
    expect(updated.status).toBe("modified");
  });

  it("does not crash or change name for invalid regex rules", () => {
    const files = [makeFile({ currentName: "ABC", characterCount: 3 })];
    const rules = [makeRule({ isRegex: true, searchPattern: "[", replaceWith: "X" })];

    const [updated] = applySearchReplace(files, rules);
    expect(updated.currentName).toBe("ABC");
    expect(updated.status).toBe("valid");
  });

  it("upgrades prior duplicate status to modified when replacement changes name", () => {
    const files = [makeFile({ currentName: "DUPLICATE", status: "duplicate" })];
    const rules = [makeRule({ searchPattern: "DUPLICATE", replaceWith: "UNIQUE" })];

    const [updated] = applySearchReplace(files, rules);
    expect(updated.currentName).toBe("UNIQUE");
    expect(updated.status).toBe("modified");
  });
});

describe("getSearchReplacePreview", () => {
  it("reports changed file counts for applicable rules", () => {
    const files = [
      makeFile({ id: "1", currentName: "A B" }),
      makeFile({ id: "2", currentName: "C D" }),
    ];
    const rules = [makeRule({ id: "r1", searchPattern: " ", replaceWith: "_" })];

    const preview = getSearchReplacePreview(files, rules);
    expect(preview.changedFiles).toBe(2);
    expect(preview.totalFiles).toBe(2);
    expect(preview.applicableRulesCount).toBe(1);
    expect(preview.hasInvalidRegexRules).toBe(false);
    expect(preview.ruleImpacts[0].changedFiles).toBe(2);
  });

  it("marks invalid regex rules and excludes them from applicable count", () => {
    const files = [makeFile({ currentName: "ABC" })];
    const rules = [makeRule({ id: "bad", isRegex: true, searchPattern: "[" })];

    const preview = getSearchReplacePreview(files, rules);
    expect(preview.applicableRulesCount).toBe(0);
    expect(preview.hasInvalidRegexRules).toBe(true);
    expect(preview.ruleImpacts[0].invalidRegex).toBe(true);
    expect(preview.changedFiles).toBe(0);
  });
});

describe("getSearchReplacePreviewNameMap", () => {
  it("returns preview names keyed by file id", () => {
    const files = [
      makeFile({ id: "f1", currentName: "A B" }),
      makeFile({ id: "f2", currentName: "C D" }),
    ];
    const rules = [makeRule({ searchPattern: " ", replaceWith: "_" })];

    const previewMap = getSearchReplacePreviewNameMap(files, rules);
    expect(previewMap).toEqual({
      f1: "A_B",
      f2: "C_D",
    });
  });

  it("keeps original name when regex is invalid", () => {
    const files = [makeFile({ id: "f1", currentName: "ABC" })];
    const rules = [makeRule({ isRegex: true, searchPattern: "[", replaceWith: "X" })];

    const previewMap = getSearchReplacePreviewNameMap(files, rules);
    expect(previewMap.f1).toBe("ABC");
  });
});

describe("non-cue highlighting helpers", () => {
  it("builds matchers for enabled non-cue rules only", () => {
    const rules = [
      makeRule({ id: "literal", searchPattern: " ", replaceWith: "_" }),
      makeRule({ id: "cue", searchPattern: ".*", replaceWith: "CUE_SHEET", isRegex: true }),
      makeRule({ id: "disabled", isEnabled: false, searchPattern: "A" }),
      makeRule({ id: "invalid", isRegex: true, searchPattern: "[" }),
    ];

    const matchers = getNonCueHighlightMatchers(rules);
    expect(matchers.length).toBe(1);
  });

  it("returns merged highlight ranges for overlapping matches", () => {
    const rules = [
      makeRule({ searchPattern: "ABC", replaceWith: "X" }),
      makeRule({ searchPattern: "BCD", replaceWith: "Y" }),
    ];
    const matchers = getNonCueHighlightMatchers(rules);
    const highlighted = getHighlightSegmentsFromMatchers("ABCDE", matchers)
      .filter((segment) => segment.tone === "match")
      .map((segment) => ({ start: segment.start, end: segment.end }));

    expect(highlighted).toEqual([{ start: 0, end: 4 }]);
  });

  it("marks regex capture groups as capture tone", () => {
    const rules = [
      makeRule({
        searchPattern: "(AB)CD",
        replaceWith: "X",
        isRegex: true,
      }),
    ];
    const matchers = getNonCueHighlightMatchers(rules);
    const segments = getHighlightSegmentsFromMatchers("ABCD", matchers);

    const captures = segments
      .filter((segment) => segment.tone === "capture")
      .map((segment) => ({ start: segment.start, end: segment.end }));
    const matches = segments
      .filter((segment) => segment.tone === "match")
      .map((segment) => ({ start: segment.start, end: segment.end }));

    expect(captures).toEqual([{ start: 0, end: 2 }]);
    expect(matches).toEqual([{ start: 2, end: 4 }]);
  });
});
