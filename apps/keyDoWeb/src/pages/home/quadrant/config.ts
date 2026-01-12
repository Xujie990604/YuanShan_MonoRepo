import type { QuadrantType } from '@yuan-shan/keydo-contract'

/**
 * 象限配置（前端 UI 配置）
 */
export interface QuadrantConfig {
  id: QuadrantType
  label: string
  bgColor: string
  description: string
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
    bgColor: 'bg-quadrant-q1',
    description: '重要且紧急',
  },
  {
    id: 'Q2',
    label: '重要不紧急',
    bgColor: 'bg-quadrant-q2',
    description: '重要不紧急',
  },
  {
    id: 'Q3',
    label: '不重要但紧急',
    bgColor: 'bg-quadrant-q3',
    description: '不重要但紧急',
  },
  {
    id: 'Q4',
    label: '不重要不紧急',
    bgColor: 'bg-quadrant-q4',
    description: '不重要不紧急',
  },
]
