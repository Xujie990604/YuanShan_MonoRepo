import { Settings, LogOut } from 'lucide-react'
import { useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import ColorfulLogo from '@/components/ColorfulLogo'
import { useAuthStore } from '@/store/auth'

/**
 * 侧边栏组件
 * 
 * 布局结构：
 * - 顶部：Logo + 应用名称 + 系统介绍
 * - 中间：flex-grow 撑开空间
 * - 底部：设置 + 退出登录按钮
 */
export default function Sidebar() {
  const queryClient = useQueryClient()
  const clearAuth = useAuthStore((state) => state.clearAuth)
  const [showLogoutDialog, setShowLogoutDialog] = useState(false)

  /**
   * 退出登录
   * 
   * 步骤：
   * 1. 清除 Zustand 认证状态（token、user）
   * 2. 清除 TanStack Query 缓存（避免下次登录看到旧数据）
   * 3. 跳转到登录页（使用 window.location 确保完全刷新）
   */
  const handleLogout = () => {
    // 清除认证状态
    clearAuth()
    // 清除所有缓存的查询数据
    queryClient.clear()
    // 跳转到登录页
    window.location.href = '/auth/login'
  }

  const handleSettings = () => {
    // TODO: 实现设置页面跳转
    console.log('Settings clicked')
  }

  return (
    <aside className="w-40 h-screen flex flex-col bg-sidebar border-r border-sidebar-border">
      {/* Logo 区域 */}
      <div className="p-4">
        <div className="flex items-center gap-3">
          {/* 彩色四象限 Logo */}
          <ColorfulLogo size="md" />
          {/* 应用名称和标语 */}
          <div className="min-w-0">
            <h1 className="text-lg font-semibold text-sidebar-foreground leading-tight mb-1">
              KeyDo
            </h1>
            <p className="text-xs text-muted-foreground">
              要事优先
            </p>
          </div>
        </div>
      </div>

      <Separator />

      {/* 中间空白区域（未来可添加导航菜单） */}
      <div className="flex-1 p-3">
        {/* 预留：未来可以添加导航菜单项 */}
      </div>

      <Separator />

      {/* 底部操作区域 */}
      <div className="p-3 space-y-2">
        <Button
          variant="ghost"
          className="w-full justify-start gap-2 text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
          onClick={handleSettings}
        >
          <Settings className="w-4 h-4" />
          <span>设置</span>
        </Button>
        <Button
          variant="ghost"
          className="w-full justify-start gap-2 text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
          onClick={() => setShowLogoutDialog(true)}
        >
          <LogOut className="w-4 h-4" />
          <span>退出登录</span>
        </Button>
      </div>

      {/* 退出登录确认弹窗 */}
      <AlertDialog open={showLogoutDialog} onOpenChange={setShowLogoutDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>确认退出登录</AlertDialogTitle>
            <AlertDialogDescription>
              退出登录后，您需要重新登录才能继续使用。是否确认退出？
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>取消</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleLogout}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              确认退出
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </aside>
  )
}
