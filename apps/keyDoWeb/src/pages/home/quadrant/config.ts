import type { QuadrantType } from '@yuan-shan/keydo-contract'

/**
 * 象限配置（前端 UI 配置）
 */
export interface QuadrantConfig {
  id: QuadrantType
  label: string           // 中文标题
  subtitle: string        // 英文副标题
  description: string     // 简短说明
  bgColor: string         // 背景色类名
  badgeColor: string      // Badge 颜色类名
  hoverColor: string      // 任务卡片 hover 颜色
  borderColor: string     // 象限高亮边框颜色（用于拖拽目标高亮）
}

/**
 * 象限配置数组
 * 
 * bgColor 使用语义化类名（定义在 index.css 中）：
 * - bg-quadrant-q1: 重要且紧急（红色系）
 * - bg-quadrant-q2: 重要不紧急（橙色系）
 * - bg-quadrant-q3: 不重要但紧急（蓝色系）
 * - bg-quadrant-q4: 不重要不紧急（绿色系）
 */
export const QUADRANT_CONFIGS: QuadrantConfig[] = [
  {
    id: 'Q1',
    label: '重要且紧急',
    subtitle: 'Do First',
    description: '立即处理',
    bgColor: 'bg-quadrant-q1',
    badgeColor: 'bg-rose-100 text-rose-700 hover:bg-rose-100 dark:bg-rose-900/30 dark:text-rose-400 dark:hover:bg-rose-900/30',
    hoverColor: 'hover:bg-rose-100/50 dark:hover:bg-rose-900/20',
    borderColor: 'border-rose-400 dark:border-rose-500',
  },
  {
    id: 'Q2',
    label: '重要不紧急',
    subtitle: 'Schedule',
    description: '计划安排',
    bgColor: 'bg-quadrant-q2',
    badgeColor: 'bg-amber-100 text-amber-700 hover:bg-amber-100 dark:bg-amber-900/30 dark:text-amber-400 dark:hover:bg-amber-900/30',
    hoverColor: 'hover:bg-amber-100/50 dark:hover:bg-amber-900/20',
    borderColor: 'border-amber-400 dark:border-amber-500',
  },
  {
    id: 'Q3',
    label: '不重要但紧急',
    subtitle: 'Delegate',
    description: '委派处理',
    bgColor: 'bg-quadrant-q3',
    badgeColor: 'bg-blue-100 text-blue-700 hover:bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400 dark:hover:bg-blue-900/30',
    hoverColor: 'hover:bg-blue-100/50 dark:hover:bg-blue-900/20',
    borderColor: 'border-blue-400 dark:border-blue-500',
  },
  {
    id: 'Q4',
    label: '不重要不紧急',
    subtitle: 'Eliminate',
    description: '尽量避免',
    bgColor: 'bg-quadrant-q4',
    badgeColor: 'bg-emerald-100 text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-900/30 dark:text-emerald-400 dark:hover:bg-emerald-900/30',
    hoverColor: 'hover:bg-emerald-100/50 dark:hover:bg-emerald-900/20',
    borderColor: 'border-emerald-400 dark:border-emerald-500',
  },
]
