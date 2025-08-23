import { describe, it, expect } from 'vitest';
import CWRReporter from './reporter';

describe('normalizeToTarget', () => {
  const run = (
    input: Record<string, number>,
    target: number,
    step: number,
    opts?: { absTol?: number; relTol?: number }
  ) => CWRReporter.normalizeToTarget(input, target, step, opts);

  const sum = (o: Record<string, number>) =>
    Object.values(o).reduce((a, b) => a + b, 0);

  it('returns unchanged when total is not close to target (fails tolerance)', () => {
    const input = { A: 10, B: 20 };
    // Default tol: abs=step(=0.01), rel=1% -> threshold=max(0.01, 0.5)=0.5
    // |30-50| = 20 > 0.5 => unchanged
    const result = run(input, 50, 0.01);
    expect(result).toEqual(input);
  });

  it('normalizes when total is within tolerance window', () => {
    const input = { A: 24.9, B: 25.1 }; // sum=50.0 (already at target)
    const result = run(input, 50, 0.01);
    expect(result).toEqual(input); // already perfect → idempotent
  });

  it('can be forced to normalize by widening tolerance explicitly', () => {
    const input = { A: 10, B: 20 }; // sum=30
    // Make a big tolerance so |30-50|=20 <= threshold triggers normalization
    const result = run(input, 50, 0.01, { absTol: 25 }); // threshold >= 25
    expect(sum(result)).toBe(50);
    // proportions preserved: A: 1/3 of 50, B: 2/3 of 50
    expect(result.A).toBeCloseTo(16.67, 2);
    expect(result.B).toBeCloseTo(33.33, 2);
  });

  it('still returns zeros when input sum is zero', () => {
    const result = run({ A: 0, B: 0 }, 50, 0.01);
    expect(result).toEqual({ A: 0, B: 0 });
  });

  it('ignores non-finite inputs and applies tolerance to the finite sum', () => {
    const input = { A: 10, B: Number.NaN, C: Number.POSITIVE_INFINITY }; // finite sum=10
    // target=50; |10-50|=40 > default threshold -> unchanged finite entries
    const pass = run(input, 50, 0.01);
    expect(pass).toEqual({ A: 10 }); // B/C dropped (non-finite)
    // If we widen tolerance, it will normalize A to take all of target
    const forced = run(input, 50, 0.01, { absTol: 50 });
    expect(forced).toEqual({ A: 50 });
  });

  it('respects step granularity when it does normalize', () => {
    const result = run({ A: 12.54, B: 37.45 }, 50, 0.01);
    expect(sum(result)).toBe(50);
    expect(result.A).toBe(12.54);
    expect(result.B).toBe(37.46);
  });

  it('respects normalizes in both directions', () => {
    const result = run({ A: 13, B: 38 }, 50, 0.01, { absTol: 100 });
    expect(result.A).toBe(12.75);
    expect(result.B).toBe(37.25);
  });
});
