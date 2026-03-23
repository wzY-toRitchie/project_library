import React, { useCallback, useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { message, Spin, Result, Button, Card, Typography, Divider } from 'antd';
import { CheckCircleOutlined, WechatOutlined, AlipayCircleOutlined, CreditCardOutlined, ClockCircleOutlined } from '@ant-design/icons';
import api from '../api';
import type { Order } from '../types';
import OrderTimeline from '../components/OrderTimeline';

const { Title, Text } = Typography;

const Payment: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [order, setOrder] = useState<Order | null>(null);
    const [loading, setLoading] = useState(true);
    const [paymentMethod, setPaymentMethod] = useState('wechat');
    const [paying, setPaying] = useState(false);

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
        // Simulate payment delay
        setTimeout(async () => {
            try {
                await api.patch(`/orders/${order.id}/status`, null, {
                    params: { status: 'PAID' }
                });
                message.success('支付成功！');
                navigate('/profile?tab=orders');
            } catch (error) {
                console.error('Payment failed:', error);
                message.error('支付失败，请重试');
            } finally {
                setPaying(false);
            }
        }, 1500);
    };

    const paymentMethods = [
        {
            key: 'wechat',
            name: '微信支付',
            icon: <WechatOutlined className="text-3xl" />,
            iconColor: 'text-green-600',
            borderColor: 'border-green-500',
            bgColor: 'bg-green-50 dark:bg-green-900/20',
            checkColor: 'text-green-500',
            recommended: true
        },
        {
            key: 'alipay',
            name: '支付宝',
            icon: <AlipayCircleOutlined className="text-3xl" />,
            iconColor: 'text-blue-600',
            borderColor: 'border-blue-500',
            bgColor: 'bg-blue-50 dark:bg-blue-900/20',
            checkColor: 'text-blue-500',
            recommended: false
        },
        {
            key: 'card',
            name: '银行卡',
            icon: <CreditCardOutlined className="text-3xl" />,
            iconColor: 'text-primary',
            borderColor: 'border-primary',
            bgColor: 'bg-primary/10',
            checkColor: 'text-primary',
            recommended: false
        }
    ];

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <Spin size="large" tip="加载中..." />
            </div>
        );
    }

    if (!order) {
        return (
            <Result
                status="error"
                title="订单不存在"
                extra={
                    <Button type="primary" onClick={() => navigate('/')}>
                        返回首页
                    </Button>
                }
            />
        );
    }

    return (
        <div className="max-w-4xl mx-auto px-4 py-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Payment Card */}
                <div className="lg:col-span-2">
                    <Card className="shadow-md rounded-xl border border-slate-200 dark:border-slate-700">
                        {/* Header */}
                        <div className="text-center mb-6">
                            <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-full mb-4">
                                <ClockCircleOutlined className="text-3xl text-primary" />
                            </div>
                            <Text type="secondary">订单提交成功，请尽快完成支付</Text>
                            <div className="mt-4">
                                <Text className="text-sm text-slate-500">应付金额</Text>
                                <Title level={1} className="m-0 text-primary">
                                    ¥{order.totalPrice.toFixed(2)}
                                </Title>
                            </div>
                            <Text type="secondary" className="text-xs">
                                订单号: ORD-{order.id.toString().padStart(6, '0')}
                            </Text>
                        </div>

                        <Divider />

                        {/* Payment Methods */}
                        <div className="mb-6">
                            <Title level={5} className="mb-4">选择支付方式</Title>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                {paymentMethods.map((method) => (
                                    <div
                                        key={method.key}
                                        onClick={() => setPaymentMethod(method.key)}
                                        className={`relative cursor-pointer border-2 rounded-xl p-5 flex flex-col items-center gap-3 transition-all ${
                                            paymentMethod === method.key 
                                                ? `${method.borderColor} ${method.bgColor}` 
                                                : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
                                        }`}
                                    >
                                        {method.recommended && (
                                            <span className="absolute -top-2 left-1/2 -translate-x-1/2 px-2 py-0.5 bg-green-500 text-white text-xs font-bold rounded-full">
                                                推荐
                                            </span>
                                        )}
                                        <div className={method.iconColor}>{method.icon}</div>
                                        <span className="font-medium text-slate-900 dark:text-white">{method.name}</span>
                                        {paymentMethod === method.key && (
                                            <CheckCircleOutlined className={`absolute top-3 right-3 text-lg ${method.checkColor}`} />
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Pay Button */}
                        <Button 
                            type="primary" 
                            size="large" 
                            block 
                            loading={paying}
                            onClick={handlePayment}
                            className="h-14 text-lg font-bold bg-primary hover:bg-blue-600 rounded-xl"
                        >
                            {paying ? '正在处理...' : `立即支付 ¥${order.totalPrice.toFixed(2)}`}
                        </Button>

                        {/* Tips */}
                        <div className="mt-4 text-center text-xs text-slate-400">
                            <p>点击支付即表示您同意《用户协议》和《隐私政策》</p>
                        </div>
                    </Card>
                </div>

                {/* Order Summary & Timeline */}
                <div className="space-y-6">
                    {/* Order Summary */}
                    <Card className="shadow-md rounded-xl border border-slate-200 dark:border-slate-700">
                        <Title level={5} className="mb-4">订单摘要</Title>
                        <div className="space-y-3">
                            {order.items?.map((item) => (
                                <div key={item.id} className="flex items-center gap-3">
                                    <div 
                                        className="w-12 h-16 bg-cover bg-center rounded"
                                        style={{ backgroundImage: `url(${item.book?.coverImage || 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?auto=format&fit=crop&q=80&w=300&h=400'})` }}
                                    />
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-slate-900 dark:text-white truncate">{item.book?.title}</p>
                                        <p className="text-xs text-slate-500">x{item.quantity}</p>
                                    </div>
                                    <p className="text-sm font-medium text-slate-900 dark:text-white">¥{(item.price * item.quantity).toFixed(2)}</p>
                                </div>
                            ))}
                        </div>
                        <Divider />
                        <div className="flex justify-between items-center">
                            <Text className="text-slate-500">合计</Text>
                            <Text strong className="text-xl text-primary">¥{order.totalPrice.toFixed(2)}</Text>
                        </div>
                    </Card>

                    {/* Order Timeline */}
                    <Card className="shadow-md rounded-xl border border-slate-200 dark:border-slate-700">
                        <Title level={5} className="mb-4">订单状态</Title>
                        <OrderTimeline 
                            status={order.status}
                            createTime={order.createTime}
                        />
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default Payment;
