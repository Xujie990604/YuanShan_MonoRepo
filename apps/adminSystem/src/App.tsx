
import { Layout, Menu, Dropdown, Avatar } from 'antd'
import { UserOutlined } from '@ant-design/icons'
import { Link, Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom'
import LoginPage from './pages/login/Login'
import UsersPage from './pages/users/Users'
import LogsPage from './pages/logs/Logs'
import RolesPage from './pages/roles/Roles'
import MenusPage from './pages/menus/Menus'
import { useAuthStore } from './store/auth'

const { Sider, Header, Content } = Layout

function AdminLayout() {
  const location = useLocation()
  const navigate = useNavigate()
  const setAccessToken = useAuthStore(state => state.setAccessToken)
  const selectedKey = location.pathname.split('/')[1] || 'users'

  const userMenuItems = [
    {
      key: 'logout',
      label: '退出登录',
    },
  ]

  const handleUserMenuClick = ({ key }: { key: string }) => {
    if (key === 'logout') {
      // 清空全局登录状态（内部会同步移除 localStorage 中的 token）
      setAccessToken(null)
      navigate('/login', { replace: true })
    }
  }

  return (
    <Layout style={{ height: '100%' }}>
      {/* 顶部 Header 区域 */}
      <Header
        style={{
          background: '#fff',
          padding: '0 24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <div style={{ fontSize: 18, fontWeight: 500 }}>NoOne Admin</div>
        <Dropdown
          menu={{ items: userMenuItems, onClick: handleUserMenuClick }}
          placement="bottomRight"
        >
          <div style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8 }}>
            <Avatar size={32} icon={<UserOutlined />} />
          </div>
        </Dropdown>
      </Header>
      {/* 左侧 Sider 区域 */}
      <Layout>
        <Sider width={200} theme="light" style={{ background: '#fff' }}>
          {/* 左侧菜单区域 */}
          <Menu
            mode="inline"
            theme="light"
            selectedKeys={[selectedKey]}
            items={[
              { key: 'users', label: <Link to="/users">用户管理</Link> },
              { key: 'logs', label: <Link to="/logs">日志管理</Link> },
              { key: 'roles', label: <Link to="/roles">角色管理</Link> },
              { key: 'menus', label: <Link to="/menus">菜单管理</Link> },
            ]}
          />
        </Sider>
        {/* 内容区域 */}
        <Content style={{ padding: 24 }}>
          <Routes>
            <Route path="/users" element={<UsersPage />} />
            <Route path="/logs" element={<LogsPage />} />
            <Route path="/roles" element={<RolesPage />} />
            <Route path="/menus" element={<MenusPage />} />
            <Route path="*" element={<Navigate to="/users" replace />} />
          </Routes>
        </Content>
      </Layout>
    </Layout>
  )
}

function App() {
  return (
    <Routes>
      {/* 独立的登录路由 */}
      <Route path="/login" element={<LoginPage />} />
      {/* 后台管理布局 + 子路由 */}
      <Route path="/*" element={<AdminLayout />} />
    </Routes>
  )
}

export default App
