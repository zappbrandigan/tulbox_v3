import { describe, expect, it } from "vitest";
import { FileItem, SearchReplaceRule } from "@/types";
import { applySearchReplace } from "./fileHelpers";

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
