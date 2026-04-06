import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { message } from 'antd';
import { getPaymentStatus } from '../api/payment';
import api from '../api';

const PaymentReturn: React.FC = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [status, setStatus] = useState<'checking' | 'success' | 'failed'>('checking');

    useEffect(() => {
        const outTradeNo = searchParams.get('out_trade_no');
        if (!outTradeNo) {
            message.error('无效的支付返回');
            navigate('/profile?tab=orders');
            return;
        }

        const checkPayment = async () => {
            try {
                // 查询支付状态
                const result = await getPaymentStatus(parseInt(outTradeNo));

                if (result.status === 'TRADE_SUCCESS' || result.status === 'TRADE_FINISHED') {
                    // 支付成功，更新订单状态
                    await api.patch(`/orders/${outTradeNo}/status`, null, {
                        params: { status: 'PAID' }
                    });
                    setStatus('success');
                    message.success('支付成功！');

                    // 跳转到订单确认页面
                    setTimeout(() => {
                        navigate('/order-confirm', { state: { orderId: parseInt(outTradeNo), status: 'PAID' } });
                    }, 2000);
                } else {
                    setStatus('failed');
                    message.error('支付未完成');
                    setTimeout(() => {
                        navigate('/payment/' + outTradeNo);
                    }, 2000);
                }
            } catch (error) {
                console.error('Check payment status failed:', error);
                setStatus('failed');
                message.error('支付状态查询失败');
                setTimeout(() => {
                    navigate('/profile?tab=orders');
                }, 2000);
            }
        };

        checkPayment();
    }, [searchParams, navigate]);

    return (
        <div className="min-h-[60vh] flex flex-col items-center justify-center px-4">
            {status === 'checking' && (
                <>
                    <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mb-6" />
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white">正在检查支付状态...</h2>
                </>
            )}
            {status === 'success' && (
                <>
                    <span className="material-symbols-outlined text-6xl text-green-500 mb-4" aria-hidden="true">check_circle</span>
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white">支付成功！</h2>
                    <p className="text-slate-500 mt-2">正在跳转到订单确认页面...</p>
                </>
            )}
            {status === 'failed' && (
                <>
                    <span className="material-symbols-outlined text-6xl text-red-500 mb-4" aria-hidden="true">error</span>
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white">支付失败</h2>
                    <p className="text-slate-500 mt-2">正在跳转到订单页面...</p>
                </>
            )}
        </div>
    );
};

export default PaymentReturn;