import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    // 开发服务器配置
    port: 5173, // 前端开发服务器端口
    proxy: {
      // 代理所有以 /api/v1 开头的请求
      '/api/v1': {
        target: 'http://localhost:6040', // 后端服务器地址
        changeOrigin: true, // 改变请求头中的 origin
        secure: false, // 如果是 https 接口，需要配置这个参数
        // 不需要重写路径，因为后端已经有全局前缀 api/v1
        // 如果后端没有全局前缀，可以使用 rewrite: (path) => path.replace(/^\/api\/v1/, '')
      },
    },
  },
})
