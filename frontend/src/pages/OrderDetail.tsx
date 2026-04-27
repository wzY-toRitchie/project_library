import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../api';
import type { Order } from '../types';
import OrderTimeline from '../components/OrderTimeline';
import { FALLBACK_COVER } from '../utils/constants';
import { message } from 'antd';

const statusLabel: Record<string, string> = { PENDING: '待支付', PAID: '已支付', SHIPPED: '已发货', COMPLETED: '已完成', CANCELLED: '已取消', REFUND_REQUESTED: '退款申请中', REFUNDED: '已退款', REFUND_REJECTED: '退款已拒绝' };
const statusColor: Record<string, string> = { PENDING: 'bg-amber-100 text-amber-700', PAID: 'bg-blue-100 text-blue-700', SHIPPED: 'bg-purple-100 text-purple-700', COMPLETED: 'bg-emerald-100 text-emerald-700', CANCELLED: 'bg-red-100 text-red-700', REFUND_REQUESTED: 'bg-orange-100 text-orange-700', REFUNDED: 'bg-emerald-100 text-emerald-700', REFUND_REJECTED: 'bg-rose-100 text-rose-700' };

const OrderDetail: React.FC = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [order, setOrder] = useState<Order | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchOrder = async () => {
            try {
                const res = await api.get(`/orders/${id}`);
                setOrder(res.data);
            } catch { message.error('订单不存在'); navigate('/profile?tab=orders'); }
            finally { setLoading(false); }
        };
        fetchOrder();
    }, [id, navigate]);

    if (loading) return <div className="flex justify-center py-20"><div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" /></div>;
    if (!order) return null;

    return (
        <div className="max-w-4xl mx-auto px-4 py-8">
            <div className="flex items-center gap-2 text-sm text-slate-500 mb-6">
                <Link to="/" className="hover:text-primary">首页</Link><span>/</span>
                <Link to="/profile?tab=orders" className="hover:text-primary">我的订单</Link><span>/</span>
                <span className="text-slate-900 dark:text-white">订单详情</span>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 p-6 mb-6">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">ORD-{order.id.toString().padStart(6, '0')}</h1>
                        <p className="text-sm text-slate-500 mt-1">下单时间：{order.createTime?.slice(0, 16).replace('T', ' ')}</p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusColor[order.status] || 'bg-slate-100 text-slate-600'}`}>
                        {statusLabel[order.status] || order.status}
                    </span>
                </div>

                {/* Order Items */}
                <div className="divide-y divide-slate-100 dark:divide-slate-700">
                    {order.items?.map(item => (
                        <div key={item.id} className="flex items-center gap-4 py-4">
                            <img src={item.book?.coverImage || FALLBACK_COVER} alt={item.book?.title} className="w-16 h-24 object-cover rounded" width={64} height={96} />
                            <div className="flex-1 min-w-0">
                                <Link to={`/book/${item.book?.id}`} className="font-medium text-slate-900 dark:text-white hover:text-primary">{item.book?.title}</Link>
                                <p className="text-sm text-slate-500">{item.book?.author}</p>
                            </div>
                            <span className="text-sm text-slate-500">x{item.quantity}</span>
                            <span className="font-bold text-slate-900 dark:text-white">¥{(item.price * item.quantity).toFixed(2)}</span>
                        </div>
                    ))}
                </div>

                <div className="border-t border-slate-100 dark:border-slate-700 pt-4 flex justify-between items-center">
                    <span className="text-slate-500">合计</span>
                    <span className="text-2xl font-bold text-primary">¥{order.totalPrice.toFixed(2)}</span>
                </div>
            </div>

            {/* Timeline */}
            <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
                <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4">订单时间线</h2>
                <OrderTimeline status={order.status} createTime={order.createTime} />
            </div>
        </div>
    );
};

export default OrderDetail;
