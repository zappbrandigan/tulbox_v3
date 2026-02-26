import { describe, expect, it } from 'vitest';
import type { SearchReplaceRule } from '@/types';
import {
  computeSearchReplacePreviewPayload,
  isLatestPreviewWorkerResult,
  type PreviewFile,
} from './searchReplacePreview';

const makeRule = (overrides: Partial<SearchReplaceRule> = {}): SearchReplaceRule => ({
  id: 'r1',
  searchPattern: ' ',
  replaceWith: '_',
  isRegex: false,
  isCaseInsensitive: false,
  isEnabled: true,
  ...overrides,
});

const makeFile = (overrides: Partial<PreviewFile> = {}): PreviewFile => ({
  id: 'f1',
  currentName: 'A B',
  status: 'valid',
  ...overrides,
});

describe('computeSearchReplacePreviewPayload', () => {
  it('computes preview counts and name map', () => {
    const files = [makeFile({ id: 'f1', currentName: 'A B' }), makeFile({ id: 'f2', currentName: 'C D' })];
    const rules = [makeRule()];

    const result = computeSearchReplacePreviewPayload(files, rules);
    expect(result.preview.changedFiles).toBe(2);
    expect(result.preview.totalFiles).toBe(2);
    expect(result.previewNameMap).toEqual({ f1: 'A_B', f2: 'C_D' });
  });

  it('marks invalid regex rule and does not change names', () => {
    const files = [makeFile({ id: 'f1', currentName: 'ABC' })];
    const rules = [makeRule({ isRegex: true, searchPattern: '[' })];

    const result = computeSearchReplacePreviewPayload(files, rules);
    expect(result.preview.hasInvalidRegexRules).toBe(true);
    expect(result.preview.changedFiles).toBe(0);
    expect(result.previewNameMap.f1).toBe('ABC');
  });

  it('applies cue transform only when provided', () => {
    const files = [makeFile({ id: 'f1', currentName: 'SHOW   EP  101' })];
    const rules = [makeRule({ replaceWith: 'CUE_SHEET', isRegex: true, searchPattern: '.*' })];

    const withoutCue = computeSearchReplacePreviewPayload(files, rules);
    expect(withoutCue.previewNameMap.f1).toBe('SHOW   EP  101');

    const withCue = computeSearchReplacePreviewPayload(files, rules, {
      cueTransform: (title) => ({ title: `${title}_DOTIFIED`, status: 'modified' }),
    });
    expect(withCue.previewNameMap.f1).toBe('SHOW   EP  101_DOTIFIED');
  });
});

describe('isLatestPreviewWorkerResult', () => {
  it('accepts only matching request ids', () => {
    expect(isLatestPreviewWorkerResult(5, 5)).toBe(true);
    expect(isLatestPreviewWorkerResult(5, 4)).toBe(false);
    expect(isLatestPreviewWorkerResult(5, 6)).toBe(false);
  });
});
