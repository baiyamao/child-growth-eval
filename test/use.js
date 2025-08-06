"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const evaluator_1 = require("../src/evaluator");
const result = (0, evaluator_1.evaluateGrowth)({
    gender: 'boy',
    ageInMonths: 24,
    height: 87,
    weight: 50,
    heightType: 'height'
});
console.log(result);
//# sourceMappingURL=use.js.map