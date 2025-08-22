# excludeDependencies

## 一、使用 external 排除依赖

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


```js
// 使用 transformIndexHtml 注入 CDN 资源
{
  name: 'inject-cdn-assets',
  transformIndexHtml(html) {
    if (!isProd) return html
    const js = '\n    <script src="https://cdn.jsdelivr.net/npm/vue@3.5.19/dist/vue.global.min.js"></script>\n' +
                '    <script src="https://cdn.jsdelivr.net/npm/vant@4.9.21/lib/vant.min.js"></script>\n' +
                '    <script src="https://cdn.jsdelivr.net/npm/dayjs@1.11.13/dayjs.min.js"></script>\n' +
                '    <script src="https://cdn.jsdelivr.net/npm/axios@1.10.0/dist/axios.min.js"></script>\n'
    const css = '    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/vant@4.9.21/lib/index.min.css">\n'
    return html.replace('</head>', `${js}${css}</head>`)
  }
}
```

## 二、使用本地加载的方式

- 和 CDN 一样的配置用法，仅需要将 transformIndexHtml 插件中的注入路径修改为 APP 的本地路径即可
- 根目录下的 linkLocalFileDemo 是 示例项目