/**
 * 应用入口文件
 * - 配置 React Router
 * - 配置 TanStack Query
 * - 渲染根组件
 */
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { RouterProvider } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import './index.css'
import { router } from './router'

/**
 * 创建 QueryClient 实例
 * 配置全局的查询默认选项
 */
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // 失败后重试次数
      retry: 1,
      // 窗口重新获得焦点时不自动重新获取数据
      refetchOnWindowFocus: false,
      // 数据过期时间（5分钟）
      staleTime: 5 * 60 * 1000,
    },
  },
})

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {/* TanStack Query Provider - 提供数据获取和缓存功能 */}
    <QueryClientProvider client={queryClient}>
      {/* React Router Provider - 提供路由功能 */}
      <RouterProvider router={router} />
    </QueryClientProvider>
  </StrictMode>
)
