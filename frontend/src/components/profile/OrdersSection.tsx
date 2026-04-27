import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Order, Book } from '../../types';
import { formatDate, getStatusColor, getStatusText } from '../../utils/format';
import OrderTimeline from '../OrderTimeline';

interface OrdersSectionProps {
    orders: Order[];
    loading: boolean;
    reviewedBooks: Set<number>;
    onOpenReview: (book: Book) => void;
    onDeleteOrder: (orderId: number) => void;
    onConfirmReceipt: (orderId: number) => void;
    onRequestRefund: (orderId: number, reason: string) => void;
    onBuyAgain: (book: Book) => void;
}

export function OrdersSection({
    orders,
    loading,
    reviewedBooks,
    onOpenReview,
    onDeleteOrder,
    onConfirmReceipt,
    onRequestRefund,
    onBuyAgain,
}: OrdersSectionProps) {
    const navigate = useNavigate();
    const [searchQuery, setSearchQuery] = useState('');
    const [orderFilter, setOrderFilter] = useState<string>('all');
    const [expandedOrderId, setExpandedOrderId] = useState<number | null>(null);
    const refundableStatuses = new Set(['PAID', 'SHIPPED', 'COMPLETED', 'REFUND_REJECTED']);

    const filteredOrders = useMemo(() => {
        let result = orders;

        if (searchQuery.trim()) {
            const q = searchQuery.toLowerCase();
            result = result.filter(
                (order) =>
                    order.id.toString().includes(q) ||
                    order.items?.some(
                        (item) =>
                            item.book?.title?.toLowerCase().includes(q) ||
                            item.book?.author?.toLowerCase().includes(q)
                    )
            );
        }

        if (orderFilter === 'review') {
            result = result.filter(
                (order) =>
                    order.status === 'COMPLETED' &&
                    order.items?.some(
                        (item) => item.book && !reviewedBooks.has(item.book.id)
                    )
            );
        } else if (orderFilter !== 'all') {
            result = result.filter((order) => order.status === orderFilter);
        }

        return [...result].sort(
            (a, b) =>
                new Date(b.createTime).getTime() -
                new Date(a.createTime).getTime()
        );
    }, [orders, searchQuery, orderFilter, reviewedBooks]);

    const orderCounts = useMemo(() => {
        let pendingPayment = 0;
        let pendingShipment = 0;
        let pendingReceipt = 0;
        let pendingReview = 0;
        let refundRequests = 0;
        for (const o of orders) {
            if (o.status === 'PENDING') pendingPayment++;
            else if (o.status === 'PAID') pendingShipment++;
            else if (o.status === 'SHIPPED') pendingReceipt++;
            else if (o.status === 'COMPLETED' && o.items?.some((item) => item.book && !reviewedBooks.has(item.book.id))) pendingReview++;
            else if (o.status === 'REFUND_REQUESTED') refundRequests++;
        }
        return { pendingPayment, pendingShipment, pendingReceipt, pendingReview, refundRequests };
    }, [orders, reviewedBooks]);

    const handleRequestRefund = (orderId: number) => {
        const reason = window.prompt('请输入退款原因');
        if (reason === null) return;
        onRequestRefund(orderId, reason);
    };

    return (
        <>
            <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white">我的订单历史</h1>
                <div className="relative">
                    <input
                        className="pl-10 pr-4 py-2 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none text-sm w-full md:w-64"
                        placeholder="搜索订单..."
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    <span className="material-symbols-outlined absolute left-3 top-2.5 text-slate-400 text-base" aria-hidden="true">search</span>
                </div>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-primary/5 overflow-hidden mb-8">
                <div className="flex border-b border-slate-100 dark:border-slate-800 overflow-x-auto">
                    <button
                        onClick={() => setOrderFilter('all')}
                        className={`px-6 py-4 text-sm font-semibold whitespace-nowrap ${orderFilter === 'all' ? 'text-primary border-b-2 border-primary' : 'text-slate-500 hover:text-primary'}`}
                    >
                        全部订单
                    </button>
                    <button
                        onClick={() => setOrderFilter('PENDING')}
                        className={`px-6 py-4 text-sm font-medium whitespace-nowrap relative ${orderFilter === 'PENDING' ? 'text-primary border-b-2 border-primary' : 'text-slate-500 hover:text-primary'}`}
                    >
                        待付款
                        {orderCounts.pendingPayment > 0 && <span className="ml-2 px-2 py-0.5 bg-red-100 text-red-600 text-[10px] rounded-full font-bold">{orderCounts.pendingPayment}</span>}
                    </button>
                    <button
                        onClick={() => setOrderFilter('PAID')}
                        className={`px-6 py-4 text-sm font-medium whitespace-nowrap relative ${orderFilter === 'PAID' ? 'text-primary border-b-2 border-primary' : 'text-slate-500 hover:text-primary'}`}
                    >
                        待发货
                        {orderCounts.pendingShipment > 0 && <span className="ml-2 px-2 py-0.5 bg-indigo-100 text-indigo-600 text-[10px] rounded-full font-bold">{orderCounts.pendingShipment}</span>}
                    </button>
                    <button
                        onClick={() => setOrderFilter('SHIPPED')}
                        className={`px-6 py-4 text-sm font-medium whitespace-nowrap relative ${orderFilter === 'SHIPPED' ? 'text-primary border-b-2 border-primary' : 'text-slate-500 hover:text-primary'}`}
                    >
                        待收货
                        {orderCounts.pendingReceipt > 0 && <span className="ml-2 px-2 py-0.5 bg-amber-100 text-amber-600 text-[10px] rounded-full font-bold">{orderCounts.pendingReceipt}</span>}
                    </button>
                    <button
                        onClick={() => setOrderFilter('review')}
                        className={`px-6 py-4 text-sm font-medium whitespace-nowrap relative ${orderFilter === 'review' ? 'text-primary border-b-2 border-primary' : 'text-slate-500 hover:text-primary'}`}
                    >
                        待评价
                        {orderCounts.pendingReview > 0 && <span className="ml-2 px-2 py-0.5 bg-green-100 text-green-600 text-[10px] rounded-full font-bold">{orderCounts.pendingReview}</span>}
                    </button>
                    <button
                        onClick={() => setOrderFilter('REFUND_REQUESTED')}
                        className={`px-6 py-4 text-sm font-medium whitespace-nowrap relative ${orderFilter === 'REFUND_REQUESTED' ? 'text-primary border-b-2 border-primary' : 'text-slate-500 hover:text-primary'}`}
                    >
                        退款中
                        {orderCounts.refundRequests > 0 && <span className="ml-2 px-2 py-0.5 bg-orange-100 text-orange-600 text-[10px] rounded-full font-bold">{orderCounts.refundRequests}</span>}
                    </button>
                </div>

                <div className="p-1 min-h-[400px]">
                    {loading ? (
                        <div className="flex justify-center items-center h-64">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                        </div>
                    ) : filteredOrders.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-64 text-slate-500">
                            <span className="material-symbols-outlined text-4xl mb-2" aria-hidden="true">shopping_bag</span>
                            <p>暂无相关订单</p>
                        </div>
                    ) : (
                        filteredOrders.map((order) => (
                            <div key={order.id} className="m-4 bg-background-light dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden hover:shadow-md transition-shadow">
                                <div className="p-4 bg-white dark:bg-slate-800 flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-700">
                                    <div className="flex gap-6">
                                        <div>
                                            <p className="text-[10px] uppercase font-bold text-slate-400">下单时间</p>
                                            <p className="text-sm font-semibold">{formatDate(order.createTime)}</p>
                                        </div>
                                        <div>
                                            <p className="text-[10px] uppercase font-bold text-slate-400">订单号</p>
                                            <p className="text-sm font-semibold">ORD-{order.id.toString().padStart(6, '0')}</p>
                                        </div>
                                        <div>
                                            <p className="text-[10px] uppercase font-bold text-slate-400">总价</p>
                                            <p className="text-sm font-bold text-primary">¥{order.totalPrice.toFixed(2)}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${getStatusColor(order.status)}`}>
                                            <span className={`h-1.5 w-1.5 rounded-full ${order.status === 'COMPLETED' ? 'bg-green-600' : 'bg-slate-600'}`}></span>
                                            {getStatusText(order.status)}
                                        </span>
                                        {order.status === 'PENDING' && (
                                            <button
                                                onClick={() => navigate(`/payment/${order.id}`)}
                                                className="px-3 py-1 bg-primary text-white text-xs font-bold rounded-full hover:bg-blue-600 transition-colors"
                                            >
                                                付款
                                            </button>
                                        )}
                                        {order.status === 'SHIPPED' && (
                                            <button
                                                onClick={() => onConfirmReceipt(order.id)}
                                                className="px-3 py-1 bg-green-600 text-white text-xs font-bold rounded-full hover:bg-green-700 transition-colors"
                                            >
                                                确认收货
                                            </button>
                                        )}
                                        {refundableStatuses.has(order.status) && (
                                            <button
                                                onClick={() => handleRequestRefund(order.id)}
                                                className="px-3 py-1 bg-orange-600 text-white text-xs font-bold rounded-full hover:bg-orange-700 transition-colors"
                                            >
                                                申请退款
                                            </button>
                                        )}
                                        <button
                                            onClick={() => onDeleteOrder(order.id)}
                                            className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full transition-colors"
                                            title="删除订单"
                                            aria-label="删除订单"
                                        >
                                            <span className="material-symbols-outlined text-xl" aria-hidden="true">delete</span>
                                        </button>
                                    </div>
                                </div>

                                <div className="p-4 flex flex-col gap-4">
                                    {order.items?.map((item) => (
                                        <div key={item.id} className="flex flex-col md:flex-row gap-6 border-b border-slate-100 dark:border-slate-700 last:border-0 pb-4 last:pb-0">
                                            <div className="flex-1 flex items-center gap-4">
                                                <img
                                                    src={item.book?.coverImage || 'https://via.placeholder.com/150'}
                                                    alt={item.book?.title || 'Book'}
                                                    className="h-20 w-14 object-cover rounded shadow-sm border border-slate-200 dark:border-slate-700"
                                                    loading="lazy"
                                                    width={56}
                                                    height={80}
                                                />
                                                <div>
                                                    <h4 className="font-semibold text-slate-900 dark:text-white leading-tight">{item.book?.title || 'Unknown Title'}</h4>
                                                    <p className="text-xs text-slate-500 mt-1">{item.book?.author || 'Unknown Author'}</p>
                                                    <p className="text-sm font-medium mt-1">数量: {item.quantity}</p>
                                                </div>
                                            </div>
                                            <div className="flex flex-col justify-center items-end gap-3 min-w-[140px]">
                                                {order.status === 'COMPLETED' && item.book && !reviewedBooks.has(item.book.id) && (
                                                    <button
                                                        onClick={() => item.book && onOpenReview(item.book)}
                                                        className="w-full py-2 px-4 bg-primary text-white rounded-lg text-sm font-bold hover:bg-primary/90 transition-colors flex items-center justify-center gap-2"
                                                    >
                                                        <span className="material-symbols-outlined text-lg" aria-hidden="true">rate_review</span>
                                                        写评价
                                                    </button>
                                                )}
                                                {order.status === 'COMPLETED' && item.book && reviewedBooks.has(item.book.id) && (
                                                    <div className="w-full py-2 px-4 bg-slate-100 dark:bg-slate-800 text-slate-500 rounded-lg text-sm font-bold flex items-center justify-center gap-2">
                                                        <span className="material-symbols-outlined text-lg" aria-hidden="true">check_circle</span>
                                                        已评价
                                                    </div>
                                                )}
                                                <button
                                                    onClick={() => item.book && onBuyAgain(item.book)}
                                                    className="w-full py-2 px-4 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 rounded-lg text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                                                >
                                                    再次购买
                                                </button>
                                            </div>
                                        </div>
                                    ))}

                                    {/* 订单时间线 */}
                                    <div className="mt-2 pt-4 border-t border-slate-100 dark:border-slate-700">
                                        <button
                                            onClick={() => setExpandedOrderId(expandedOrderId === order.id ? null : order.id)}
                                            className="flex items-center gap-2 text-sm text-slate-500 hover:text-primary transition-colors"
                                        >
                                            <span className="material-symbols-outlined text-lg" aria-hidden="true">
                                                {expandedOrderId === order.id ? 'expand_less' : 'expand_more'}
                                            </span>
                                            {expandedOrderId === order.id ? '收起详情' : '查看物流'}
                                        </button>
                                        {expandedOrderId === order.id && (
                                            <div className="mt-4 px-4 py-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                                                <OrderTimeline
                                                    status={order.status}
                                                    createTime={order.createTime}
                                                    horizontal
                                                />
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </>
    );
}

export default OrdersSection;
