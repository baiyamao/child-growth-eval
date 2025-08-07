import { evaluateGrowth } from '../src/evaluator';

const result = evaluateGrowth({
  gender: 'boy',
  ageInMonths: 113,
  height: 138,
  weight: 32,
  heightType: 'height'
});

console.log(result);
