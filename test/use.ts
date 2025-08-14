import { evaluateGrowth } from '../src';

const result = evaluateGrowth({
  gender: 'girl',
  ageInMonths: 23,
  height: 90,
  weight: 32,
  heightType: 'length'
});

console.log(result);
