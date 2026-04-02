import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import api from '../api';
import type { Book, Category, Coupon } from '../types';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { BookGridSkeleton } from '../components/Skeleton';
import EmptyState from '../components/EmptyState';
import StarRating from '../components/StarRating';
import BookCard from '../components/BookCard';
import CategoryTabs from '../components/CategoryTabs';
import Rankings from '../components/home/Rankings';
import FeaturedBooks from '../components/home/FeaturedBooks';
import HeroCarousel from '../components/HeroCarousel';
import { getAvailableCoupons, claimCoupon } from '../api/coupons';
import { signIn as apiSignIn, getUserPoints } from '../api/points';
import { message } from 'antd';

const categoryIcons: Record<string, string> = {
    '文学': 'auto_stories', '小说': 'menu_book', '科技': 'computer', '历史': 'history_edu',
    '哲学': 'psychology', '艺术': 'palette', '经济': 'trending_up', '科学': 'science',
    '教育': 'school', '医学': 'medical_services', '法律': 'gavel', '军事': 'shield',
    '体育': 'sports_soccer', '音乐': 'music_note', '旅行': 'flight', '美食': 'restaurant',
    '儿童': 'child_care', '漫画': 'comic_bubble', '政治': 'account_balance', '宗教': 'church',
    '心理': 'psychiatry', '自然': 'eco', '建筑': 'architecture', '摄影': 'photo_camera',
    '设计': 'design_services',
};
const defaultIcon = 'category';
const getIcon = (name: string): string => {
    for (const [key, icon] of Object.entries(categoryIcons)) {
        if (name.includes(key)) return icon;
    }
    return defaultIcon;
};

const Home: React.FC = () => {
    const [books, setBooks] = useState<Book[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
    const [sortOption, setSortOption] = useState('newest');
    const { addToCart } = useCart();
    const { isAuthenticated } = useAuth();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const searchQuery = searchParams.get('search');
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    
    // 分页状态
    const [currentPage, setCurrentPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [totalElements, setTotalElements] = useState(0);
    const pageSize = 12;

    // 优惠券状态
    const [coupons, setCoupons] = useState<Coupon[]>([]);
    const [claimedIds, setClaimedIds] = useState<Set<number>>(new Set());

    // 签到状态
    const [userPoints, setUserPoints] = useState(0);
    const [signedInToday, setSignedInToday] = useState(false);
    const [signInLoading, setSignInLoading] = useState(false);

    const getSortParams = useCallback(() => {
        let sortBy = 'createTime';
        let direction = 'desc';
        if (sortOption === 'price_asc') {
            sortBy = 'price';
            direction = 'asc';
        } else if (sortOption === 'price_desc') {
            sortBy = 'price';
            direction = 'desc';
        } else if (sortOption === 'rating') {
            sortBy = 'rating';
            direction = 'desc';
        }
        return { sortBy, direction };
    }, [sortOption]);

    const fetchCategories = useCallback(async () => {
        try {
            const response = await api.get('/categories');
            setCategories(response.data);
        } catch (error) {
            console.error('Failed to fetch categories:', error);
        }
    }, []);

    const fetchBooks = useCallback(async () => {
        setLoading(true);
        try {
            const { sortBy, direction } = getSortParams();
            const response = await api.get(`/books?sortBy=${sortBy}&direction=${direction}&page=${currentPage}&size=${pageSize}`);
            setBooks(response.data.content || response.data);
            setTotalPages(response.data.totalPages || 1);
            setTotalElements(response.data.totalElements || 0);
        } catch (error) {
            console.error('Failed to fetch books:', error);
            message.error('书架暂时开小差了，请稍后再试');
        } finally {
            setLoading(false);
        }
    }, [getSortParams, currentPage]);

    const fetchBooksByCategory = useCallback(async (categoryId: number) => {
        setLoading(true);
        try {
            const { sortBy, direction } = getSortParams();
            const response = await api.get(`/books/category/${categoryId}?sortBy=${sortBy}&direction=${direction}&page=${currentPage}&size=${pageSize}`);
            setBooks(response.data.content || response.data);
            setTotalPages(response.data.totalPages || 1);
            setTotalElements(response.data.totalElements || 0);
        } catch (error) {
            console.error('Failed to fetch books by category:', error);
            message.error('该分类图书加载失败，请重试');
        } finally {
            setLoading(false);
        }
    }, [getSortParams, currentPage]);

    const handleSearch = useCallback(async (query: string) => {
        setLoading(true);
        try {
            const response = await api.get(`/books/search?title=${encodeURIComponent(query)}`);
            setBooks(response.data);
            setTotalPages(1);
            setTotalElements(response.data.length);
        } catch (error) {
            console.error('Search failed:', error);
            message.error('搜索失败');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchCategories();
    }, [fetchCategories]);

    useEffect(() => {
        if (searchQuery) {
            handleSearch(searchQuery);
        } else if (selectedCategory) {
            fetchBooksByCategory(selectedCategory);
        } else {
            fetchBooks();
        }
    }, [fetchBooks, fetchBooksByCategory, handleSearch, searchQuery, selectedCategory, sortOption, currentPage]);

    // 获取优惠券和签到状态
    useEffect(() => {
        if (isAuthenticated) {
            getAvailableCoupons().then(setCoupons).catch(() => {});
            getUserPoints().then((data) => {
                setUserPoints(data.points);
                setSignedInToday(data.signedInToday);
            }).catch(() => {});
        }
    }, [isAuthenticated]);

    // Intersection Observer for section entry animations
    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('visible');
                    }
                });
            },
            { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
        );

        const timer = setTimeout(() => {
            document.querySelectorAll('.section-animate').forEach((el) => observer.observe(el));
            document.querySelectorAll('.stagger-entry').forEach((el) => observer.observe(el));
        }, 100);

        return () => {
            clearTimeout(timer);
            observer.disconnect();
        };
    }, [books]);

    const handleAddToCart = (book: Book) => {
        addToCart(book);
        message.success(`${book.title} 已加入购物车`);
    };

    const handleClaimCoupon = async (couponId: number) => {
        try {
            await claimCoupon(couponId);
            setClaimedIds((prev) => new Set(prev).add(couponId));
            message.success('优惠券领取成功！');
        } catch (error: any) {
            message.error(error?.response?.data?.message || '领取失败，请重试');
        }
    };

    const handleSignIn = async () => {
        try {
            setSignInLoading(true);
            const result = await apiSignIn();
            setSignedInToday(true);
            setUserPoints((prev) => prev + result.points);
            message.success(result.message || `签到成功，获得 ${result.points} 积分！`);
        } catch (error: any) {
            message.error(error?.response?.data?.message || '签到失败，请重试');
        } finally {
            setSignInLoading(false);
        }
    };

    const getCouponDiscountText = (coupon: Coupon) => {
        if (coupon.type === 'DISCOUNT') return `${coupon.value * 10}折`;
        if (coupon.type === 'FREE_SHIPPING') return '免运费';
        return `满${coupon.minAmount || 0}减${coupon.value}`;
    };

    return (
        <div className="flex-1 max-w-[1440px] mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
            <h1 className="sr-only">JavaBooks - 在线书店</h1>
            <div className="flex flex-col lg:flex-row gap-8 relative">
                {/* Mobile Sidebar Toggle */}
                <button
                    onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                    className="lg:hidden fixed bottom-6 left-6 z-40 p-3 bg-primary text-white rounded-full shadow-lg"
                    title="切换分类栏"
                    aria-label="切换分类栏"
                >
                    <span className="material-symbols-outlined" aria-hidden="true">category</span>
                </button>

                {/* Mobile Sidebar Backdrop */}
                {isSidebarOpen && (
                    <button
                        className="fixed inset-0 bg-black/40 z-40 lg:hidden"
                        onClick={() => setIsSidebarOpen(false)}
                        aria-label="关闭分类栏"
                    />
                )}

                {/* Sidebar Navigation */}
                <aside className={`
                    fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-surface-dark transform transition-transform duration-300 ease-in-out shadow-lg lg:shadow-none
                    lg:sticky lg:top-20 lg:z-10 lg:transform-none lg:transition-[width,opacity] lg:duration-300 lg:ease-in-out lg:self-start lg:max-h-[calc(100vh-5rem)] lg:overflow-y-auto
                    ${isSidebarOpen ? 'translate-x-0 lg:w-64 lg:opacity-100' : '-translate-x-full lg:w-0 lg:opacity-0 lg:overflow-hidden'}
                `}>
                    <div className="bg-surface-light dark:bg-surface-dark rounded-xl shadow-sm border border-slate-100 dark:border-slate-700">
                        <div className="p-4 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center">
                            <h3 className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                <span className="material-symbols-outlined text-primary" aria-hidden="true">category</span>
                                分类
                            </h3>
                            <button
                                onClick={() => setIsSidebarOpen(false)}
                                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                                title="收起侧边栏"
                                aria-label="收起侧边栏"
                            >
                                <span className="material-symbols-outlined" aria-hidden="true">close</span>
                            </button>
                        </div>
                        <nav className="p-2 space-y-1">
                            <button
                                onClick={() => { setSelectedCategory(null); setCurrentPage(0); }}
                                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg font-medium transition-colors ${
                                    selectedCategory === null
                                        ? 'bg-primary/10 text-primary'
                                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                                }`}
                            >
                                <span className="material-symbols-outlined text-[20px]" aria-hidden="true">grid_view</span>
                                所有分类
                            </button>
                            {categories.map((category) => (
                                <button
                                    key={category.id}
                                    onClick={() => { setSelectedCategory(category.id); setCurrentPage(0); }}
                                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg font-medium transition-all duration-200 group ${
                                        selectedCategory === category.id
                                            ? 'bg-primary/10 text-primary border-r-4 border-primary'
                                            : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 hover:translate-x-1'
                                    }`}
                                >
                                    <span className={`material-symbols-outlined text-[20px] ${selectedCategory === category.id ? 'text-primary' : 'text-gray-400 group-hover:text-primary'}`} aria-hidden="true">
                                        {getIcon(category.name)}
                                    </span>
                                    {category.name}
                                </button>
                            ))}
                        </nav>

                        {/* 优惠券领取 & 每日签到 - 侧边栏下方 */}
                        {isAuthenticated && (
                            <div className="p-3 space-y-3 mt-2">
                                {/* 签到卡片 */}
                                <div className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 rounded-xl p-4 text-center">
                                    <span className="material-symbols-outlined text-amber-500 text-3xl mb-2" aria-hidden="true">workspace_premium</span>
                                    <p className="text-sm text-ink-light dark:text-gray-400 mb-1">
                                        积分：<span className="font-bold text-primary">{userPoints}</span>
                                    </p>
                                    <button
                                        onClick={handleSignIn}
                                        disabled={signedInToday || signInLoading}
                                        className={`w-full px-4 py-2 rounded-lg font-display font-semibold text-xs transition-colors ${
                                            signedInToday
                                                ? 'bg-gray-100 dark:bg-gray-700 text-gray-400 cursor-default'
                                                : 'bg-gradient-to-r from-amber-500 to-orange-500 text-white hover:shadow-md'
                                        }`}
                                    >
                                        {signedInToday ? '已签到' : '签到领积分'}
                                    </button>
                                </div>
                                {/* 优惠券领取 */}
                                {coupons.length > 0 && (
                                    <div className="space-y-2">
                                        <p className="text-xs font-bold text-ink-light dark:text-gray-400 px-1">可领取优惠券</p>
                                        {coupons.slice(0, 2).map((coupon) => (
                                            <div
                                                key={coupon.id}
                                                className="flex items-center justify-between p-2.5 rounded-lg border border-gray-100 dark:border-gray-700 bg-white dark:bg-slate-800"
                                            >
                                                <span className="shrink-0 px-2 py-1 rounded bg-primary/10 text-primary font-bold text-xs">
                                                    {getCouponDiscountText(coupon)}
                                                </span>
                                                <button
                                                    onClick={() => handleClaimCoupon(coupon.id)}
                                                    disabled={claimedIds.has(coupon.id)}
                                                    className={`shrink-0 px-3 py-1 rounded text-xs font-medium ${
                                                        claimedIds.has(coupon.id)
                                                            ? 'bg-gray-100 text-gray-400'
                                                            : 'bg-primary text-white hover:bg-primary/90'
                                                    }`}
                                                >
                                                    {claimedIds.has(coupon.id) ? '已领' : '领取'}
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Settings & Support */}
                        <div className="mt-auto pt-6 border-t border-slate-100 dark:border-slate-700 space-y-1">
                            <button onClick={() => navigate('/contact')} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                                <span className="material-symbols-outlined text-[20px]" aria-hidden="true">help_outline</span>
                                <span className="text-sm font-medium">客服支持</span>
                            </button>
                        </div>
                    </div>
                </aside>

                {/* Main Content */}
                <div className="flex-1 transition-[width,opacity] duration-300">
                    {!isSidebarOpen && (
                        <button
                            onClick={() => setIsSidebarOpen(true)}
                            className="hidden lg:flex items-center gap-2 mb-4 text-primary font-bold hover:underline"
                        >
                            <span className="material-symbols-outlined" aria-hidden="true">menu_open</span>
                            显示分类
                        </button>
                    )}

                    {/* Hero Banner - CSS Auto Carousel */}
                    {!searchQuery && !selectedCategory && <HeroCarousel />}

                    {/* AI + Rankings Side by Side */}
                    {!searchQuery && !selectedCategory && (
                        <div className="flex flex-col lg:flex-row gap-8 mb-8">
                            {/* AI Recommendation - Left */}
                            <div className="flex-1 space-y-6">
                                <div className="bg-gradient-to-br from-primary via-blue-500 to-blue-600 p-[1px] rounded-2xl shadow-xl shadow-primary/10">
                                    <div className="bg-white dark:bg-slate-900 rounded-[15px] p-8 flex flex-col md:flex-row items-center gap-8">
                                        <div className="flex-1 space-y-4">
                                            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-xs font-bold">
                                                <span className="material-symbols-outlined text-sm" aria-hidden="true" style={{ fontVariationSettings: "'FILL' 1" }}>auto_awesome</span>
                                                AI CURATOR
                                            </div>
                                            <h2 className="text-2xl lg:text-3xl font-bold text-slate-900 dark:text-white leading-snug">AI 智能荐书，发现你的下一本书</h2>
                                            <div className="flex flex-wrap gap-2">
                                                {['Java进阶', '入门Python', '科幻小说', '人工智能'].map((suggestion) => (
                                                    <button
                                                        key={suggestion}
                                                        type="button"
                                                        onClick={() => navigate(`/ai-recommend?q=${encodeURIComponent(suggestion)}`)}
                                                        className="px-4 py-2 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-600 dark:text-slate-300 hover:bg-primary hover:text-white hover:border-primary transition-all cursor-pointer"
                                                    >
                                                        {suggestion}
                                                    </button>
                                                ))}
                                            </div>
                                            <button
                                                onClick={() => navigate('/ai-recommend')}
                                                className="group inline-flex items-center gap-3 text-primary font-bold text-lg hover:gap-4 transition-all"
                                            >
                                                开始 AI 荐书之旅
                                                <span className="material-symbols-outlined group-hover:translate-x-2 transition-transform" aria-hidden="true">east</span>
                                            </button>
                                        </div>
                                        <div className="w-full md:w-48 aspect-square bg-slate-50 dark:bg-slate-800 rounded-2xl flex items-center justify-center border border-slate-200 dark:border-slate-700 relative overflow-hidden">
                                            <span className="material-symbols-outlined text-primary/10 text-[8rem] absolute -bottom-8 -right-8" style={{ fontVariationSettings: "'FILL' 1" }}>auto_stories</span>
                                            <div className="relative z-10 text-center space-y-2">
                                                <span className="material-symbols-outlined text-primary text-5xl">cognition</span>
                                                <p className="text-[10px] uppercase tracking-widest text-slate-400">Neural Engine</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Below AI: Member CTA + Coupon */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {/* 会员推荐卡 */}
                                    <div className="p-6 rounded-2xl bg-blue-50 dark:bg-blue-900/20 space-y-4">
                                        <span className="material-symbols-outlined text-4xl text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>workspace_premium</span>
                                        <h5 className="font-bold text-xl text-slate-900 dark:text-white leading-tight">加入书友会</h5>
                                        <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">解锁专属推荐、稀有版本优先购买、以及独家读书笔记。</p>
                                        <button className="w-full py-3 bg-primary text-white rounded-xl text-sm font-bold hover:bg-blue-700 transition-colors">
                                            立即加入
                                        </button>
                                    </div>

                                    {/* 领取优惠券 */}
                                    <div className="p-6 rounded-2xl bg-amber-50 dark:bg-amber-900/20 space-y-4">
                                        <span className="material-symbols-outlined text-4xl text-amber-500" style={{ fontVariationSettings: "'FILL' 1" }}>confirmation_number</span>
                                        <h5 className="font-bold text-xl text-slate-900 dark:text-white leading-tight">领取优惠券</h5>
                                        {isAuthenticated && coupons.length > 0 ? (
                                            <div className="space-y-2">
                                                {coupons.slice(0, 2).map((coupon) => (
                                                    <div key={coupon.id} className="flex items-center justify-between p-3 rounded-lg border border-amber-200 dark:border-amber-700 bg-white dark:bg-slate-800">
                                                        <span className="px-2 py-1 rounded bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 font-bold text-xs">
                                                            {getCouponDiscountText(coupon)}
                                                        </span>
                                                        <button
                                                            onClick={() => handleClaimCoupon(coupon.id)}
                                                            disabled={claimedIds.has(coupon.id)}
                                                            className={`px-4 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                                                                claimedIds.has(coupon.id)
                                                                    ? 'bg-slate-100 text-slate-400'
                                                                    : 'bg-amber-500 text-white hover:bg-amber-600'
                                                            }`}
                                                        >
                                                            {claimedIds.has(coupon.id) ? '已领' : '领取'}
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <div>
                                                <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed mb-3">
                                                    {isAuthenticated ? '暂无可领取优惠券' : '登录后领取专属优惠券'}
                                                </p>
                                                {!isAuthenticated && (
                                                    <button onClick={() => navigate('/login')} className="w-full py-3 bg-amber-500 text-white rounded-xl text-sm font-bold hover:bg-amber-600 transition-colors">
                                                        登录领取
                                                    </button>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Rankings Sidebar - Right */}
                            <div className="w-full lg:w-80">
                                <Rankings />
                            </div>
                        </div>
                    )}

                    {/* 编辑精选 */}
                    {!searchQuery && !selectedCategory && <FeaturedBooks />}

                    {/* 全部图书标题 */}
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h2 className="section-title text-2xl deco-line">
                                {searchQuery ? `"${searchQuery}" 的搜索结果` : selectedCategory ? '分类结果' : '全部图书'}
                            </h2>
                        </div>
                        <div className="flex items-center gap-3">
                            <label htmlFor="sort-select" className="text-sm text-ink-light font-body">排序</label>
                            <select 
                                id="sort-select"
                                value={sortOption}
                                onChange={(e) => setSortOption(e.target.value)}
                                className="text-sm font-body border border-gray-200 dark:border-gray-700 bg-white dark:bg-surface-dark rounded-lg focus:ring-primary focus:border-primary px-3 py-1.5 outline-none"
                            >
                                <option value="newest">最新上架</option>
                                <option value="rating">好评优先</option>
                                <option value="price_asc">价格 ↑</option>
                                <option value="price_desc">价格 ↓</option>
                            </select>
                        </div>
                    </div>

                    {/* 分类标签 */}
                    <CategoryTabs 
                        categories={categories}
                        activeCategory={selectedCategory}
                        onCategoryChange={(id) => { setSelectedCategory(id); setCurrentPage(0); }}
                    />

                    {/* Book Grid */}
                    {loading ? (
                        <BookGridSkeleton count={8} />
                    ) : (
                        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 stagger-children">
                            {books.map((book) => (
                                <BookCard key={book.id} book={book} />
                            ))}
                        </div>
                    )}
                    
                    {!loading && books.length === 0 && (
                        <EmptyState
                            icon="search"
                            title="未找到相关书籍"
                            description={searchQuery ? `没有找到与"${searchQuery}"相关的图书，试试其他关键词吧` : '该分类下暂无图书，去看看其他分类吧'}
                            action={{ label: '查看全部图书', onClick: () => { setSelectedCategory(null); setCurrentPage(0); } }}
                        />
                    )}
                    
                    {/* 分页组件 */}
                    {!loading && totalPages > 1 && (
                        <div className="flex justify-center items-center gap-2 mt-8">
                            <button
                                onClick={() => setCurrentPage(prev => Math.max(0, prev - 1))}
                                disabled={currentPage === 0}
                                className="px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                            >
                                上一页
                            </button>
                            <div className="flex gap-1">
                                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                                    let pageNum;
                                    if (totalPages <= 5) {
                                        pageNum = i;
                                    } else if (currentPage < 2) {
                                        pageNum = i;
                                    } else if (currentPage > totalPages - 3) {
                                        pageNum = totalPages - 5 + i;
                                    } else {
                                        pageNum = currentPage - 2 + i;
                                    }
                                    return (
                                        <button
                                            key={pageNum}
                                            onClick={() => setCurrentPage(pageNum)}
                                            className={`w-11 h-11 rounded-lg transition-colors ${
                                                currentPage === pageNum
                                                    ? 'bg-primary text-white'
                                                    : 'border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800'
                                            }`}
                                        >
                                            {pageNum + 1}
                                        </button>
                                    );
                                })}
                            </div>
                            <button
                                onClick={() => setCurrentPage(prev => Math.min(totalPages - 1, prev + 1))}
                                disabled={currentPage >= totalPages - 1}
                                className="px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                            >
                                下一页
                            </button>
                            <span className="text-sm text-gray-500 ml-4">
                                共 {totalElements} 本书籍
                            </span>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Home;
