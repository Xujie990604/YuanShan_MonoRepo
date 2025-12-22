import { Card, Table, Pagination, Tag } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import type { IMenuInfo } from '../../request/menus'

interface MenusTableSectionProps {
  // 表格数据源
  data: IMenuInfo[]
  // 是否处于加载中
  loading: boolean
  // 当前页码
  page: number
  // 每页条数
  pageSize: number
  // 总条数
  total: number
  // 分页变化回调
  onPageChange: (page: number, pageSize: number) => void
}

/**
 * 菜单列表 - 表格 + 分页器区域
 * 只负责展示数据和触发分页事件，不直接处理请求逻辑
 */
function MenusTableSection({
  data,
  loading,
  page,
  pageSize,
  total,
  onPageChange,
}: MenusTableSectionProps) {
  /**
   * Table 表头和每一列的配置
   */
  const columns: ColumnsType<IMenuInfo> = [
    {
      title: '菜单ID',
      dataIndex: 'id',
      key: 'id',
      width: 100,
    },
    {
      title: '菜单名称',
      dataIndex: 'name',
      key: 'name',
      width: 150,
    },
    {
      title: '菜单路径',
      dataIndex: 'path',
      key: 'path',
      width: 200,
    },
    {
      title: '排序',
      dataIndex: 'order',
      key: 'order',
      width: 100,
      render: (order: number) => <Tag color="blue">{order}</Tag>,
    },
    {
      title: '权限标识',
      dataIndex: 'permission',
      key: 'permission',
    },
  ]

  return (
    <>
      {/* 表格区域 */}
      <Card
        style={{ flex: 1, marginBottom: 16 }}
        styles={{ body: { padding: 0 } }}
      >
        <Table<IMenuInfo>
          rowKey="id"
          columns={columns}
          dataSource={data}
          loading={loading}
          pagination={false}
          scroll={{ y: 'calc(100vh - 200px)' }}
        />
      </Card>

      {/* 分页器区域 */}
      <div style={{ textAlign: 'right' }}>
        <Pagination
          current={page}
          pageSize={pageSize}
          total={total}
          showSizeChanger
          showTotal={total => `共 ${total} 条`}
          onChange={onPageChange}
          onShowSizeChange={onPageChange}
        />
      </div>
    </>
  )
}

export default MenusTableSection

