import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import externalGlobals from 'rollup-plugin-external-globals'

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue()],
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
    },
  }
})
