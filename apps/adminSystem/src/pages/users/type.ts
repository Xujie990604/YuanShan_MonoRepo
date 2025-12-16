// 角色“枚举”常量（用对象 + 类型别名代替 TS enum，兼容 erasableSyntaxOnly）
export const UserRole = {
  Admin: 1, // 管理员
  Member: 2, // 普通成员
  Guest: 3, // 访客
} as const
export type UserRole = (typeof UserRole)[keyof typeof UserRole]

// 性别“枚举”常量（与后端约定：0 女 1 男）
export const Gender = {
  Female: 0,
  Male: 1,
} as const
export type Gender = (typeof Gender)[keyof typeof Gender]

// 通用下拉选项类型（不依赖 antd）
export interface SelectOption {
  label: string
  value: number
}

// 用户角色下拉选项
export const USER_ROLE_OPTIONS: SelectOption[] = [
  { label: '管理员', value: UserRole.Admin },
  { label: '普通成员', value: UserRole.Member },
  { label: '访客', value: UserRole.Guest },
]

// 性别下拉选项
export const GENDER_OPTIONS: SelectOption[] = [
  { label: '男', value: Gender.Male },
  { label: '女', value: Gender.Female },
]



