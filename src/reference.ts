import heightBoys from '../references/boy_who_growth_standards_heights.json';
import lengthBoys from '../references/boy_who_growth_standards_lengths.json';
import heightGirls from '../references/girl_who_growth_standards_heights.json';
import lengthGirls from '../references/girl_who_growth_standards_lengths.json';

import hwHeightBoys from '../references/boy_who_height_weights.json';
import hwLengthBoys from '../references/boy_who_length_weights.json';
import hwHeightGirls from '../references/girl_who_height_weights.json';
import hwLengthGirls from '../references/girl_who_length_weights.json';

import {
  Gender,
  HeightType,
  GrowthStandardEntry,
  HeightWeightStandardEntry
} from './types';

function parseGrowthData(raw: any[][]): GrowthStandardEntry[] {
  const [headers, ...rows] = raw;
  return rows.map((row) => {
    const entry: any = {};
    headers?.forEach((key, i) => {
      entry[key] = typeof row[i] === 'string' ? parseFloat(row[i]) : row[i];
    });
    return entry as GrowthStandardEntry;
  });
}

function parseHeightWeightData(raw: any[][]): HeightWeightStandardEntry[] {
  const [headers, ...rows] = raw;
  return rows.map((row) => {
    const entry: any = {};
    headers?.forEach((key, i) => {
      entry[key] = typeof row[i] === 'string' ? parseFloat(row[i]) : row[i];
    });
    return entry as HeightWeightStandardEntry;
  });
}

const growthData = {
  boy: {
    height: parseGrowthData(heightBoys),
    length: parseGrowthData(lengthBoys)
  },
  girl: {
    height: parseGrowthData(heightGirls),
    length: parseGrowthData(lengthGirls)
  }
};

const heightWeightData = {
  boy: {
    height: parseHeightWeightData(hwHeightBoys),
    length: parseHeightWeightData(hwLengthBoys)
  },
  girl: {
    height: parseHeightWeightData(hwHeightGirls),
    length: parseHeightWeightData(hwLengthGirls)
  }
};

export function getGrowthStandard(
  gender: Gender,
  heightType: HeightType,
  ageInMonths: number
): GrowthStandardEntry | undefined {
  return growthData[gender][heightType].find((entry) => entry.age_month === ageInMonths);
}

export function getHeightWeightStandard(
  gender: Gender,
  heightType: HeightType,
  height: number
): HeightWeightStandardEntry | undefined {
  const closest = roundToNearestHalf(height);
  return heightWeightData[gender][heightType].find(
    (entry) => entry.height === closest
  );
}

function roundToNearestHalf(value: number): number {
  const int = Math.floor(value);
  const decimal = value - int;

  if (decimal < 0.25) return int;
  else if (decimal < 0.75) return int + 0.5;
  else return int + 1;
}
