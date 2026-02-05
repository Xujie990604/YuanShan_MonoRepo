import { X } from 'lucide-react'
import { useRoles } from '@/hooks/use-roles'
import { useRoleStore } from '@/store/role'

/**
 * 角色聚焦 Banner 组件
 */
export default function RoleFocusBanner() {
  const { focusedRoleId, clearFocus } = useRoleStore()
  const { data: roles = [] } = useRoles()

  // 获取当前聚焦的角色
  const role = roles.find((r) => r.id === focusedRoleId)

  // 如果没有聚焦角色,不显示
  if (!role) return null

  return (
    <div
      className="mx-4 mt-4 mb-2 px-6 py-4 rounded-xl flex items-center gap-3"
      style={{
        backgroundColor: `hsl(var(--role-${role.color}-bg))`,
      }}
    >
      {/* 左侧图标：与整块文字垂直居中 */}
      <span className="text-3xl flex-shrink-0 leading-none">{role.icon}</span>

      {/* 中间：名称 + 关闭按钮（同一行）、宣言 */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span
            className="text-base font-medium"
            style={{ color: `hsl(var(--role-${role.color}-text))` }}
          >
            {role.name}
          </span>
          <button
            onClick={() => clearFocus()}
            className="flex-shrink-0 text-muted-foreground hover:text-foreground transition-colors p-0.5 -m-0.5"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        <p className="mt-1 text-sm text-muted-foreground">
          <span className="italic">{role.manifesto}</span>
        </p>
      </div>
    </div>
  )
}
