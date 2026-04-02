import React from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';

const OrderConfirm: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const state = location.state as { orderId?: number; status?: string; totalPrice?: number } | null;

    const isPaid = state?.status === 'PAID';

    return (
        <div className="max-w-2xl mx-auto px-4 py-16 text-center">
            <div className="mb-8">
                <span className="material-symbols-outlined text-emerald-500 mx-auto mb-4 text-7xl" aria-hidden="true">check_circle</span>
                <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
                    {isPaid ? '支付成功！' : '订单提交成功！'}
                </h1>
                <p className="text-slate-500 dark:text-slate-400">
                    {isPaid ? '您的订单已成功支付，我们将尽快为您发货。' : '您的订单已成功提交，请尽快完成支付以确保商品为您保留。'}
                </p>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 p-8 mb-8 text-left">
                <div className="space-y-4">
                    {state?.orderId && (
                        <div className="flex justify-between items-center">
                            <span className="text-slate-500">订单号</span>
                            <span className="font-mono text-slate-900 dark:text-white font-medium">ORD-{state.orderId.toString().padStart(6, '0')}</span>
                        </div>
                    )}
                    <div className="flex justify-between items-center">
                        <span className="text-slate-500">订单状态</span>
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                            isPaid
                                ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                                : 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                        }`}>
                            {isPaid ? '已支付' : '待支付'}
                        </span>
                    </div>
                    {state?.totalPrice && (
                        <div className="flex justify-between items-center">
                            <span className="text-slate-500">支付金额</span>
                            <span className="text-xl font-bold text-primary">¥{state.totalPrice.toFixed(2)}</span>
                        </div>
                    )}
                    <div className="flex justify-between items-center">
                        <span className="text-slate-500">预计送达</span>
                        <span className="text-slate-900 dark:text-white font-medium">3-5 个工作日</span>
                    </div>
                </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <button
                    onClick={() => navigate('/profile?tab=orders')}
                    className="w-full sm:w-auto px-8 py-3 bg-primary text-white font-bold rounded-lg hover:bg-blue-600 transition-colors"
                >
                    查看订单
                </button>
                <Link
                    to="/"
                    className="w-full sm:w-auto px-8 py-3 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-bold rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors text-center"
                >
                    继续购物
                </Link>
            </div>
        </div>
    );
};

export default OrderConfirm;
