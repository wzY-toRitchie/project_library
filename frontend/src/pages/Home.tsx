import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import api from '../api';
import type { Book, Category } from '../types';
import { useCart } from '../context/CartContext';
import { BookGridSkeleton } from '../components/Skeleton';
import EmptyState from '../components/EmptyState';
import StarRating from '../components/StarRating';
import RecentBrowsing from '../components/RecentBrowsing';
import Recommendations from '../components/Recommendations';
import CategoryTabs from '../components/CategoryTabs';
import { message } from 'antd'; // Keep antd message for now as it's convenient

const Home: React.FC = () => {
    const [books, setBooks] = useState<Book[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
    const [sortOption, setSortOption] = useState('newest');
    const { addToCart } = useCart();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const searchQuery = searchParams.get('search');
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    
    // 分页状态
    const [currentPage, setCurrentPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [totalElements, setTotalElements] = useState(0);
    const pageSize = 12;

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

    const handleAddToCart = (book: Book) => {
        addToCart(book);
        message.success(`${book.title} 已加入购物车`);
    };

    return (
        <div className="flex-1 max-w-[1440px] mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex flex-col lg:flex-row gap-8 relative">
                {/* Mobile Sidebar Toggle */}
                <button
                    onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                    className="lg:hidden fixed bottom-6 left-6 z-40 p-3 bg-primary text-white rounded-full shadow-lg"
                    title="切换分类栏"
                >
                    <span className="material-symbols-outlined">category</span>
                </button>

                {/* Sidebar Navigation */}
                <aside className={`
                    fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-surface-dark transform transition-transform duration-300 ease-in-out shadow-lg lg:shadow-none
                    lg:sticky lg:top-20 lg:z-10 lg:transform-none lg:transition-all lg:duration-300 lg:ease-in-out lg:self-start lg:max-h-[calc(100vh-5rem)] lg:overflow-y-auto
                    ${isSidebarOpen ? 'translate-x-0 lg:w-64 lg:opacity-100' : '-translate-x-full lg:w-0 lg:opacity-0 lg:overflow-hidden'}
                `}>
                    <div className="bg-surface-light dark:bg-surface-dark rounded-xl shadow-sm border border-[#f0f2f4] dark:border-[#2a3441]">
                        <div className="p-4 border-b border-[#f0f2f4] dark:border-[#2a3441] flex justify-between items-center">
                            <h3 className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                <span className="material-symbols-outlined text-primary">category</span>
                                分类
                            </h3>
                            <button 
                                onClick={() => setIsSidebarOpen(false)} 
                                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                                title="收起侧边栏"
                            >
                                <span className="material-symbols-outlined">close</span>
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
                                <span className="material-symbols-outlined text-[20px]">grid_view</span>
                                所有分类
                            </button>
                            {categories.map((category) => (
                                <button
                                    key={category.id}
                                    onClick={() => { setSelectedCategory(category.id); setCurrentPage(0); }}
                                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg font-medium transition-colors group ${
                                        selectedCategory === category.id
                                            ? 'bg-primary/10 text-primary'
                                            : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                                    }`}
                                >
                                    <span className={`material-symbols-outlined text-[20px] ${selectedCategory === category.id ? 'text-primary' : 'text-gray-400 group-hover:text-primary'}`}>
                                        label
                                    </span>
                                    {category.name}
                                </button>
                            ))}
                        </nav>
                    </div>
                </aside>

                {/* Main Content */}
                <div className="flex-1 transition-all duration-300">
                    {!isSidebarOpen && (
                        <button
                            onClick={() => setIsSidebarOpen(true)}
                            className="hidden lg:flex items-center gap-2 mb-4 text-primary font-bold hover:underline"
                        >
                            <span className="material-symbols-outlined">menu_open</span>
                            显示分类
                        </button>
                    )}

                    {/* Hero Banner - Editorial Style */}
                    {!searchQuery && !selectedCategory && (
                        <div className="relative w-full rounded-2xl overflow-hidden mb-10 hero-pattern text-white">
                            <div className="relative z-10 px-8 py-12 md:px-12 md:py-16">
                                <div className="max-w-xl">
                                    <p className="text-amber-300/90 font-body text-sm font-semibold tracking-widest uppercase mb-3 animate-fadeUp">
                                        Online Bookstore
                                    </p>
                                    <h1 className="font-display text-4xl md:text-5xl font-bold leading-tight mb-4 animate-fadeUp" style={{ animationDelay: '0.1s', animationFillMode: 'both' }}>
                                        在知识的海洋中<br/>
                                        <span className="text-amber-300">发现你的珍宝</span>
                                    </h1>
                                    <p className="text-blue-100/80 font-body text-lg max-w-md mb-6 animate-fadeUp" style={{ animationDelay: '0.2s', animationFillMode: 'both' }}>
                                        从经典文学到前沿科技，精选优质好书，让阅读成为一种享受。
                                    </p>
                                    <div className="flex gap-3 animate-fadeUp" style={{ animationDelay: '0.3s', animationFillMode: 'both' }}>
                                        <button 
                                            onClick={() => navigate('/search?q=推荐')}
                                            className="btn-accent flex items-center gap-2 text-sm"
                                        >
                                            浏览推荐
                                            <span className="material-symbols-outlined text-lg">arrow_forward</span>
                                        </button>
                                    </div>
                                </div>
                            </div>
                            {/* Decorative elements */}
                            <div className="absolute top-8 right-12 w-32 h-32 rounded-full bg-amber-400/10 blur-2xl animate-float"></div>
                            <div className="absolute bottom-4 right-24 w-20 h-20 rounded-full bg-blue-400/15 blur-xl animate-float" style={{ animationDelay: '2s' }}></div>
                        </div>
                    )}

                    {/* 猜你喜欢 */}
                    {!searchQuery && !selectedCategory && (
                        <Recommendations categories={categories} onAddToCart={handleAddToCart} />
                    )}

                    {/* 最近浏览 */}
                    {!searchQuery && !selectedCategory && (
                        <RecentBrowsing onAddToCart={handleAddToCart} />
                    )}

                    {/* 全部图书标题 - Editorial Style */}
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h2 className="section-title text-2xl deco-line">
                                {searchQuery ? `"${searchQuery}" 的搜索结果` : selectedCategory ? '分类结果' : '全部图书'}
                            </h2>
                        </div>
                        <div className="flex items-center gap-3">
                            <span className="text-sm text-ink-light font-body">排序</span>
                            <select 
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

                    {/* Book Grid - Editorial Cards */}
                    {loading ? (
                        <BookGridSkeleton count={8} />
                    ) : (
                        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-5 stagger-children">
                            {books.map((book) => (
                                <div 
                                    key={book.id} 
                                    className="card-elegant overflow-hidden flex flex-col h-full cursor-pointer group" 
                                    onClick={() => navigate(`/book/${book.id}`)}
                                >
                                    <div className="relative aspect-[3/4] overflow-hidden bg-gray-50">
                                        {book.coverImage ? (
                                            <div className="img-zoom absolute inset-0">
                                                <img 
                                                    src={book.coverImage}
                                                    alt={book.title}
                                                    loading="lazy"
                                                    className="absolute inset-0 w-full h-full object-cover"
                                                    onError={(e) => {
                                                        e.currentTarget.style.display = 'none';
                                                    }}
                                                />
                                            </div>
                                        ) : (
                                            <div className="absolute inset-0 flex items-center justify-center bg-gray-100 text-gray-300">
                                                <span className="material-symbols-outlined text-5xl">menu_book</span>
                                            </div>
                                        )}
                                        {/* Gradient overlay */}
                                        <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                                    </div>
                                    <div className="p-4 flex flex-col flex-1">
                                        <div className="mb-auto">
                                            <h3 
                                                className="font-display font-semibold text-ink dark:text-white line-clamp-1 text-base mb-1 group-hover:text-primary transition-colors" 
                                                title={book.title}
                                            >
                                                {book.title}
                                            </h3>
                                            <p className="text-xs text-ink-light dark:text-gray-400 font-body mb-2">{book.author}</p>
                                            <StarRating rating={book.rating || 5} size="sm" showValue />
                                        </div>
                                        <div className="mt-3 flex items-center justify-between">
                                            <span className="text-lg font-bold price-tag">¥{book.price}</span>
                                            <button 
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleAddToCart(book);
                                                }}
                                                className="btn-primary p-2 !rounded-lg ripple btn-icon" 
                                                title="加入购物车"
                                                aria-label={`将 ${book.title} 加入购物车`}
                                            >
                                                <span className="material-symbols-outlined text-sm">add_shopping_cart</span>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                    
                    {!loading && books.length === 0 && (
                        <EmptyState
                            icon="search"
                            title="未找到相关书籍"
                            description={searchQuery ? `没有找到与"${searchQuery}"相关的图书，试试其他关键词吧` : '该分类下暂无图书，去看看其他分类吧'}
                            action={{ label: '查看全部图书', onClick: () => { setSearchQuery(''); setSelectedCategory(null); setCurrentPage(0); } }}
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
                                            className={`w-10 h-10 rounded-lg transition-colors ${
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
