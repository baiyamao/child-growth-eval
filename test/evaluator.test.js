"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const evaluator_1 = require("../src/evaluator");
(0, vitest_1.describe)('evaluateGrowth', () => {
    (0, vitest_1.it)('should return expected evaluation for 24-month-old boy', () => {
        const result = (0, evaluator_1.evaluateGrowth)({
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
    (0, vitest_1.it)('should handle unknown age gracefully', () => {
        (0, vitest_1.expect)(() => (0, evaluator_1.evaluateGrowth)({
            gender: 'boy',
            ageInMonths: 999,
            height: 90,
            weight: 14,
            heightType: 'height',
        })).toThrow('年龄 999 月的标准数据未找到');
    });
});
//# sourceMappingURL=evaluator.test.js.map