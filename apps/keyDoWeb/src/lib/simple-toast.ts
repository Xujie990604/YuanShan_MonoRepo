/**
 * 超简单的 Toast 实现
 * 不依赖任何第三方库，直接用 DOM API
 */

type ToastType = 'success' | 'error' | 'info'

interface ToastOptions {
  type?: ToastType
  duration?: number
}

const typeStyles = {
  success: 'bg-green-500',
  error: 'bg-red-500',
  info: 'bg-blue-500',
}

/**
 * 显示 Toast 提示
 */
export function showToast(message: string, options: ToastOptions = {}) {
  const { type = 'info', duration = 3000 } = options

  // 创建容器（如果不存在）
  let container = document.getElementById('simple-toast-container')
  if (!container) {
    container = document.createElement('div')
    container.id = 'simple-toast-container'
    container.className = 'fixed top-24 left-4 z-[9999] flex flex-col gap-2'
    document.body.appendChild(container)
  }

  // 创建 Toast 元素
  const toast = document.createElement('div')
  toast.className = `
    ${typeStyles[type]}
    text-white px-4 py-3 rounded-lg shadow-lg
    transform transition-all duration-300
    translate-x-[-400px] opacity-0
  `.trim()
  toast.textContent = message
  
  container.appendChild(toast)

  // 动画：进入
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      toast.style.transform = 'translateX(0)'
      toast.style.opacity = '1'
    })
  })

  // 自动消失
  setTimeout(() => {
    // 动画：退出
    toast.style.transform = 'translateX(-400px)'
    toast.style.opacity = '0'
    
    // 移除元素
    setTimeout(() => {
      container?.removeChild(toast)
      
      // 如果没有 toast 了，移除容器
      if (container?.children.length === 0) {
        document.body.removeChild(container)
      }
    }, 300)
  }, duration)
}

// 便捷方法
export const toast = {
  success: (message: string) => showToast(message, { type: 'success' }),
  error: (message: string) => showToast(message, { type: 'error' }),
  info: (message: string) => showToast(message, { type: 'info' }),
}

