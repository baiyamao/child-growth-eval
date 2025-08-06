import { Gender, HeightType } from './types';
export interface GrowthInput {
    gender: Gender;
    ageInMonths: number;
    height: number;
    weight: number;
    heightType: HeightType;
}
export interface GrowthEvaluationResult {
    heightEvaluation: string;
    weightEvaluation?: string | null;
    heightWeightEvaluation?: string | null;
    bmi: number;
    bmiEvaluation?: string | null;
    nutrition: {
        weight?: string;
        height?: string;
        heightWeight?: string;
        bmi?: string;
    };
}
/**
 * 评估儿童的生长发育情况
 */
export declare function evaluateGrowth(input: GrowthInput): GrowthEvaluationResult;
//# sourceMappingURL=evaluator.d.ts.map