# excludeDependencies

## 一、使用 external 排除依赖

- vite 配置

```js
  build: {
    rollupOptions: {
      // external: ['vant'] 不会匹配 vant/xxx 这类子路径导入
      // 外部化处理 CDN 依赖（同时匹配子路径导入）
      external: (id) => ['axios', 'dayjs', 'vue', 'vant'].some((pkg) => id === pkg || id.startsWith(pkg + '/')),
      plugins: [
        // 将 ESM 导入重写为全局变量访问，适配应用构建（非库构建）
        externalGlobals({
          vue: 'Vue',
          axios: 'axios',
          dayjs: 'dayjs',
          vant: 'vant'
        })
      ]
    },
  }
```

## 二、TODO：使用本地加载的方式