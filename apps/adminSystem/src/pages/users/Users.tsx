import { useState } from 'react'
import { Form, message } from 'antd'
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query'
import type { IUserInfo, IUserListFilterForm } from '../../request/users'
import { getUserListRequest, deleteUserRequest } from '../../request/users'
import { USER_ROLE_OPTIONS } from './type'
import UserSearchForm from './UserSearchForm'
import UserTableSection from './UserTableSection'
import UserCreateModal from './UserCreateModal'

function UsersPage() {
  // 查询表单实例：负责管理搜索条件的值和校验状态
  const [form] = Form.useForm<IUserListFilterForm>()
  // 当前页码（从 1 开始）
  const [page, setPage] = useState(1)
  // 每页条数
  const [pageSize, setPageSize] = useState(10)
  // 当前搜索条件（从表单中读取后存起来，保证 useQuery 的 queryKey 是可序列化的）
  const [filters, setFilters] = useState<Partial<IUserListFilterForm>>({})
  // 新增用户弹窗是否可见
  const [createVisible, setCreateVisible] = useState(false)
  // 编辑用户弹窗是否可见
  const [editVisible, setEditVisible] = useState(false)
  // 当前正在编辑的用户
  const [editingUser, setEditingUser] = useState<IUserInfo | null>(null)
  // React Query 的客户端实例，用于在新增用户后手动刷新列表
  const queryClient = useQueryClient()

  // 删除用户的 mutation
  const { mutate: mutateDeleteUser } = useMutation({
    mutationFn: (id: number) => deleteUserRequest(id, { loading: true, toast: true }),
    onSuccess: () => {
      message.success('删除用户成功')
      queryClient.invalidateQueries({ queryKey: ['users'] })
    },
  })

  /**
   * 使用 React Query 管理“用户列表”这份服务器数据：
   * - queryKey：['users', { page, pageSize, filters }] 用于标识这一份数据以及缓存
   * - queryFn：真正发请求的函数，返回 Promise<IGetUserInfoRes>
   * - React Query 会自动管理 loading / error / 缓存 / 重新请求 等细节
   */
  const {
    data: queryData,
    isLoading,
    isFetching,
  } = useQuery({
    queryKey: ['users', { page, pageSize, filters }],
    queryFn: async () => {
      const res = await getUserListRequest({
        page,
        limit: pageSize,
        ...filters,
      })
      return res
    },
    placeholderData: previousData => previousData,
  })

  // 从 React Query 的返回值中拆出真正的列表数据和总条数
  const data: IUserInfo[] = queryData?.userInfoList ?? []
  const total = queryData?.total ?? 0
  // isLoading：首次加载；isFetching：包括重新请求的过程
  const loading = isLoading || isFetching

  /**
   * 点击“查询”按钮：
   * - 重置页码到第一页
   * - 带着当前搜索条件重新拉取数据
   */
  const handleSearch = () => {
    setPage(1)
    // 从表单取出当前搜索条件，更新 filters，触发 useQuery 重新请求
    const values = form.getFieldsValue()
    // 注意：getFieldsValue 可能返回同一个对象引用，这里用展开运算符拷贝一份，
    // 确保 React state 一定感知到 filters 发生了变化，从而触发 useQuery 重新请求
    setFilters({ ...values })
  }

  /**
   * 点击“重置”按钮：
   * - 清空表单所有搜索条件
   * - 页码重置到第一页
   * - 使用默认条件重新拉取数据
   */
  const handleReset = () => {
    form.resetFields()
    setPage(1)
    // 清空搜索条件，重置 filters，触发 useQuery 重新请求
    setFilters({})
  }

  /**
   * 分页组件变化回调：
   * - current: 新的页码
   * - size: 新的每页条数
   * 同步更新本地状态并重新请求对应页的数据
   */
  const handlePageChange = (current: number, size: number) => {
    setPage(current)
    setPageSize(size)
    // page / pageSize 更新后，queryKey 变化，React Query 会自动重新请求
  }

  /**
   * 新增 / 编辑 用户成功后：
   * - 关闭所有用户编辑相关弹窗
   * - 手动失效用户列表的缓存，让 React Query 重新拉取最新数据
   */
  const handleCreateSuccess = () => {
    setCreateVisible(false)
    setEditVisible(false)
    setEditingUser(null)
    queryClient.invalidateQueries({ queryKey: ['users'] })
  }

  /**
   * 点击“编辑”按钮：
   * - 记录当前要编辑的用户
   * - 打开编辑弹窗
   */
  const handleEditUser = (user: IUserInfo) => {
    setEditingUser(user)
    setEditVisible(true)
  }

  /**
   * 点击“删除”按钮：
   * - 通过 React Query 的 mutation 调用删除接口
   * - 成功后刷新列表（在 mutation 的 onSuccess 中处理）
   */
  const handleDeleteUser = (user: IUserInfo) => {
    mutateDeleteUser(user.id)
  }

  return (
    // 整个页面是一个上下排列的三段布局：搜索区 / 表格区 / 分页器
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* 上：搜索区域（独立组件，接收 form 和回调） */}
      <UserSearchForm
        form={form}
        roleOptions={USER_ROLE_OPTIONS}
        onSearch={handleSearch}
        onReset={handleReset}
        onCreate={() => setCreateVisible(true)}
      />

      {/* 中 + 下：表格 + 分页器 区域（独立组件） */}
      <UserTableSection
        data={data}
        loading={loading}
        page={page}
        pageSize={pageSize}
        total={total}
        onPageChange={handlePageChange}
        onEdit={handleEditUser}
        onDelete={handleDeleteUser}
      />

      {/* 新增用户弹窗 */}
      <UserCreateModal
        open={createVisible}
        onCancel={() => setCreateVisible(false)}
        onSuccess={handleCreateSuccess}
      />

      {/* 编辑用户弹窗 */}
      <UserCreateModal
        open={editVisible}
        onCancel={() => setEditVisible(false)}
        onSuccess={handleCreateSuccess}
        user={editingUser ?? undefined}
      />
    </div>
  )
}

export default UsersPage

