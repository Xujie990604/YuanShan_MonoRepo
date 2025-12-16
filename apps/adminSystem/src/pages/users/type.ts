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



