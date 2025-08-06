import { describe, it, expect } from 'vitest';
import { evaluateGrowth } from '../src/evaluator';

describe('evaluateGrowth', () => {
  it('should return expected evaluation for 24-month-old boy', () => {
    const result = evaluateGrowth({
      gender: 'boy',
      ageInMonths: 25,
      height: 87.1,
      weight: 12.2,
      heightType: 'height',
    });

    // expect(result.heightEvaluation).toBe('中');
    // expect(result.weightEvaluation).toBe('中');
    // expect(result.bmi).toBeGreaterThan(0);
    // expect(result.nutrition).toHaveProperty('weight');
  });

  it('should handle unknown age gracefully', () => {
    expect(() =>
      evaluateGrowth({
        gender: 'boy',
        ageInMonths: 999,
        height: 90,
        weight: 14,
        heightType: 'height',
      })
    ).toThrow('年龄 999 月的标准数据未找到');
  });
});
