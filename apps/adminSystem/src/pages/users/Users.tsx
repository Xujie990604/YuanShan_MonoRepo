import { useState } from 'react'
import { Form } from 'antd'
import { useQuery } from '@tanstack/react-query'
import type { IUserInfo, IUserListFilterForm } from '../../request/users'
import { getUserListRequest } from '../../request/users'
import { UserRole } from './type'
import UserSearchForm from './UserSearchForm'
import UserTableSection from './UserTableSection'

// 角色下拉选项配置（使用枚举常量的值，避免在各处写魔法数字）
const roleOptions = [
  { label: '管理员', value: UserRole.Admin },
  { label: '普通成员', value: UserRole.Member },
  { label: '访客', value: UserRole.Guest },
]

function UsersPage() {
  // 查询表单实例：负责管理搜索条件的值和校验状态
  const [form] = Form.useForm<IUserListFilterForm>()
  // 当前页码（从 1 开始）
  const [page, setPage] = useState(1)
  // 每页条数
  const [pageSize, setPageSize] = useState(10)
  // 当前搜索条件（从表单中读取后存起来，保证 useQuery 的 queryKey 是可序列化的）
  const [filters, setFilters] = useState<Partial<IUserListFilterForm>>({})

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
    setFilters(values)
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

  return (
    // 整个页面是一个上下排列的三段布局：搜索区 / 表格区 / 分页器
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* 上：搜索区域（独立组件，接收 form 和回调） */}
      <UserSearchForm
        form={form}
        roleOptions={roleOptions}
        onSearch={handleSearch}
        onReset={handleReset}
      />

      {/* 中 + 下：表格 + 分页器 区域（独立组件） */}
      <UserTableSection
        data={data}
        loading={loading}
        page={page}
        pageSize={pageSize}
        total={total}
        onPageChange={handlePageChange}
      />
    </div>
  )
}

export default UsersPage

