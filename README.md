# child-growth-eval

基于国家卫生健康委员会 **WS/T 423—2022《7岁以下儿童生长标准》** 的 TypeScript 评价工具，适用于出生至未满 7 周岁（0～83 整月龄）儿童。

## 功能

- 年龄别体重、年龄别身长/身高、年龄别 BMI 评价
- 身长/身高别体重评价
- 可选的 0～36 月龄年龄别头围评价
- 八档生长水平：`下下`、`下`、`中下`、`中-`、`中+`、`中上`、`上`、`上上`
- 低体重、生长迟缓、消瘦、超重、肥胖等营养状况评价
- 对标准表未列出的月龄和非整数身长/身高进行线性插值
- 返回插值节点、详细 SD 区间和距离最近阈值的差值

本工具使用标准公布的七条 SD 阈值进行分档，**不计算连续 Z-score 或精确百分位**。

## 安装

```bash
npm install child-growth-eval
```

## 使用

```ts
import { evaluateGrowth } from 'child-growth-eval';

const result = evaluateGrowth({
  gender: 'girl',
  ageInMonths: 25,
  height: 88.4,
  weight: 12.3,
  headCircumference: 48.1,
});

console.log(result.heightEvaluation);        // 八档生长水平评价
console.log(result.sdBands.height);          // 详细 SD 区间
console.log(result.nutrition);               // 营养状况
console.log(result.evaluations.height.reference); // 插值节点与比例
```

### 输入

```ts
interface GrowthInput {
  gender: 'boy' | 'girl';
  ageInMonths: number;       // 0～83 的整数
  height: number;            // cm
  weight: number;            // kg
  heightType?: 'length' | 'height'; // 兼容字段，通常无需传入
  headCircumference?: number;       // cm，仅适用于 0～36 月龄
}
```

24 月以下自动使用卧位身长标准，24 月及以上自动使用立位身高标准。若仍传入 `heightType`，其值必须与月龄一致。

## 插值规则

0～24 月龄的年龄表按月提供标准值；24 月以后按 3 个月提供。缺失月份对相邻节点的七条 SD 阈值分别做线性插值。例如 25 月龄使用 24 月和 27 月节点，比例为 `1/3`。

标准最后一个公布节点为 81 月。82、83 月沿 78～81 月的末段趋势线性外推，返回结果中的 `reference.extrapolated` 为 `true`。

身长别体重标准范围为 45～100 cm，身高别体重标准范围为 75～130 cm。范围内的非整数值在相邻 1 cm 节点之间插值；超出范围时该指标返回 `null`，并在 `unavailableReasons` 中说明原因。

插值是数字化实现策略，并非标准正文另行公布的中间节点。结果接近分界线时，应结合测量误差和连续生长趋势判断。

## 返回结果

`heightEvaluation`、`weightEvaluation`、`heightWeightEvaluation`、`bmiEvaluation` 和可选的 `headCircumferenceEvaluation` 使用八档生长水平：

- `下下`：小于 `-3SD`
- `下`：`-3SD`（含）至 `-2SD`（不含）
- `中下`：`-2SD`（含）至 `-1SD`（不含）
- `中-`：`-1SD`（含）至 `0SD`（不含）
- `中+`：`0SD`（含）至 `+1SD`（不含）
- `中上`：`+1SD`（含）至 `+2SD`（不含）
- `上`：`+2SD`（含）至 `+3SD`（不含）
- `上上`：大于或等于 `+3SD`

`sdBands` 提供更细的阈值区间：

- `belowMinus3Sd`
- `minus3ToMinus2Sd`
- `minus2ToMinus1Sd`
- `minus1ToMedian`
- `medianToPlus1Sd`
- `plus1ToPlus2Sd`
- `plus2ToPlus3Sd`
- `atOrAbovePlus3Sd`

每项 `evaluations` 还包含：

- 实测值及七条 SD 阈值
- 用于插值的上下节点和比例
- `interpolated` / `extrapolated` 标记
- 距离最近阈值的有符号差值和绝对差值

## 从 v1 升级

v2 仅使用 WS/T 423—2022，不再使用 WHO 数据。主要变化：

- 支持范围改为 0～83 整月龄。
- 生长水平使用国家标准公布的七条 SD 阈值细分为八档。
- `sdBands` 同时提供便于程序处理的稳定英文区间标识。
- `heightType` 不再是必填项。
- `standard` 返回标准元数据；各指标阈值位于 `evaluations`。
- BMI 保留完整计算精度，不在计算阶段四舍五入。

## 数据来源与生成

项目参考数据来自国家卫生健康委员会发布的 [WS/T 423—2022 官方标准全文](https://www.nhc.gov.cn/cms-search/downFiles/e38068f0a62d4a1eb1bd451414444ec1.pdf)附录 B。仓库内的生成脚本会从 `references/7岁以下儿童生长标准.xlsx` 提取并校验数据：

```bash
npm run generate:standard
```

脚本检查数据行数、键顺序、身长/身高范围及七条 SD 阈值的单调性。

## 开发

```bash
npm install
npm run build
npm test
```

## License

MIT
