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
import { evaluateGrowth } from '../src';

const result = evaluateGrowth({
    gender: 'girl',
    ageInMonths: 23,
    height: 90,
    weight: 32,
    heightType: 'length'// 'length' 代表身长（小于24个月时用）
});

console.log(result);
```

输出示例：

```ts
{
    heightEvaluation: '中上',
        weightEvaluation: '上上',
        heightWeightEvaluation: '上上',
        bmi: 39.51,
        bmiEvaluation: '上上',
        nutrition: { heightWeight: '重度肥胖', bmi: '重度肥胖' },
    standard: {
        id: 24,
            age_month: 23,
            height_minus_3sd: 76,
            height_minus_2sd: 79.2,
            height_minus_1sd: 82.3,
            height_0sd: 85.5,
            height_plus_1sd: 88.7,
            height_plus_2sd: 91.9,
            height_plus_3sd: 95,
            weight_minus_3sd: 7.9,
            weight_minus_2sd: 8.9,
            weight_minus_1sd: 10,
            weight_0sd: 11.3,
            weight_plus_1sd: 12.8,
            weight_plus_2sd: 14.6,
            weight_plus_3sd: 16.7,
            head_circumference_minus_3sd: 42.9,
            head_circumference_minus_2sd: 44.3,
            head_circumference_minus_1sd: 45.6,
            head_circumference_0sd: 47,
            head_circumference_plus_1sd: 48.4,
            head_circumference_plus_2sd: 49.8,
            head_circumference_plus_3sd: 51.2,
            bmi_minus_3sd: 12.2,
            bmi_minus_2sd: 13.1,
            bmi_minus_1sd: 14.2,
            bmi_0sd: 15.4,
            bmi_plus_1sd: 16.9,
            bmi_plus_2sd: 18.5,
            bmi_plus_3sd: 20.4
    },
    heightWeightStandard: {
        id: 91,
            height: 90,
            weight_minus_3sd: 9.7,
            weight_minus_2sd: 10.5,
            weight_minus_1sd: 11.4,
            weight_0sd: 12.5,
            weight_plus_1sd: 13.7,
            weight_plus_2sd: 15,
            weight_plus_3sd: 16.5
    }
}

```

> 💡 如果身高/体重等值落在-2SD以下，`nutrition` 字段将输出例如“低体重”“重度消瘦”等中文评价结果。


## 📚 接口说明

```ts
type GrowthInput = {
  gender: 'boy' | 'girl';
  ageInMonths: number;
  height: number;
  weight: number;
  heightType: 'height' | 'length'; // 24个月以下用 length，24个月及以上用 height
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

## 🧠 评价标准范围

`ZRangeLabel` 为：

| 代码 | 含义           |
| -- | ------------ |
| 下下 | < -3SD       |
| 下  | -3SD \~ -2SD |
| 中下 | -2SD \~ -1SD |
| 中- | -1SD \~ 0SD  |
| 中+ | 0SD \~ +1SD  |
| 中上 | +1SD \~ +2SD |
| 上  | +2SD \~ +3SD |
| 上上 | > +3SD       |

营养状态文字（nutrition 字段）将根据上表映射为：

* 低体重、重度低体重
* 生长迟缓、重度生长迟缓
* 消瘦、重度消瘦
* 肥胖、重度肥胖、超重

## 🧩 适用人群

* 儿科医生
* 基层保健工作者
* 早教/托育机构
* 家长工具包

## 🛠 开发与测试

```bash
npm install
npx ts-node use.ts
```

或运行打包：

```bash
npm run build
```

## 📜 License

MIT License