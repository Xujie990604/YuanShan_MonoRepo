import { Card, Form, Input, Select, Button, Space } from 'antd'
import type { FormInstance } from 'antd'
import type { IUserListFilterForm } from '../../request/users'

interface RoleOption {
  label: string
  value: number
}

interface UserSearchFormProps {
  // antd 表单实例（由父组件创建并传入）
  form: FormInstance<IUserListFilterForm>
  // 角色下拉列表数据
  roleOptions: RoleOption[]
  // 点击“查询”按钮回调
  onSearch: () => void
  // 点击“重置”按钮回调
  onReset: () => void
}

/**
 * 用户列表 - 顶部搜索区域
 * 负责展示搜索条件表单，不直接发起请求，由父组件控制行为
 */
function UserSearchForm({ form, roleOptions, onSearch, onReset }: UserSearchFormProps) {
  return (
    <Card style={{ marginBottom: 16 }} size="small">
      <Form<IUserListFilterForm> form={form} layout="inline">
        {/* 用户姓名输入项 */}
        <Form.Item label="用户姓名" name="username">
          <Input placeholder="请输入用户姓名" allowClear />
        </Form.Item>

        {/* 邮箱输入项 */}
        <Form.Item label="邮箱" name="address">
          <Input placeholder="请输入邮箱" allowClear />
        </Form.Item>

        {/* 角色下拉选择项 */}
        <Form.Item label="角色" name="role">
          <Select
            placeholder="请选择角色"
            allowClear
            style={{ width: 160 }}
            options={roleOptions}
          />
        </Form.Item>

        {/* 查询 / 重置 按钮组 */}
        <Form.Item>
          <Space>
            <Button type="primary" onClick={onSearch}>
              查询
            </Button>
            <Button onClick={onReset}>重置</Button>
          </Space>
        </Form.Item>
      </Form>
    </Card>
  )
}

export default UserSearchForm


