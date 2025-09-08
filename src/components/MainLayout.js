import React, { useState } from 'react';
import {
  Layout,
  Menu,
  Button,
  Badge,
  Space,
  Typography
} from 'antd';
import {
  DashboardOutlined,
  FileTextOutlined,
  LogoutOutlined,
  BellOutlined
} from '@ant-design/icons';

const { Header, Sider, Content } = Layout;
const { Title } = Typography;

const MainLayout = ({ 
  children, 
  activeTab, 
  onTabChange, 
  onLogout, 
  newTicketsCount 
}) => {
  const [collapsed, setCollapsed] = useState(false);

  const menuItems = [
    {
      key: 'domains',
      icon: <DashboardOutlined />,
      label: 'Domain'
    },
    {
      key: 'tickets',
      icon: (
        <Badge count={newTicketsCount} size="small" offset={[10, 0]}>
          <FileTextOutlined />
        </Badge>
      ),
      label: 'Ticket'
    }
  ];

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider 
        collapsible 
        collapsed={collapsed} 
        onCollapse={setCollapsed}
        theme="dark"
        style={{
          background: '#001529'
        }}
      >
        <div style={{
          height: 64,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderBottom: '1px solid #303030'
        }}>
          <Title level={4} style={{ color: '#1890ff', margin: 0 }}>
            {collapsed ? 'DMS' : 'Domain MS'}
          </Title>
        </div>
        
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[activeTab]}
          items={menuItems}
          onClick={({ key }) => onTabChange(key)}
          style={{
            background: '#001529',
            borderRight: 'none'
          }}
        />
      </Sider>
      
      <Layout>
        <Header style={{
          padding: '0 24px',
          background: '#001529',
          borderBottom: '1px solid #303030',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div />
          <Space>
            {newTicketsCount > 0 && (
              <Badge count={newTicketsCount}>
                <BellOutlined style={{ fontSize: 18, color: '#1890ff' }} />
              </Badge>
            )}
            <Button
              type="text"
              icon={<LogoutOutlined />}
              onClick={onLogout}
              style={{ color: 'rgba(255, 255, 255, 0.65)' }}
            >
              Logout
            </Button>
          </Space>
        </Header>
        
        <Content style={{
          margin: 0,
          padding: 0,
          background: '#000000',
          minHeight: 'calc(100vh - 64px)'
        }}>
          {children}
        </Content>
      </Layout>
    </Layout>
  );
};

export default MainLayout;
