import { useState, useEffect } from 'react'
import { AlertCircle, Pencil, Trash2, Smile } from 'lucide-react'
import { EmojiPicker, EmojiPickerSearch, EmojiPickerContent } from '@/components/ui/emoji-picker'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { toast } from '@/lib/simple-toast'
import { useRoles, useCreateRole, useUpdateRole, useDeleteRole } from '@/hooks/use-roles'
import { useRoleStore } from '@/store/role'
import { cn } from '@/lib/utils'
import type { Role, CreateRoleInput, RoleColor } from '@yuan-shan/keydo-contract'

interface RoleManageDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

/**
 * 角色颜色选项配置 (与 contract 中的 ROLE_COLORS 一致)
 */
const ROLE_COLOR_OPTIONS = [
  { value: 'blue' as const, label: '蓝色', bgClass: 'bg-blue-500' },
  { value: 'green' as const, label: '绿色', bgClass: 'bg-green-500' },
  { value: 'orange' as const, label: '橙色', bgClass: 'bg-orange-500' },
  { value: 'purple' as const, label: '紫色', bgClass: 'bg-purple-500' },
  { value: 'red' as const, label: '红色', bgClass: 'bg-red-500' },
  { value: 'yellow' as const, label: '黄色', bgClass: 'bg-yellow-500' },
  { value: 'pink' as const, label: '粉色', bgClass: 'bg-pink-500' },
  { value: 'gray' as const, label: '灰色', bgClass: 'bg-gray-500' },
]

/**
 * 角色管理对话框 (v0 风格 - 列表和表单集成)
 * 
 * 功能:
 * - 顶部显示角色数量进度 (3/5)
 * - 上半部分: 现有角色列表 (可编辑/删除)
 * - 下半部分: 新建/编辑表单 (始终可见)
 * - 参考 v0 设计: 紧凑布局,全中文
 */
export default function RoleManageDialog({ open, onOpenChange }: RoleManageDialogProps) {
  const [editingRoleId, setEditingRoleId] = useState<string | null>(null)
  const [deletingRoleId, setDeletingRoleId] = useState<string | null>(null)
  const [emojiPickerOpen, setEmojiPickerOpen] = useState(false)
  
  // 表单状态
  const [formData, setFormData] = useState({
    emoji: '',
    name: '',
    color: 'blue' as RoleColor,
    manifesto: '',
  })

  const { data: roles = [] } = useRoles()
  const createMutation = useCreateRole()
  const updateMutation = useUpdateRole()
  const deleteMutation = useDeleteRole()
  const { focusedRoleId, clearFocus } = useRoleStore()

  const MAX_ROLES = 5
  const isRoleLimitReached = roles.length >= MAX_ROLES

  // 校验规则（与 contract 一致）
  const NAME_MIN = 1
  const NAME_MAX = 10
  const MANIFESTO_MIN = 10
  const MANIFESTO_MAX = 200

  // 名称是否与已有角色重复（同名称视为重复，排除当前编辑的角色）
  const nameTrim = formData.name.trim()
  const isDuplicateName =
    nameTrim.length >= NAME_MIN &&
    (editingRoleId
      ? roles.some((r) => r.id !== editingRoleId && r.name === nameTrim)
      : roles.some((r) => r.name === nameTrim))

  // 表单是否有效：图标、名称必填且 1-10 字、不重名，宣言 10-200 字
  const manifestoLen = formData.manifesto.trim().length
  const isFormValid =
    formData.emoji.trim().length > 0 &&
    formData.name.trim().length >= NAME_MIN &&
    formData.name.trim().length <= NAME_MAX &&
    !isDuplicateName &&
    manifestoLen >= MANIFESTO_MIN &&
    manifestoLen <= MANIFESTO_MAX

  // 重置表单
  const resetForm = () => {
    setFormData({
      emoji: '',
      name: '',
      color: 'blue',
      manifesto: '',
    })
    setEditingRoleId(null)
    setEmojiPickerOpen(false)
  }

  // 当对话框关闭时，重置表单
  useEffect(() => {
    if (!open) {
      resetForm()
    }
  }, [open])

  // 开始编辑角色
  const startEditRole = (role: Role) => {
    setFormData({
      emoji: role.icon,
      name: role.name,
      color: role.color,
      manifesto: role.manifesto,
    })
    setEditingRoleId(role.id)
  }

  // 选择 Emoji
  const handleEmojiSelect = (data: { emoji: string }) => {
    setFormData({ ...formData, emoji: data.emoji })
    setEmojiPickerOpen(false)
  }

  // 保存角色 (创建或更新)
  const handleSaveRole = async () => {
    if (!formData.emoji.trim()) {
      toast.error('请选择角色图标')
      return
    }
    if (!formData.name.trim()) {
      toast.error('请填写角色名称')
      return
    }
    if (formData.name.trim().length > NAME_MAX) {
      toast.error(`角色名称不能超过 ${NAME_MAX} 字`)
      return
    }
    // 校验名称不能与已有角色重复
    if (editingRoleId) {
      if (roles.some((r) => r.id !== editingRoleId && r.name === nameTrim)) {
        toast.error('已存在同名角色，请使用其他名称')
        return
      }
    } else {
      if (roles.some((r) => r.name === nameTrim)) {
        toast.error('已存在同名角色，请使用其他名称')
        return
      }
    }
    const manifestoTrim = formData.manifesto.trim()
    if (manifestoTrim.length < MANIFESTO_MIN) {
      toast.error(`角色宣言至少需要 ${MANIFESTO_MIN} 字`)
      return
    }
    if (manifestoTrim.length > MANIFESTO_MAX) {
      toast.error(`角色宣言不能超过 ${MANIFESTO_MAX} 字`)
      return
    }

    const data: CreateRoleInput = {
      icon: formData.emoji.trim(),
      name: formData.name.trim(),
      color: formData.color,
      manifesto: manifestoTrim,
    }

    try {
      if (editingRoleId) {
        // 更新现有角色
        await updateMutation.mutateAsync({ id: editingRoleId, data })
        toast.success(`角色"${data.name}"已更新`)
      } else {
        // 创建新角色
        if (isRoleLimitReached) return
        await createMutation.mutateAsync(data)
        toast.success(`角色"${data.name}"已创建`)
      }
      resetForm()
    } catch (error: any) {
      const errorMsg = error.response?.data?.message || error.message || '操作失败'
      toast.error(editingRoleId ? `更新失败: ${errorMsg}` : `创建失败: ${errorMsg}`)
    }
  }

  // 删除角色
  const handleDeleteRole = async (roleId: string) => {
    try {
      if (focusedRoleId === roleId) {
        clearFocus()
      }
      await deleteMutation.mutateAsync(roleId)
      toast.success('角色已删除,相关任务已变为未分类状态')
      setDeletingRoleId(null)
    } catch (error: any) {
      const errorMsg = error.response?.data?.message || '删除角色时出错'
      toast.error(`删除失败: ${errorMsg}`)
    }
  }

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-lg max-h-[90vh] flex flex-col p-0 overflow-hidden">
          {/* 固定表头：不随内容滚动 */}
          <DialogHeader className="flex-shrink-0 px-6 pt-6 pb-2 pr-10">
            <DialogTitle>管理角色</DialogTitle>
            <DialogDescription>
              定义你的人生角色,保持专注于最重要的领域
            </DialogDescription>
          </DialogHeader>

          {/* 可滚动区域：仅此处有垂直滚动条，禁止水平滚动 */}
          <div className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden px-6 pb-6 min-w-0">
            <div className="space-y-4 min-w-0">
              {/* 现有角色列表（最多 5 个，不加列表内滚动） */}
              <div className="space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <Label className="text-xs text-muted-foreground uppercase tracking-wide">
                    我的角色
                  </Label>
                  <span className="flex-shrink-0 rounded-full bg-muted px-3 py-1 text-sm font-medium text-muted-foreground">
                    {roles.length}/{MAX_ROLES}
                  </span>
                </div>
                <div className="space-y-1">
                  {roles.map((role) => (
                    <div
                      key={role.id}
                      className={cn(
                        'flex items-center gap-3 p-2 rounded-lg border transition-colors min-w-0',
                        editingRoleId === role.id
                          ? 'border-primary bg-accent'
                          : 'border-border hover:bg-accent/50'
                      )}
                    >
                      <span className="text-xl flex-shrink-0">{role.icon}</span>
                      <div className="flex-1 min-w-0 overflow-hidden">
                        <p className="text-sm font-medium truncate">{role.name}</p>
                        <p className="text-xs text-muted-foreground truncate">{role.manifesto}</p>
                      </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-7 w-7"
                        onClick={() => startEditRole(role)}
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-7 w-7 text-destructive hover:text-destructive"
                        onClick={() => setDeletingRoleId(role.id)}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </div>
                ))}
                  {roles.length === 0 && (
                    <div className="text-center py-6 text-muted-foreground text-sm">
                      还没有角色,在下方添加你的第一个角色。
                    </div>
                  )}
                </div>
              </div>

              {/* 分割线 */}
              <div className="border-t border-border" />

            {/* 新建/编辑表单 */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-xs text-muted-foreground uppercase tracking-wide">
                  {editingRoleId ? '编辑角色' : '添加新角色'}
                </Label>
                {editingRoleId && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 text-xs"
                    onClick={resetForm}
                  >
                    取消编辑
                  </Button>
                )}
              </div>

              {/* 达到上限提示 */}
              {isRoleLimitReached && !editingRoleId ? (
                <div className="flex flex-col items-center gap-2 py-4 px-3 rounded-lg bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800">
                  <div className="flex items-center gap-2 text-amber-700 dark:text-amber-400">
                    <AlertCircle className="w-4 h-4" />
                    <span className="text-sm font-medium">已达专注上限</span>
                  </div>
                  <p className="text-xs text-amber-600 dark:text-amber-500 text-center">
                    删除一个角色后才能添加新角色。太多角色会导致精力分散。
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {/* Icon + Name 同行 */}
                  <div className="grid grid-cols-[80px_1fr] gap-2">
                    <div className="space-y-1">
                      <Label className="text-xs">图标 <span className="text-destructive">*</span></Label>
                      <Popover open={emojiPickerOpen} onOpenChange={setEmojiPickerOpen}>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className={cn(
                              'w-full h-10 text-2xl',
                              !formData.emoji && 'text-muted-foreground'
                            )}
                          >
                            {formData.emoji || <Smile className="w-5 h-5" />}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-full p-0" align="start">
                          <EmojiPicker
                            className="h-[350px] w-full"
                            onEmojiSelect={handleEmojiSelect}
                          >
                            <EmojiPickerSearch placeholder="搜索表情..." />
                            <EmojiPickerContent />
                          </EmojiPicker>
                        </PopoverContent>
                      </Popover>
                      <p className="text-xs text-muted-foreground">点击按钮选择</p>
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="role-name" className="text-xs">
                        名称 <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        id="role-name"
                        placeholder="如: 父亲、开发者"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        maxLength={NAME_MAX}
                      />
                      <p className="text-xs text-muted-foreground">
                        {formData.name.trim().length}/{NAME_MAX} 字，必填 1-10 字，不可与已有角色重名
                      </p>
                      {isDuplicateName && (
                        <p className="text-xs text-destructive">该名称已被使用，请换一个</p>
                      )}
                    </div>
                  </div>

                  {/* 颜色选择 */}
                  <div className="space-y-1">
                    <Label htmlFor="role-color" className="text-xs">
                      颜色
                    </Label>
                    <Select
                      value={formData.color}
                      onValueChange={(value) => setFormData({ ...formData, color: value as RoleColor })}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="选择颜色" />
                      </SelectTrigger>
                      <SelectContent>
                        {ROLE_COLOR_OPTIONS.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            <span className="flex items-center gap-2">
                              <span className={cn('w-3 h-3 rounded-full', option.bgClass)} />
                              <span>{option.label}</span>
                            </span>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* 宣言：使用 Textarea，带字数限制与提示 */}
                  <div className="space-y-1">
                    <Label htmlFor="role-manifesto" className="text-xs">
                      角色宣言 <span className="text-destructive">*</span>{' '}
                      <span className="text-muted-foreground font-normal">- 你的承诺</span>
                    </Label>
                    <Textarea
                      id="role-manifesto"
                      placeholder="在这个角色里,我想成为什么样的人?我承诺做什么?（至少 10 字）"
                      value={formData.manifesto}
                      onChange={(e) => setFormData({ ...formData, manifesto: e.target.value })}
                      className="min-h-[80px] resize-none"
                      maxLength={MANIFESTO_MAX}
                    />
                    <p className="text-xs text-muted-foreground">
                      {formData.manifesto.trim().length}/{MANIFESTO_MAX} 字，必填 {MANIFESTO_MIN}-{MANIFESTO_MAX} 字
                    </p>
                  </div>

                  {/* 保存按钮及不可点击时的说明 */}
                  <div className="space-y-2">
                    <Button
                      className="w-full"
                      onClick={handleSaveRole}
                      disabled={!isFormValid || createMutation.isPending || updateMutation.isPending}
                    >
                      {editingRoleId ? '更新角色' : '添加角色'}
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* 删除确认对话框 */}
      <AlertDialog open={!!deletingRoleId} onOpenChange={(open) => !open && setDeletingRoleId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>确认删除角色?</AlertDialogTitle>
            <AlertDialogDescription>
              删除后,该角色下的任务将变为"未分类"状态,任务本身不会被删除。
              此操作无法撤销。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>取消</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deletingRoleId && handleDeleteRole(deletingRoleId)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              确认删除
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
