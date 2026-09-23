export type Gender = 'boy' | 'girl';
export type HeightType = 'height' | 'length';
export type AgeMetric = 'weight' | 'stature' | 'bmi' | 'headCircumference';

/** WS/T 423—2022 表2规定的五档生长水平。 */
export type GrowthLevel = '下' | '中下' | '中' | '中上' | '上';

/** 相对于七条标准差阈值的详细区间；不是连续 Z-score。 */
export type SdBand =
  | 'belowMinus3Sd'
  | 'minus3ToMinus2Sd'
  | 'minus2ToMinus1Sd'
  | 'minus1ToMedian'
  | 'medianToPlus1Sd'
  | 'plus1ToPlus2Sd'
  | 'plus2ToPlus3Sd'
  | 'atOrAbovePlus3Sd';

export interface SdThresholds {
  minus3sd: number;
  minus2sd: number;
  minus1sd: number;
  median: number;
  plus1sd: number;
  plus2sd: number;
  plus3sd: number;
}

export interface ReferenceInterpolation {
  input: number;
  lowerKey: number;
  upperKey: number;
  fraction: number;
  interpolated: boolean;
  extrapolated: boolean;
}

export interface StandardLookup {
  thresholds: SdThresholds;
  reference: ReferenceInterpolation;
}

export interface NearestBoundary {
  sd: -3 | -2 | -1 | 0 | 1 | 2 | 3;
  value: number;
  /** 实测值减去最近阈值；正值表示高于该阈值。 */
  signedDistance: number;
  absoluteDistance: number;
}

export interface MetricEvaluation extends StandardLookup {
  value: number;
  level: GrowthLevel;
  sdBand: SdBand;
  nearestBoundary: NearestBoundary;
}

export interface GrowthStandardMetadata {
  code: 'WS/T 423—2022';
  name: '7岁以下儿童生长标准';
  publisher: string;
  publishedAt: '2022-09-19';
  effectiveAt: '2023-03-01';
  lookupMode: 'linear-interpolation';
}

export type NutritionStatus =
  | '低体重'
  | '重度低体重'
  | '生长迟缓'
  | '重度生长迟缓'
  | '消瘦'
  | '重度消瘦'
  | '超重'
  | '肥胖'
  | '重度肥胖';
