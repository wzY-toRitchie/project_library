import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import SearchDropdown from './SearchDropdown';
import { addToSearchHistory } from '../utils/searchHistory';

interface MainLayoutProps {
    children: React.ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
    const navigate = useNavigate();
    const { cartCount } = useCart();
    const { user, logout, isAuthenticated } = useAuth();
    const [searchQuery, setSearchQuery] = useState('');
    const [showDropdown, setShowDropdown] = useState(false);
    const searchInputRef = useRef<HTMLInputElement>(null);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            addToSearchHistory(searchQuery.trim());
            navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
            setShowDropdown(false);
        }
    };

    const handleSearchSelect = (keyword: string) => {
        setSearchQuery(keyword);
        navigate(`/search?q=${encodeURIComponent(keyword)}`);
        setShowDropdown(false);
    };

    return (
        <div className="bg-background-light dark:bg-background-dark text-ink dark:text-white font-body min-h-screen flex flex-col">
            {/* Navigation Bar */}
            <header className="sticky top-0 z-50 bg-white/95 dark:bg-surface-dark/95 backdrop-blur-md border-b border-gray-100 dark:border-[#2a3441]">
                <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16 gap-4">
                        {/* Logo */}
                        <div className="flex items-center gap-2.5 min-w-fit cursor-pointer group" onClick={() => navigate('/')}>
                            <div className="flex items-center justify-center text-primary group-hover:text-accent transition-colors">
                                <span className="material-symbols-outlined text-[28px]">menu_book</span>
                            </div>
                            <h2 className="font-display text-xl font-bold tracking-tight text-ink dark:text-white">JavaBooks</h2>
                        </div>
                        
                        {/* Central Search Bar (Desktop) */}
                        <div className="hidden md:flex flex-1 max-w-xl px-4 relative">
                            <form className="relative w-full" onSubmit={handleSearch}>
                                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400 transition-colors group-focus-within:text-primary">
                                    <span className="material-symbols-outlined text-[20px]">search</span>
                                </div>
                                <input 
                                    ref={searchInputRef}
                                    className="input-elegant block w-full pl-11 pr-3 py-2.5 !bg-gray-50 dark:!bg-[#202b36] text-gray-900 dark:text-gray-100 text-sm" 
                                    placeholder="搜索书籍、作者..." 
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    onFocus={() => setShowDropdown(true)}
                                />
                            </form>
                            <SearchDropdown
                                isOpen={showDropdown}
                                onClose={() => setShowDropdown(false)}
                                onSelect={handleSearchSelect}
                                inputRef={searchInputRef}
                            />
                        </div>

                        {/* Right Actions */}
                        <div className="flex items-center gap-2 min-w-fit">
                            {isAuthenticated ? (
                                <div className="flex items-center gap-2">
                                    <button
                                        className="btn-ghost text-sm font-medium flex items-center gap-1.5"
                                        onClick={() => navigate('/profile')}
                                    >
                                        <span className="material-symbols-outlined text-[18px]">person</span>
                                        {user?.username}
                                    </button>
                                    {(user?.roles?.includes('ADMIN') || user?.roles?.includes('ROLE_ADMIN')) && (
                                         <button 
                                            onClick={() => navigate('/admin')}
                                            className="btn-ghost text-sm font-medium flex items-center gap-1.5"
                                         >
                                            <span className="material-symbols-outlined text-[18px]">dashboard</span>
                                            管理后台
                                         </button>
                                    )}
                                    <button 
                                        onClick={() => { logout(); navigate('/login'); }}
                                        className="btn-ghost text-sm font-medium text-red-500 hover:!bg-red-50 hover:!text-red-600 flex items-center gap-1.5"
                                    >
                                        <span className="material-symbols-outlined text-[18px]">logout</span>
                                        退出
                                    </button>
                                </div>
                            ) : (
                                <button 
                                    onClick={() => navigate('/login')}
                                    className="btn-primary !py-2 !px-4 text-sm"
                                >
                                    登录
                                </button>
                            )}
                            
                            <button 
                                onClick={() => navigate('/cart')}
                                className="btn-icon relative"
                                aria-label="购物车"
                            >
                                <span className="material-symbols-outlined">shopping_cart</span>
                                {cartCount > 0 && (
                                    <span className="absolute -top-1 -right-1 inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 text-[10px] font-bold text-white bg-red-500 rounded-full badge-pulse">
                                        {cartCount > 99 ? '99+' : cartCount}
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
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                        <span className="material-symbols-outlined text-gray-400 text-[20px]">search</span>
                    </div>
                    <input 
                        className="block w-full pl-11 pr-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg leading-5 bg-[#f0f2f4] dark:bg-[#202b36] text-gray-900 dark:text-gray-100 placeholder-gray-500 focus:outline-none focus:bg-white dark:focus:bg-[#2a3441] focus:ring-1 focus:ring-primary focus:border-primary text-sm" 
                        placeholder="搜索书籍、作者..." 
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </form>
            </div>

            {/* Main Content */}
            <main className="flex-1 w-full bg-background-light dark:bg-background-dark">
                <div className="animate-fadeIn">
                    {children}
                </div>
            </main>

             <footer className="bg-white dark:bg-surface-dark border-t border-gray-100 dark:border-[#2a3441] py-8 mt-auto">
                <div className="max-w-[1440px] mx-auto px-4 text-center flex flex-col items-center gap-3">
                    <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-primary text-xl">menu_book</span>
                        <span className="font-display font-bold text-ink dark:text-white">JavaBooks</span>
                    </div>
                    <p className="text-ink-light dark:text-gray-400 text-sm font-body">在线书店 · 2026 毕业设计作品</p>
                    <button 
                        onClick={() => navigate('/contact')}
                        className="text-sm font-medium text-primary hover:text-accent transition-colors font-body"
                    >
                        联系客服
                    </button>
                </div>
            </footer>
        </div>
    );
};

export default MainLayout;
