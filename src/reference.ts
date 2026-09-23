import rawStandard from '../references/china_growth_standard_2022.json';
import {
  AgeMetric,
  Gender,
  GrowthStandardMetadata,
  HeightType,
  SdThresholds,
  StandardLookup,
} from './types';

type StandardRow = [number, number, number, number, number, number, number, number];

interface StandardData {
  ageBased: Record<Gender, Record<AgeMetric, StandardRow[]>>;
  statureBasedWeight: Record<Gender, Record<HeightType, StandardRow[]>>;
}

const standardData = rawStandard as unknown as StandardData;

export const growthStandardMetadata: GrowthStandardMetadata = {
  code: 'WS/T 423—2022',
  name: '7岁以下儿童生长标准',
  publisher: '中华人民共和国国家卫生健康委员会',
  publishedAt: '2022-09-19',
  effectiveAt: '2023-03-01',
  lookupMode: 'linear-interpolation',
};

function rowToThresholds(row: StandardRow): SdThresholds {
  return {
    minus3sd: row[1],
    minus2sd: row[2],
    minus1sd: row[3],
    median: row[4],
    plus1sd: row[5],
    plus2sd: row[6],
    plus3sd: row[7],
  };
}

function interpolateRows(lower: StandardRow, upper: StandardRow, input: number): StandardLookup {
  const fraction = lower[0] === upper[0] ? 0 : (input - lower[0]) / (upper[0] - lower[0]);
  const values = lower.slice(1).map((value, index) =>
    value + fraction * (upper[index + 1] - value)
  );
  const thresholds = rowToThresholds([input, ...values] as StandardRow);

  return {
    thresholds,
    reference: {
      input,
      lowerKey: lower[0],
      upperKey: upper[0],
      fraction,
      interpolated: lower[0] !== upper[0] && fraction > 0 && fraction < 1,
      extrapolated: fraction < 0 || fraction > 1,
    },
  };
}

function findStandard(
  series: StandardRow[],
  input: number,
  allowUpperExtrapolation = false
): StandardLookup | undefined {
  const exact = series.find((row) => row[0] === input);
  if (exact) return interpolateRows(exact, exact, input);

  const upperIndex = series.findIndex((row) => row[0] > input);
  if (upperIndex > 0) return interpolateRows(series[upperIndex - 1], series[upperIndex], input);

  if (allowUpperExtrapolation && upperIndex === -1 && series.length >= 2) {
    return interpolateRows(series[series.length - 2], series[series.length - 1], input);
  }

  return undefined;
}

export function inferHeightType(ageInMonths: number): HeightType {
  return ageInMonths < 24 ? 'length' : 'height';
}

export function getAgeStandard(
  gender: Gender,
  metric: AgeMetric,
  ageInMonths: number
): StandardLookup | undefined {
  const series = standardData.ageBased[gender][metric];
  const allowUpperExtrapolation = metric !== 'headCircumference' && ageInMonths < 84;
  return findStandard(series, ageInMonths, allowUpperExtrapolation);
}

export function getHeightWeightStandard(
  gender: Gender,
  heightType: HeightType,
  stature: number
): StandardLookup | undefined {
  return findStandard(standardData.statureBasedWeight[gender][heightType], stature);
}

/** Returns all age-based standards used by the evaluator. */
export function getGrowthStandards(gender: Gender, ageInMonths: number) {
  return {
    weight: getAgeStandard(gender, 'weight', ageInMonths),
    stature: getAgeStandard(gender, 'stature', ageInMonths),
    bmi: getAgeStandard(gender, 'bmi', ageInMonths),
    headCircumference: getAgeStandard(gender, 'headCircumference', ageInMonths),
  };
}
