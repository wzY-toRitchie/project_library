import React, { useEffect, useState } from 'react';
import { Table, Tag, Typography, message, Card, Space, Empty, Button } from 'antd';
import { useAuth } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api';

const { Title, Text } = Typography;

const Orders: React.FC = () => {
    const [orders, setOrders] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const { user, isAuthenticated } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (!isAuthenticated) {
            navigate('/login');
            return;
        }
        fetchOrders();
    }, [isAuthenticated, user]);

    const fetchOrders = async () => {
        try {
            const response = await api.get(`/orders/user/${user?.id}`);
            setOrders(response.data);
        } catch (error) {
            console.error('Failed to fetch orders:', error);
            message.error('获取订单失败');
        } finally {
            setLoading(false);
        }
    };

    const getStatusTag = (status: string) => {
        const statusMap: any = {
            'PENDING': { color: 'gold', text: '待付款' },
            'PAID': { color: 'blue', text: '已付款' },
            'SHIPPED': { color: 'purple', text: '已发货' },
            'COMPLETED': { color: 'green', text: '已完成' },
            'CANCELLED': { color: 'red', text: '已取消' },
        };
        const info = statusMap[status] || { color: 'default', text: status };
        return <Tag color={info.color}>{info.text}</Tag>;
    };

    const columns = [
        {
            title: '订单编号',
            dataIndex: 'id',
            key: 'id',
            render: (id: number) => <Text copyable>{`ORD-${id.toString().padStart(6, '0')}`}</Text>
        },
        {
            title: '下单时间',
            dataIndex: 'createTime',
            key: 'createTime',
            render: (time: string) => new Date(time).toLocaleString(),
        },
        {
            title: '总金额',
            dataIndex: 'totalPrice',
            key: 'totalPrice',
            render: (price: number) => <Text strong type="danger">¥{price.toFixed(2)}</Text>,
        },
        {
            title: '状态',
            dataIndex: 'status',
            key: 'status',
            render: (status: string) => getStatusTag(status),
        },
        {
            title: '详情',
            key: 'details',
            render: (_: any, record: any) => (
                <Space direction="vertical" size={0}>
                    {record.items.map((item: any) => (
                        <div key={item.id}>
                            <Text size="small">{item.book.title} x {item.quantity}</Text>
                        </div>
                    ))}
                </Space>
            )
        }
    ];

    if (!loading && orders.length === 0) {
        return (
            <div style={{ padding: '48px', textAlign: 'center' }}>
                <Empty description="您还没有任何订单" />
                <Link to="/">
                    <Button type="primary" style={{ marginTop: '16px' }}>去选购</Button>
                </Link>
            </div>
        );
    }

    return (
        <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>
            <Title level={2}>我的订单</Title>
            <Table 
                columns={columns} 
                dataSource={orders} 
                rowKey="id" 
                loading={loading}
            />
        </div>
    );
};

export default Orders;
