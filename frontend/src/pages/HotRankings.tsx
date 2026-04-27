import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';
import type { Book } from '../types';
import { FALLBACK_COVER } from '../utils/constants';
import StarRating from '../components/StarRating';

type RankTab = 'bestseller' | 'topRated' | 'newArrivals';

const tabConfig: Record<RankTab, { label: string; icon: string; apiPath: string; description: string }> = {
    bestseller: { label: '热销榜', icon: 'local_fire_department', apiPath: '/home/bestsellers', description: '最受欢迎的图书' },
    topRated: { label: '好评榜', icon: 'star', apiPath: '/home/top-rated', description: '评分最高的图书' },
    newArrivals: { label: '新书榜', icon: 'new_releases', apiPath: '/home/new-arrivals', description: '最新上架的图书' },
};

const HotRankings: React.FC = () => {
    const [activeTab, setActiveTab] = useState<RankTab>('bestseller');
    const [books, setBooks] = useState<Book[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchBooks = async () => {
            setLoading(true);
            try {
                const config = tabConfig[activeTab];
                const response = await api.get(`${config.apiPath}?size=20`);
                setBooks(response.data.content || response.data || []);
            } catch (error) {
                console.error('Failed to fetch rankings:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchBooks();
    }, [activeTab]);

    const currentConfig = tabConfig[activeTab];

    return (
        <div className="flex-1 max-w-[1440px] mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
            {/* Header */}
            <div className="mb-8">
                <div className="flex items-center gap-2 text-sm text-slate-500 mb-3">
                    <Link to="/" className="hover:text-primary transition-colors">首页</Link>
                    <span>/</span>
                    <span className="text-slate-900 dark:text-white">热销排行</span>
                </div>
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
                            <span className="material-symbols-outlined text-primary text-3xl" aria-hidden="true">leaderboard</span>
                            热销排行
                        </h1>
                        <p className="text-slate-500 mt-1">{currentConfig.description}</p>
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 bg-slate-100 dark:bg-slate-800 rounded-xl p-1.5 mb-8">
                {(Object.entries(tabConfig) as [RankTab, typeof tabConfig['bestseller']][]).map(([key, config]) => (
                    <button
                        key={key}
                        onClick={() => setActiveTab(key)}
                        className={`flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-lg text-sm font-medium transition-all ${
                            activeTab === key
                                ? 'bg-white dark:bg-slate-700 text-primary shadow-sm'
                                : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                        }`}
                    >
                        <span className="material-symbols-outlined text-[18px]" aria-hidden="true">{config.icon}</span>
                        {config.label}
                    </button>
                ))}
            </div>

            {/* Rankings Content */}
            {loading ? (
                <div className="space-y-0">
                    {Array.from({ length: 10 }).map((_, i) => (
                        <div key={i} className="flex items-center gap-4 p-4 animate-pulse">
                            <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-700" />
                            <div className="w-14 h-20 rounded bg-slate-200 dark:bg-slate-700" />
                            <div className="flex-1 space-y-2">
                                <div className="h-5 bg-slate-200 dark:bg-slate-700 rounded w-3/4" />
                                <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-1/2" />
                            </div>
                            <div className="h-6 bg-slate-200 dark:bg-slate-700 rounded w-20" />
                        </div>
                    ))}
                </div>
            ) : (
                <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
                    {books.map((book, index) => (
                        <Link
                            key={book.id}
                            to={`/book/${book.id}`}
                            className={`flex items-center gap-4 p-4 transition-colors hover:bg-slate-50 dark:hover:bg-slate-800 ${
                                index < books.length - 1 ? 'border-b border-slate-100 dark:border-slate-700' : ''
                            }`}
                        >
                            {/* Rank Number */}
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm shrink-0 ${
                                index < 3
                                    ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                                    : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400'
                            }`}>
                                {index + 1}
                            </div>

                            {/* Book Cover */}
                            <div className="w-14 h-20 flex-shrink-0 rounded overflow-hidden bg-slate-100 dark:bg-slate-800">
                                <img
                                    src={book.coverImage || FALLBACK_COVER}
                                    alt={book.title}
                                    className="w-full h-full object-cover"
                                    loading="lazy"
                                    width={56}
                                    height={80}
                                />
                            </div>

                            {/* Book Info */}
                            <div className="flex-1 min-w-0">
                                <h3 className="text-base font-medium text-slate-900 dark:text-white truncate">{book.title}</h3>
                                <p className="text-sm text-slate-500 mt-0.5">{book.author}</p>
                                <div className="flex items-center gap-2 mt-1">
                                    <StarRating rating={book.rating || 0} size="sm" showValue />
                                    {book.category && (
                                        <span className="text-xs text-slate-400">{book.category.name}</span>
                                    )}
                                </div>
                            </div>

                            {/* Price */}
                            <div className="text-right shrink-0">
                                <span className="text-lg font-bold text-primary">¥{book.price.toFixed(2)}</span>
                                <button
                                    onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}
                                    aria-label="加入购物车"
                                    className="block mt-2 px-4 py-1.5 bg-primary/10 text-primary rounded-lg text-xs font-medium hover:bg-primary hover:text-white transition-colors"
                                >
                                    加入购物车
                                </button>
                            </div>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
};

export default HotRankings;
