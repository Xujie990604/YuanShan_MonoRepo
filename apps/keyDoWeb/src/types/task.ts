export type QuadrantType = 'Q1' | 'Q2' | 'Q3' | 'Q4'

export interface Task {
  id: string 
  title: string
  quadrant: QuadrantType
  completed: boolean
  createdAt: string // ISO 8601 格式
  updatedAt: string // ISO 8601 格式
}

export interface QuadrantConfig {
  id: QuadrantType
  label: string
  bgColor: string
  description: string
}

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
