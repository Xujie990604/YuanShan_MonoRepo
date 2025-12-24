/**
 * shadcn/ui 工具函数
 * 用于合并 className，支持条件类名和 tailwind 类名合并
 */
import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

/**
 * cn - className 合并函数
 * 结合 clsx 和 tailwind-merge，可以安全地合并和覆盖 Tailwind CSS 类名
 * 
 * @example
 * cn('px-2 py-1', 'px-3') // => 'py-1 px-3' (后面的 px-3 覆盖了 px-2)
 * cn('text-red-500', condition && 'text-blue-500') // 根据条件应用类名
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

