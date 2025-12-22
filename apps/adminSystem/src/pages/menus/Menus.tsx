import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import type { IMenuInfo } from '../../request/menus'
import { getMenusListRequest } from '../../request/menus'
import MenusTableSection from './MenusTableSection'

/**
 * 菜单管理页面
 * 功能：展示系统菜单列表，支持分页查看
 */
function MenusPage() {
  // 当前页码（从 1 开始）
  const [page, setPage] = useState(1)
  // 每页条数
  const [pageSize, setPageSize] = useState(10)

  /**
   * 使用 React Query 管理"菜单列表"这份服务器数据
   */
  const {
    data: queryData,
    isLoading,
    isFetching,
  } = useQuery({
    queryKey: ['menus', { page, pageSize }],
    queryFn: async () => {
      const res = await getMenusListRequest({
        page,
        limit: pageSize,
      })
      return res
    },
    placeholderData: previousData => previousData,
  })

  // 从 React Query 的返回值中拆出真正的列表数据和总条数
  const data: IMenuInfo[] = queryData?.menus ?? []
  const total = queryData?.total ?? 0
  const loading = isLoading || isFetching

  /**
   * 分页组件变化回调
   */
  const handlePageChange = (current: number, size: number) => {
    setPage(current)
    setPageSize(size)
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <MenusTableSection
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

export default MenusPage
