import React from 'react';

// 图书卡片骨架屏
export const BookCardSkeleton: React.FC = () => (
    <div className="card-elegant overflow-hidden">
        <div className="aspect-[2/3] skeleton-shimmer" />
        <div className="p-4">
            <div className="h-5 skeleton-shimmer rounded mb-2 w-3/4" />
            <div className="h-4 skeleton-shimmer rounded mb-3 w-1/2" />
            <div className="flex items-center gap-1 mb-3">
                {[1, 2, 3, 4, 5].map(i => (
                    <div key={i} className="w-4 h-4 skeleton-shimmer rounded" />
                ))}
            </div>
            <div className="flex items-center justify-between">
                <div className="h-6 skeleton-shimmer rounded w-16" />
                <div className="w-8 h-8 skeleton-shimmer rounded-lg" />
            </div>
        </div>
    </div>
);

// 图书列表骨架屏
export const BookGridSkeleton: React.FC<{ count?: number }> = ({ count = 8 }) => (
    <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-5">
        {Array.from({ length: count }).map((_, i) => (
            <BookCardSkeleton key={i} />
        ))}
    </div>
);

export const HomeDiscoverySkeleton: React.FC = () => (
    <section aria-label="首页推荐内容加载中" className="space-y-8 mb-8">
        <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_20rem] gap-8">
            <div className="space-y-6">
                <div className="rounded-2xl border border-slate-200 dark:border-slate-700 p-8 space-y-4">
                    <div className="h-6 skeleton-shimmer rounded w-32" />
                    <div className="h-10 skeleton-shimmer rounded w-3/4" />
                    <div className="flex flex-wrap gap-2">
                        {Array.from({ length: 4 }).map((_, index) => (
                            <div key={index} className="h-10 w-24 skeleton-shimmer rounded-lg" />
                        ))}
                    </div>
                    <div className="h-10 skeleton-shimmer rounded w-40" />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {Array.from({ length: 2 }).map((_, index) => (
                        <div
                            key={index}
                            className="rounded-2xl border border-slate-200 dark:border-slate-700 p-6 space-y-3"
                        >
                            <div className="h-10 w-10 skeleton-shimmer rounded-full" />
                            <div className="h-6 skeleton-shimmer rounded w-1/2" />
                            <div className="h-4 skeleton-shimmer rounded w-full" />
                            <div className="h-10 skeleton-shimmer rounded w-full" />
                        </div>
                    ))}
                </div>
            </div>

            <div className="rounded-2xl border border-slate-200 dark:border-slate-700 p-6 space-y-4">
                <div className="h-7 skeleton-shimmer rounded w-24" />
                {Array.from({ length: 5 }).map((_, index) => (
                    <div key={index} className="flex items-center gap-3">
                        <div className="w-8 h-8 skeleton-shimmer rounded-full" />
                        <div className="w-10 h-14 skeleton-shimmer rounded" />
                        <div className="flex-1 space-y-2">
                            <div className="h-4 skeleton-shimmer rounded w-3/4" />
                            <div className="h-3 skeleton-shimmer rounded w-1/2" />
                        </div>
                    </div>
                ))}
            </div>
        </div>

        <section className="space-y-6">
            <div className="h-7 skeleton-shimmer rounded w-28" />
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
                {Array.from({ length: 8 }).map((_, index) => (
                    <div key={index} data-testid="featured-book-skeleton">
                        <BookCardSkeleton />
                    </div>
                ))}
            </div>
        </section>
    </section>
);

export const AdminDashboardChartsSkeleton: React.FC = () => (
    <section aria-label="管理后台图表加载中" className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div data-testid="admin-chart-skeleton" className="lg:col-span-2 h-80 rounded-xl skeleton-shimmer" />
            <div data-testid="admin-chart-skeleton" className="h-80 rounded-xl skeleton-shimmer" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div data-testid="admin-chart-skeleton" className="lg:col-span-2 h-80 rounded-xl skeleton-shimmer" />
            <div data-testid="admin-chart-skeleton" className="h-80 rounded-xl skeleton-shimmer" />
        </div>
        <div data-testid="admin-chart-skeleton" className="h-80 rounded-xl skeleton-shimmer" />
    </section>
);

// 订单卡片骨架屏
export const OrderCardSkeleton: React.FC = () => (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 animate-pulse">
        <div className="flex justify-between items-start mb-4">
            <div>
                <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-32 mb-2" />
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24" />
            </div>
            <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-16" />
        </div>
        <div className="flex gap-3 mb-4">
            {[1, 2].map(i => (
                <div key={i} className="w-16 h-16 bg-gray-200 dark:bg-gray-700 rounded" />
            ))}
        </div>
        <div className="flex justify-between items-center">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-20" />
            <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-24" />
        </div>
    </div>
);

// 用户行骨架屏
export const UserRowSkeleton: React.FC = () => (
    <tr className="animate-pulse">
        <td className="px-4 py-3">
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-full" />
                <div>
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24 mb-1" />
                    <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-32" />
                </div>
            </div>
        </td>
        <td className="px-4 py-3">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-20" />
        </td>
        <td className="px-4 py-3">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-16" />
        </td>
        <td className="px-4 py-3">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24" />
        </td>
        <td className="px-4 py-3">
            <div className="flex gap-2">
                <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded" />
                <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded" />
            </div>
        </td>
    </tr>
);

// 表格骨架屏
export const TableSkeleton: React.FC<{ rows?: number; cols?: number }> = ({ rows = 5, cols = 5 }) => (
    <>
        {Array.from({ length: rows }).map((_, i) => (
            <tr key={i} className="animate-pulse">
                {Array.from({ length: cols }).map((_, j) => (
                    <td key={j} className="px-6 py-4">
                        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full" />
                    </td>
                ))}
            </tr>
        ))}
    </>
);

// 文本骨架屏
export const TextSkeleton: React.FC<{ lines?: number }> = ({ lines = 3 }) => (
    <div className="animate-pulse space-y-2">
        {Array.from({ length: lines }).map((_, i) => (
            <div
                key={i}
                className="h-4 bg-gray-200 dark:bg-gray-700 rounded"
                style={{ width: `${100 - i * 15}%` }}
            />
        ))}
    </div>
);
