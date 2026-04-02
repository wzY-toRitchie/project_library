import React, { useEffect, useState, useCallback } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { message } from 'antd';
import api from '../api';
import { searchBooks } from '../api/search';
import type { Book, Category } from '../types';
import { useCart } from '../context/CartContext';
import { BookGridSkeleton } from '../components/Skeleton';
import EmptyState from '../components/EmptyState';
import StarRating from '../components/StarRating';

const PRICE_RANGES = [
    { label: '全部', value: '' },
    { label: '¥0 - ¥30', value: '0-30' },
    { label: '¥30 - ¥50', value: '30-50' },
    { label: '¥50 - ¥100', value: '50-100' },
    { label: '¥100+', value: '100-' },
];

const RATING_FILTERS = [
    { label: '全部', value: '' },
    { label: <><span className="material-symbols-outlined text-sm align-middle" style={{ fontVariationSettings: "'FILL' 1" }}>star</span> 4+</>, value: '4' },
    { label: <><span className="material-symbols-outlined text-sm align-middle" style={{ fontVariationSettings: "'FILL' 1" }}>star</span> 3+</>, value: '3' },
];

const SearchResults: React.FC = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const navigate = useNavigate();
    const { addToCart } = useCart();
    
    const keyword = searchParams.get('q') || '';
    const [books, setBooks] = useState<Book[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);

    // Filter state synced with URL
    const [selectedCategory, setSelectedCategory] = useState<number | null>(() => {
        const cat = searchParams.get('category');
        return cat ? Number(cat) : null;
    });
    const [priceRange, setPriceRange] = useState(searchParams.get('price') || '');
    const [ratingFilter, setRatingFilter] = useState(searchParams.get('rating') || '');
    const [sortBy, setSortBy] = useState(searchParams.get('sort') || 'relevance');
    
    // Pagination
    const [currentPage, setCurrentPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [totalElements, setTotalElements] = useState(0);
    const pageSize = 12;

    // Fetch categories
    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const response = await api.get('/categories');
                setCategories(response.data);
            } catch (error) {
                console.error('Failed to fetch categories:', error);
            }
        };
        fetchCategories();
    }, []);

    // Sync filters to URL
    useEffect(() => {
        const params = new URLSearchParams();
        if (keyword) params.set('q', keyword);
        if (selectedCategory) params.set('category', String(selectedCategory));
        if (priceRange) params.set('price', priceRange);
        if (ratingFilter) params.set('rating', ratingFilter);
        if (sortBy && sortBy !== 'relevance') params.set('sort', sortBy);
        setSearchParams(params, { replace: true });
    }, [selectedCategory, priceRange, ratingFilter, sortBy, keyword, setSearchParams]);

    // Search books
    const fetchSearchResults = useCallback(async () => {
        if (!keyword) {
            setBooks([]);
            return;
        }
        
        setLoading(true);
        try {
            const response = await searchBooks(keyword, {
                categoryId: selectedCategory || undefined,
                sortBy,
                page: currentPage,
                size: pageSize
            });
            let filtered: Book[] = response.content || [];

            // Client-side price filtering
            if (priceRange) {
                const [min, max] = priceRange.split('-').map(Number);
                filtered = filtered.filter(b => {
                    if (max) return b.price >= min && b.price <= max;
                    return b.price >= min;
                });
            }

            // Client-side rating filtering
            if (ratingFilter) {
                const minRating = Number(ratingFilter);
                filtered = filtered.filter(b => (b.rating || 0) >= minRating);
            }

            setBooks(filtered);
            setTotalPages(Math.ceil(response.totalElements / pageSize));
            setTotalElements(response.totalElements);
        } catch (error) {
            console.error('Search failed:', error);
            message.error('搜索遇到了问题，请稍后再试');
        } finally {
            setLoading(false);
        }
    }, [keyword, selectedCategory, sortBy, currentPage, priceRange, ratingFilter]);

    useEffect(() => {
        fetchSearchResults();
    }, [fetchSearchResults]);

    useEffect(() => {
        setCurrentPage(0);
    }, [keyword, selectedCategory, sortBy, priceRange, ratingFilter]);

    const handleAddToCart = (book: Book) => {
        addToCart(book);
        message.success(`${book.title} 已加入购物车`);
    };

    const clearFilters = () => {
        setSelectedCategory(null);
        setPriceRange('');
        setRatingFilter('');
        setSortBy('relevance');
    };

    const hasActiveFilters = selectedCategory || priceRange || ratingFilter;

    return (
        <div className="flex-1 max-w-[1440px] mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
            {/* Breadcrumb */}
            <div className="mb-6">
                <div className="flex items-center gap-2 text-sm text-slate-500 mb-2">
                    <button onClick={() => navigate('/')} className="hover:text-primary cursor-pointer">
                        首页
                    </button>
                    <span>/</span>
                    <span className="text-slate-900 dark:text-white">搜索结果</span>
                </div>
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                    搜索结果 &ldquo;{keyword}&rdquo;
                    {!loading && (
                        <span className="text-sm font-normal text-slate-500 ml-2">
                            找到 {totalElements} 本书
                        </span>
                    )}
                </h1>
            </div>

            <div className="flex gap-8">
                {/* Left Sidebar: Filters */}
                <aside className="hidden md:block w-56 flex-shrink-0">
                    <div className="sticky top-24 space-y-6">
                        {/* Price Range */}
                        <div>
                            <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-3">价格区间</h3>
                            <div className="space-y-1.5">
                                {PRICE_RANGES.map(r => (
                                    <button
                                        key={r.value}
                                        onClick={() => setPriceRange(r.value)}
                                        className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                                            priceRange === r.value
                                                ? 'bg-primary/10 text-primary font-medium'
                                                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                                        }`}
                                    >
                                        {r.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Rating Filter */}
                        <div>
                            <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-3">评分</h3>
                            <div className="space-y-1.5">
                                {RATING_FILTERS.map(r => (
                                    <button
                                        key={r.value}
                                        onClick={() => setRatingFilter(r.value)}
                                        className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                                            ratingFilter === r.value
                                                ? 'bg-primary/10 text-primary font-medium'
                                                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                                        }`}
                                    >
                                        {r.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Category Filter */}
                        <div>
                            <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-3">分类</h3>
                            <div className="space-y-1.5">
                                <button
                                    onClick={() => setSelectedCategory(null)}
                                    className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                                        !selectedCategory
                                            ? 'bg-primary/10 text-primary font-medium'
                                            : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                                    }`}
                                >
                                    所有分类
                                </button>
                                {categories.map(cat => (
                                    <button
                                        key={cat.id}
                                        onClick={() => setSelectedCategory(cat.id)}
                                        className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                                            selectedCategory === cat.id
                                                ? 'bg-primary/10 text-primary font-medium'
                                                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                                        }`}
                                    >
                                        {cat.name}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Clear Filters */}
                        {hasActiveFilters && (
                            <button
                                onClick={clearFilters}
                                className="w-full py-2 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                            >
                                清除所有筛选
                            </button>
                        )}
                    </div>
                </aside>

                {/* Main Content */}
                <div className="flex-1 min-w-0">
                    {/* Sort Bar */}
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-2">
                            <span className="text-sm text-slate-500">排序：</span>
                            <select
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value)}
                                className="px-3 py-2 text-sm border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 focus:ring-1 focus:ring-primary focus:border-primary"
                            >
                                <option value="relevance">综合排序</option>
                                <option value="newest">最新上架</option>
                                <option value="rating">好评优先</option>
                                <option value="price_asc">价格：从低到高</option>
                                <option value="price_desc">价格：从高到低</option>
                            </select>
                        </div>
                        {/* Active filter pills (mobile) */}
                        {hasActiveFilters && (
                            <div className="flex items-center gap-2 lg:hidden">
                                {selectedCategory && (
                                    <span className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-full">
                                        {categories.find(c => c.id === selectedCategory)?.name}
                                    </span>
                                )}
                                {priceRange && (
                                    <span className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-full">
                                        ¥{priceRange}
                                    </span>
                                )}
                                {ratingFilter && (
                                    <span className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-full">
                                        ★{ratingFilter}+
                                    </span>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Book Grid */}
                    {loading ? (
                        <BookGridSkeleton count={8} />
                    ) : books.length === 0 ? (
                        <EmptyState
                            icon="search"
                            title="未找到相关书籍"
                            description={`没有找到"${keyword}"相关的图书，请尝试其他关键词或调整筛选条件`}
                            action={{ label: '返回首页', to: '/' }}
                        />
                    ) : (
                        <>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                                {books.map((book) => (
                                    <div 
                                        key={book.id} 
                                        className="group bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden hover:shadow-lg transition-shadow cursor-pointer" 
                                        onClick={() => navigate(`/book/${book.id}`)}
                                    >
                                        <div className="relative aspect-[3/4] overflow-hidden bg-slate-100 dark:bg-slate-700">
                                            {book.coverImage ? (
                                                <img
                                                    src={book.coverImage}
                                                    alt={book.title}
                                                    loading="lazy"
                                                    className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                                    onError={(e) => { e.currentTarget.style.display = 'none'; }}
                                                    width={300}
                                                    height={400}
                                                />
                                            ) : (
                                                <div className="absolute inset-0 flex items-center justify-center">
                                                    <span className="material-symbols-outlined text-4xl text-slate-400" aria-hidden="true">image</span>
                                                </div>
                                            )}
                                        </div>
                                        <div className="p-4">
                                            <h3 className="font-bold text-slate-900 dark:text-white line-clamp-1 mb-1">{book.title}</h3>
                                            <p className="text-sm text-slate-500 mb-2">{book.author}</p>
                                            {book.rating && <StarRating rating={book.rating} size="sm" showValue />}
                                            <div className="flex items-center justify-between mt-3">
                                                <span className="text-lg font-bold text-primary">¥{book.price}</span>
                                                <button 
                                                    onClick={(e) => { e.stopPropagation(); handleAddToCart(book); }}
                                                    className="p-2.5 rounded-lg bg-primary hover:bg-primary/90 text-white transition-colors"
                                                    title="加入购物车"
                                                >
                                                    <span className="material-symbols-outlined text-sm" aria-hidden="true">add_shopping_cart</span>
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Pagination */}
                            {totalPages > 1 && (
                                <div className="flex justify-center items-center gap-2 mt-8">
                                    <button
                                        onClick={() => setCurrentPage(prev => Math.max(0, prev - 1))}
                                        disabled={currentPage === 0}
                                        className="px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50 dark:hover:bg-slate-800"
                                    >
                                        上一页
                                    </button>
                                    <div className="flex gap-1">
                                        {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                                            let pageNum;
                                            if (totalPages <= 5) pageNum = i;
                                            else if (currentPage < 2) pageNum = i;
                                            else if (currentPage > totalPages - 3) pageNum = totalPages - 5 + i;
                                            else pageNum = currentPage - 2 + i;
                                            return (
                                                <button
                                                    key={pageNum}
                                                    onClick={() => setCurrentPage(pageNum)}
                                                    className={`w-11 h-11 rounded-lg transition-colors ${
                                                        currentPage === pageNum
                                                            ? 'bg-primary text-white'
                                                            : 'border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800'
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
                                        className="px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50 dark:hover:bg-slate-800"
                                    >
                                        下一页
                                    </button>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default SearchResults;
