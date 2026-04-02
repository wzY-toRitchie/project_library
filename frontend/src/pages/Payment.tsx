import React, { useCallback, useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { message } from 'antd';
import api from '../api';
import type { Order } from '../types';
import OrderTimeline from '../components/OrderTimeline';
import { FALLBACK_COVER } from '../utils/constants';

const Payment: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [order, setOrder] = useState<Order | null>(null);
    const [loading, setLoading] = useState(true);
    const [paymentMethod, setPaymentMethod] = useState('wechat');
    const [paying, setPaying] = useState(false);
    const isMounted = useRef(true);

    useEffect(() => {
        isMounted.current = true;
        return () => { isMounted.current = false; };
    }, []);

    const fetchOrder = useCallback(async () => {
        if (!id) return;
        try {
            const response = await api.get(`/orders/${id}`);
            setOrder(response.data);
            if (response.data.status === 'PAID') {
                message.info('该订单已支付');
                navigate('/profile?tab=orders');
            }
        } catch (error) {
            console.error('Failed to fetch order:', error);
            message.error('获取订单信息失败');
            navigate('/profile?tab=orders');
        } finally {
            setLoading(false);
        }
    }, [id, navigate]);

    useEffect(() => {
        fetchOrder();
    }, [fetchOrder]);

    const handlePayment = async () => {
        if (!order) return;
        setPaying(true);
        const timeoutId = setTimeout(async () => {
            try {
                await api.patch(`/orders/${order.id}/status`, null, {
                    params: { status: 'PAID' }
                });
                if (isMounted.current) {
                    message.success('支付成功！');
                    navigate('/order-confirm', { state: { orderId: order.id, status: 'PAID', totalPrice: order.totalPrice } });
                }
            } catch (error) {
                console.error('Payment failed:', error);
                if (isMounted.current) {
                    message.error('支付失败，请重试');
                }
            } finally {
                if (isMounted.current) setPaying(false);
            }
        }, 1500);
        return () => clearTimeout(timeoutId);
    };

    const paymentMethods = [
        { key: 'wechat', name: '微信支付', icon: 'chat', iconClass: 'text-green-600', borderClass: 'border-green-500', bgClass: 'bg-green-50 dark:bg-green-900/20', checkClass: 'text-green-500', recommended: true },
        { key: 'alipay', name: '支付宝', icon: 'account_balance_wallet', iconClass: 'text-blue-600', borderClass: 'border-blue-500', bgClass: 'bg-blue-50 dark:bg-blue-900/20', checkClass: 'text-blue-500', recommended: false },
        { key: 'card', name: '银行卡', icon: 'credit_card', iconClass: 'text-primary', borderClass: 'border-primary', bgClass: 'bg-primary/10', checkClass: 'text-primary', recommended: false },
    ];

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-[60vh]">
                <div className="flex flex-col items-center gap-3">
                    <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                    <span className="text-slate-500 text-sm">加载中…</span>
                </div>
            </div>
        );
    }

    if (!order) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 text-center">
                <span className="material-symbols-outlined text-6xl text-slate-300 mb-4" aria-hidden="true">error</span>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">订单不存在</h2>
                <button onClick={() => navigate('/')} className="mt-4 px-6 py-3 bg-primary text-white font-bold rounded-lg hover:bg-blue-600 transition-colors">
                    返回首页
                </button>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto px-4 py-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Payment Card */}
                <div className="lg:col-span-2">
                    <div className="bg-white dark:bg-slate-900 rounded-xl shadow-md border border-slate-200 dark:border-slate-700 p-8">
                        {/* Header */}
                        <div className="text-center mb-6">
                            <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-full mb-4">
                                <span className="material-symbols-outlined text-3xl text-primary" aria-hidden="true">schedule</span>
                            </div>
                            <p className="text-slate-500 dark:text-slate-400">订单提交成功，请尽快完成支付</p>
                            <div className="mt-4">
                                <p className="text-sm text-slate-500">应付金额</p>
                                <p className="text-4xl font-black text-primary tracking-tight">
                                    ¥{order.totalPrice.toFixed(2)}
                                </p>
                            </div>
                            <p className="text-xs text-slate-400 mt-1">
                                订单号: ORD-{order.id.toString().padStart(6, '0')}
                            </p>
                        </div>

                        <div className="h-px bg-slate-100 dark:bg-slate-700 my-6" />

                        {/* Payment Methods */}
                        <div className="mb-6">
                            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">选择支付方式</h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                {paymentMethods.map((method) => (
                                    <button
                                        key={method.key}
                                        onClick={() => setPaymentMethod(method.key)}
                                        aria-label={method.name}
                                        className={`relative cursor-pointer border-2 rounded-xl p-5 flex flex-col items-center gap-3 transition-colors ${
                                            paymentMethod === method.key
                                                ? `${method.borderClass} ${method.bgClass}`
                                                : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
                                        }`}
                                    >
                                        {method.recommended && (
                                            <span className="absolute -top-2 left-1/2 -translate-x-1/2 px-2 py-0.5 bg-green-500 text-white text-xs font-bold rounded-full">
                                                推荐
                                            </span>
                                        )}
                                        <span className={`material-symbols-outlined text-3xl ${method.iconClass}`} aria-hidden="true">{method.icon}</span>
                                        <span className="font-medium text-slate-900 dark:text-white">{method.name}</span>
                                        {paymentMethod === method.key && (
                                            <span className={`material-symbols-outlined absolute top-3 right-3 text-lg ${method.checkClass}`} aria-hidden="true">check_circle</span>
                                        )}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Pay Button */}
                        <button
                            onClick={handlePayment}
                            disabled={paying}
                            className="w-full h-14 flex items-center justify-center gap-2 bg-primary text-white font-bold text-lg rounded-xl hover:bg-blue-600 transition-colors shadow-md hover:shadow-lg active:scale-[0.98] transform duration-100 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {paying && <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />}
                            {paying ? '正在处理…' : `立即支付 ¥${order.totalPrice.toFixed(2)}`}
                        </button>

                        {/* Tips */}
                        <p className="mt-4 text-center text-xs text-slate-400">
                            点击支付即表示您同意《用户协议》和《隐私政策》
                        </p>
                    </div>
                </div>

                {/* Order Summary & Timeline */}
                <div className="space-y-6">
                    {/* Order Summary */}
                    <div className="bg-white dark:bg-slate-900 rounded-xl shadow-md border border-slate-200 dark:border-slate-700 p-6">
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">订单摘要</h3>
                        <div className="space-y-3">
                            {order.items?.map((item) => (
                                <div key={item.id} className="flex items-center gap-3">
                                    <img
                                        src={item.book?.coverImage || FALLBACK_COVER}
                                        alt={item.book?.title || '图书'}
                                        className="w-12 h-16 object-cover rounded"
                                        loading="lazy"
                                        width={48}
                                        height={64}
                                    />
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-slate-900 dark:text-white truncate">{item.book?.title}</p>
                                        <p className="text-xs text-slate-500">x{item.quantity}</p>
                                    </div>
                                    <p className="text-sm font-medium text-slate-900 dark:text-white">¥{(item.price * item.quantity).toFixed(2)}</p>
                                </div>
                            ))}
                        </div>
                        <div className="h-px bg-slate-100 dark:bg-slate-700 my-4" />
                        <div className="flex justify-between items-center">
                            <span className="text-slate-500">合计</span>
                            <span className="text-xl font-bold text-primary">¥{order.totalPrice.toFixed(2)}</span>
                        </div>
                    </div>

                    {/* Order Timeline */}
                    <div className="bg-white dark:bg-slate-900 rounded-xl shadow-md border border-slate-200 dark:border-slate-700 p-6">
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">订单状态</h3>
                        <OrderTimeline
                            status={order.status}
                            createTime={order.createTime}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Payment;
