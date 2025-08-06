明白了，既然你的项目结构不包含 `src` 目录，我会根据你当前的平铺式项目结构重新生成 `README.md` 中的项目结构和相关说明。以下是更新后的版本：

---

````md
# who-growth-eval

> 👶 儿童生长发育评价工具包，基于 WHO 标准曲线数据，使用 TypeScript 编写，支持身高、体重、BMI、身高别体重的 Z-score 计算与营养状态评估。

## ✨ 功能特色

- 支持 0–60 月龄婴幼儿身高/身长发育水平评估
- 支持体重、BMI、身高别体重（weight-for-height/length）评价
- 自动选择 WHO 男/女性标准，依据年龄和身高类型匹配参考值
- 支持中文营养状态输出（如：低体重、消瘦、超重等）
- TypeScript 编写，结构清晰，可扩展性强

## 📦 安装

```bash
npm install who-growth-eval
````

或使用 yarn：

```bash
yarn add who-growth-eval
```

## 🧪 使用示例

```ts
import { evaluateGrowth } from 'who-growth-eval';

const result = evaluateGrowth({
  gender: 'boy',
  ageInMonths: 24,
  height: 87.1,
  weight: 12.2,
  heightType: 'height' // 或 'length'，24个月以下请使用 length
});

console.log(result);
```

## 📁 项目结构

```bash
.
├── evaluator.ts             # 主评价逻辑
├── zscore.ts                # Z-score 区间判断函数
├── bmi.ts                   # BMI 计算函数
├── references/              # WHO 参考标准 JSON 数据
│   ├── boy_who_growth_standards_heights.json
│   ├── boy_who_growth_standards_lengths.json
│   ├── boy_who_height_weights.json
│   ├── boy_who_length_weights.json
│   ├── girl_who_growth_standards_heights.json
│   ├── girl_who_growth_standards_lengths.json
│   ├── girl_who_height_weights.json
│   └── girl_who_length_weights.json
├── types.ts                 # 类型定义
├── index.ts                 # 导出入口
├── use.ts                  # 调试/测试文件
├── tsconfig.json
└── package.json
```

## 📚 接口说明

```ts
type GrowthInput = {
  gender: 'boy' | 'girl';
  ageInMonths: number;
  height: number;
  weight: number;
  heightType: 'height' | 'length'; // 小于24个月使用 'length'
};
```

返回类型：

```ts
type GrowthEvaluationResult = {
  heightEvaluation: ZRangeLabel;
  weightEvaluation: ZRangeLabel | null;
  heightWeightEvaluation: ZRangeLabel | null;
  bmi: number;
  bmiEvaluation: ZRangeLabel | null;
  nutrition: {
    height?: string;
    weight?: string;
    heightWeight?: string;
    bmi?: string;
  };
};
```

## 🧠 Z-score 区间说明

| 标签 | 区间         | 含义   |
| -- | ---------- | ---- |
| 下下 | < -3SD     | 极低水平 |
| 下  | -3 \~ -2SD | 低水平  |
| 中下 | -2 \~ -1SD | 稍低   |
| 中- | -1 \~ 0SD  | 正常偏低 |
| 中+ | 0 \~ +1SD  | 正常偏高 |
| 中上 | +1 \~ +2SD | 稍高   |
| 上  | +2 \~ +3SD | 高水平  |
| 上上 | > +3SD     | 极高水平 |

根据这些标签，`nutrition` 字段会返回：

* **低体重 / 重度低体重**
* **生长迟缓 / 重度生长迟缓**
* **消瘦 / 重度消瘦**
* **超重 / 肥胖 / 重度肥胖**

## 🛠 本地调试与运行

确保你已安装依赖：

```bash
npm install
```

使用 `ts-node` 运行测试文件（你需全局或项目中安装 `ts-node`）：

```bash
npx ts-node use.ts
```

## 📜 License

MIT License © 2025