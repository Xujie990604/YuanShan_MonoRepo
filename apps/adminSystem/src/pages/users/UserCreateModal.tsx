import { Modal, Form, Input, Select, Button, Space, message, Upload } from 'antd'
import type { UploadChangeParam, UploadFile } from 'antd/es/upload'
import { useMutation } from '@tanstack/react-query'
import type { ICreateUserReq, IUserInfo, IUpdateUserReq } from '../../request/users'
import { createUserRequest, updateUserRequest } from '../../request/users'
import { GENDER_OPTIONS, USER_ROLE_OPTIONS } from './type'
import { normalizePhotoUrl } from '../../utils/url'

type CreateUserFormValues = ICreateUserReq

interface UserCreateModalProps {
  open: boolean
  onCancel: () => void
  onSuccess: () => void
  // 编辑模式下传入的用户信息；不传则视为“新增用户”
  user?: IUserInfo
}

/**
 * 新增 / 编辑 用户弹窗：
 * - 字段：用户名、密码、性别、头像、地址、角色
 * - gender 和 roles 使用枚举下拉
 * - photo 暂时用输入框
 */
function UserCreateModal({ open, onCancel, onSuccess, user }: UserCreateModalProps) {
  const [form] = Form.useForm<CreateUserFormValues>()
  const isEdit = !!user

  // 编辑模式下的表单初始值（密码默认空）
  const initialValues: Partial<CreateUserFormValues> | undefined = user
    ? {
        username: user.username,
        gender: user.profile?.gender,
        photo: user.profile?.photo,
        address: user.profile?.address,
        roles: user.roles.map(role => role.id),
      }
    : undefined

  const photo = Form.useWatch('photo', form)
  const photoPreviewUrl = normalizePhotoUrl(photo)

  // 使用 React Query 的 useMutation 管理“新增/编辑用户”这个写操作
  const { mutateAsync, isPending } = useMutation({
    mutationFn: (values: CreateUserFormValues) => {
      if (isEdit && user) {
        // 更新用户：所有字段可选，密码为空时不传递 password 字段
        const payload: IUpdateUserReq = { ...values }
        if (!payload.password) {
          delete payload.password
        }
        return updateUserRequest(user.id, payload, { loading: true, toast: true })
      }
      // 新增用户
      return createUserRequest(values, { loading: true, toast: true })
    },
    onSuccess: () => {
      message.success(isEdit ? '编辑用户成功' : '新增用户成功')
      form.resetFields()
      onSuccess()
    },
  })

  const handleOk = async () => {
    const values = await form.validateFields()
    await mutateAsync(values)
  }

  const handleClose = () => {
    if (!isPending) {
      form.resetFields()
      onCancel()
    }
  }

  /**
   * 头像上传回调：
   * - 假设后端返回的数据结构为 IResponseType<{ url: string }>
   * - 上传成功后，从 response 中取出 url，写入表单的 photo 字段
   */
  const handleAvatarUploadChange = (info: UploadChangeParam<UploadFile>) => {
    if (info.file.status === 'done') {
      const resp = info.file.response as any

      // 兼容多种返回结构：
      // 1) IResponseType<{url}>: { code, message, data: { url } }
      // 2) { url: '...' }
      // 3) string(json)
      let rawUrl: string | undefined =
        resp?.data?.url ?? resp?.url ?? resp?.data?.data?.url

      if (!rawUrl && typeof resp === 'string') {
        try {
          const parsed = JSON.parse(resp)
          rawUrl = parsed?.data?.url ?? parsed?.url
        } catch {
          // ignore
        }
      }

      // 注意：表单 photo 字段只存“后端返回的原始值”，预览时再 normalize
      if (rawUrl) {
        form.setFieldsValue({ photo: rawUrl })
        message.success('头像上传成功')
      } else {
        message.warning('上传成功但未获取到可用的头像地址，请检查后端返回值')
      }
    }
  }

  return (
    <Modal
      title={isEdit ? '编辑用户' : '新增用户'}
      open={open}
      onCancel={handleClose}
      footer={null} // 使用自定义的表单按钮，不显示默认 OK/Cancel 按钮
      maskClosable={false}
      destroyOnClose
    >
      <Form<CreateUserFormValues> form={form} layout="vertical" initialValues={initialValues}>
        {/* 用户名 */}
        <Form.Item
          label="用户名"
          name="username"
          rules={[
            { required: true, message: '用户名不能为空' },
            { type: 'string', message: '用户名必须是字符串' },
          ]}
        >
          <Input placeholder="请输入用户名" allowClear />
        </Form.Item>

        {/* 密码（新增必填，编辑可选；编辑时留空表示不修改密码） */}
        <Form.Item
          label="密码"
          name="password"
          rules={[
            ...(isEdit ? [] : [{ required: true, message: '密码不能为空' }]),
            { type: 'string', message: '密码必须是字符串' },
          ]}
        >
          <Input.Password placeholder="请输入密码" autoComplete="new-password" />
        </Form.Item>

        <Space size="middle" style={{ width: '100%' }}>
          {/* 性别 */}
          <Form.Item label="性别" name="gender" style={{ flex: 1, marginBottom: 0 }}>
            <Select
              placeholder="请选择性别"
              allowClear
              options={GENDER_OPTIONS}
            />
          </Form.Item>

          {/* 头像：上传 + 预览 + URL 输入 */}
          <Form.Item label="头像" style={{ flex: 1, marginBottom: 0 }}>
            <Space align="start">
              <Upload
                name="file"
                listType="picture-card"
                showUploadList={false}
                action="/api/v1/upload/avatar" // 假设的头像上传接口，后端按需实现
                onChange={handleAvatarUploadChange}
              >
                {photoPreviewUrl ? (
                  <img
                    src={photoPreviewUrl}
                    alt="avatar"
                    style={{
                      width: 80,
                      height: 80,
                      borderRadius: 8,
                      objectFit: 'cover',
                    }}
                  />
                ) : (
                  <div style={{ fontSize: 12 }}>上传头像</div>
                )}
              </Upload>
              {/* URL 输入框：允许手动粘贴图片地址 */}
              <Form.Item name="photo" noStyle>
                <Input placeholder="或粘贴图片 URL" allowClear style={{ width: 200 }} />
              </Form.Item>
            </Space>
          </Form.Item>
        </Space>

        {/* 地址 */}
        <Form.Item label="地址" name="address">
          <Input placeholder="请输入地址（可选）" allowClear />
        </Form.Item>

        {/* 角色 */}
        <Form.Item label="角色" name="roles">
          <Select
            placeholder="请选择角色（可多选）"
            mode="multiple"
            allowClear
            options={USER_ROLE_OPTIONS}
          />
        </Form.Item>

        {/* 底部占位按钮行（与 Modal 的底部按钮对齐） */}
        <Form.Item style={{ marginBottom: 0 }}>
          <Space style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <Button onClick={handleClose} disabled={isPending}>
              取消
            </Button>
            <Button type="primary" onClick={handleOk} loading={isPending}>
              确认
            </Button>
          </Space>
        </Form.Item>
      </Form>
    </Modal>
  )
}

export default UserCreateModal


