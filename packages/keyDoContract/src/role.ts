import { z } from 'zod'

// 预设主题色枚举(8 种精选颜色)
export const ROLE_COLORS = [
  'blue',    // 蓝色系 - 专业/理性
  'green',   // 绿色系 - 成长/健康
  'orange',  // 橙色系 - 活力/创造
  'purple',  // 紫色系 - 智慧/精神
  'red',     // 红色系 - 激情/力量
  'yellow',  // 黄色系 - 快乐/阳光
  'pink',    // 粉色系 - 温柔/关怀
  'gray',    // 灰色系 - 沉稳/平衡
] as const

export type RoleColor = typeof ROLE_COLORS[number]

// 角色接口
export interface Role {
  id: string
  name: string
  icon: string          // Emoji 字符
  color: RoleColor
  manifesto: string
  createdAt: string
  updatedAt: string
}

// 创建角色 Schema
export const createRoleSchema = z.object({
  name: z.string()
    .min(1, '角色名称不能为空')
    .max(10, '角色名称不能超过 10 个字符'),
  icon: z.string()
    .min(1, '请选择角色图标')
    .max(10, '图标格式错误'),
  color: z.enum(ROLE_COLORS, { 
    errorMap: () => ({ message: '请选择有效的主题色' }) 
  }),
  manifesto: z.string()
    .min(10, '角色宣言至少需要 10 个字符')
    .max(200, '角色宣言不能超过 200 个字符'),
})

export type CreateRoleInput = z.infer<typeof createRoleSchema>

// 更新角色 Schema
export const updateRoleSchema = z.object({
  name: z.string().min(1, '角色名称不能为空').max(10, '角色名称不能超过 10 个字符').optional(),
  icon: z.string().min(1, '请选择角色图标').max(10, '图标格式错误').optional(),
  color: z.enum(ROLE_COLORS, {
    errorMap: () => ({ message: '请选择有效的主题色' })
  }).optional(),
  manifesto: z.string().max(200, '角色宣言不能超过 200 个字符').optional()
    .refine(
      (val) => !val || val.length >= 10,
      { message: '角色宣言至少需要 10 个字符' }
    ),
})

export type UpdateRoleInput = z.infer<typeof updateRoleSchema>
