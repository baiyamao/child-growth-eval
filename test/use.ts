// @ts-ignore
import { evaluateGrowth } from '../src';

const result = evaluateGrowth({
  gender: 'boy',
  ageInMonths: 24,
  height: 90,
  weight: 32,
  heightType: 'length'
});

console.log(result);
