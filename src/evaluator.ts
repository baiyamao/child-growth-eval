import {
  Gender,
  GrowthLevel,
  GrowthStandardMetadata,
  HeightType,
  MetricEvaluation,
  NearestBoundary,
  NutritionStatus,
  SdBand,
  SdThresholds,
  StandardLookup,
} from './types';
import {
  getGrowthStandards,
  getHeightWeightStandard,
  growthStandardMetadata,
  inferHeightType,
} from './reference';

export interface GrowthInput {
  gender: Gender;
  /** 整月龄，范围为 0～83。 */
  ageInMonths: number;
  /** 身长或身高，单位 cm。24月以下按身长，24月及以上按身高。 */
  height: number;
  /** 体重，单位 kg。 */
  weight: number;
  /** 可选兼容字段；与月龄推断结果冲突时抛错。 */
  heightType?: HeightType;
  /** 可选头围，单位 cm；标准仅支持 0～36 月龄。 */
  headCircumference?: number;
}

export interface GrowthEvaluationResult {
  standard: GrowthStandardMetadata;
  heightType: HeightType;
  bmi: number;
  heightEvaluation: GrowthLevel;
  weightEvaluation: GrowthLevel;
  heightWeightEvaluation: GrowthLevel | null;
  bmiEvaluation: GrowthLevel;
  headCircumferenceEvaluation?: GrowthLevel;
  sdBands: {
    height: SdBand;
    weight: SdBand;
    heightWeight: SdBand | null;
    bmi: SdBand;
    headCircumference?: SdBand;
  };
  nutrition: {
    weight?: NutritionStatus;
    height?: NutritionStatus;
    heightWeight?: NutritionStatus;
    bmi?: NutritionStatus;
  };
  evaluations: {
    height: MetricEvaluation;
    weight: MetricEvaluation;
    heightWeight: MetricEvaluation | null;
    bmi: MetricEvaluation;
    headCircumference?: MetricEvaluation;
  };
  unavailableReasons: {
    heightWeight?: string;
  };
}

const boundaryEntries = (thresholds: SdThresholds): Array<[NearestBoundary['sd'], number]> => [
  [-3, thresholds.minus3sd],
  [-2, thresholds.minus2sd],
  [-1, thresholds.minus1sd],
  [0, thresholds.median],
  [1, thresholds.plus1sd],
  [2, thresholds.plus2sd],
  [3, thresholds.plus3sd],
];

function evaluateLevel(value: number, thresholds: SdThresholds): GrowthLevel {
  if (value < thresholds.minus3sd) return '下下';
  if (value < thresholds.minus2sd) return '下';
  if (value < thresholds.minus1sd) return '中下';
  if (value < thresholds.median) return '中-';
  if (value < thresholds.plus1sd) return '中+';
  if (value < thresholds.plus2sd) return '中上';
  if (value < thresholds.plus3sd) return '上';
  return '上上';
}

function evaluateSdBand(value: number, thresholds: SdThresholds): SdBand {
  if (value < thresholds.minus3sd) return 'belowMinus3Sd';
  if (value < thresholds.minus2sd) return 'minus3ToMinus2Sd';
  if (value < thresholds.minus1sd) return 'minus2ToMinus1Sd';
  if (value < thresholds.median) return 'minus1ToMedian';
  if (value < thresholds.plus1sd) return 'medianToPlus1Sd';
  if (value < thresholds.plus2sd) return 'plus1ToPlus2Sd';
  if (value < thresholds.plus3sd) return 'plus2ToPlus3Sd';
  return 'atOrAbovePlus3Sd';
}

function nearestBoundary(value: number, thresholds: SdThresholds): NearestBoundary {
  const [sd, boundary] = boundaryEntries(thresholds).reduce((nearest, current) =>
    Math.abs(value - current[1]) < Math.abs(value - nearest[1]) ? current : nearest
  );
  const signedDistance = value - boundary;
  return { sd, value: boundary, signedDistance, absoluteDistance: Math.abs(signedDistance) };
}

function evaluateMetric(value: number, standard: StandardLookup): MetricEvaluation {
  return {
    value,
    level: evaluateLevel(value, standard.thresholds),
    sdBand: evaluateSdBand(value, standard.thresholds),
    nearestBoundary: nearestBoundary(value, standard.thresholds),
    ...standard,
  };
}

function calculateBMI(weight: number, height: number): number {
  return weight / Math.pow(height / 100, 2);
}

function requireFinitePositive(name: string, value: number): void {
  if (!Number.isFinite(value) || value <= 0) {
    throw new RangeError(`${name} 必须是大于 0 的有限数值`);
  }
}

function validateInput(input: GrowthInput): HeightType {
  if (input.gender !== 'boy' && input.gender !== 'girl') {
    throw new TypeError('gender 必须是 boy 或 girl');
  }
  if (!Number.isInteger(input.ageInMonths) || input.ageInMonths < 0 || input.ageInMonths >= 84) {
    throw new RangeError('ageInMonths 必须是 0～83 之间的整数');
  }
  requireFinitePositive('height', input.height);
  requireFinitePositive('weight', input.weight);
  if (input.headCircumference !== undefined) {
    requireFinitePositive('headCircumference', input.headCircumference);
    if (input.ageInMonths > 36) {
      throw new RangeError('头围标准仅适用于 0～36 月龄儿童');
    }
  }

  const inferred = inferHeightType(input.ageInMonths);
  if (input.heightType !== undefined && input.heightType !== inferred) {
    throw new RangeError(
      `${input.ageInMonths} 月龄应使用 ${inferred}，不能使用 ${input.heightType}`
    );
  }
  return inferred;
}

function undernutritionStatus(
  evaluation: MetricEvaluation,
  moderate: NutritionStatus,
  severe: NutritionStatus
): NutritionStatus | undefined {
  if (evaluation.value < evaluation.thresholds.minus3sd) return severe;
  if (evaluation.value < evaluation.thresholds.minus2sd) return moderate;
  return undefined;
}

function weightForStatureStatus(evaluation: MetricEvaluation): NutritionStatus | undefined {
  const { value, thresholds } = evaluation;
  if (value < thresholds.minus3sd) return '重度消瘦';
  if (value < thresholds.minus2sd) return '消瘦';
  if (value >= thresholds.plus3sd) return '重度肥胖';
  if (value >= thresholds.plus2sd) return '肥胖';
  if (value >= thresholds.plus1sd) return '超重';
  return undefined;
}

/** 根据 WS/T 423—2022 评价 7 岁以下儿童生长水平与营养状况。 */
export function evaluateGrowth(input: GrowthInput): GrowthEvaluationResult {
  const heightType = validateInput(input);
  const standards = getGrowthStandards(input.gender, input.ageInMonths);
  if (!standards.weight || !standards.stature || !standards.bmi) {
    throw new Error(`年龄 ${input.ageInMonths} 月的标准数据未找到`);
  }

  const bmi = calculateBMI(input.weight, input.height);
  const height = evaluateMetric(input.height, standards.stature);
  const weight = evaluateMetric(input.weight, standards.weight);
  const bmiEvaluation = evaluateMetric(bmi, standards.bmi);
  const heightWeightStandard = getHeightWeightStandard(input.gender, heightType, input.height);
  const heightWeight = heightWeightStandard
    ? evaluateMetric(input.weight, heightWeightStandard)
    : null;
  const headCircumference = input.headCircumference !== undefined && standards.headCircumference
    ? evaluateMetric(input.headCircumference, standards.headCircumference)
    : undefined;

  const nutrition: GrowthEvaluationResult['nutrition'] = {};
  nutrition.weight = undernutritionStatus(weight, '低体重', '重度低体重');
  nutrition.height = undernutritionStatus(height, '生长迟缓', '重度生长迟缓');
  if (heightWeight) nutrition.heightWeight = weightForStatureStatus(heightWeight);
  nutrition.bmi = weightForStatureStatus(bmiEvaluation);

  const unavailableReasons: GrowthEvaluationResult['unavailableReasons'] = {};
  if (!heightWeight) {
    const range = heightType === 'length' ? '45～100 cm' : '75～130 cm';
    unavailableReasons.heightWeight = `${heightType === 'length' ? '身长' : '身高'}别体重标准范围为 ${range}`;
  }

  return {
    standard: growthStandardMetadata,
    heightType,
    bmi,
    heightEvaluation: height.level,
    weightEvaluation: weight.level,
    heightWeightEvaluation: heightWeight?.level ?? null,
    bmiEvaluation: bmiEvaluation.level,
    headCircumferenceEvaluation: headCircumference?.level,
    sdBands: {
      height: height.sdBand,
      weight: weight.sdBand,
      heightWeight: heightWeight?.sdBand ?? null,
      bmi: bmiEvaluation.sdBand,
      headCircumference: headCircumference?.sdBand,
    },
    nutrition,
    evaluations: { height, weight, heightWeight, bmi: bmiEvaluation, headCircumference },
    unavailableReasons,
  };
}
