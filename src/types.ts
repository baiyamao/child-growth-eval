export type Gender = 'boy' | 'girl';
export type HeightType = 'height' | 'length';

export interface GrowthStandardEntry {
  age_month: number;
  height_minus_3sd: number;
  height_minus_2sd: number;
  height_minus_1sd: number;
  height_0sd: number;
  height_plus_1sd: number;
  height_plus_2sd: number;
  height_plus_3sd: number;

  weight_minus_3sd: number;
  weight_minus_2sd: number;
  weight_minus_1sd: number;
  weight_0sd: number;
  weight_plus_1sd: number;
  weight_plus_2sd: number;
  weight_plus_3sd: number;

  bmi_minus_3sd: number;
  bmi_minus_2sd: number;
  bmi_minus_1sd: number;
  bmi_0sd: number;
  bmi_plus_1sd: number;
  bmi_plus_2sd: number;
  bmi_plus_3sd: number;
}

export interface HeightWeightStandardEntry {
  height: number;
  weight_minus_3sd: number;
  weight_minus_2sd: number;
  weight_minus_1sd: number;
  weight_0sd: number;
  weight_plus_1sd: number;
  weight_plus_2sd: number;
  weight_plus_3sd: number;
}
