import { evaluateGrowth } from '../src/evaluator';

const result = evaluateGrowth({
  gender: 'boy',
  ageInMonths: 24,
  height: 87,
  weight: 50,
  heightType: 'height'
});

console.log(result);
