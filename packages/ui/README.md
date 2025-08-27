# UI

TODO: 组件库项目的代码组织形式、打包工具配置需要深入学习。可参考开源项目
TODO: 发布资源的时候，都需要提供哪些模块的文件，他们各自的适用场景是啥？
TODO: 创建练习场，在当前项目进行组件测试。并编写项目文档。

## package.json 设置

```json
  "name": "@yuan-shan/ui",                // UI 组件库的包名
  "version": "0.0.1",                     // 版本号
  "type": "module",                       // ES 模块包
  "main": "dist/yuanshan-ui.js",          // 旧版本的主入口（兼容性）
  "module": "dist/yuanshan-ui.js",        // ES 模块入口（兼容性）
  "types": "dist/index.d.ts",             // TypeScript 类型声明文件
  "exports": {                            // 现代的导出配置
    ".": {                                // 主入口：import '@yuan-shan/ui'
      "development": "./src/index.ts",    // 开发时：使用源码
      "import": "./dist/yuanshan-ui.js",  // 生产时：使用编译后的文件
      "types": "./dist/index.d.ts"        // 类型声明文件
    },
    "./style": "./dist/css/index.css"     // 样式文件别名：import '@yuan-shan/ui/style'
  },
```
