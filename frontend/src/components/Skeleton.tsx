import React from 'react';

// 图书卡片骨架屏
export const BookCardSkeleton: React.FC = () => (
    <div className="card-elegant overflow-hidden">
        <div className="aspect-[3/4] skeleton-shimmer" />
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
    <div className="animate-pulse">
        <div className="flex gap-4 mb-4 px-4">
            {Array.from({ length: cols }).map((_, i) => (
                <div key={i} className="h-4 bg-gray-200 dark:bg-gray-700 rounded flex-1" />
            ))}
        </div>
        {Array.from({ length: rows }).map((_, i) => (
            <div key={i} className="flex gap-4 mb-3 px-4">
                {Array.from({ length: cols }).map((_, j) => (
                    <div key={j} className="h-10 bg-gray-200 dark:bg-gray-700 rounded flex-1" />
                ))}
            </div>
        ))}
    </div>
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
