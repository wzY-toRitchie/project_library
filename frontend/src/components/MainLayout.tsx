import React, { useState, useRef } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import SearchDropdown from './SearchDropdown';
import { addToSearchHistory } from '../utils/searchHistory';
import { resolveAssetUrl } from '../utils/url';

interface MainLayoutProps {
    children: React.ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
    const navigate = useNavigate();
    const location = useLocation();
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
            {/* Top Utility Bar */}
            <div className="hidden md:block bg-primary dark:bg-slate-900 text-white/90 dark:text-slate-300">
                <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-8 text-xs">
                    <div className="flex items-center gap-4">
                        <span className="flex items-center gap-1">
                            <span className="material-symbols-outlined text-[14px]" aria-hidden="true">local_shipping</span>
                            满99元免运费
                        </span>
                        <span className="flex items-center gap-1">
                            <span className="material-symbols-outlined text-[14px]" aria-hidden="true">verified_user</span>
                            正品保障
                        </span>
                        <span className="flex items-center gap-1">
                            <span className="material-symbols-outlined text-[14px]" aria-hidden="true">support_agent</span>
                            7×24小时客服
                        </span>
                    </div>
                    <div className="flex items-center gap-4">
                        <span className="flex items-center gap-1">
                            <span className="material-symbols-outlined text-[14px]" aria-hidden="true">schedule</span>
                            工作时间 9:00-22:00
                        </span>
                    </div>
                </div>
            </div>

            {/* Navigation Bar */}
            <header className="sticky top-0 z-50 bg-white/95 dark:bg-surface-dark/95 backdrop-blur-md border-b border-gray-100 dark:border-slate-700">
                <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16 gap-4">
                        {/* Logo */}
                        <Link to="/" className="flex items-center gap-2.5 min-w-fit cursor-pointer group">
                            <div className="flex items-center justify-center text-primary group-hover:text-accent transition-colors">
                                <span className="material-symbols-outlined text-[28px]" aria-hidden="true">menu_book</span>
                            </div>
                            <h2 className="font-display text-xl font-bold tracking-tight text-ink dark:text-white">JavaBooks</h2>
                        </Link>
                        
                        {/* Central Search Bar (Desktop) */}
                        <div className="hidden md:flex flex-1 max-w-xl px-4 relative">
                            <form className="relative w-full" onSubmit={handleSearch}>
                                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400 transition-colors group-focus-within:text-primary">
                                    <span className="material-symbols-outlined text-[20px]" aria-hidden="true">search</span>
                                </div>
                                <input 
                                    ref={searchInputRef}
                                    className="input-elegant block w-full pl-11 pr-3 py-2.5 !bg-gray-50 dark:!bg-slate-800 text-gray-900 dark:text-gray-100 text-sm" 
                                    placeholder="搜索书籍、作者..." 
                                    type="text"
                                    aria-label="搜索书籍"
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
                        <div className="flex items-center gap-4 min-w-fit">
                            <div className="hidden md:flex gap-6 font-medium text-sm">
                                <Link to="/" className={`transition-colors ${location.pathname === '/' ? 'text-primary border-b-2 border-primary' : 'text-slate-600 dark:text-slate-400 hover:text-primary'}`}>首页</Link>
                                <Link to="/ai-recommend" className={`transition-colors ${location.pathname === '/ai-recommend' ? 'text-primary border-b-2 border-primary' : 'text-slate-600 dark:text-slate-400 hover:text-primary'}`}>AI荐书</Link>
                            </div>
                            {isAuthenticated ? (
                                <div className="flex items-center gap-2">
                                    <button
                                        className="btn-ghost text-sm font-medium flex items-center gap-1.5"
                                        onClick={() => navigate('/profile')}
                                    >
                                        {user?.avatar ? (
                                            <img src={resolveAssetUrl(user.avatar)} alt="avatar" className="w-8 h-8 rounded-full object-cover" width={32} height={32} />
                                        ) : (
                                            <span className="material-symbols-outlined text-[18px]" aria-hidden="true">person</span>
                                        )}
                                        {user?.username}
                                    </button>
                                    {(user?.roles?.includes('ADMIN') || user?.roles?.includes('ROLE_ADMIN')) && (
                                         <button 
                                            onClick={() => navigate('/admin')}
                                            className="btn-ghost text-sm font-medium flex items-center gap-1.5"
                                         >
                                            <span className="material-symbols-outlined text-[18px]" aria-hidden="true">dashboard</span>
                                            管理后台
                                         </button>
                                    )}
                                    <button 
                                        onClick={() => navigate('/cart')}
                                        className="btn-icon relative"
                                        aria-label="购物车"
                                    >
                                        <span className="material-symbols-outlined" aria-hidden="true">shopping_cart</span>
                                        {cartCount > 0 && (
                                            <span className="absolute -top-1 -right-1 inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 text-[10px] font-bold text-white bg-red-500 rounded-full badge-pulse">
                                                {cartCount > 99 ? '99+' : cartCount}
                                            </span>
                                        )}
                                    </button>
                                    <button 
                                        onClick={() => { logout(); navigate('/login'); }}
                                        className="btn-ghost text-sm font-medium text-red-500 hover:!bg-red-50 hover:!text-red-600 flex items-center gap-1.5"
                                    >
                                        <span className="material-symbols-outlined text-[18px]" aria-hidden="true">logout</span>
                                        退出
                                    </button>
                                </div>
                            ) : (
                                <div className="flex items-center gap-2">
                                    <button 
                                        onClick={() => navigate('/login')}
                                        className="btn-ghost !py-2 !px-4 text-sm"
                                    >
                                        登录
                                    </button>
                                    <button 
                                        onClick={() => navigate('/register')}
                                        className="btn-primary !py-2 !px-4 text-sm"
                                    >
                                        注册
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </header>

            {/* Mobile Search (Visible only on small screens) */}
            <div className="md:hidden bg-surface-light dark:bg-surface-dark p-4 border-b border-slate-100 dark:border-slate-700">
                <form className="relative w-full" onSubmit={handleSearch}>
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                        <span className="material-symbols-outlined text-gray-400 text-[20px]" aria-hidden="true">search</span>
                    </div>
                    <input 
                        className="block w-full pl-11 pr-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg leading-5 bg-slate-100 dark:bg-slate-800 text-gray-900 dark:text-gray-100 placeholder-gray-500 focus:outline-none focus:bg-white dark:focus:bg-slate-700 focus:ring-1 focus:ring-primary focus:border-primary text-sm" 
                        placeholder="搜索书籍、作者..." 
                        type="text"
                        aria-label="搜索书籍"
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

            <footer className="bg-slate-900 dark:bg-black text-slate-300 mt-auto">
                <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-12">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                        {/* Column 1: Shop */}
                        <div>
                            <h3 className="font-bold text-white mb-4 text-sm uppercase tracking-wider">商品分类</h3>
                            <ul className="space-y-2 text-sm">
                                <li><Link to="/search?q=文学" className="hover:text-white transition-colors">文学小说</Link></li>
                                <li><Link to="/search?q=科技" className="hover:text-white transition-colors">科学技术</Link></li>
                                <li><Link to="/search?q=经管" className="hover:text-white transition-colors">经济管理</Link></li>
                                <li><Link to="/search?q=计算机" className="hover:text-white transition-colors">计算机</Link></li>
                                <li><Link to="/search?q=教育" className="hover:text-white transition-colors">教育考试</Link></li>
                            </ul>
                        </div>
                        {/* Column 2: Help */}
                        <div>
                            <h3 className="font-bold text-white mb-4 text-sm uppercase tracking-wider">帮助中心</h3>
                            <ul className="space-y-2 text-sm">
                                <li><Link to="/contact" className="hover:text-white transition-colors">联系客服</Link></li>
                                <li><span className="cursor-default">配送说明</span></li>
                                <li><span className="cursor-default">退换货政策</span></li>
                                <li><span className="cursor-default">常见问题</span></li>
                                <li><span className="cursor-default">发票服务</span></li>
                            </ul>
                        </div>
                        {/* Column 3: About */}
                        <div>
                            <h3 className="font-bold text-white mb-4 text-sm uppercase tracking-wider">关于我们</h3>
                            <ul className="space-y-2 text-sm">
                                <li><Link to="/about" className="hover:text-white transition-colors">公司简介</Link></li>
                                <li><Link to="/faq" className="hover:text-white transition-colors">常见问题</Link></li>
                                <li><Link to="/legal?tab=terms" className="hover:text-white transition-colors">用户协议</Link></li>
                                <li><Link to="/legal?tab=privacy" className="hover:text-white transition-colors">隐私政策</Link></li>
                                <li><Link to="/contact" className="hover:text-white transition-colors">联系客服</Link></li>
                            </ul>
                        </div>
                        {/* Column 4: Payment & Contact */}
                        <div>
                            <h3 className="font-bold text-white mb-4 text-sm uppercase tracking-wider">支付方式</h3>
                            <div className="flex items-center gap-3 mb-6">
                                <span className="px-2 py-1 bg-slate-800 rounded text-xs text-slate-400 border border-slate-700">微信支付</span>
                                <span className="px-2 py-1 bg-slate-800 rounded text-xs text-slate-400 border border-slate-700">支付宝</span>
                            </div>
                            <h3 className="font-bold text-white mb-2 text-sm uppercase tracking-wider">客服热线</h3>
                            <p className="text-primary text-lg font-bold">400-888-0000</p>
                            <p className="text-xs text-slate-500 mt-1">工作时间 9:00-22:00</p>
                        </div>
                    </div>
                    <div className="border-t border-slate-800 mt-10 pt-6 flex flex-col md:flex-row items-center justify-between gap-4">
                        <div className="flex items-center gap-2">
                            <span className="material-symbols-outlined text-primary text-xl" aria-hidden="true">menu_book</span>
                            <span className="font-display font-bold text-white">JavaBooks</span>
                        </div>
                        <p className="text-xs text-slate-500">&copy; 2026 JavaBooks. All rights reserved.</p>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default MainLayout;
