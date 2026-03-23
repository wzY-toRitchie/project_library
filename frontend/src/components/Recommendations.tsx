import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import { getBrowsingHistory } from '../api/history';
import type { Book, Category } from '../types';
import { useAuth } from '../context/AuthContext';

interface RecommendationsProps {
    categories: Category[];
    onAddToCart?: (book: Book) => void;
}

const Recommendations: React.FC<RecommendationsProps> = ({ categories, onAddToCart }) => {
    const [books, setBooks] = useState<Book[]>([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    const { isAuthenticated } = useAuth();

    useEffect(() => {
        const fetchRecommendations = async () => {
            setLoading(true);
            try {
                // 优先基于浏览历史推荐
                if (isAuthenticated) {
                    const history = await getBrowsingHistory();
                    if (history.length > 0) {
                        // 统计分类偏好
                        const categoryCount: Record<number, number> = {};
                        history.forEach(h => {
                            const catId = h.book.category?.id;
                            if (catId) {
                                categoryCount[catId] = (categoryCount[catId] || 0) + 1;
                            }
                        });
                        
                        // 获取最常浏览的分类
                        const sortedCategories = Object.entries(categoryCount)
                            .sort((a, b) => b[1] - a[1]);
                        
                        if (sortedCategories.length > 0) {
                            const topCategoryId = sortedCategories[0][0];
                            const response = await api.get(`/books?categoryId=${topCategoryId}&size=4`);
                            const data = response.data.content || response.data;
                            if (Array.isArray(data) && data.length > 0) {
                                setBooks(data.slice(0, 4));
                                return;
                            }
                        }
                    }
                }
                
                // 无历史或未登录时，返回热门图书
                const response = await api.get('/books?sort=rating,desc&size=4');
                const data = response.data.content || response.data;
                setBooks(Array.isArray(data) ? data.slice(0, 4) : []);
            } catch (error) {
                console.error('Failed to fetch recommendations:', error);
                setBooks([]);
            } finally {
                setLoading(false);
            }
        };
        fetchRecommendations();
    }, [isAuthenticated]);

    if (loading) {
        return (
            <div className="animate-pulse">
                <div className="h-8 w-32 bg-slate-200 dark:bg-slate-700 rounded mb-4"></div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[1, 2, 3, 4].map(i => (
                        <div key={i} className="h-48 bg-slate-200 dark:bg-slate-700 rounded"></div>
                    ))}
                </div>
            </div>
        );
    }

    if (books.length === 0) {
        return null;
    }

    return (
        <section className="mb-8">
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary">auto_awesome</span>
                    {isAuthenticated ? '猜你喜欢' : '热门推荐'}
                </h2>
                <button
                    onClick={() => navigate('/')}
                    className="text-sm text-primary hover:underline"
                >
                    查看更多 →
                </button>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {books.map((book) => (
                    <div
                        key={book.id}
                        className="group bg-white dark:bg-slate-800 rounded-lg shadow-sm hover:shadow-md transition-all cursor-pointer border border-slate-100 dark:border-slate-700"
                        onClick={() => navigate(`/book/${book.id}`)}
                    >
                        <div className="relative aspect-[3/4] overflow-hidden rounded-t-lg">
                            <img
                                src={book.coverImage || 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?auto=format&fit=crop&q=80&w=300&h=400'}
                                alt={book.title}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                loading="lazy"
                            />
                            {book.rating && book.rating > 0 && (
                                <div className="absolute top-2 right-2 bg-yellow-400 text-yellow-900 px-2 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                                    <span className="material-symbols-outlined text-sm">star</span>
                                    {book.rating.toFixed(1)}
                                </div>
                            )}
                        </div>
                        <div className="p-3">
                            <h3 className="font-medium text-slate-900 dark:text-white line-clamp-1 text-sm">
                                {book.title}
                            </h3>
                            <p className="text-xs text-slate-500 mt-1">{book.author}</p>
                            <div className="flex items-center justify-between mt-2">
                                <span className="text-primary font-bold">¥{book.price.toFixed(2)}</span>
                                {onAddToCart && (
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            onAddToCart(book);
                                        }}
                                        className="p-1 rounded-full hover:bg-primary/10 text-primary"
                                    >
                                        <span className="material-symbols-outlined text-lg">add_shopping_cart</span>
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
};

export default Recommendations;
