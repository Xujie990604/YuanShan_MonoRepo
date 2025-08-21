import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue()],
  build: {
    rollupOptions: {
      // 确保外部化处理那些你不想打包进库的依赖
      external: ['axios', 'dayjs', 'vue', 'vant'],
      output: {
        format: 'iife',
        globals: {
          axios: 'axios',
          dayjs: 'dayjs',
          vue: 'Vue',
          vant: 'vant',
        },
      },
    },
  }
})
