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

const SearchResults: React.FC = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const { addToCart } = useCart();
    
    const keyword = searchParams.get('q') || '';
    const [books, setBooks] = useState<Book[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
    const [sortBy, setSortBy] = useState('relevance');
    
    // 分页状态
    const [currentPage, setCurrentPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [totalElements, setTotalElements] = useState(0);
    const pageSize = 12;

    // 获取分类列表
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

    // 搜索图书
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
            setBooks(response.content);
            setTotalPages(Math.ceil(response.totalElements / pageSize));
            setTotalElements(response.totalElements);
        } catch (error) {
            console.error('Search failed:', error);
            message.error('搜索遇到了问题，请稍后再试');
        } finally {
            setLoading(false);
        }
    }, [keyword, selectedCategory, sortBy, currentPage]);

    useEffect(() => {
        fetchSearchResults();
    }, [fetchSearchResults]);

    // 重置分页
    useEffect(() => {
        setCurrentPage(0);
    }, [keyword, selectedCategory, sortBy]);

    const handleAddToCart = (book: Book) => {
        addToCart(book);
        message.success(`${book.title} 已加入购物车`);
    };

    return (
        <div className="flex-1 max-w-[1440px] mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
            {/* 搜索结果头部 */}
            <div className="mb-6">
                <div className="flex items-center gap-2 text-sm text-slate-500 mb-2">
                    <span 
                        className="hover:text-primary cursor-pointer"
                        onClick={() => navigate('/')}
                    >
                        首页
                    </span>
                    <span>/</span>
                    <span className="text-slate-900 dark:text-white">搜索结果</span>
                </div>
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                    🔍 搜索结果："{keyword}"
                    {!loading && (
                        <span className="text-sm font-normal text-slate-500 ml-2">
                            找到 {totalElements} 本书籍
                        </span>
                    )}
                </h1>
            </div>

            {/* 筛选和排序 */}
            <div className="flex flex-wrap items-center gap-4 mb-6">
                {/* 分类筛选 */}
                <div className="flex items-center gap-2">
                    <span className="text-sm text-slate-500">分类：</span>
                    <select
                        value={selectedCategory || ''}
                        onChange={(e) => setSelectedCategory(e.target.value ? Number(e.target.value) : null)}
                        className="px-3 py-2 text-sm border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 focus:ring-2 focus:ring-primary/50"
                    >
                        <option value="">所有分类</option>
                        {categories.map(cat => (
                            <option key={cat.id} value={cat.id}>{cat.name}</option>
                        ))}
                    </select>
                </div>

                {/* 排序 */}
                <div className="flex items-center gap-2">
                    <span className="text-sm text-slate-500">排序：</span>
                    <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                        className="px-3 py-2 text-sm border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 focus:ring-2 focus:ring-primary/50"
                    >
                        <option value="relevance">综合排序</option>
                        <option value="newest">最新上架</option>
                        <option value="rating">好评优先</option>
                        <option value="price_asc">价格：从低到高</option>
                        <option value="price_desc">价格：从高到低</option>
                    </select>
                </div>
            </div>

            {/* 搜索结果列表 */}
            {loading ? (
                <BookGridSkeleton count={8} />
            ) : books.length === 0 ? (
                <EmptyState
                    icon="search"
                    title="未找到相关书籍"
                    description={`没有找到与"${keyword}"相关的图书，请尝试其他关键词或调整筛选条件`}
                    action={{ label: '返回首页', to: '/' }}
                />
            ) : (
                <>
                    <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
                        {books.map((book) => (
                            <div 
                                key={book.id} 
                                className="group bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden hover:shadow-lg transition-all cursor-pointer" 
                                onClick={() => navigate(`/book/${book.id}`)}
                            >
                                <div className="relative aspect-[3/4] overflow-hidden bg-slate-100 dark:bg-slate-700">
                                    {book.coverImage ? (
                                        <img 
                                            src={book.coverImage}
                                            alt={book.title}
                                            loading="lazy"
                                            className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                            onError={(e) => {
                                                e.currentTarget.style.display = 'none';
                                            }}
                                        />
                                    ) : (
                                        <div className="absolute inset-0 flex items-center justify-center">
                                            <span className="material-symbols-outlined text-4xl text-slate-400">image</span>
                                        </div>
                                    )}
                                </div>
                                <div className="p-4">
                                    <h3 className="font-bold text-slate-900 dark:text-white line-clamp-1 mb-1">
                                        {book.title}
                                    </h3>
                                    <p className="text-sm text-slate-500 mb-2">{book.author}</p>
                                    {book.rating && <StarRating rating={book.rating} size="sm" showValue />}
                                    <div className="flex items-center justify-between mt-3">
                                        <span className="text-lg font-bold text-primary">¥{book.price}</span>
                                        <button 
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleAddToCart(book);
                                            }}
                                            className="p-2 rounded-lg bg-primary hover:bg-primary/90 text-white transition-colors" 
                                            title="加入购物车"
                                        >
                                            <span className="material-symbols-outlined text-sm">add_shopping_cart</span>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* 分页 */}
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
    );
};

export default SearchResults;
