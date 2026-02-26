import type { SearchReplaceRule, fileStatus } from '@/types';

export type PreviewFile = {
  id: string;
  currentName: string;
  status: fileStatus;
};

type RuleExecutionResult = {
  name: string;
  status: fileStatus;
  changed: boolean;
  invalidRegex: boolean;
};

type PreparedRule = {
  rule: SearchReplaceRule;
  regex: RegExp | null;
  invalidRegex: boolean;
  isCueSheetWithEpisodeTitle: boolean;
  isCueSheetWithoutEpisodeTitle: boolean;
};

export type SearchReplaceRuleImpact = {
  ruleId: string;
  changedFiles: number;
  isEnabled: boolean;
  isApplicable: boolean;
  invalidRegex: boolean;
};

export type SearchReplacePreview = {
  changedFiles: number;
  totalFiles: number;
  applicableRulesCount: number;
  hasInvalidRegexRules: boolean;
  ruleImpacts: SearchReplaceRuleImpact[];
};

export type HighlightRange = {
  start: number;
  end: number;
};

export type HighlightTone = 'none' | 'match' | 'capture';

export type HighlightSegment = {
  start: number;
  end: number;
  tone: HighlightTone;
};

type NonCueHighlightMatcher = {
  regex: RegExp;
  captureRegex: RegExp | null;
};

export type SearchReplacePreviewPayload = {
  preview: SearchReplacePreview;
  previewNameMap: Record<string, string>;
  currentHighlightSegmentsMap: Record<string, HighlightSegment[]>;
  previewHighlightSegmentsMap: Record<string, HighlightSegment[]>;
};

type DotifyTransform = (
  title: string,
  hasEpisodeTitle: boolean
) => { title: string; status: fileStatus };

type ComputeSearchReplaceOptions = {
  cueTransform?: DotifyTransform;
};

const isCueSheetTemplateRule = (rule: SearchReplaceRule): boolean =>
  rule.replaceWith === 'CUE_SHEET' || rule.replaceWith === 'CUE_SHEET_NO_EP';

const isRuleApplicable = (rule: SearchReplaceRule): boolean =>
  isCueSheetTemplateRule(rule) || rule.searchPattern.length > 0;

const hasCapturingGroups = (pattern: string): boolean => {
  let inCharClass = false;
  let escaped = false;

  for (let i = 0; i < pattern.length; i += 1) {
    const ch = pattern[i];
    if (escaped) {
      escaped = false;
      continue;
    }
    if (ch === '\\') {
      escaped = true;
      continue;
    }
    if (ch === '[') {
      inCharClass = true;
      continue;
    }
    if (ch === ']' && inCharClass) {
      inCharClass = false;
      continue;
    }
    if (inCharClass || ch !== '(') continue;

    const next = pattern[i + 1];
    const next2 = pattern[i + 2];
    if (next !== '?') return true;
    if (next === '?' && next2 === '<') {
      const next3 = pattern[i + 3];
      if (next3 !== '=' && next3 !== '!') return true;
    }
  }

  return false;
};

const escapeRegExp = (value: string): string =>
  value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const prepareRules = (rules: SearchReplaceRule[]): PreparedRule[] =>
  rules.map((rule) => {
    const isCueSheetWithEpisodeTitle = rule.replaceWith === 'CUE_SHEET';
    const isCueSheetWithoutEpisodeTitle = rule.replaceWith === 'CUE_SHEET_NO_EP';

    if (
      !rule.isEnabled ||
      isCueSheetWithEpisodeTitle ||
      isCueSheetWithoutEpisodeTitle ||
      rule.searchPattern.length === 0
    ) {
      return {
        rule,
        regex: null,
        invalidRegex: false,
        isCueSheetWithEpisodeTitle,
        isCueSheetWithoutEpisodeTitle,
      };
    }

    const flags = rule.isCaseInsensitive ? 'gi' : 'g';
    try {
      return {
        rule,
        regex: rule.isRegex
          ? new RegExp(rule.searchPattern, flags)
          : new RegExp(escapeRegExp(rule.searchPattern), flags),
        invalidRegex: false,
        isCueSheetWithEpisodeTitle,
        isCueSheetWithoutEpisodeTitle,
      };
    } catch {
      return {
        rule,
        regex: null,
        invalidRegex: true,
        isCueSheetWithEpisodeTitle,
        isCueSheetWithoutEpisodeTitle,
      };
    }
  });

const getNonCueHighlightMatchers = (
  rules: SearchReplaceRule[]
): NonCueHighlightMatcher[] =>
  rules.flatMap((rule) => {
    if (!rule.isEnabled) return [];
    if (isCueSheetTemplateRule(rule)) return [];
    if (rule.searchPattern.length === 0) return [];

    const flags = rule.isCaseInsensitive ? 'gi' : 'g';
    try {
      const regex = rule.isRegex
        ? new RegExp(rule.searchPattern, flags)
        : new RegExp(escapeRegExp(rule.searchPattern), flags);
      let captureRegex: RegExp | null = null;
      if (rule.isRegex && hasCapturingGroups(rule.searchPattern)) {
        try {
          captureRegex = new RegExp(rule.searchPattern, `${flags}d`);
        } catch {
          captureRegex = null;
        }
      }
      return [{ regex, captureRegex }];
    } catch {
      return [];
    }
  });

const mergeHighlightRanges = (ranges: HighlightRange[]): HighlightRange[] => {
  if (ranges.length === 0) return [];
  const sorted = [...ranges].sort((a, b) => a.start - b.start || a.end - b.end);
  const merged: HighlightRange[] = [sorted[0]];

  for (let i = 1; i < sorted.length; i += 1) {
    const current = sorted[i];
    const last = merged[merged.length - 1];
    if (current.start <= last.end) {
      last.end = Math.max(last.end, current.end);
      continue;
    }
    merged.push({ ...current });
  }

  return merged;
};

const getHighlightRangesFromMatchers = (
  text: string,
  matchers: NonCueHighlightMatcher[]
): HighlightRange[] => {
  const ranges: HighlightRange[] = [];
  for (const matcher of matchers) {
    matcher.regex.lastIndex = 0;
    let safetyCounter = 0;
    let match: RegExpExecArray | null;

    while ((match = matcher.regex.exec(text)) !== null) {
      const start = match.index;
      const end = start + match[0].length;
      if (end > start) ranges.push({ start, end });

      if (match[0].length === 0) {
        matcher.regex.lastIndex += 1;
        if (matcher.regex.lastIndex > text.length) break;
      }

      safetyCounter += 1;
      if (safetyCounter > 10000) break;
    }
  }
  return mergeHighlightRanges(ranges);
};

const getCaptureRangesFromMatchers = (
  text: string,
  matchers: NonCueHighlightMatcher[]
): HighlightRange[] => {
  const ranges: HighlightRange[] = [];

  for (const matcher of matchers) {
    if (!matcher.captureRegex) continue;
    matcher.captureRegex.lastIndex = 0;
    let safetyCounter = 0;
    let match: RegExpExecArray | null;

    while ((match = matcher.captureRegex.exec(text)) !== null) {
      const withIndices = match as RegExpExecArray & {
        indices?: Array<[number, number] | undefined>;
      };
      if (withIndices.indices) {
        for (let i = 1; i < withIndices.indices.length; i += 1) {
          const range = withIndices.indices[i];
          if (!range) continue;
          const [start, end] = range;
          if (end > start) ranges.push({ start, end });
        }
      }

      if (match[0].length === 0) {
        matcher.captureRegex.lastIndex += 1;
        if (matcher.captureRegex.lastIndex > text.length) break;
      }

      safetyCounter += 1;
      if (safetyCounter > 10000) break;
    }
  }

  return mergeHighlightRanges(ranges);
};

const getHighlightSegmentsForText = (
  text: string,
  matchers: NonCueHighlightMatcher[]
): HighlightSegment[] => {
  const matchRanges = getHighlightRangesFromMatchers(text, matchers);
  const captureRanges = getCaptureRangesFromMatchers(text, matchers);

  if (text.length === 0) return [];
  if (matchRanges.length === 0 && captureRanges.length === 0) return [];

  const boundaries = new Set<number>([0, text.length]);
  for (const range of matchRanges) {
    boundaries.add(range.start);
    boundaries.add(range.end);
  }
  for (const range of captureRanges) {
    boundaries.add(range.start);
    boundaries.add(range.end);
  }

  const points = [...boundaries].sort((a, b) => a - b);
  const containsPoint = (ranges: HighlightRange[], point: number): boolean =>
    ranges.some((range) => range.start <= point && point < range.end);

  const segments: HighlightSegment[] = [];
  for (let i = 0; i < points.length - 1; i += 1) {
    const start = points[i];
    const end = points[i + 1];
    if (end <= start) continue;

    const inCapture = containsPoint(captureRanges, start);
    const inMatch = containsPoint(matchRanges, start);
    segments.push({
      start,
      end,
      tone: inCapture ? 'capture' : inMatch ? 'match' : 'none',
    });
  }

  return segments;
};

const executeRule = (
  name: string,
  status: fileStatus,
  preparedRule: PreparedRule,
  cueTransform: DotifyTransform
): RuleExecutionResult => {
  const { rule } = preparedRule;
  if (!rule.isEnabled) {
    return { name, status, changed: false, invalidRegex: false };
  }

  if (preparedRule.isCueSheetWithEpisodeTitle) {
    const { title, status: nextStatus } = cueTransform(name, true);
    return {
      name: title,
      status: nextStatus,
      changed: title !== name,
      invalidRegex: false,
    };
  }

  if (preparedRule.isCueSheetWithoutEpisodeTitle) {
    const { title, status: nextStatus } = cueTransform(name, false);
    return {
      name: title,
      status: nextStatus,
      changed: title !== name,
      invalidRegex: false,
    };
  }

  if (rule.searchPattern.length === 0) {
    return { name, status, changed: false, invalidRegex: false };
  }

  if (preparedRule.invalidRegex || !preparedRule.regex) {
    return { name, status, changed: false, invalidRegex: true };
  }

  const nextName = name.replace(preparedRule.regex, rule.replaceWith);
  return {
    name: nextName,
    status,
    changed: nextName !== name,
    invalidRegex: false,
  };
};

export const computeSearchReplacePreviewPayload = (
  files: PreviewFile[],
  rules: SearchReplaceRule[],
  options: ComputeSearchReplaceOptions = {}
): SearchReplacePreviewPayload => {
  const cueTransform: DotifyTransform =
    options.cueTransform ??
    ((title, _hasEpisodeTitle) => ({ title, status: 'valid' }));
  const preparedRules = prepareRules(rules);
  const highlightMatchers = getNonCueHighlightMatchers(rules);
  const previewNameMap: Record<string, string> = {};
  const currentHighlightSegmentsMap: Record<string, HighlightSegment[]> = {};
  const previewHighlightSegmentsMap: Record<string, HighlightSegment[]> = {};
  const ruleImpacts = preparedRules.map((preparedRule) => ({
    ruleId: preparedRule.rule.id,
    changedFiles: 0,
    isEnabled: preparedRule.rule.isEnabled,
    isApplicable:
      preparedRule.rule.isEnabled && isRuleApplicable(preparedRule.rule),
    invalidRegex: preparedRule.rule.isEnabled && preparedRule.invalidRegex,
  }));

  let changedFiles = 0;

  files.forEach((file) => {
    const originalName = file.currentName;
    let nextName = file.currentName;
    let nextStatus = file.status;

    preparedRules.forEach((preparedRule, index) => {
      const result = executeRule(nextName, nextStatus, preparedRule, cueTransform);
      if (result.changed) {
        ruleImpacts[index].changedFiles += 1;
      }
      if (result.invalidRegex) {
        ruleImpacts[index].invalidRegex = true;
      }
      nextName = result.name;
      nextStatus = result.status;
    });

    previewNameMap[file.id] = nextName;
    currentHighlightSegmentsMap[file.id] = getHighlightSegmentsForText(
      originalName,
      highlightMatchers
    );
    previewHighlightSegmentsMap[file.id] = getHighlightSegmentsForText(
      nextName,
      highlightMatchers
    );

    if (nextName !== originalName) changedFiles += 1;
  });

  return {
    preview: {
      changedFiles,
      totalFiles: files.length,
      applicableRulesCount: ruleImpacts.filter(
        (impact) => impact.isEnabled && impact.isApplicable && !impact.invalidRegex
      ).length,
      hasInvalidRegexRules: ruleImpacts.some(
        (impact) => impact.isEnabled && impact.invalidRegex
      ),
      ruleImpacts,
    },
    previewNameMap,
    currentHighlightSegmentsMap,
    previewHighlightSegmentsMap,
  };
};

export const isLatestPreviewWorkerResult = (
  activeRequestId: number,
  incomingRequestId: number
): boolean => activeRequestId === incomingRequestId;
