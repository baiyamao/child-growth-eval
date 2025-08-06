"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getGrowthStandard = getGrowthStandard;
exports.getHeightWeightStandard = getHeightWeightStandard;
const boy_who_growth_standards_heights_json_1 = __importDefault(require("../references/boy_who_growth_standards_heights.json"));
const boy_who_growth_standards_lengths_json_1 = __importDefault(require("../references/boy_who_growth_standards_lengths.json"));
const girl_who_growth_standards_heights_json_1 = __importDefault(require("../references/girl_who_growth_standards_heights.json"));
const girl_who_growth_standards_lengths_json_1 = __importDefault(require("../references/girl_who_growth_standards_lengths.json"));
const boy_who_height_weights_json_1 = __importDefault(require("../references/boy_who_height_weights.json"));
const boy_who_length_weights_json_1 = __importDefault(require("../references/boy_who_length_weights.json"));
const girl_who_height_weights_json_1 = __importDefault(require("../references/girl_who_height_weights.json"));
const girl_who_length_weights_json_1 = __importDefault(require("../references/girl_who_length_weights.json"));
function parseGrowthData(raw) {
    const [headers, ...rows] = raw;
    return rows.map((row) => {
        const entry = {};
        headers?.forEach((key, i) => {
            entry[key] = typeof row[i] === 'string' ? parseFloat(row[i]) : row[i];
        });
        return entry;
    });
}
function parseHeightWeightData(raw) {
    const [headers, ...rows] = raw;
    return rows.map((row) => {
        const entry = {};
        headers?.forEach((key, i) => {
            entry[key] = typeof row[i] === 'string' ? parseFloat(row[i]) : row[i];
        });
        return entry;
    });
}
const growthData = {
    boy: {
        height: parseGrowthData(boy_who_growth_standards_heights_json_1.default),
        length: parseGrowthData(boy_who_growth_standards_lengths_json_1.default)
    },
    girl: {
        height: parseGrowthData(girl_who_growth_standards_heights_json_1.default),
        length: parseGrowthData(girl_who_growth_standards_lengths_json_1.default)
    }
};
const heightWeightData = {
    boy: {
        height: parseHeightWeightData(boy_who_height_weights_json_1.default),
        length: parseHeightWeightData(boy_who_length_weights_json_1.default)
    },
    girl: {
        height: parseHeightWeightData(girl_who_height_weights_json_1.default),
        length: parseHeightWeightData(girl_who_length_weights_json_1.default)
    }
};
function getGrowthStandard(gender, heightType, ageInMonths) {
    return growthData[gender][heightType].find((entry) => entry.age_month === ageInMonths);
}
function getHeightWeightStandard(gender, heightType, height) {
    const closest = roundToNearestHalf(height);
    return heightWeightData[gender][heightType].find((entry) => entry.height === closest);
}
function roundToNearestHalf(value) {
    const int = Math.floor(value);
    const decimal = value - int;
    if (decimal < 0.25)
        return int;
    else if (decimal < 0.75)
        return int + 0.5;
    else
        return int + 1;
}
//# sourceMappingURL=reference.js.map