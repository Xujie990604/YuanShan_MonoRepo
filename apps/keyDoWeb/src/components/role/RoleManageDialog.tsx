/**
 * 角色管理对话框组件
 * 
 * 功能概述：
 * - 展示已创建的角色列表（最多 5 个）
 * - 支持创建、编辑、删除角色
 * - 使用 react-hook-form + zod 进行表单管理和校验
 * 
 * 数据流：
 * - 查询：useRoles() Hook（TanStack Query 管理缓存）
 * - 创建：useCreateRole() Mutation
 * - 更新：useUpdateRole() Mutation
 * - 删除：useDeleteRole() Mutation
 */

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { AlertCircle, Pencil, Trash2, Smile } from 'lucide-react'
import { createRoleSchema, type CreateRoleInput, type Role, type RoleColor } from '@yuan-shan/keydo-contract'
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
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
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

/**
 * 角色颜色选项配置（与 keydo-contract 中的 ROLE_COLORS 保持一致）
 */
const ROLE_COLOR_OPTIONS: { value: RoleColor; label: string; bgClass: string }[] = [
  { value: 'blue', label: '蓝色', bgClass: 'bg-blue-500' },
  { value: 'green', label: '绿色', bgClass: 'bg-green-500' },
  { value: 'orange', label: '橙色', bgClass: 'bg-orange-500' },
  { value: 'purple', label: '紫色', bgClass: 'bg-purple-500' },
  { value: 'red', label: '红色', bgClass: 'bg-red-500' },
  { value: 'yellow', label: '黄色', bgClass: 'bg-yellow-500' },
  { value: 'pink', label: '粉色', bgClass: 'bg-pink-500' },
  { value: 'gray', label: '灰色', bgClass: 'bg-gray-500' },
]

/** 最多允许创建的角色数量 */
const MAX_ROLES = 5

interface RoleManageDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export default function RoleManageDialog({ open, onOpenChange }: RoleManageDialogProps) {
  // ========== 状态管理 ==========
  
  // 当前编辑的角色 ID（null 表示新建模式）
  const [editingRoleId, setEditingRoleId] = useState<string | null>(null)
  
  // 待删除的角色 ID（控制删除确认对话框）
  const [deletingRoleId, setDeletingRoleId] = useState<string | null>(null)
  
  // Emoji 选择器状态
  const [emojiPickerOpen, setEmojiPickerOpen] = useState(false)

  // ========== Hooks ==========
  
  const { data: roles = [] } = useRoles()
  const createMutation = useCreateRole()
  const updateMutation = useUpdateRole()
  const deleteMutation = useDeleteRole()
  const { focusedRoleId, clearFocus } = useRoleStore()

  // ========== 表单管理（react-hook-form + zod） ==========
  
  const form = useForm<CreateRoleInput>({
    resolver: zodResolver(createRoleSchema),
    defaultValues: {
      icon: '',
      name: '',
      color: 'blue',
      manifesto: '',
    },
  })

  // 监听表单值变化（用于实时显示字数）
  const nameValue = form.watch('name')
  const manifestoValue = form.watch('manifesto')

  // 是否已达角色上限
  const isRoleLimitReached = roles.length >= MAX_ROLES

  // ========== 副作用 ==========
  
  // 对话框打开时，如果不是编辑模式，确保表单是干净的
  useEffect(() => {
    if (open && !editingRoleId) {
      // 对话框打开且不是编辑模式时，重置表单
      form.reset({
        icon: '',
        name: '',
        color: 'blue',
        manifesto: '',
      })
    }
  }, [open]) // 只依赖 open，避免不必要的重置

  // ========== 事件处理 ==========
  
  /** 开始编辑角色 */
  const startEditRole = (role: Role) => {
    form.reset({
      icon: role.icon,
      name: role.name,
      color: role.color,
      manifesto: role.manifesto,
    })
    setEditingRoleId(role.id)
  }

  /** 取消编辑，重置表单 */
  const cancelEdit = () => {
    form.reset({
      icon: '',
      name: '',
      color: 'blue',
      manifesto: '',
    })
    setEditingRoleId(null)
  }

  /** 处理对话框打开/关闭状态变化 */
  const handleOpenChange = (newOpen: boolean) => {
    // 关闭对话框时重置所有状态
    if (!newOpen) {
      form.reset({
        icon: '',
        name: '',
        color: 'blue',
        manifesto: '',
      })
      setEditingRoleId(null)
      setEmojiPickerOpen(false)
    }
    onOpenChange(newOpen)
  }

  /** 选择 Emoji */
  const handleEmojiSelect = (data: { emoji: string }) => {
    form.setValue('icon', data.emoji, { shouldValidate: true })
    setEmojiPickerOpen(false)
  }

  /** 提交表单（创建或更新） */
  const onSubmit = form.handleSubmit(async (data) => {
    // 检查重名（排除当前编辑的角色）
    const isDuplicate = editingRoleId
      ? roles.some((r) => r.id !== editingRoleId && r.name === data.name.trim())
      : roles.some((r) => r.name === data.name.trim())

    if (isDuplicate) {
      form.setError('name', { message: '已存在同名角色，请使用其他名称' })
      return
    }

    try {
      if (editingRoleId) {
        await updateMutation.mutateAsync({ id: editingRoleId, data })
        toast.success(`角色"${data.name}"已更新`)
      } else {
        if (isRoleLimitReached) return
        await createMutation.mutateAsync(data)
        toast.success(`角色"${data.name}"已创建`)
      }
      form.reset()
      setEditingRoleId(null)
    } catch (error: any) {
      const errorMsg = error.response?.data?.message || error.message || '操作失败'
      toast.error(editingRoleId ? `更新失败: ${errorMsg}` : `创建失败: ${errorMsg}`)
    }
  })

  /** 删除角色 */
  const handleDeleteRole = async (roleId: string) => {
    try {
      if (focusedRoleId === roleId) {
        clearFocus()
      }
      await deleteMutation.mutateAsync(roleId)
      toast.success('角色已删除，相关任务已变为未分类状态')
      setDeletingRoleId(null)
    } catch (error: any) {
      const errorMsg = error.response?.data?.message || '删除角色时出错'
      toast.error(`删除失败: ${errorMsg}`)
    }
  }

  // ========== 渲染 ==========
  
  return (
    <>
      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent className="sm:max-w-lg max-h-[90vh] flex flex-col p-0 overflow-hidden">
          <DialogHeader className="flex-shrink-0 px-6 pt-6 pb-2 pr-10">
            <DialogTitle>管理角色</DialogTitle>
            <DialogDescription>
              定义你的人生角色，保持专注于最重要的领域
            </DialogDescription>
          </DialogHeader>

          <div className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden px-6 pb-6">
            <div className="space-y-4">
              
              {/* ===== 现有角色列表 ===== */}
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
                      还没有角色，在下方添加你的第一个角色。
                    </div>
                  )}
                </div>
              </div>

              <div className="border-t border-border" />

              {/* ===== 新建/编辑表单 ===== */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="text-xs text-muted-foreground uppercase tracking-wide">
                    {editingRoleId ? '编辑角色' : '添加新角色'}
                  </Label>
                  {editingRoleId && (
                    <Button variant="ghost" size="sm" className="h-6 text-xs" onClick={cancelEdit}>
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
                  <Form {...form}>
                    <form onSubmit={onSubmit} className="space-y-3">
                      
                      {/* 图标 + 名称（同行） */}
                      <div className="grid grid-cols-[80px_1fr] gap-2">
                        {/* 图标选择 */}
                        <FormField
                          control={form.control}
                          name="icon"
                          render={({ field }) => (
                            <FormItem>
                              {/* 使用相同的 flex 容器结构保持与名称列对齐 */}
                              <div className="flex items-center justify-between">
                                <FormLabel className="text-xs">图标</FormLabel>
                              </div>
                              <Popover open={emojiPickerOpen} onOpenChange={setEmojiPickerOpen}>
                                <PopoverTrigger asChild>
                                  <FormControl>
                                    <Button
                                      type="button"
                                      variant="outline"
                                      className={cn(
                                        'w-full h-9 text-xl',
                                        !field.value && 'text-muted-foreground'
                                      )}
                                    >
                                      {field.value || <Smile className="w-5 h-5" />}
                                    </Button>
                                  </FormControl>
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
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        {/* 名称输入 */}
                        <FormField
                          control={form.control}
                          name="name"
                          render={({ field }) => (
                            <FormItem>
                              <div className="flex items-center justify-between">
                                <FormLabel className="text-xs">名称</FormLabel>
                                <span className="text-xs text-muted-foreground">
                                  {nameValue.trim().length}/10 字
                                </span>
                              </div>
                              <FormControl>
                                <Input placeholder="如：父亲、开发者" maxLength={10} {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      {/* 颜色选择 */}
                      <FormField
                        control={form.control}
                        name="color"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-xs">颜色</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger className="w-full">
                                  <SelectValue placeholder="选择颜色" />
                                </SelectTrigger>
                              </FormControl>
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
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {/* 角色宣言 */}
                      <FormField
                        control={form.control}
                        name="manifesto"
                        render={({ field }) => (
                          <FormItem>
                            <div className="flex items-center justify-between">
                              <FormLabel className="text-xs">
                                角色宣言 <span className="text-muted-foreground font-normal">- 你的承诺</span>
                              </FormLabel>
                              <span className="text-xs text-muted-foreground">
                                {manifestoValue.trim().length}/200 字
                              </span>
                            </div>
                            <FormControl>
                              <Textarea
                                placeholder="在这个角色里，我想成为什么样的人？我承诺做什么？（至少 10 字）"
                                rows={5}
                                maxLength={200}
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {/* 提交按钮 */}
                      <Button
                        type="submit"
                        className="w-full"
                        disabled={createMutation.isPending || updateMutation.isPending}
                      >
                        {editingRoleId ? '更新角色' : '添加角色'}
                      </Button>
                    </form>
                  </Form>
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
            <AlertDialogTitle>确认删除角色？</AlertDialogTitle>
            <AlertDialogDescription>
              删除后，该角色下的任务将变为"未分类"状态，任务本身不会被删除。
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
