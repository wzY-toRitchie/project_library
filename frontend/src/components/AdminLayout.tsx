import React from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api';
import type { Notification } from '../types';

const AdminLayout: React.FC = () => {
    const { user, logout, isAuthenticated, isAdmin } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();
    const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
    const [showNotifications, setShowNotifications] = React.useState(false);
    const [notifications, setNotifications] = React.useState<Notification[]>([]);
    const [unreadCount, setUnreadCount] = React.useState(0);

    const fetchNotifications = React.useCallback(async () => {
        try {
            const response = await api.get<Notification[]>('/notifications');
            const sorted = response.data.sort((a, b) => new Date(b.createTime).getTime() - new Date(a.createTime).getTime());
            setNotifications(sorted);
            setUnreadCount(sorted.filter(n => !n.read).length);
        } catch {
            console.error('Failed to fetch notifications');
        }
    }, []);

    React.useEffect(() => {
        if (isAuthenticated) {
            fetchNotifications();
            const interval = setInterval(fetchNotifications, 10000);
            return () => clearInterval(interval);
        }
    }, [isAuthenticated, fetchNotifications]);

    React.useEffect(() => {
        if (!isAuthenticated || !isAdmin) {
            navigate('/login', { replace: true });
        }
    }, [isAuthenticated, isAdmin, navigate]);

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

    const handleMarkAsRead = async () => {
        try {
            await api.post('/notifications/mark-read');
            fetchNotifications();
        } catch (error) {
            console.error('Failed to mark notifications as read', error);
        }
    };

    const typeLabels: Record<string, string> = { STOCK: '库存预警', ORDER: '新订单', USER: '用户消息' };
    const typeIcons: Record<string, string> = { STOCK: 'inventory_2', ORDER: 'shopping_cart', USER: 'person' };
    const typeColors: Record<string, string> = { STOCK: 'bg-red-500', ORDER: 'bg-green-500', USER: 'bg-blue-500' };

    const isActive = (path: string) => {
        return location.pathname === path
            ? 'bg-primary/10 text-primary'
            : 'text-slate-500 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors';
    };

    const navItems = [
        { path: '/admin', icon: 'dashboard', label: '仪表盘' },
        { path: '/admin/books', icon: 'inventory_2', label: '库存管理' },
        { path: '/admin/categories', icon: 'category', label: '分类管理' },
        { path: '/admin/orders', icon: 'shopping_cart', label: '订单管理' },
        { path: '/admin/users', icon: 'group', label: '用户管理' },
        { path: '/admin/coupons', icon: 'confirmation_number', label: '优惠券管理' },
        { path: '/admin/points-rules', icon: 'loyalty', label: '积分规则' },
        { path: '/admin/reviews', icon: 'reviews', label: '评价管理' },
        { path: '/admin/alipay', icon: 'account_balance_wallet', label: '支付宝沙箱' },
        { path: '/admin/settings', icon: 'settings', label: '系统设置' },
    ];

    const pageTitles: Record<string, string> = {
        '/admin': 'Dashboard Overview',
        '/admin/books': 'Book Inventory',
        '/admin/categories': 'Category Management',
        '/admin/orders': 'Order Management',
        '/admin/users': 'User Management',
        '/admin/coupons': 'Coupon Management',
        '/admin/points-rules': 'Points Rules',
        '/admin/reviews': 'Review Management',
        '/admin/alipay': 'Alipay Sandbox',
        '/admin/settings': 'System Settings',
    };

    return (
        <div className="flex h-screen w-full bg-background-light dark:bg-background-dark text-slate-900 dark:text-white font-display overflow-hidden">
            {/* Mobile Menu Overlay */}
            {mobileMenuOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 md:hidden"
                    onClick={() => setMobileMenuOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside className={`w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-700 flex-shrink-0 flex flex-col justify-between fixed md:relative h-full z-50 transform transition-transform duration-300 md:transform-none ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>
                <div className="flex flex-col">
                    <div className="h-16 flex items-center px-6 border-b border-slate-200 dark:border-slate-700">
                        <div className="flex items-center gap-3">
                            <div className="bg-primary/10 flex items-center justify-center rounded-full size-8 text-primary">
                                <span className="material-symbols-outlined text-xl" aria-hidden="true">menu_book</span>
                            </div>
                            <h1 className="text-lg font-bold tracking-tight">书店管理系统</h1>
                        </div>
                    </div>
                    <nav className="flex flex-col gap-1 p-4">
                        {navItems.map(item => (
                            <Link
                                key={item.path}
                                to={item.path}
                                onClick={() => setMobileMenuOpen(false)}
                                className={`flex items-center gap-3 px-3 py-2 rounded-lg ${isActive(item.path)}`}
                            >
                                <span className={`material-symbols-outlined ${location.pathname === item.path ? 'fill-1' : ''}`} aria-hidden="true">{item.icon}</span>
                                <span className="text-sm font-medium">{item.label}</span>
                            </Link>
                        ))}
                    </nav>
                </div>
                <div className="p-4 border-t border-slate-200 dark:border-slate-700">
                    <button
                        onClick={handleLogout}
                        className="flex w-full items-center gap-3 px-3 py-2 rounded-lg text-slate-500 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors"
                    >
                        <span className="material-symbols-outlined" aria-hidden="true">logout</span>
                        <span className="text-sm font-medium">退出登录</span>
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 flex flex-col h-full overflow-hidden bg-background-light dark:bg-background-dark">
                {/* Top Header */}
                <header className="h-16 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between px-6 md:px-8 flex-shrink-0 z-10">
                    <div className="flex items-center gap-4">
                        <button className="md:hidden p-1 text-slate-500" onClick={() => setMobileMenuOpen(!mobileMenuOpen)} aria-label="菜单">
                            <span className="material-symbols-outlined" aria-hidden="true">menu</span>
                        </button>
                        <h2 className="text-lg font-bold leading-tight hidden sm:block">
                            {pageTitles[location.pathname] || 'Admin Panel'}
                        </h2>
                    </div>
                    <div className="flex items-center gap-6">
                        {/* Notification Bell */}
                        <div className="relative">
                            <button
                                onClick={() => setShowNotifications(!showNotifications)}
                                className="relative p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full transition-colors"
                                aria-label="通知"
                            >
                                <span className="material-symbols-outlined" aria-hidden="true">notifications</span>
                                {unreadCount > 0 && (
                                    <span className="absolute top-2 right-2 block h-2 w-2 rounded-full bg-red-500 ring-2 ring-white dark:ring-slate-900"></span>
                                )}
                            </button>
                            {/* Notification Dropdown */}
                            {showNotifications && (
                                <div className="absolute right-0 top-full mt-2 w-80 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 z-50 overflow-hidden">
                                    <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between">
                                        <span className="text-sm font-bold">通知中心</span>
                                        {unreadCount > 0 && (
                                            <button onClick={handleMarkAsRead} className="text-xs text-primary hover:underline">全部已读</button>
                                        )}
                                    </div>
                                    <div className="max-h-80 overflow-y-auto">
                                        {notifications.length === 0 ? (
                                            <div className="py-8 text-center text-slate-400 text-sm">
                                                <span className="material-symbols-outlined text-3xl block mb-2" aria-hidden="true">notifications_off</span>
                                                暂无通知
                                            </div>
                                        ) : (
                                            notifications.map(item => (
                                                <div key={item.id} className={`px-4 py-3 border-b border-slate-50 dark:border-slate-700/50 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors ${!item.read ? 'bg-blue-50/50 dark:bg-blue-900/10' : ''}`}>
                                                    <div className="flex items-start gap-3">
                                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${typeColors[item.type] || 'bg-blue-500'}`}>
                                                            <span className="material-symbols-outlined text-white text-[16px]" aria-hidden="true">{typeIcons[item.type] || 'person'}</span>
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <div className="flex items-center gap-2">
                                                                <span className="text-sm font-medium">{typeLabels[item.type] || item.type}</span>
                                                                {!item.read && <span className="w-1.5 h-1.5 rounded-full bg-blue-500 flex-shrink-0" />}
                                                            </div>
                                                            <p className="text-xs text-slate-500 mt-0.5">{item.message}</p>
                                                            <p className="text-xs text-slate-400 mt-0.5">{new Date(item.createTime).toLocaleString()}</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                        {/* User Avatar */}
                        <div className="flex items-center gap-3">
                            <div className="h-8 w-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold">
                                {user?.username?.charAt(0).toUpperCase() || 'A'}
                            </div>
                            <span className="text-sm font-medium hidden sm:block">{user?.username || '管理员'}</span>
                        </div>
                    </div>
                </header>

                {/* Content Area */}
                <div className="flex-1 overflow-y-auto relative">
                    <div className="h-full animate-fadeIn">
                        <Outlet />
                    </div>
                </div>
            </main>
        </div>
    );
};

export default AdminLayout;
