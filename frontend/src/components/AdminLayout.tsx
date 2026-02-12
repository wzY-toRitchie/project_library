import React from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { message } from 'antd';
import { useAuth } from '../context/AuthContext';

const AdminLayout: React.FC = () => {
    const { user, logout, isAuthenticated } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();

    React.useEffect(() => {
        if (!isAuthenticated || !(user?.roles?.includes('ADMIN') || user?.roles?.includes('ROLE_ADMIN'))) {
            // Optional: Add a message here if you want
            // message.error('无权访问管理员后台');
            navigate('/login');
        }
    }, [isAuthenticated, user, navigate]);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const handleNotificationsClick = () => {
        message.info('暂无新通知');
    };

    const handleMobileMenuClick = () => {
        message.info('移动端菜单暂未开放');
    };

    const isActive = (path: string) => {
        return location.pathname === path ? 
            "bg-primary/10 text-primary" : 
            "text-[#637588] dark:text-[#9ca3af] hover:bg-gray-100 dark:hover:bg-[#2a3b4d] transition-colors";
    };

    return (
        <div className="flex h-screen w-full bg-background-light dark:bg-background-dark text-[#111418] dark:text-white font-display overflow-hidden">
            {/* Sidebar */}
            <aside className="w-64 bg-white dark:bg-[#1a2632] border-r border-[#e5e7eb] dark:border-[#2a3b4d] flex-shrink-0 flex flex-col justify-between hidden md:flex transition-colors duration-200">
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
                            className={`flex items-center gap-3 px-3 py-2 rounded-lg ${isActive('/admin')}`}
                        >
                            <span className={`material-symbols-outlined ${location.pathname === '/admin' ? 'fill-1' : ''}`}>dashboard</span>
                            <p className="text-sm font-medium">仪表盘</p>
                        </Link>
                        
                        {/* Inventory */}
                        <Link 
                            to="/admin/books" 
                            className={`flex items-center gap-3 px-3 py-2 rounded-lg ${isActive('/admin/books')}`}
                        >
                            <span className="material-symbols-outlined">inventory_2</span>
                            <p className="text-sm font-medium">库存管理</p>
                        </Link>
                        
                        <Link 
                            to="/admin/orders" 
                            className={`flex items-center gap-3 px-3 py-2 rounded-lg ${isActive('/admin/orders')}`}
                        >
                            <span className="material-symbols-outlined">shopping_cart</span>
                            <p className="text-sm font-medium">订单管理</p>
                        </Link>
                        
                        <Link
                            to="/admin/users"
                            className={`flex items-center gap-3 px-3 py-2 rounded-lg ${isActive('/admin/users')}`}
                        >
                            <span className="material-symbols-outlined">group</span>
                            <p className="text-sm font-medium">用户管理</p>
                        </Link>
                        
                        <Link
                            to="/admin/settings"
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
                             location.pathname === '/admin/orders' ? 'Order Management' :
                             location.pathname === '/admin/users' ? 'User Management' :
                             location.pathname === '/admin/settings' ? 'System Settings' : 'Admin Panel'}
                        </h2>
                    </div>
                    <div className="flex items-center gap-6">
                        <div className="hidden md:flex relative w-64 h-10">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#637588]">
                                <span className="material-symbols-outlined text-[20px]">search</span>
                            </div>
                            <input 
                                className="block w-full pl-10 pr-3 py-2 border-none rounded-lg bg-[#f0f2f4] dark:bg-[#2a3b4d] dark:text-white text-sm placeholder-[#637588] focus:ring-2 focus:ring-primary focus:bg-white dark:focus:bg-[#1a2632] transition-colors" 
                                placeholder="搜索功能开发中" 
                                type="text"
                                disabled
                            />
                        </div>
                        <div className="flex items-center gap-4">
                            <button className="relative p-2 text-[#637588] hover:bg-[#f0f2f4] dark:hover:bg-[#2a3b4d] rounded-full transition-colors" onClick={handleNotificationsClick}>
                                <span className="material-symbols-outlined">notifications</span>
                                <span className="absolute top-2 right-2 block h-2 w-2 rounded-full bg-red-500 ring-2 ring-white dark:ring-[#1a2632]"></span>
                            </button>
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
                    <Outlet />
                </div>
            </main>
        </div>
    );
};

export default AdminLayout;
