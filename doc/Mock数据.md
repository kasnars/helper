# Mock 数据

## 功能概述
根据 TypeScript interface 或一份 JSON 样例生成最多 200 条假数据，可选中文或英文，并导出 JSON 或 CSV。

## 关键技术栈
- `@faker-js/faker`，含 `zh_CN`
- `src/lib/mock.ts`

## 关键组件
- `MockDataGenerator.vue`
- `parseSchema`、`generateRecords`、`recordsToCsv`

## 实现思路
解析一层对象字段、可选标记和数组。字段名里出现 email、phone、city、name 等词时选用对应的 faker 方法，其余按 string、number、boolean 生成。种子固定，方便对照。

## 功能总结
给表格和接口调试准备本地数据。原有的字段点选方式仍然保留。
