/**
 * 角色管理对话框组件
 * 
 * 功能概述：
 * - 展示已创建的角色列表（最多 5 个）
 * - 支持创建、编辑、删除角色
 * - 集成表单和列表，无需切换页面
 * 
 * 核心特性：
 * 1. 角色数量限制：最多 5 个角色（避免精力分散）
 * 2. 表单校验：
 *    - 图标必填（Emoji）
 *    - 名称 1-10 字，不能重名
 *    - 宣言 10-200 字
 *    - 颜色从 8 种预设中选择
 * 3. 编辑模式：点击编辑按钮后，表单自动填充角色数据
 * 4. 删除确认：删除前弹出二次确认对话框
 * 5. 自动刷新：增删改操作成功后，TanStack Query 自动刷新列表
 * 
 * 数据流：
 * - 查询：useRoles() Hook（TanStack Query 管理缓存）
 * - 创建：useCreateRole() Mutation
 * - 更新：useUpdateRole() Mutation
 * - 删除：useDeleteRole() Mutation
 * 
 * 状态管理：
 * - 表单数据：组件内部 useState（formData）
 * - 编辑状态：组件内部 useState（editingRoleId）
 * - 角色列表：TanStack Query 缓存
 * - 聚焦角色：Zustand store（useRoleStore）
 * 
 * 类型定义：
 * - 所有类型从 @yuan-shan/keydo-contract 导入（前后端共享）
 */

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

/**
 * 组件 Props 接口
 */
interface RoleManageDialogProps {
  /** 对话框是否打开 */
  open: boolean
  /** 对话框打开/关闭状态变化的回调函数 */
  onOpenChange: (open: boolean) => void
}

/**
 * 角色颜色选项配置
 * 
 * 说明：
 * - 与 keydo-contract 中的 ROLE_COLORS 保持一致
 * - 8 种精选颜色，每种颜色代表不同的角色属性
 * - value: 后端存储的颜色标识（与 contract 中的 RoleColor 类型对应）
 * - label: 前端显示的中文名称
 * - bgClass: Tailwind CSS 背景色类名（用于颜色选择器的预览圆点）
 */
const ROLE_COLOR_OPTIONS = [
  { value: 'blue' as const, label: '蓝色', bgClass: 'bg-blue-500' },      // 专业/理性
  { value: 'green' as const, label: '绿色', bgClass: 'bg-green-500' },    // 成长/健康
  { value: 'orange' as const, label: '橙色', bgClass: 'bg-orange-500' },  // 活力/创造
  { value: 'purple' as const, label: '紫色', bgClass: 'bg-purple-500' },  // 智慧/精神
  { value: 'red' as const, label: '红色', bgClass: 'bg-red-500' },        // 激情/力量
  { value: 'yellow' as const, label: '黄色', bgClass: 'bg-yellow-500' },  // 快乐/阳光
  { value: 'pink' as const, label: '粉色', bgClass: 'bg-pink-500' },      // 温柔/关怀
  { value: 'gray' as const, label: '灰色', bgClass: 'bg-gray-500' },      // 沉稳/平衡
]

/**
 * 角色管理对话框
 * 
 * 功能:
 * - 顶部显示角色数量进度 (3/5)
 * - 上半部分: 现有角色列表 (可编辑/删除)
 * - 下半部分: 新建/编辑表单 (始终可见)
 */
export default function RoleManageDialog({ open, onOpenChange }: RoleManageDialogProps) {
  // ========== 组件状态管理 ==========
  
  // 当前正在编辑的角色 ID（null 表示新建模式）
  const [editingRoleId, setEditingRoleId] = useState<string | null>(null)
  
  // 待删除的角色 ID（用于控制删除确认对话框）
  const [deletingRoleId, setDeletingRoleId] = useState<string | null>(null)
  
  // Emoji 选择器的打开状态
  const [emojiPickerOpen, setEmojiPickerOpen] = useState(false)
  
  // 表单数据状态（用于新建或编辑角色）
  const [formData, setFormData] = useState({
    emoji: '',                    // 角色图标（Emoji）
    name: '',                     // 角色名称
    color: 'blue' as RoleColor,   // 角色颜色
    manifesto: '',                // 角色宣言
  })

  // ========== Hooks 调用 ==========
  
  // 获取角色列表数据（TanStack Query 自动管理缓存）
  const { data: roles = [] } = useRoles()
  
  // 创建角色的 mutation（成功后会自动刷新角色列表）
  const createMutation = useCreateRole()
  
  // 更新角色的 mutation（成功后会自动刷新角色列表）
  const updateMutation = useUpdateRole()
  
  // 删除角色的 mutation（成功后会自动刷新角色列表和任务列表）
  const deleteMutation = useDeleteRole()
  
  // 从 Zustand store 获取当前聚焦的角色 ID 和清除聚焦的方法
  const { focusedRoleId, clearFocus } = useRoleStore()

  // ========== 常量定义 ==========
  
  // 最多允许创建的角色数量（避免精力分散）
  const MAX_ROLES = 5
  
  // 是否已达到角色数量上限
  const isRoleLimitReached = roles.length >= MAX_ROLES

  // 校验规则常量（与 keydo-contract 中的 Schema 保持一致）
  const NAME_MIN = 1          // 角色名称最小长度
  const NAME_MAX = 10         // 角色名称最大长度
  const MANIFESTO_MIN = 10    // 角色宣言最小长度
  const MANIFESTO_MAX = 200   // 角色宣言最大长度

  // ========== 表单校验逻辑 ==========
  
  // 去除名称首尾空格（用于校验和提交）
  const nameTrim = formData.name.trim()
  
  /**
   * 检查名称是否与已有角色重复
   * 
   * 逻辑：
   * 1. 名称长度至少为 NAME_MIN 才进行重名检查
   * 2. 编辑模式：排除当前编辑的角色，检查其他角色是否重名
   * 3. 新建模式：检查所有角色是否有重名
   */
  const isDuplicateName =
    nameTrim.length >= NAME_MIN &&
    (editingRoleId
      ? roles.some((r) => r.id !== editingRoleId && r.name === nameTrim)
      : roles.some((r) => r.name === nameTrim))

  /**
   * 表单是否有效（所有条件都满足才能提交）
   * 
   * 校验规则：
   * 1. 图标必填（emoji 不为空）
   * 2. 名称 1-10 字
   * 3. 名称不与已有角色重复
   * 4. 宣言 10-200 字
   */
  const manifestoLen = formData.manifesto.trim().length
  const isFormValid =
    formData.emoji.trim().length > 0 &&
    formData.name.trim().length >= NAME_MIN &&
    formData.name.trim().length <= NAME_MAX &&
    !isDuplicateName &&
    manifestoLen >= MANIFESTO_MIN &&
    manifestoLen <= MANIFESTO_MAX

  // ========== 表单操作函数 ==========
  
  /**
   * 重置表单到初始状态
   * 
   * 使用场景：
   * 1. 对话框关闭时
   * 2. 保存成功后
   * 3. 点击"取消编辑"按钮时
   */
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

  /**
   * 监听对话框打开/关闭状态
   * 当对话框关闭时，自动重置表单（避免下次打开时显示旧数据）
   */
  useEffect(() => {
    if (!open) {
      resetForm()
    }
  }, [open])

  /**
   * 开始编辑角色
   * 
   * 流程：
   * 1. 将角色数据填充到表单
   * 2. 设置 editingRoleId（切换到编辑模式）
   * 
   * @param role 要编辑的角色对象
   */
  const startEditRole = (role: Role) => {
    setFormData({
      emoji: role.icon,
      name: role.name,
      color: role.color,
      manifesto: role.manifesto,
    })
    setEditingRoleId(role.id)
  }

  /**
   * 选择 Emoji 图标
   * 
   * @param data Emoji 选择器返回的数据对象
   */
  const handleEmojiSelect = (data: { emoji: string }) => {
    setFormData({ ...formData, emoji: data.emoji })
    setEmojiPickerOpen(false)
  }

  /**
   * 保存角色（创建或更新）
   * 
   * 流程：
   * 1. 前端校验（图标、名称、宣言、重名检查）
   * 2. 根据 editingRoleId 判断是创建还是更新
   * 3. 调用对应的 mutation（TanStack Query 会自动处理缓存刷新）
   * 4. 成功后显示提示并重置表单
   * 5. 失败后显示错误信息
   * 
   * 注意：虽然前端已校验，但后端也会再次校验（使用 Zod Schema）
   */
  const handleSaveRole = async () => {
    // ===== 前端校验 =====
    
    // 校验图标
    if (!formData.emoji.trim()) {
      toast.error('请选择角色图标')
      return
    }
    
    // 校验名称
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
      // 编辑模式：排除当前角色
      if (roles.some((r) => r.id !== editingRoleId && r.name === nameTrim)) {
        toast.error('已存在同名角色，请使用其他名称')
        return
      }
    } else {
      // 新建模式：检查所有角色
      if (roles.some((r) => r.name === nameTrim)) {
        toast.error('已存在同名角色，请使用其他名称')
        return
      }
    }
    
    // 校验宣言
    const manifestoTrim = formData.manifesto.trim()
    if (manifestoTrim.length < MANIFESTO_MIN) {
      toast.error(`角色宣言至少需要 ${MANIFESTO_MIN} 字`)
      return
    }
    if (manifestoTrim.length > MANIFESTO_MAX) {
      toast.error(`角色宣言不能超过 ${MANIFESTO_MAX} 字`)
      return
    }

    // ===== 构造提交数据 =====
    const data: CreateRoleInput = {
      icon: formData.emoji.trim(),
      name: formData.name.trim(),
      color: formData.color,
      manifesto: manifestoTrim,
    }

    // ===== 提交到后端 =====
    try {
      if (editingRoleId) {
        // 更新现有角色
        await updateMutation.mutateAsync({ id: editingRoleId, data })
        toast.success(`角色"${data.name}"已更新`)
      } else {
        // 创建新角色
        if (isRoleLimitReached) return  // 双重保险：虽然 UI 已禁用，但这里再检查一次
        await createMutation.mutateAsync(data)
        toast.success(`角色"${data.name}"已创建`)
      }
      
      // 成功后重置表单
      resetForm()
    } catch (error: any) {
      // 捕获后端返回的错误信息
      const errorMsg = error.response?.data?.message || error.message || '操作失败'
      toast.error(editingRoleId ? `更新失败: ${errorMsg}` : `创建失败: ${errorMsg}`)
    }
  }

  /**
   * 删除角色
   * 
   * 流程：
   * 1. 如果删除的是当前聚焦的角色，先清除聚焦状态（回到"全部任务"视图）
   * 2. 调用删除 mutation（后端会将该角色下的任务设为未分类）
   * 3. 成功后关闭确认对话框并显示提示
   * 4. 失败后显示错误信息
   * 
   * 注意：删除角色不会删除任务，只是将任务的 roleId 设为 null
   * 
   * @param roleId 要删除的角色 ID
   */
  const handleDeleteRole = async (roleId: string) => {
    try {
      // 如果删除的是当前聚焦的角色，先清除聚焦状态
      if (focusedRoleId === roleId) {
        clearFocus()
      }
      
      // 调用删除 API
      await deleteMutation.mutateAsync(roleId)
      
      // 成功提示
      toast.success('角色已删除,相关任务已变为未分类状态')
      
      // 关闭删除确认对话框
      setDeletingRoleId(null)
    } catch (error: any) {
      // 捕获后端返回的错误信息
      const errorMsg = error.response?.data?.message || '删除角色时出错'
      toast.error(`删除失败: ${errorMsg}`)
    }
  }

  // ========== JSX 渲染 ==========
  
  return (
    <>
      {/* 主对话框：角色管理 */}
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-lg max-h-[90vh] flex flex-col p-0 overflow-hidden">
          
          {/* ===== 固定表头：不随内容滚动 ===== */}
          <DialogHeader className="flex-shrink-0 px-6 pt-6 pb-2 pr-10">
            <DialogTitle>管理角色</DialogTitle>
            <DialogDescription>
              定义你的人生角色,保持专注于最重要的领域
            </DialogDescription>
          </DialogHeader>

          {/* ===== 可滚动区域：包含角色列表和表单 ===== */}
          <div className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden px-6 pb-6 min-w-0">
            <div className="space-y-4 min-w-0">
              
              {/* ----- 现有角色列表区域 ----- */}
              <div className="space-y-2">
                {/* 列表标题 + 角色数量进度 */}
                <div className="flex items-center justify-between gap-2">
                  <Label className="text-xs text-muted-foreground uppercase tracking-wide">
                    我的角色
                  </Label>
                  <span className="flex-shrink-0 rounded-full bg-muted px-3 py-1 text-sm font-medium text-muted-foreground">
                    {roles.length}/{MAX_ROLES}
                  </span>
                </div>
                {/* 角色列表（最多 5 个） */}
                <div className="space-y-1">
                  {roles.map((role) => (
                    <div
                      key={role.id}
                      className={cn(
                        'flex items-center gap-3 p-2 rounded-lg border transition-colors min-w-0',
                        // 当前编辑的角色高亮显示
                        editingRoleId === role.id
                          ? 'border-primary bg-accent'
                          : 'border-border hover:bg-accent/50'
                      )}
                    >
                      {/* 角色图标 */}
                      <span className="text-xl flex-shrink-0">{role.icon}</span>
                      
                      {/* 角色信息：名称 + 宣言 */}
                      <div className="flex-1 min-w-0 overflow-hidden">
                        <p className="text-sm font-medium truncate">{role.name}</p>
                        <p className="text-xs text-muted-foreground truncate">{role.manifesto}</p>
                      </div>
                      
                      {/* 操作按钮：编辑 + 删除 */}
                      <div className="flex items-center gap-1 shrink-0">
                        {/* 编辑按钮 */}
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-7 w-7"
                          onClick={() => startEditRole(role)}
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </Button>
                        
                        {/* 删除按钮 */}
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
                  
                  {/* 空状态提示 */}
                  {roles.length === 0 && (
                    <div className="text-center py-6 text-muted-foreground text-sm">
                      还没有角色,在下方添加你的第一个角色。
                    </div>
                  )}
                </div>
              </div>

              {/* ----- 分割线 ----- */}
              <div className="border-t border-border" />

            {/* ----- 新建/编辑表单区域 ----- */}
            <div className="space-y-3">
              {/* 表单标题 + 取消编辑按钮 */}
              <div className="flex items-center justify-between">
                <Label className="text-xs text-muted-foreground uppercase tracking-wide">
                  {editingRoleId ? '编辑角色' : '添加新角色'}
                </Label>
                {/* 编辑模式下显示取消按钮 */}
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

              {/* 达到上限时显示提示（仅在新建模式下显示） */}
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
                /* 表单内容（未达上限或编辑模式下显示） */
                <div className="space-y-3">
                  {/* ----- 图标 + 名称（同一行） ----- */}
                  <div className="grid grid-cols-[80px_1fr] gap-2">
                    
                    {/* 图标选择器 */}
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
                            {/* 显示已选择的 Emoji，或默认图标 */}
                            {formData.emoji || <Smile className="w-5 h-5" />}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-full p-0" align="start">
                          {/* Emoji 选择器（shadcn/ui 组件） */}
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
                    
                    {/* 名称输入框 */}
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
                      {/* 字数统计 + 校验提示 */}
                      <p className="text-xs text-muted-foreground">
                        {formData.name.trim().length}/{NAME_MAX} 字，必填 1-10 字，不可与已有角色重名
                      </p>
                      {/* 重名错误提示 */}
                      {isDuplicateName && (
                        <p className="text-xs text-destructive">该名称已被使用，请换一个</p>
                      )}
                    </div>
                  </div>

                  {/* ----- 颜色选择 ----- */}
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
                        {/* 渲染 8 种预设颜色选项 */}
                        {ROLE_COLOR_OPTIONS.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            <span className="flex items-center gap-2">
                              {/* 颜色圆点 */}
                              <span className={cn('w-3 h-3 rounded-full', option.bgClass)} />
                              {/* 颜色名称 */}
                              <span>{option.label}</span>
                            </span>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* ----- 角色宣言输入框 ----- */}
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
                    {/* 字数统计 + 校验提示 */}
                    <p className="text-xs text-muted-foreground">
                      {formData.manifesto.trim().length}/{MANIFESTO_MAX} 字，必填 {MANIFESTO_MIN}-{MANIFESTO_MAX} 字
                    </p>
                  </div>

                  {/* ----- 保存按钮 ----- */}
                  <div className="space-y-2">
                    <Button
                      className="w-full"
                      onClick={handleSaveRole}
                      disabled={
                        // 禁用条件：表单无效 或 正在提交
                        !isFormValid || createMutation.isPending || updateMutation.isPending
                      }
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

      {/* ===== 删除确认对话框（独立的 AlertDialog） ===== */}
      <AlertDialog 
        open={!!deletingRoleId} 
        onOpenChange={(open) => !open && setDeletingRoleId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>确认删除角色?</AlertDialogTitle>
            <AlertDialogDescription>
              删除后,该角色下的任务将变为"未分类"状态,任务本身不会被删除。
              此操作无法撤销。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            {/* 取消按钮 */}
            <AlertDialogCancel>取消</AlertDialogCancel>
            
            {/* 确认删除按钮（红色警告样式） */}
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
