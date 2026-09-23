import { describe, expect, it } from 'vitest';
import {
  evaluateGrowth,
  getAgeStandard,
  getHeightWeightStandard,
  inferHeightType,
} from '../src';

describe('WS/T 423—2022 reference lookup', () => {
  it('uses exact published nodes without interpolation', () => {
    const standard = getAgeStandard('boy', 'weight', 24);
    expect(standard?.thresholds.median).toBe(12.6);
    expect(standard?.reference).toEqual({
      input: 24,
      lowerKey: 24,
      upperKey: 24,
      fraction: 0,
      interpolated: false,
      extrapolated: false,
    });
  });

  it('linearly interpolates missing monthly nodes after 24 months', () => {
    const standard = getAgeStandard('boy', 'stature', 25);
    expect(standard?.thresholds.median).toBeCloseTo(89.0666667, 6);
    expect(standard?.reference.lowerKey).toBe(24);
    expect(standard?.reference.upperKey).toBe(27);
    expect(standard?.reference.fraction).toBeCloseTo(1 / 3, 10);
    expect(standard?.reference.interpolated).toBe(true);
    expect(standard?.reference.extrapolated).toBe(false);
  });

  it('marks 82 and 83 month values as upper extrapolations', () => {
    const standard = getAgeStandard('girl', 'bmi', 83);
    expect(standard?.reference.lowerKey).toBe(78);
    expect(standard?.reference.upperKey).toBe(81);
    expect(standard?.reference.fraction).toBeCloseTo(5 / 3, 10);
    expect(standard?.reference.interpolated).toBe(false);
    expect(standard?.reference.extrapolated).toBe(true);
  });

  it('interpolates non-integer stature between one-centimetre nodes', () => {
    const lower = getHeightWeightStandard('girl', 'height', 90);
    const upper = getHeightWeightStandard('girl', 'height', 91);
    const middle = getHeightWeightStandard('girl', 'height', 90.5);
    expect(middle?.thresholds.plus2sd).toBeCloseTo(
      ((lower?.thresholds.plus2sd ?? 0) + (upper?.thresholds.plus2sd ?? 0)) / 2,
      10
    );
    expect(middle?.reference.interpolated).toBe(true);
  });

  it('does not extrapolate beyond stature table ranges', () => {
    expect(getHeightWeightStandard('boy', 'length', 44.9)).toBeUndefined();
    expect(getHeightWeightStandard('boy', 'height', 130.1)).toBeUndefined();
  });
});

describe('evaluateGrowth', () => {
  it('returns eight growth levels, detailed SD bands and interpolation metadata', () => {
    const result = evaluateGrowth({
      gender: 'boy',
      ageInMonths: 25,
      height: 89.1,
      weight: 12.8,
    });

    expect(result.standard.code).toBe('WS/T 423—2022');
    expect(result.heightType).toBe('height');
    expect(result.heightEvaluation).toBe('中+');
    expect(result.weightEvaluation).toBe('中+');
    expect(result.sdBands.height).toBe('medianToPlus1Sd');
    expect(result.evaluations.height.reference.interpolated).toBe(true);
    expect(result.evaluations.height.nearestBoundary.absoluteDistance).toBeLessThan(0.04);
  });

  it('uses inclusive official boundaries', () => {
    const standard = getAgeStandard('boy', 'weight', 0);
    if (!standard) throw new Error('missing test standard');

    const atMinus3 = evaluateGrowth({
      gender: 'boy', ageInMonths: 0, height: 51.2, weight: standard.thresholds.minus3sd,
    });
    expect(atMinus3.sdBands.weight).toBe('minus3ToMinus2Sd');
    expect(atMinus3.nutrition.weight).toBe('低体重');

    const belowMinus3 = evaluateGrowth({
      gender: 'boy', ageInMonths: 0, height: 51.2, weight: standard.thresholds.minus3sd - 0.001,
    });
    expect(belowMinus3.sdBands.weight).toBe('belowMinus3Sd');
    expect(belowMinus3.nutrition.weight).toBe('重度低体重');
  });

  it('applies every eight-level growth boundary exactly', () => {
    const standard = getAgeStandard('girl', 'weight', 12);
    if (!standard) throw new Error('missing test standard');
    const base = { gender: 'girl' as const, ageInMonths: 12, height: 75.2 };

    expect(evaluateGrowth({ ...base, weight: standard.thresholds.minus3sd - 0.001 }).weightEvaluation).toBe('下下');
    expect(evaluateGrowth({ ...base, weight: standard.thresholds.minus3sd }).weightEvaluation).toBe('下');
    expect(evaluateGrowth({ ...base, weight: standard.thresholds.minus2sd }).weightEvaluation).toBe('中下');
    expect(evaluateGrowth({ ...base, weight: standard.thresholds.minus1sd }).weightEvaluation).toBe('中-');
    expect(evaluateGrowth({ ...base, weight: standard.thresholds.median }).weightEvaluation).toBe('中+');
    expect(evaluateGrowth({ ...base, weight: standard.thresholds.plus1sd }).weightEvaluation).toBe('中上');
    expect(evaluateGrowth({ ...base, weight: standard.thresholds.plus2sd }).weightEvaluation).toBe('上');
    expect(evaluateGrowth({ ...base, weight: standard.thresholds.plus3sd - 0.001 }).weightEvaluation).toBe('上');
    expect(evaluateGrowth({ ...base, weight: standard.thresholds.plus3sd }).weightEvaluation).toBe('上上');
  });

  it('applies wasting and obesity boundaries to weight-for-stature', () => {
    const height = 90;
    const standard = getHeightWeightStandard('boy', 'height', height);
    if (!standard) throw new Error('missing test standard');
    const base = { gender: 'boy' as const, ageInMonths: 24, height };

    expect(evaluateGrowth({ ...base, weight: standard.thresholds.minus3sd - 0.001 }).nutrition.heightWeight)
      .toBe('重度消瘦');
    expect(evaluateGrowth({ ...base, weight: standard.thresholds.minus3sd }).nutrition.heightWeight)
      .toBe('消瘦');
    expect(evaluateGrowth({ ...base, weight: standard.thresholds.minus2sd }).nutrition.heightWeight)
      .toBeUndefined();
    expect(evaluateGrowth({ ...base, weight: standard.thresholds.plus1sd }).nutrition.heightWeight)
      .toBe('超重');
    expect(evaluateGrowth({ ...base, weight: standard.thresholds.plus2sd }).nutrition.heightWeight)
      .toBe('肥胖');
    expect(evaluateGrowth({ ...base, weight: standard.thresholds.plus3sd }).nutrition.heightWeight)
      .toBe('重度肥胖');
  });

  it('evaluates optional head circumference through 36 months', () => {
    const result = evaluateGrowth({
      gender: 'girl', ageInMonths: 30, height: 91.9, weight: 13, headCircumference: 47.9,
    });
    expect(result.headCircumferenceEvaluation).toBe('中+');
    expect(result.evaluations.headCircumference?.reference.interpolated).toBe(false);
  });

  it('returns an unavailable reason when stature is outside the table', () => {
    const result = evaluateGrowth({ gender: 'boy', ageInMonths: 1, height: 44, weight: 3.5 });
    expect(result.heightWeightEvaluation).toBeNull();
    expect(result.evaluations.heightWeight).toBeNull();
    expect(result.unavailableReasons.heightWeight).toContain('45～100 cm');
  });

  it('infers stature type and rejects conflicting compatibility input', () => {
    expect(inferHeightType(23)).toBe('length');
    expect(inferHeightType(24)).toBe('height');
    expect(() => evaluateGrowth({
      gender: 'girl', ageInMonths: 24, height: 87, weight: 12, heightType: 'length',
    })).toThrow('24 月龄应使用 height');
  });

  it('validates age, measurements and head circumference applicability', () => {
    expect(() => evaluateGrowth({ gender: 'boy', ageInMonths: 84, height: 120, weight: 20 }))
      .toThrow('0～83');
    expect(() => evaluateGrowth({ gender: 'boy', ageInMonths: 10.5, height: 75, weight: 10 }))
      .toThrow('整数');
    expect(() => evaluateGrowth({ gender: 'boy', ageInMonths: 10, height: 0, weight: 10 }))
      .toThrow('height');
    expect(() => evaluateGrowth({
      gender: 'boy', ageInMonths: 37, height: 100, weight: 15, headCircumference: 50,
    })).toThrow('0～36');
  });
});
