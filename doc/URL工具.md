# URL 工具

## 功能概述
对文本做 URL 编码和解码，把完整 URL 的查询参数拆成可编辑表格，改完再拼回一条 URL。

## 关键技术栈
- `URL` / `URLSearchParams`
- `src/lib/url.ts`

## 关键组件
- `URLEncoder.vue`

## 实现思路
编码使用 `encodeURIComponent`，解码失败时提示而不是输出乱码。解析保留参数顺序，空键在拼回时丢掉。哈希和端口按原样保留。

## 功能总结
改一个查询参数时不用手改整段字符串。
