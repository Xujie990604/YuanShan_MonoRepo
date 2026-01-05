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
 */
export const QUADRANT_CONFIGS: QuadrantConfig[] = [
  {
    id: 'Q1',
    label: '重要且紧急',
    bgColor: 'bg-red-50',
    description: '重要且紧急',
  },
  {
    id: 'Q2',
    label: '重要不紧急',
    bgColor: 'bg-orange-50',
    description: '重要不紧急',
  },
  {
    id: 'Q3',
    label: '不重要但紧急',
    bgColor: 'bg-blue-50',
    description: '不重要但紧急',
  },
  {
    id: 'Q4',
    label: '不重要不紧急',
    bgColor: 'bg-green-50',
    description: '不重要不紧急',
  },
]
