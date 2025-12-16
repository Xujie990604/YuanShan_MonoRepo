import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // 前端以 /api 开头的请求，转发到后端 http://localhost:3000
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        // 如果后端不需要 /api 前缀，可以打开下面的重写
        // rewrite: path => path.replace(/^\/api/, ''),
      },
    },
  },
})
