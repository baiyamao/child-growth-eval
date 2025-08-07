"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const evaluator_1 = require("../src/evaluator");
const result = (0, evaluator_1.evaluateGrowth)({
    gender: 'boy',
    ageInMonths: 113,
    height: 138,
    weight: 32,
    heightType: 'height'
});
console.log(result);
//# sourceMappingURL=use.js.map