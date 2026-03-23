import React from 'react';
import type { Order, Book } from '../../types';

interface OrderListProps {
    orders: Order[];
    orderFilter: string;
    searchQuery: string;
    reviewedBooks: Set<number>;
    onFilterChange: (filter: string) => void;
    onSearchChange: (query: string) => void;
    onReview: (book: Book) => void;
}

const OrderList: React.FC<OrderListProps> = ({
    orders,
    orderFilter,
    searchQuery,
    reviewedBooks,
    onFilterChange,
    onSearchChange,
    onReview
}) => {
    const statusMap: Record<string, { text: string; color: string }> = {
        PENDING: { text: '待支付', color: 'text-yellow-600 bg-yellow-50' },
        PAID: { text: '已支付', color: 'text-blue-600 bg-blue-50' },
        SHIPPED: { text: '已发货', color: 'text-purple-600 bg-purple-50' },
        COMPLETED: { text: '已完成', color: 'text-green-600 bg-green-50' },
        CANCELLED: { text: '已取消', color: 'text-red-600 bg-red-50' }
    };

    const filteredOrders = orders.filter(order => {
        if (orderFilter !== 'all' && order.status !== orderFilter) return false;
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            return order.items?.some(item => 
                item.book?.title?.toLowerCase().includes(query)
            );
        }
        return true;
    });

    return (
        <div>
            <div className="mb-6">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">我的订单</h2>
                
                {/* Filters */}
                <div className="flex flex-wrap gap-4 mb-4">
                    <div className="flex gap-2">
                        {['all', 'PENDING', 'PAID', 'SHIPPED', 'COMPLETED', 'CANCELLED'].map(status => (
                            <button
                                key={status}
                                onClick={() => onFilterChange(status)}
                                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                                    orderFilter === status 
                                        ? 'bg-primary text-white' 
                                        : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                                }`}
                            >
                                {status === 'all' ? '全部' : statusMap[status]?.text}
                            </button>
                        ))}
                    </div>
                    <input
                        type="text"
                        placeholder="搜索订单..."
                        value={searchQuery}
                        onChange={(e) => onSearchChange(e.target.value)}
                        className="px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    />
                </div>
            </div>

            {filteredOrders.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                    <span className="material-symbols-outlined text-4xl mb-2">receipt_long</span>
                    <p>暂无订单</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {filteredOrders.map(order => (
                        <div key={order.id} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <p className="font-semibold text-gray-900 dark:text-white">订单号: #{order.id}</p>
                                    <p className="text-sm text-gray-500">{new Date(order.createTime).toLocaleString()}</p>
                                </div>
                                <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusMap[order.status]?.color}`}>
                                    {statusMap[order.status]?.text}
                                </span>
                            </div>
                            
                            <div className="space-y-3">
                                {order.items?.map(item => (
                                    <div key={item.id} className="flex items-center gap-4 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                                        <img 
                                            src={item.book?.coverImage || '/placeholder.png'} 
                                            alt={item.book?.title}
                                            className="w-16 h-20 object-cover rounded"
                                        />
                                        <div className="flex-1">
                                            <p className="font-medium text-gray-900 dark:text-white">{item.book?.title}</p>
                                            <p className="text-sm text-gray-500">x{item.quantity}</p>
                                        </div>
                                        <p className="font-semibold text-primary">¥{item.price}</p>
                                        {order.status === 'COMPLETED' && item.book && (
                                            <button
                                                onClick={() => onReview(item.book!)}
                                                className="text-sm text-primary hover:underline"
                                            >
                                                {reviewedBooks.has(item.book.id) ? '已评价' : '评价'}
                                            </button>
                                        )}
                                    </div>
                                ))}
                            </div>
                            
                            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 flex justify-between items-center">
                                <p className="text-gray-500">共 {order.items?.length || 0} 件商品</p>
                                <p className="text-lg font-bold text-gray-900 dark:text-white">
                                    合计: <span className="text-primary">¥{order.totalPrice}</span>
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default OrderList;
