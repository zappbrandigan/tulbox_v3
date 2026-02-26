import { describe, expect, it } from 'vitest';
import type { FileItem } from '@/types';
import { createApplySnapshot, restoreFromApplySnapshot } from './undo';

const makeFile = (overrides: Partial<FileItem> = {}): FileItem => ({
  id: 'f1',
  originalName: 'original.pdf',
  currentName: 'CURRENT',
  file: {} as File,
  characterCount: 7,
  status: 'valid',
  lastModified: new Date(0),
  ...overrides,
});

describe('undo helpers', () => {
  it('creates a snapshot of names/count/status', () => {
    const files = [
      makeFile({ id: 'f1', currentName: 'A', characterCount: 1, status: 'valid' }),
      makeFile({ id: 'f2', currentName: 'B', characterCount: 1, status: 'duplicate' }),
    ];

    const snapshot = createApplySnapshot(files);
    expect(snapshot).toEqual({
      f1: { currentName: 'A', characterCount: 1, status: 'valid' },
      f2: { currentName: 'B', characterCount: 1, status: 'duplicate' },
    });
  });

  it('restores file state from snapshot by id', () => {
    const before = [
      makeFile({ id: 'f1', currentName: 'A', characterCount: 1, status: 'valid' }),
      makeFile({ id: 'f2', currentName: 'B', characterCount: 1, status: 'duplicate' }),
    ];
    const snapshot = createApplySnapshot(before);

    const afterApply = [
      makeFile({ id: 'f1', currentName: 'A_MOD', characterCount: 5, status: 'modified' }),
      makeFile({ id: 'f2', currentName: 'B_MOD', characterCount: 5, status: 'modified' }),
      makeFile({ id: 'f3', currentName: 'UNCHANGED', characterCount: 9, status: 'valid' }),
    ];

    const restored = restoreFromApplySnapshot(afterApply, snapshot);
    expect(restored[0].currentName).toBe('A');
    expect(restored[0].status).toBe('valid');
    expect(restored[1].currentName).toBe('B');
    expect(restored[1].status).toBe('duplicate');
    expect(restored[2].currentName).toBe('UNCHANGED');
  });
});

