import React from 'react';
import { Layout, Menu, Typography, Badge, Dropdown, Space, Button } from 'antd';
import { ShoppingCart, User as UserIcon, BookOpen, Home as HomeIcon, LogOut, LogIn } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

const { Header, Content, Footer } = Layout;
const { Title, Text } = Typography;

interface MainLayoutProps {
    children: React.ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
    const location = useLocation();
    const navigate = useNavigate();
    const { cartCount } = useCart();
    const { user, logout, isAuthenticated } = useAuth();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const userMenuItems = [
        {
            key: 'profile',
            label: <Link to="/profile">个人信息</Link>,
            icon: <UserIcon size={14} />,
        },
        {
            key: 'logout',
            label: '退出登录',
            icon: <LogOut size={14} />,
            onClick: handleLogout,
        },
    ];

    const menuItems = [
        {
            key: '/',
            icon: <HomeIcon size={18} />,
            label: <Link to="/">首页</Link>,
        },
        {
            key: '/cart',
            icon: <Badge count={cartCount} size="small"><ShoppingCart size={18} /></Badge>,
            label: <Link to="/cart">购物车</Link>,
        },
        {
            key: '/orders',
            icon: <BookOpen size={18} />,
            label: <Link to="/orders">我的订单</Link>,
        },
    ];

    return (
        <Layout style={{ minHeight: '100vh' }}>
            <Header style={{ display: 'flex', alignItems: 'center', background: '#fff', padding: '0 24px', boxShadow: '0 2px 8px #f0f1f2', zIndex: 1 }}>
                <Title level={4} style={{ margin: 0, marginRight: '48px', color: '#1890ff', cursor: 'pointer' }} onClick={() => navigate('/')}>
                    线上书店销售系统
                </Title>
                <Menu
                    mode="horizontal"
                    selectedKeys={[location.pathname]}
                    items={menuItems}
                    style={{ flex: 1, border: 'none' }}
                />
                
                <div style={{ marginLeft: '24px' }}>
                    {isAuthenticated ? (
                        <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
                            <Space style={{ cursor: 'pointer' }}>
                                <UserIcon size={20} />
                                <Text strong>{user?.username}</Text>
                            </Space>
                        </Dropdown>
                    ) : (
                        <Button type="primary" icon={<LogIn size={16} />} onClick={() => navigate('/login')}>
                            登录
                        </Button>
                    )}
                </div>
            </Header>
            <Content style={{ padding: '0', background: '#f5f7fa' }}>
                <div style={{ minHeight: '280px' }}>
                    {children}
                </div>
            </Content>
            <Footer style={{ textAlign: 'center' }}>
                Online Bookstore ©2026 Created for Graduation Project
            </Footer>
        </Layout>
    );
};

export default MainLayout;
