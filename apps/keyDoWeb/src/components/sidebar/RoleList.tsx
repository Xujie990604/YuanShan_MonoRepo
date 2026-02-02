import { useState } from 'react'
import { Users, Settings2 } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'
import { useRoles } from '@/hooks/use-roles'
import { useTasks } from '@/hooks/use-tasks'
import { useRoleStore } from '@/store/role'
import RoleManageDialog from '@/components/role/RoleManageDialog'

/**
 * 角色列表组件 (v0 风格)
 * 
 * 设计参考:
 * - 分组标题 "My Roles 人生角色"
 * - "全部任务" 作为默认选项（彩色四象限图标）
 * - 角色项: 图标 + 名称
 * - 底部: "Manage Roles 3/5" 管理入口
 */
export default function RoleList() {
  const { data: roles = [], isLoading } = useRoles()
  const { data: tasks = [] } = useTasks()
  const { focusedRoleId, setFocusedRole, clearFocus } = useRoleStore()
  const [manageDialogOpen, setManageDialogOpen] = useState(false)

  if (isLoading) {
    return (
      <div className="space-y-2">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-10 w-full" />
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-1">
      {/* 分组标题 */}
      <div className="flex items-center gap-2 px-3 py-2 text-sm text-muted-foreground">
        <Users className="w-4 h-4" />
        <span className="font-medium">My Roles</span>
        <span className="text-xs">人生角色</span>
      </div>

      {/* 全部任务选项 */}
      <button
        className={cn(
          'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ml-2',
          !focusedRoleId
            ? 'bg-sidebar-accent text-sidebar-accent-foreground font-medium'
            : 'text-sidebar-foreground hover:bg-sidebar-accent/50'
        )}
        onClick={() => clearFocus()}
      >
        <span className="text-lg flex-shrink-0">📋</span>
        <span className="flex-1 text-left">全部任务</span>
      </button>

      {/* 角色列表 */}
      {roles.map((role) => (
        <button
          key={role.id}
          className={cn(
            'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ml-2',
            focusedRoleId === role.id
              ? 'bg-sidebar-accent text-sidebar-accent-foreground font-medium'
              : 'text-sidebar-foreground hover:bg-sidebar-accent/50'
          )}
          onClick={() => setFocusedRole(role.id)}
        >
          <span className="text-lg flex-shrink-0">{role.icon}</span>
          <span className="flex-1 text-left truncate">{role.name}</span>
        </button>
      ))}

      {/* 管理角色按钮 */}
      <button
        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-muted-foreground hover:bg-sidebar-accent/50 transition-colors"
        onClick={() => setManageDialogOpen(true)}
      >
        <Settings2 className="w-4 h-4 flex-shrink-0" />
        <span className="flex-1 text-left">Manage Roles</span>
        <span className="text-xs">{roles.length}/5</span>
      </button>

      {/* 角色管理对话框 */}
      <RoleManageDialog open={manageDialogOpen} onOpenChange={setManageDialogOpen} />
    </div>
  )
}
