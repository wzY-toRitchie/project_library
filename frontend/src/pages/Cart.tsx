import React from 'react';
import { Table, Button, Typography, Space, Card, Empty, message } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { Trash2, Plus, Minus } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api';

const { Title, Text } = Typography;

interface CartItem {
    id: number;
    title: string;
    author: string;
    price: number;
    coverImage?: string;
    quantity: number;
}

const Cart: React.FC = () => {
    const { cartItems, removeFromCart, updateQuantity, clearCart, totalPrice } = useCart();
    const { user, isAuthenticated } = useAuth();
    const navigate = useNavigate();
    const [loading, setLoading] = React.useState(false);

    const handleCheckout = async () => {
        if (!isAuthenticated) {
            message.warning('请先登录后再进行结算');
            navigate('/login');
            return;
        }

        setLoading(true);
        try {
            const orderData = {
                user: { id: user?.id },
                totalPrice: totalPrice,
                status: 'PENDING',
                items: cartItems.map(item => ({
                    book: { id: item.id },
                    quantity: item.quantity,
                    price: item.price
                }))
            };

            await api.post('/orders', orderData);
            message.success('下单成功！');
            clearCart();
            navigate('/orders');
        } catch (error) {
            console.error('Checkout failed:', error);
            message.error('下单失败，请稍后再试');
        } finally {
            setLoading(false);
        }
    };

    const columns: ColumnsType<CartItem> = [
        {
            title: '图书信息',
            dataIndex: 'title',
            key: 'title',
            render: (_: string, record: CartItem) => (
                <Space>
                    <img 
                        src={record.coverImage || 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?auto=format&fit=crop&q=80&w=300&h=400'} 
                        alt={record.title} 
                        style={{ width: 50, height: 70, objectFit: 'cover' }} 
                    />
                    <Space direction="vertical" size={0}>
                        <Text strong>{record.title}</Text>
                        <Text type="secondary">{record.author}</Text>
                    </Space>
                </Space>
            ),
        },
        {
            title: '单价',
            dataIndex: 'price',
            key: 'price',
            render: (price: number) => <Text>¥{price}</Text>,
        },
        {
            title: '数量',
            key: 'quantity',
            render: (_: unknown, record: CartItem) => (
                <Space>
                    <Button 
                        icon={<Minus size={14} />} 
                        size="small" 
                        onClick={() => updateQuantity(record.id, record.quantity - 1)}
                    />
                    <Text>{record.quantity}</Text>
                    <Button 
                        icon={<Plus size={14} />} 
                        size="small" 
                        onClick={() => updateQuantity(record.id, record.quantity + 1)}
                    />
                </Space>
            ),
        },
        {
            title: '小计',
            key: 'subtotal',
            render: (_: unknown, record: CartItem) => <Text strong type="danger">¥{(record.price * record.quantity).toFixed(2)}</Text>,
        },
        {
            title: '操作',
            key: 'action',
            render: (_: unknown, record: CartItem) => (
                <Button 
                    type="text" 
                    danger 
                    icon={<Trash2 size={16} />} 
                    onClick={() => removeFromCart(record.id)}
                >
                    删除
                </Button>
            ),
        },
    ];

    if (cartItems.length === 0) {
        return (
            <div style={{ padding: '48px', textAlign: 'center' }}>
                <Empty description="购物车空空如也" />
                <Link to="/">
                    <Button type="primary" style={{ marginTop: '16px' }}>去逛逛</Button>
                </Link>
            </div>
        );
    }

    return (
        <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>
            <Title level={2}>我的购物车</Title>
            <Table 
                columns={columns} 
                dataSource={cartItems} 
                rowKey="id" 
                pagination={false}
                style={{ marginBottom: '24px' }}
            />
            
            <Card>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Button onClick={clearCart}>清空购物车</Button>
                    <Space size="large">
                        <Text>共 {cartItems.reduce((acc, item) => acc + item.quantity, 0)} 件商品</Text>
                        <Text style={{ fontSize: '18px' }}>
                            合计：<Text type="danger" strong style={{ fontSize: '24px' }}>¥{totalPrice.toFixed(2)}</Text>
                        </Text>
                        <Button type="primary" size="large" onClick={handleCheckout} loading={loading}>
                            去结算
                        </Button>
                    </Space>
                </div>
            </Card>
        </div>
    );
};

export default Cart;
