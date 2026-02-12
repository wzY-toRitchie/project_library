import React, { useCallback, useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { message, Spin, Result, Button, Card, Radio, Typography, Divider } from 'antd';
import { CheckCircleOutlined, WechatOutlined, AlipayCircleOutlined, CreditCardOutlined } from '@ant-design/icons';
import api from '../api';
import type { Order } from '../types';

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
                navigate('/orders');
            }
        } catch (error) {
            console.error('Failed to fetch order:', error);
            message.error('获取订单信息失败');
            navigate('/orders');
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
                // Assuming backend has an endpoint to update status
                // Or use the existing patch endpoint
                await api.patch(`/orders/${order.id}/status`, null, {
                    params: { status: 'PAID' }
                });
                message.success('支付成功！');
                navigate('/orders');
            } catch (error) {
                console.error('Payment failed:', error);
                message.error('支付失败，请重试');
            } finally {
                setPaying(false);
            }
        }, 1500);
    };

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
        <div className="max-w-3xl mx-auto px-4 py-8">
            <Card title="收银台" className="shadow-md rounded-xl">
                <div className="text-center mb-8">
                    <Text type="secondary">订单提交成功，请尽快完成支付</Text>
                    <div className="mt-4">
                        <Text className="text-sm">应付金额</Text>
                        <Title level={2} className="m-0 text-primary">
                            ¥{order.totalPrice.toFixed(2)}
                        </Title>
                    </div>
                    <Text type="secondary" className="text-xs">订单号: ORD-{order.id.toString().padStart(6, '0')}</Text>
                </div>

                <Divider />

                <div className="mb-6">
                    <Title level={5} className="mb-4">选择支付方式</Title>
                    <Radio.Group 
                        onChange={(e) => setPaymentMethod(e.target.value)} 
                        value={paymentMethod}
                        className="w-full grid grid-cols-1 md:grid-cols-3 gap-4"
                    >
                        <label className={`cursor-pointer border rounded-lg p-4 flex items-center gap-3 transition-all ${paymentMethod === 'wechat' ? 'border-green-500 bg-green-50' : 'border-gray-200 hover:border-gray-300'}`}>
                            <Radio value="wechat" className="hidden" />
                            <WechatOutlined className="text-2xl text-green-600" />
                            <span className="font-medium">微信支付</span>
                            {paymentMethod === 'wechat' && <CheckCircleOutlined className="ml-auto text-green-500" />}
                        </label>

                        <label className={`cursor-pointer border rounded-lg p-4 flex items-center gap-3 transition-all ${paymentMethod === 'alipay' ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'}`}>
                            <Radio value="alipay" className="hidden" />
                            <AlipayCircleOutlined className="text-2xl text-blue-600" />
                            <span className="font-medium">支付宝</span>
                            {paymentMethod === 'alipay' && <CheckCircleOutlined className="ml-auto text-blue-500" />}
                        </label>

                        <label className={`cursor-pointer border rounded-lg p-4 flex items-center gap-3 transition-all ${paymentMethod === 'card' ? 'border-primary bg-blue-50' : 'border-gray-200 hover:border-gray-300'}`}>
                            <Radio value="card" className="hidden" />
                            <CreditCardOutlined className="text-2xl text-primary" />
                            <span className="font-medium">银行卡</span>
                            {paymentMethod === 'card' && <CheckCircleOutlined className="ml-auto text-primary" />}
                        </label>
                    </Radio.Group>
                </div>

                <Button 
                    type="primary" 
                    size="large" 
                    block 
                    loading={paying}
                    onClick={handlePayment}
                    className="h-12 text-lg font-bold bg-primary hover:bg-blue-600"
                >
                    {paying ? '正在处理...' : `立即支付 ¥${order.totalPrice.toFixed(2)}`}
                </Button>
            </Card>
        </div>
    );
};

export default Payment;
