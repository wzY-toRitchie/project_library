import React, { useEffect, useState } from 'react';
import api from '../../api';
import { useAuth } from '../../context/AuthContext';

interface StatsData {
    ordersCount: number;
    favoritesCount: number;
    reviewsCount: number;
}

const ReadingStats: React.FC = () => {
    const { isAuthenticated, user } = useAuth();
    const [stats, setStats] = useState<StatsData>({ ordersCount: 0, favoritesCount: 0, reviewsCount: 0 });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!isAuthenticated) {
            setLoading(false);
            return;
        }

        const fetchStats = async () => {
            setLoading(true);
            try {
                const [ordersRes, favoritesRes, reviewsRes] = await Promise.all([
                    api.get('/orders/my').catch(() => ({ data: [] })),
                    api.get('/favorites/count').catch(() => ({ data: { count: 0 } })),
                    api.get(`/reviews/user/${user?.id}`).catch(() => ({ data: [] })),
                ]);

                const orders = Array.isArray(ordersRes.data) ? ordersRes.data : [];
                const favoritesCount = favoritesRes.data?.count ?? 0;
                const reviews = Array.isArray(reviewsRes.data) ? reviewsRes.data : [];

                setStats({
                    ordersCount: orders.length,
                    favoritesCount,
                    reviewsCount: reviews.length,
                });
            } catch (error) {
                console.error('Failed to fetch reading stats:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, [isAuthenticated, user?.id]);

    if (!isAuthenticated) return null;

    if (loading) {
        return (
            <section className="mb-10 section-animate bg-gradient-section">
                <div className="h-8 w-32 bg-slate-200 dark:bg-slate-700 rounded mb-6 animate-pulse" />
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {Array.from({ length: 3 }).map((_, i) => (
                        <div key={i} className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-slate-100 dark:border-slate-700 animate-pulse">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-slate-200 dark:bg-slate-700 rounded-full" />
                                <div className="flex-1">
                                    <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-16 mb-2" />
                                    <div className="h-8 bg-slate-200 dark:bg-slate-700 rounded w-12" />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </section>
        );
    }

    const statItems = [
        {
            icon: 'shopping_bag',
            label: '已购',
            value: stats.ordersCount,
            suffix: '本',
            color: 'text-emerald-500',
            bg: 'bg-emerald-50 dark:bg-emerald-500/10',
        },
        {
            icon: 'favorite',
            label: '收藏',
            value: stats.favoritesCount,
            suffix: '本',
            color: 'text-rose-500',
            bg: 'bg-rose-50 dark:bg-rose-500/10',
        },
        {
            icon: 'rate_review',
            label: '已评',
            value: stats.reviewsCount,
            suffix: '条',
            color: 'text-amber-500',
            bg: 'bg-amber-50 dark:bg-amber-500/10',
        },
    ];

    return (
        <section className="mb-10 section-animate bg-gradient-section">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-6">
                <span className="material-symbols-outlined text-primary" aria-hidden="true">bar_chart</span>
                阅读统计
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {statItems.map((item) => (
                    <div
                        key={item.label}
                        className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-slate-100 dark:border-slate-700 hover:shadow-md transition-shadow"
                    >
                        <div className="flex items-center gap-4">
                            <div className={`w-12 h-12 rounded-full ${item.bg} flex items-center justify-center`}>
                                <span className={`material-symbols-outlined text-2xl ${item.color}`} aria-hidden="true">{item.icon}</span>
                            </div>
                            <div>
                                <p className="text-sm text-slate-500 dark:text-slate-400">{item.label}</p>
                                <p className="text-2xl font-bold text-slate-900 dark:text-white count-up">
                                    {item.value} <span className="text-sm font-normal text-slate-500 dark:text-slate-400">{item.suffix}</span>
                                </p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
};

export default ReadingStats;
