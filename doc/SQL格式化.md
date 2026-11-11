# SQL 格式化

## 功能概述
用 sql-formatter 按 MySQL、PostgreSQL、SQLite 等方言整理 SQL，保留关键字风格选择。

## 关键技术栈
- `sql-formatter`

## 关键组件
- `SqlFormatter.vue`

## 实现思路
选择方言后调用格式化函数。语法无法识别时显示错误，不改原文。

## 功能总结
把挤在一行里的查询展开，方便复查条件。
