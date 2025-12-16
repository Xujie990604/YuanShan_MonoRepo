import { Card, Table, Pagination, Button, Popconfirm, Space } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import type { IUserInfo } from '../../request/users'
import { Gender } from './type'

interface UserTableSectionProps {
  // 表格数据源
  data: IUserInfo[]
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
  // 点击“编辑”按钮回调
  onEdit: (user: IUserInfo) => void
  // 点击“删除”按钮回调
  onDelete: (user: IUserInfo) => void
}

/**
 * 用户列表 - 表格 + 分页器区域
 * 只负责展示数据和触发分页事件，不直接处理请求逻辑
 */
function UserTableSection({
  data,
  loading,
  page,
  pageSize,
  total,
  onPageChange,
  onEdit,
  onDelete,
}: UserTableSectionProps) {
  /**
   * Table 表头和每一列的配置：
   * - title：列头显示的中文名
   * - dataIndex：对应数据字段（支持嵌套数组写法）
   * - render：自定义渲染函数
   */
  const columns: ColumnsType<IUserInfo> = [
    {
      title: '用户名',
      dataIndex: 'username',
      key: 'username',
    },
    {
      title: '角色',
      key: 'roles',
      render: (_, record) => record.roles.map(role => role.name).join('、') || '-',
    },
    {
      title: '性别',
      key: 'gender',
      render: (_, record) => {
        const g = record.profile?.gender
        // 性别字段是数字枚举：0 女 1 男 其他情况均视为“未知”
        if (g === Gender.Female) return '女'
        if (g === Gender.Male) return '男'
        return '未知'
      },
    },
    {
      title: '地址',
      dataIndex: ['profile', 'address'],
      key: 'address',
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <Space>
          <Button type="link" onClick={() => onEdit(record)}>
            编辑
          </Button>
          <Popconfirm
            title="确认删除该用户？"
            okText="删除"
            cancelText="取消"
            onConfirm={() => onDelete(record)}
          >
            <Button type="link" danger>
              删除
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ]

  return (
    <>
      {/* 中：表格区域 */}
      <Card
        style={{ flex: 1, marginBottom: 16 }}
        styles={{ body: { padding: 0 } }}
      >
        <Table<IUserInfo>
          // 使用地址或用户名作为行 key，保证每行有稳定的唯一标识
          rowKey={record => record.profile?.address ?? record.username}
          columns={columns}
          dataSource={data}
          loading={loading}
          pagination={false}
          scroll={{ y: 'calc(100vh - 290px)' }}
        />
      </Card>

      {/* 下：分页器区域，始终固定在页面底部，不随表格内容高度变化而移动 */}
      <div style={{ textAlign: 'right' }}>
        <Pagination
          current={page}
          pageSize={pageSize}
          total={total}
          showSizeChanger
          onChange={onPageChange}
          onShowSizeChange={onPageChange}
        />
      </div>
    </>
  )
}

export default UserTableSection


