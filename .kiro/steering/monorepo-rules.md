---
inclusion: always
---

# YuanShan Monorepo 项目规则

## 项目信息

这是一个基于 pnpm workspace 的 monorepo 项目。

## 依赖管理规则（重要）

### 公共依赖统一在根目录安装

- axios, dayjs, react-router-dom, zustand, @tanstack/react-query 等已在根目录
- 不要在子项目中重复安装这些依赖

### 项目特定依赖在子项目安装

- keyDoWeb 特有：shadcn/ui 相关依赖
- adminSystem 特有：antd 相关依赖

### 安装命令

- 根目录依赖：在根目录运行 `pnpm install [package]`
- 子项目依赖：`pnpm --filter @yuan-shan/keyDoWeb add [package]`

## AI 协作规范

1. 在创建或修改文件前，先检查目录结构
2. 安装依赖前，先检查根目录 package.json 是否已有
3. 修改代码时保持现有的代码风格和架构
4. 添加新功能时，参考项目现有的实现模式
5. 使用中文回复和注释

## 注意事项

1. 这是 monorepo，依赖管理需要特别注意
2. Node.js 版本使用 20.x（项目使用 nvm）
3. 包管理器使用 pnpm，不要使用 npm 或 yarn
