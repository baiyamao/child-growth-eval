import { Gender, HeightType } from './types';
import { getGrowthStandard, getHeightWeightStandard } from './reference';

export interface GrowthInput {
  gender: Gender;
  ageInMonths: number;
  height: number; // cm
  weight: number; // kg
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
 * 根据SD区间对数值进行评价
 */
function evaluateZRange(
  value: number,
  minus3sd: number,
  minus2sd: number,
  minus1sd: number,
  sd0: number,
  plus1sd: number,
  plus2sd: number,
  plus3sd: number
): string {
  if (value < minus3sd) return '下下';
  if (value < minus2sd) return '下';
  if (value < minus1sd) return '中下';
  if (value < sd0) return '中-';
  if (value < plus1sd) return '中+';
  if (value < plus2sd) return '中上';
  if (value < plus3sd) return '上';
  return '上上';
}

/**
 * 计算 BMI
 */
function calculateBMI(weight: number, height: number): number {
  if (!weight || !height) return 0;
  const bmi = weight / (Math.pow(height / 100, 2));
  return parseFloat(bmi.toFixed(2));
}

/**
 * 评估儿童的生长发育情况
 */
export function evaluateGrowth(input: GrowthInput): GrowthEvaluationResult {
  const { gender, ageInMonths, height, weight, heightType } = input;

  const standard = getGrowthStandard(gender, heightType, ageInMonths);
  const heightWeightStandard = getHeightWeightStandard(gender, heightType, height);

  if (!standard) {
    throw new Error(`年龄 ${ageInMonths} 月的标准数据未找到`);
  }

  const heightEvaluation = evaluateZRange(
    height,
    standard.height_minus_3sd,
    standard.height_minus_2sd,
    standard.height_minus_1sd,
    standard.height_0sd,
    standard.height_plus_1sd,
    standard.height_plus_2sd,
    standard.height_plus_3sd
  );

  const weightEvaluation = standard.weight_0sd
    ? evaluateZRange(
        weight,
        standard.weight_minus_3sd,
        standard.weight_minus_2sd,
        standard.weight_minus_1sd,
        standard.weight_0sd,
        standard.weight_plus_1sd,
        standard.weight_plus_2sd,
        standard.weight_plus_3sd
      )
    : null;

  const heightWeightEvaluation = heightWeightStandard
    ? evaluateZRange(
        weight,
        heightWeightStandard.weight_minus_3sd,
        heightWeightStandard.weight_minus_2sd,
        heightWeightStandard.weight_minus_1sd,
        heightWeightStandard.weight_0sd,
        heightWeightStandard.weight_plus_1sd,
        heightWeightStandard.weight_plus_2sd,
        heightWeightStandard.weight_plus_3sd
      )
    : null;

  const bmi = calculateBMI(weight, height);
  const bmiEvaluation = evaluateZRange(
    bmi,
    standard.bmi_minus_3sd,
    standard.bmi_minus_2sd,
    standard.bmi_minus_1sd,
    standard.bmi_0sd,
    standard.bmi_plus_1sd,
    standard.bmi_plus_2sd,
    standard.bmi_plus_3sd
  );

  const nutrition: GrowthEvaluationResult['nutrition'] = {};

  if (weightEvaluation === '下') nutrition.weight = '低体重';
  if (weightEvaluation === '下下') nutrition.weight = '重度低体重';

  if (heightEvaluation === '下') nutrition.height = '生长迟缓';
  if (heightEvaluation === '下下') nutrition.height = '重度生长迟缓';

  if (heightWeightEvaluation === '上上') nutrition.heightWeight = '重度肥胖';
  else if (heightWeightEvaluation === '上') nutrition.heightWeight = '肥胖';
  else if (heightWeightEvaluation === '中上') nutrition.heightWeight = '超重';
  else if (heightWeightEvaluation === '下') nutrition.heightWeight = '消瘦';
  else if (heightWeightEvaluation === '下下') nutrition.heightWeight = '重度消瘦';

  if (bmiEvaluation === '上上') nutrition.bmi = '重度肥胖';
  else if (bmiEvaluation === '上') nutrition.bmi = '肥胖';
  else if (bmiEvaluation === '中上') nutrition.bmi = '超重';
  else if (bmiEvaluation === '下') nutrition.bmi = '消瘦';
  else if (bmiEvaluation === '下下') nutrition.bmi = '重度消瘦';

  return {
    heightEvaluation,
    weightEvaluation,
    heightWeightEvaluation,
    bmi,
    bmiEvaluation,
    nutrition
  };
}
