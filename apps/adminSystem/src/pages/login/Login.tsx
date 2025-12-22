import { LockOutlined, UserOutlined } from '@ant-design/icons'
import { Button, Card, Form, Input, Tabs, message } from 'antd'
import type { TabsProps } from 'antd'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import type { IUserLoginRequestData, IUserSignupRequestData } from '../../request/login'
import { userLoginRequest, userSignupRequest } from '../../request/login'
import { useAuthStore } from '../../store/auth'

type LoginFormValues = IUserLoginRequestData
type SignupFormValues = IUserSignupRequestData & { confirmPassword: string }

/**
 * 登录页面组件：
 * - 提供账号密码登录
 * - 提供注册功能（带确认密码和昵称）
 * - 登录成功后跳转到 /users
 */
function LoginPage() {
  // 登录表单实例，用于控制登录表单的值和校验
  const [loginForm] = Form.useForm<LoginFormValues>()
  // 注册表单实例，用于控制注册表单的值和校验
  const [signupForm] = Form.useForm<SignupFormValues>()
  // 当前是否处于提交中（登录或注册），用于按钮 loading 状态
  const [submitting, setSubmitting] = useState(false)
  // 当前激活的 Tab 页签：login 表示登录，signup 表示注册
  const [activeKey, setActiveKey] = useState<'login' | 'signup'>('login')
  // 路由跳转方法，用于登录成功后跳转到后台
  const navigate = useNavigate()
  // 全局登录状态：这里只用到设置 token 的方法，读取时可以在其它组件用 useAuthStore 调用
  const setAccessToken = useAuthStore(state => state.setAccessToken)
  // 存储登录用户 id（用于个人中心查询）
  const setUserId = useAuthStore(state => state.setUserId)

  /**
   * 登录表单提交回调：
   * - 调用登录接口
   * - 成功后保存 access_token 并跳转到用户列表页
   */
  const handleLoginFinish = async (values: LoginFormValues) => {
    setSubmitting(true)
    try {
      const res = await userLoginRequest(values, { loading: true, toast: true })
      if (res.access_token) {
        // 使用 Zustand 全局状态存储 token（内部会同步到 localStorage）
        setAccessToken(res.access_token)
        setUserId(res.userId)
        message.success('登录成功')
        navigate('/users', { replace: true })
      }
    } finally {
      setSubmitting(false)
    }
  }

  /**
   * 注册表单提交回调：
   * - 移除确认密码字段，仅保留后端需要的 username/password/nickname
   * - 调用注册接口并提示成功
   * - 切换回登录 Tab，用户需要手动输入账号密码登录
   */
  const handleSignupFinish = async (values: SignupFormValues) => {
    const { confirmPassword, ...payload } = values
    setSubmitting(true)
    try {
      await userSignupRequest(payload, { loading: true, toast: true })
      message.success('注册成功，请使用账号密码登录')
      setActiveKey('login')
    } finally {
      setSubmitting(false)
    }
  }

  const items: TabsProps['items'] = [
    {
      key: 'login',
      label: '账号登录',
      children: (
        <Form<LoginFormValues> form={loginForm} layout="vertical" onFinish={handleLoginFinish}>

          {/* 用户名输入项 */}
          <Form.Item
            label="用户名"
            name="username"
            rules={[
              { required: true, message: '用户名不能为空' },
              { min: 3, max: 20, message: '用户名长度需为3-20位' },
            ]}
          >
            <Input
              prefix={<UserOutlined />}
              placeholder="请输入用户名"
              allowClear
              autoComplete="username"
            />
          </Form.Item>

          {/* 密码输入项 */}
          <Form.Item
            label="密码"
            name="password"
            rules={[
              { required: true, message: '密码不能为空' },
              { min: 6, max: 64, message: '密码长度需为6-64位' },
            ]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="请输入密码"
              autoComplete="current-password"
            />
          </Form.Item>

          {/* 登录按钮 */}
          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              block
              loading={submitting && activeKey === 'login'}
            >
              登录
            </Button>
          </Form.Item>
        </Form>
      ),
    },
    {
      key: 'signup',
      label: '注册账号',
      children: (
        <Form<SignupFormValues>
          form={signupForm}
          layout="vertical"
          onFinish={handleSignupFinish}
          autoComplete="off" // 注册表单不需要浏览器记住和自动填充
        >

          {/* 用户名输入项 */}
          <Form.Item
            label="用户名"
            name="username"
            rules={[
              { required: true, message: '用户名不能为空' },
              { min: 3, max: 20, message: '用户名长度需为3-20位' },
            ]}
          >
            <Input
              prefix={<UserOutlined />}
              placeholder="请输入用户名"
              allowClear
              autoComplete="off"
            />
          </Form.Item>

          {/* 密码输入项 */}
          <Form.Item
            label="密码"
            name="password"
            rules={[
              { required: true, message: '密码不能为空' },
              { min: 6, max: 64, message: '密码长度需为6-64位' },
            ]}
            hasFeedback
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="请输入密码"
              autoComplete="new-password"
            />
          </Form.Item>

          {/* 确认密码输入项 */}
          <Form.Item
            label="确认密码"
            name="confirmPassword"
            dependencies={['password']}
            hasFeedback
            rules={[
              { required: true, message: '请再次输入密码' },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('password') === value) {
                    return Promise.resolve()
                  }
                  return Promise.reject(new Error('两次输入的密码不一致'))
                },
              }),
            ]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="请再次输入密码"
              autoComplete="new-password"
            />
          </Form.Item>

          {/* 昵称输入项 */}
          <Form.Item
            label="昵称"
            name="nickname"
            rules={[
              { min: 1, max: 20, message: '昵称长度为1-20位' },
            ]}
          >
            <Input placeholder="请输入昵称（可选）" allowClear autoComplete="off" />
          </Form.Item>

          {/* 注册按钮 */}
          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              block
              loading={submitting && activeKey === 'signup'}
            >
              注册
            </Button>
          </Form.Item>
        </Form>
      ),
    },
  ]

  return (
    <div
      style={{
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background:
          'linear-gradient(135deg, rgba(24,144,255,0.12), rgba(111,66,193,0.08))',
      }}
    >
      <Card
        style={{ width: 380 }}
        bodyStyle={{ padding: '32px 32px 24px' }}
        bordered={false}
      >
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <div style={{ fontSize: 24, fontWeight: 600, marginBottom: 8 }}>NoOne Admin</div>
          <div style={{ color: '#888' }}>欢迎使用后台管理系统</div>
        </div>
        <Tabs
          activeKey={activeKey}
          onChange={key => setActiveKey(key as 'login' | 'signup')}
          centered
          items={items}
        />
      </Card>
    </div>
  )
}

export default LoginPage

