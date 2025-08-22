import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import externalGlobals from 'rollup-plugin-external-globals'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const isProd = mode === 'production'

  return {
    plugins: [
      vue(),
      // 生产环境注入 CDN（JS + CSS），开发环境用 import 加载
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
    ],
    build: {
      rollupOptions: {
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
      }
    }
  }
})
