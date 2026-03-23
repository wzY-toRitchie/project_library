import React from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { Popover, List, Badge, Empty, Avatar } from 'antd';
import { useAuth } from '../context/AuthContext';
import api from '../api';
import type { Notification } from '../types';

const AdminLayout: React.FC = () => {
    const { user, logout, isAuthenticated, isAdmin } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();
    const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

    // 认证检查 - 未登录或非管理员时立即重定向
    React.useEffect(() => {
        if (!isAuthenticated || !isAdmin) {
            navigate('/login', { replace: true });
        }
    }, [isAuthenticated, isAdmin, navigate]);

    // 未认证时显示加载状态，防止子组件提前渲染
    if (!isAuthenticated || !isAdmin) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background-light dark:bg-background-dark">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
        );
    }

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const [notifications, setNotifications] = React.useState<Notification[]>([]);
    const [unreadCount, setUnreadCount] = React.useState(0);

    const fetchNotifications = React.useCallback(async () => {
        try {
            const response = await api.get<Notification[]>('/notifications');
            // Sort by createTime desc
            const sorted = response.data.sort((a, b) => new Date(b.createTime).getTime() - new Date(a.createTime).getTime());
            setNotifications(sorted);
            setUnreadCount(sorted.filter(n => !n.read).length);
        } catch (error) {
            console.error('Failed to fetch notifications', error);
        }
    }, []);

    React.useEffect(() => {
        if (isAuthenticated) {
            fetchNotifications();
            const interval = setInterval(fetchNotifications, 10000);
            return () => clearInterval(interval);
        }
    }, [isAuthenticated, fetchNotifications]);

    const handleMarkAsRead = async () => {
        try {
            await api.post('/notifications/mark-read');
            fetchNotifications();
        } catch (error) {
            console.error('Failed to mark notifications as read', error);
        }
    };

    const notificationContent = (
        <div style={{ width: 300, maxHeight: 400, overflowY: 'auto' }}>
            {unreadCount > 0 && (
                <div className="px-4 py-2 border-b border-gray-100">
                    <button 
                        onClick={handleMarkAsRead}
                        className="text-xs text-primary hover:underline"
                    >
                        全部已读
                    </button>
                </div>
            )}
            <List
                itemLayout="horizontal"
                dataSource={notifications}
                locale={{ emptyText: <Empty description="暂无通知" image={Empty.PRESENTED_IMAGE_SIMPLE} /> }}
                renderItem={(item) => (
                    <List.Item 
                        className={`cursor-pointer hover:bg-gray-50 transition-colors ${!item.read ? 'bg-blue-50/50' : ''}`}
                        extra={!item.read && <Badge status="processing" />}
                    >
                        <List.Item.Meta
                            avatar={
                                <Avatar 
                                    style={{ backgroundColor: item.type === 'STOCK' ? '#ff4d4f' : item.type === 'ORDER' ? '#52c41a' : '#1890ff' }} 
                                    icon={<span className="material-symbols-outlined text-white text-sm" style={{ fontSize: 16 }}>{item.type === 'STOCK' ? 'inventory_2' : item.type === 'ORDER' ? 'shopping_cart' : 'person'}</span>} 
                                />
                            }
                            title={<span className="text-sm font-medium">{item.type === 'STOCK' ? '库存预警' : item.type === 'ORDER' ? '新订单' : '用户消息'}</span>}
                            description={
                                <div>
                                    <div className="text-xs text-gray-600 mb-1">{item.message}</div>
                                    <div className="text-xs text-gray-400">{new Date(item.createTime).toLocaleString()}</div>
                                </div>
                            }
                        />
                    </List.Item>
                )}
            />
        </div>
    );

    const handleMobileMenuClick = () => {
        setMobileMenuOpen(!mobileMenuOpen);
    };

    const isActive = (path: string) => {
        return location.pathname === path ? 
            "bg-primary/10 text-primary" : 
            "text-[#637588] dark:text-[#9ca3af] hover:bg-gray-100 dark:hover:bg-[#2a3b4d] transition-colors";
    };

    return (
        <div className="flex h-screen w-full bg-background-light dark:bg-background-dark text-[#111418] dark:text-white font-display overflow-hidden">
            {/* Mobile Menu Overlay */}
            {mobileMenuOpen && (
                <div 
                    className="fixed inset-0 bg-black/50 z-40 md:hidden"
                    onClick={() => setMobileMenuOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside className={`w-64 bg-white dark:bg-[#1a2632] border-r border-[#e5e7eb] dark:border-[#2a3b4d] flex-shrink-0 flex flex-col justify-between fixed md:relative h-full z-50 transform transition-transform duration-300 md:transform-none ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>
                <div className="flex flex-col">
                    <div className="h-16 flex items-center px-6 border-b border-[#e5e7eb] dark:border-[#2a3b4d]">
                        <div className="flex items-center gap-3">
                            <div className="bg-center bg-no-repeat bg-cover rounded-full size-8 bg-primary/10 flex items-center justify-center text-primary">
                                <span className="material-symbols-outlined text-xl">menu_book</span>
                            </div>
                            <h1 className="text-lg font-bold tracking-tight">书店管理系统</h1>
                        </div>
                    </div>
                    <div className="flex flex-col gap-1 p-4">
                        {/* Dashboard */}
                        <Link 
                            to="/admin" 
                            onClick={() => setMobileMenuOpen(false)}
                            className={`flex items-center gap-3 px-3 py-2 rounded-lg ${isActive('/admin')}`}
                        >
                            <span className={`material-symbols-outlined ${location.pathname === '/admin' ? 'fill-1' : ''}`}>dashboard</span>
                            <p className="text-sm font-medium">仪表盘</p>
                        </Link>
                        
                        {/* Inventory */}
                        <Link 
                            to="/admin/books" 
                            onClick={() => setMobileMenuOpen(false)}
                            className={`flex items-center gap-3 px-3 py-2 rounded-lg ${isActive('/admin/books')}`}
                        >
                            <span className="material-symbols-outlined">inventory_2</span>
                            <p className="text-sm font-medium">库存管理</p>
                        </Link>

                        <Link
                            to="/admin/categories"
                            onClick={() => setMobileMenuOpen(false)}
                            className={`flex items-center gap-3 px-3 py-2 rounded-lg ${isActive('/admin/categories')}`}
                        >
                            <span className="material-symbols-outlined">category</span>
                            <p className="text-sm font-medium">分类管理</p>
                        </Link>
                        
                        <Link 
                            to="/admin/orders" 
                            onClick={() => setMobileMenuOpen(false)}
                            className={`flex items-center gap-3 px-3 py-2 rounded-lg ${isActive('/admin/orders')}`}
                        >
                            <span className="material-symbols-outlined">shopping_cart</span>
                            <p className="text-sm font-medium">订单管理</p>
                        </Link>
                        
                        <Link
                            to="/admin/users"
                            onClick={() => setMobileMenuOpen(false)}
                            className={`flex items-center gap-3 px-3 py-2 rounded-lg ${isActive('/admin/users')}`}
                        >
                            <span className="material-symbols-outlined">group</span>
                            <p className="text-sm font-medium">用户管理</p>
                        </Link>
                        
                        <Link
                            to="/admin/settings"
                            onClick={() => setMobileMenuOpen(false)}
                            className={`flex items-center gap-3 px-3 py-2 rounded-lg ${isActive('/admin/settings')}`}
                        >
                            <span className="material-symbols-outlined">settings</span>
                            <p className="text-sm font-medium">系统设置</p>
                        </Link>
                    </div>
                </div>
                <div className="p-4 border-t border-[#e5e7eb] dark:border-[#2a3b4d]">
                    <button 
                        onClick={handleLogout}
                        className="flex w-full items-center gap-3 px-3 py-2 rounded-lg text-[#637588] dark:text-[#9ca3af] hover:bg-gray-100 dark:hover:bg-[#2a3b4d] transition-colors"
                    >
                        <span className="material-symbols-outlined">logout</span>
                        <p className="text-sm font-medium">退出登录</p>
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 flex flex-col h-full overflow-hidden bg-background-light dark:bg-background-dark">
                {/* Top Header */}
                <header className="h-16 bg-white dark:bg-[#1a2632] border-b border-[#e5e7eb] dark:border-[#2a3b4d] flex items-center justify-between px-6 md:px-8 flex-shrink-0 z-10">
                    <div className="flex items-center gap-4">
                        {/* Mobile Menu Button (Hidden on Desktop) */}
                        <button className="md:hidden p-1 text-[#637588]" onClick={handleMobileMenuClick}>
                            <span className="material-symbols-outlined">menu</span>
                        </button>
                        <h2 className="text-lg font-bold leading-tight hidden sm:block">
                            {location.pathname === '/admin' ? 'Dashboard Overview' : 
                             location.pathname === '/admin/books' ? 'Book Inventory' : 
                             location.pathname === '/admin/categories' ? 'Category Management' :
                             location.pathname === '/admin/orders' ? 'Order Management' :
                             location.pathname === '/admin/users' ? 'User Management' :
                             location.pathname === '/admin/settings' ? 'System Settings' : 'Admin Panel'}
                        </h2>
                    </div>
                    <div className="flex items-center gap-6">
                        <div className="flex items-center gap-4">
                            <Popover 
                                content={notificationContent} 
                                title="通知中心" 
                                trigger="click" 
                                placement="bottomRight"
                            >
                                <button className="relative p-2 text-[#637588] hover:bg-[#f0f2f4] dark:hover:bg-[#2a3b4d] rounded-full transition-colors">
                                    <span className="material-symbols-outlined">notifications</span>
                                    {unreadCount > 0 && (
                                        <span className="absolute top-2 right-2 block h-2 w-2 rounded-full bg-red-500 ring-2 ring-white dark:ring-[#1a2632]"></span>
                                    )}
                                </button>
                            </Popover>
                            <div className="flex items-center gap-3">
                                <div className="h-8 w-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold">
                                    {user?.username?.charAt(0).toUpperCase() || 'A'}
                                </div>
                                <span className="text-sm font-medium hidden sm:block">{user?.username || '管理员'}</span>
                            </div>
                        </div>
                    </div>
                </header>

                {/* Content Area */}
                <div className="flex-1 overflow-hidden relative">
                    <div className="h-full animate-fadeIn">
                        <Outlet />
                    </div>
                </div>
            </main>
        </div>
    );
};

export default AdminLayout;
