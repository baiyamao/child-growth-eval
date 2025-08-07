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
  heightType: 'height' // 'length' 代表身长（小于24个月时用）
});

console.log(result);
```

输出示例：

```ts
{
  heightEvaluation: '中+',
  weightEvaluation: '中+',
  heightWeightEvaluation: '中+',
  bmi: 16.11,
  bmiEvaluation: '中+',
  nutrition: {
    weight: undefined,
    height: undefined,
    heightWeight: undefined,
    bmi: undefined
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