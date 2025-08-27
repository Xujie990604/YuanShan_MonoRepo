# 工具函数库

TODO: 工具库项目的代码组织形式、打包工具配置需要深入学习。可参考开源项目

## package.json 设置

```json
  "name": "@yuan-shan/tools",            // 包名，@yuan-shan 是命名空间
  "type": "module",                      // 声明这是一个 ES 模块包
  "module": "dist/bundle.esm.js",        // ES 模块的入口文件
  "types": "dist/index.d.ts",            // TypeScript 类型声明文件位置
  "exports": {                           // 新的模块导出配置（Node.js 12+）
    ".": {                               // 主入口点（当 import '@yuan-shan/tools' 时）
      "development": "./src/index.ts",   // 开发环境：直接使用 TypeScript 源码
      "import": "./dist/bundle.esm.js",  // 生产环境：使用编译后的 ES 模块
      "types": "./dist/index.d.ts"       // TypeScript 类型声明文件
    }
  }
```