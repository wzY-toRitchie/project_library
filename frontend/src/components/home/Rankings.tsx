import React, { useEffect, useState } from 'react';
import api from '../../api';
import type { Book } from '../../types';
import BookCard from '../BookCard';

type RankTab = 'bestseller' | 'topRated' | 'newArrivals';

const tabConfig: Record<RankTab, { label: string; icon: string; apiPath: string }> = {
    bestseller: { label: '热销榜', icon: 'local_fire_department', apiPath: '/home/bestsellers' },
    topRated: { label: '好评榜', icon: 'star', apiPath: '/home/top-rated' },
    newArrivals: { label: '新书榜', icon: 'new_releases', apiPath: '/home/new-arrivals' },
};

const Rankings: React.FC = () => {
    const [activeTab, setActiveTab] = useState<RankTab>('bestseller');
    const [books, setBooks] = useState<Book[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchBooks = async () => {
            setLoading(true);
            try {
                const config = tabConfig[activeTab];
                const response = await api.get(`${config.apiPath}?size=5`);
                setBooks(response.data.content || response.data || []);
            } catch (error) {
                console.error('Failed to fetch rankings:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchBooks();
    }, [activeTab]);

    return (
        <section>
            <h4 className="font-bold text-xl text-slate-900 dark:text-white mb-6 border-b-2 border-primary/10 pb-2">
                排行榜
            </h4>
            <div className="flex gap-1 bg-slate-100 dark:bg-slate-800 rounded-lg p-1 mb-4">
                {(Object.entries(tabConfig) as [RankTab, typeof tabConfig['bestseller']][])
                    .map(([key, config]) => (
                        <button
                            key={key}
                            onClick={() => setActiveTab(key)}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                                activeTab === key
                                    ? 'bg-white dark:bg-slate-700 text-primary shadow-sm'
                                    : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                            }`}
                        >
                            <span className="material-symbols-outlined text-[14px]" aria-hidden="true">{config.icon}</span>
                            {config.label}
                        </button>
                    ))}
            </div>

            {loading ? (
                <div className="space-y-0">
                    {Array.from({ length: 5 }).map((_, i) => (
                        <div key={i} className="flex items-center gap-3 p-3 animate-pulse">
                            <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700" />
                            <div className="w-10 h-14 rounded bg-slate-200 dark:bg-slate-700" />
                            <div className="flex-1 space-y-2">
                                <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-3/4" />
                                <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-1/2" />
                            </div>
                            <div className="h-5 bg-slate-200 dark:bg-slate-700 rounded w-16" />
                        </div>
                    ))}
                </div>
            ) : (
            <div className="space-y-0">
                {books.slice(0, 5).map((book, index) => (
                    <BookCard key={book.id} book={book} variant="ranked" rank={index + 1} />
                ))}
            </div>
            )}
        </section>
    );
};

export default Rankings;
