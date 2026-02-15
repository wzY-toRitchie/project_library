import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

interface MainLayoutProps {
    children: React.ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
    const navigate = useNavigate();
    const { cartCount } = useCart();
    const { user, logout, isAuthenticated } = useAuth();
    const [searchQuery, setSearchQuery] = useState('');

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        navigate(`/?search=${encodeURIComponent(searchQuery)}`);
    };

    return (
        <div className="bg-background-light dark:bg-background-dark text-[#111418] dark:text-white font-display min-h-screen flex flex-col">
            {/* Navigation Bar */}
            <header className="sticky top-0 z-50 bg-surface-light dark:bg-surface-dark border-b border-[#f0f2f4] dark:border-[#2a3441] shadow-sm">
                <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16 gap-4">
                        {/* Logo */}
                        <div className="flex items-center gap-2 min-w-fit cursor-pointer" onClick={() => navigate('/')}>
                            <div className="flex items-center justify-center text-primary">
                                <span className="material-symbols-outlined text-3xl">menu_book</span>
                            </div>
                            <h2 className="text-xl font-black tracking-tight text-[#111418] dark:text-white">JavaBooks</h2>
                        </div>
                        
                        {/* Central Search Bar (Desktop) */}
                        <div className="hidden md:flex flex-1 max-w-xl px-4">
                            <form className="relative w-full" onSubmit={handleSearch}>
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <span className="material-symbols-outlined text-gray-400">search</span>
                                </div>
                                <input 
                                    className="block w-full pl-10 pr-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg leading-5 bg-[#f0f2f4] dark:bg-[#202b36] text-gray-900 dark:text-gray-100 placeholder-gray-500 focus:outline-none focus:bg-white dark:focus:bg-[#2a3441] focus:ring-2 focus:ring-primary focus:border-primary sm:text-sm transition duration-150 ease-in-out" 
                                    placeholder="搜索书名、作者或ISBN..." 
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </form>
                        </div>

                        {/* Right Actions */}
                        <div className="flex items-center gap-3 min-w-fit">
                            {isAuthenticated ? (
                                <div className="flex items-center gap-4">
                                    <div 
                                        className="text-sm font-medium cursor-pointer hover:text-primary transition-colors"
                                        onClick={() => navigate('/profile')}
                                    >
                                        欢迎, {user?.username}
                                    </div>
                                    {(user?.roles?.includes('ADMIN') || user?.roles?.includes('ROLE_ADMIN')) && (
                                         <button 
                                            onClick={() => navigate('/admin')}
                                            className="text-sm font-medium text-gray-600 hover:text-primary transition-colors"
                                         >
                                            管理后台
                                         </button>
                                    )}
                                    <button 
                                        onClick={() => { logout(); navigate('/login'); }}
                                        className="text-sm font-medium text-red-500 hover:text-red-700 transition-colors"
                                    >
                                        退出登录
                                    </button>
                                </div>
                            ) : (
                                <button 
                                    onClick={() => navigate('/login')}
                                    className="flex items-center justify-center px-4 py-2 text-sm font-medium text-primary bg-primary/10 hover:bg-primary/20 rounded-lg transition-colors"
                                >
                                    登录 | 注册
                                </button>
                            )}
                            
                            <button 
                                onClick={() => navigate('/cart')}
                                className="relative p-2 text-gray-600 dark:text-gray-300 hover:text-primary dark:hover:text-primary transition-colors"
                            >
                                <span className="material-symbols-outlined">shopping_cart</span>
                                {cartCount > 0 && (
                                    <span className="absolute top-1 right-0 inline-flex items-center justify-center px-1.5 py-0.5 text-xs font-bold leading-none text-white transform translate-x-1/4 -translate-y-1/4 bg-red-500 rounded-full">
                                        {cartCount}
                                    </span>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            {/* Mobile Search (Visible only on small screens) */}
            <div className="md:hidden bg-surface-light dark:bg-surface-dark p-4 border-b border-[#f0f2f4] dark:border-[#2a3441]">
                <form className="relative w-full" onSubmit={handleSearch}>
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <span className="material-symbols-outlined text-gray-400">search</span>
                    </div>
                    <input 
                        className="block w-full pl-10 pr-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg leading-5 bg-[#f0f2f4] dark:bg-[#202b36] text-gray-900 dark:text-gray-100 placeholder-gray-500 focus:outline-none focus:bg-white dark:focus:bg-[#2a3441] focus:ring-1 focus:ring-primary focus:border-primary text-sm" 
                        placeholder="搜索书籍..." 
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </form>
            </div>

            {/* Main Content */}
            <main className="flex-1 w-full bg-background-light dark:bg-background-dark">
                {children}
            </main>

             <footer className="bg-surface-light dark:bg-surface-dark border-t border-[#f0f2f4] dark:border-[#2a3441] py-8 mt-auto">
                <div className="max-w-[1440px] mx-auto px-4 text-center text-gray-500 text-sm flex flex-col items-center gap-2">
                    <div>在线书店 ©2026 毕业设计作品</div>
                    <button 
                        onClick={() => navigate('/contact')}
                        className="text-primary hover:underline text-sm font-medium"
                    >
                        联系客服
                    </button>
                </div>
            </footer>
        </div>
    );
};

export default MainLayout;
