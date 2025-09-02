import React, { useState } from 'react';
import {
  DesktopOutlined,
  FileOutlined,
  PieChartOutlined,
  TeamOutlined,
  UserOutlined,
  SettingOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  BellOutlined,
  LogoutOutlined,
} from '@ant-design/icons';
import type { MenuProps } from 'antd';
import {
  Layout,
  Menu,
  Button,
  theme,
  Avatar,
  Dropdown,
  Badge,
  Card,
  Row,
  Col,
  Statistic,
  Table,
  Space,
  Tag,
  Progress,
} from 'antd';

const { Header, Sider, Content } = Layout;

type MenuItem = Required<MenuProps>['items'][number];

function getItem(
  label: React.ReactNode,
  key: React.Key,
  icon?: React.ReactNode,
  children?: MenuItem[],
): MenuItem {
  return {
    key,
    icon,
    children,
    label,
  } as MenuItem;
}

const items: MenuItem[] = [
  getItem('仪表盘', '1', <PieChartOutlined />),
  getItem('用户管理', '2', <UserOutlined />),
  getItem('团队管理', 'sub1', <TeamOutlined />, [
    getItem('团队列表', '3'),
    getItem('权限管理', '4'),
    getItem('角色配置', '5'),
  ]),
  getItem('文件管理', '9', <FileOutlined />),
  getItem('系统设置', 'sub2', <SettingOutlined />, [
    getItem('基础设置', '6'),
    getItem('安全设置', '8'),
  ]),
];

// 用户下拉菜单
const userMenuItems: MenuProps['items'] = [
  {
    key: 'profile',
    label: '个人资料',
    icon: <UserOutlined />,
  },
  {
    key: 'settings',
    label: '设置',
    icon: <SettingOutlined />,
  },
  {
    type: 'divider',
  },
  {
    key: 'logout',
    label: '退出登录',
    icon: <LogoutOutlined />,
    danger: true,
  },
];

// 表格数据
const columns = [
  {
    title: '姓名',
    dataIndex: 'name',
    key: 'name',
  },
  {
    title: '年龄',
    dataIndex: 'age',
    key: 'age',
  },
  {
    title: '地址',
    dataIndex: 'address',
    key: 'address',
  },
  {
    title: '状态',
    key: 'status',
    dataIndex: 'status',
    render: (status: string) => (
      <Tag color={status === '在线' ? 'green' : 'volcano'}>
        {status}
      </Tag>
    ),
  },
  {
    title: '操作',
    key: 'action',
    render: () => (
      <Space size="middle">
        <a>编辑</a>
        <a>删除</a>
      </Space>
    ),
  },
];

const data = [
  {
    key: '1',
    name: '张三',
    age: 32,
    address: '北京市朝阳区',
    status: '在线',
  },
  {
    key: '2',
    name: '李四',
    age: 42,
    address: '上海市浦东新区',
    status: '离线',
  },
  {
    key: '3',
    name: '王五',
    age: 32,
    address: '广州市天河区',
    status: '在线',
  },
];

function App() {
  const [collapsed, setCollapsed] = useState(false);
  const [selectedKey, setSelectedKey] = useState('1');
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();

  const renderContent = () => {
    switch (selectedKey) {
      case '1':
        return (
          <div>
            <h2 style={{ marginBottom: 24 }}>数据概览</h2>
            <Row gutter={16} style={{ marginBottom: 24 }}>
              <Col span={6}>
                <Card>
                  <Statistic
                    title="总用户数"
                    value={11280}
                    prefix={<UserOutlined />}
                    valueStyle={{ color: '#3f8600' }}
                  />
                </Card>
              </Col>
              <Col span={6}>
                <Card>
                  <Statistic
                    title="活跃用户"
                    value={9280}
                    prefix={<TeamOutlined />}
                    valueStyle={{ color: '#1890ff' }}
                  />
                </Card>
              </Col>
              <Col span={6}>
                <Card>
                  <Statistic
                    title="今日订单"
                    value={1520}
                    prefix={<FileOutlined />}
                    valueStyle={{ color: '#cf1322' }}
                  />
                </Card>
              </Col>
              <Col span={6}>
                <Card>
                  <Statistic
                    title="月度收入"
                    value={328900}
                    precision={2}
                    prefix="¥"
                    valueStyle={{ color: '#722ed1' }}
                  />
                </Card>
              </Col>
            </Row>
            
            <Row gutter={16}>
              <Col span={16}>
                <Card title="用户增长趋势" style={{ height: 400 }}>
                  <div style={{ 
                    height: 300, 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    background: '#fafafa',
                    borderRadius: 8
                  }}>
                    <p style={{ color: '#999', fontSize: 16 }}>
                      图表区域 - 可集成 ECharts、Chart.js 等
                    </p>
                  </div>
                </Card>
              </Col>
              <Col span={8}>
                <Card title="系统状态" style={{ height: 400 }}>
                  <div style={{ marginBottom: 16 }}>
                    <p>CPU 使用率</p>
                    <Progress percent={30} />
                  </div>
                  <div style={{ marginBottom: 16 }}>
                    <p>内存使用率</p>
                    <Progress percent={80} status="active" />
                  </div>
                  <div style={{ marginBottom: 16 }}>
                    <p>磁盘使用率</p>
                    <Progress percent={70} status="normal" />
                  </div>
                  <div>
                    <p>网络状态</p>
                    <Progress percent={100} />
                  </div>
                </Card>
              </Col>
            </Row>
          </div>
        );
      case '2':
        return (
          <div>
            <h2 style={{ marginBottom: 24 }}>用户管理</h2>
            <Card>
              <Table columns={columns} dataSource={data} />
            </Card>
          </div>
        );
      case '9':
        return (
          <div>
            <h2 style={{ marginBottom: 24 }}>文件管理</h2>
            <Card>
              <p>文件管理功能开发中...</p>
            </Card>
          </div>
        );
      default:
        return (
          <div>
            <h2 style={{ marginBottom: 24 }}>功能开发中</h2>
            <Card>
              <p>该功能正在开发中，敬请期待...</p>
            </Card>
          </div>
        );
    }
  };

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider trigger={null} collapsible collapsed={collapsed}>
        <div style={{ 
          height: 32, 
          margin: 16, 
          background: 'rgba(255, 255, 255, 0.2)',
          borderRadius: 6,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#fff',
          fontWeight: 'bold'
        }}>
          {collapsed ? 'AS' : 'Admin System'}
        </div>
        <Menu
          theme="dark"
          mode="inline"
          defaultSelectedKeys={['1']}
          selectedKeys={[selectedKey]}
          items={items}
          onClick={({ key }) => setSelectedKey(key)}
        />
      </Sider>
      <Layout>
        <Header style={{ 
          padding: '0 16px', 
          background: colorBgContainer,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <Button
            type="text"
            icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            onClick={() => setCollapsed(!collapsed)}
            style={{
              fontSize: '16px',
              width: 64,
              height: 64,
            }}
          />
          
          <Space size="middle">
            <Badge count={5}>
              <Button type="text" icon={<BellOutlined />} />
            </Badge>
            <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
              <Space style={{ cursor: 'pointer' }}>
                <Avatar icon={<UserOutlined />} />
                <span>管理员</span>
              </Space>
            </Dropdown>
          </Space>
        </Header>
        <Content
          style={{
            margin: '24px 16px',
            padding: 24,
            minHeight: 280,
            background: colorBgContainer,
            borderRadius: borderRadiusLG,
          }}
        >
          {renderContent()}
        </Content>
      </Layout>
    </Layout>
  );
}

export default App
