import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Row, Col, Typography, Button, Space, Tag, Divider, Spin, message } from 'antd';
import { ShoppingCart, ArrowLeft } from 'lucide-react';
import api from '../api';
import type { Book } from '../types';
import { useCart } from '../context/CartContext';

const { Title, Text, Paragraph } = Typography;

const BookDetail: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [book, setBook] = useState<Book | null>(null);
    const [loading, setLoading] = useState(true);
    const { addToCart } = useCart();

    useEffect(() => {
        const fetchBook = async () => {
            try {
                const response = await api.get(`/books/${id}`);
                setBook(response.data);
            } catch (error) {
                console.error('Failed to fetch book:', error);
                message.error('获取图书详情失败');
            } finally {
                setLoading(false);
            }
        };
        fetchBook();
    }, [id]);

    const handleAddToCart = () => {
        if (book) {
            addToCart(book);
            message.success('已添加到购物车');
        }
    };

    if (loading) return <div style={{ textAlign: 'center', padding: '50px' }}><Spin size="large" /></div>;
    if (!book) return <div style={{ textAlign: 'center', padding: '50px' }}>未找到该图书</div>;

    return (
        <div style={{ padding: '24px', maxWidth: '1000px', margin: '0 auto' }}>
            <Button icon={<ArrowLeft size={16} />} onClick={() => navigate(-1)} style={{ marginBottom: '24px' }}>
                返回
            </Button>
            
            <Row gutter={[48, 24]}>
                <Col xs={24} md={10}>
                    <img 
                        src={book.coverImage || 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?auto=format&fit=crop&q=80&w=600&h=800'} 
                        alt={book.title} 
                        style={{ width: '100%', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} 
                    />
                </Col>
                <Col xs={24} md={14}>
                    <Space direction="vertical" size="large" style={{ width: '100%' }}>
                        <div>
                            <Tag color="blue">{book.category?.name || '未分类'}</Tag>
                            <Title level={1} style={{ marginTop: '12px' }}>{book.title}</Title>
                            <Text type="secondary" style={{ fontSize: '18px' }}>作者：{book.author}</Text>
                        </div>

                        <div>
                            <Text type="danger" style={{ fontSize: '32px' }} strong>¥{book.price}</Text>
                            <div style={{ marginTop: '8px' }}>
                                <Text type="secondary">库存：{book.stock} 件</Text>
                            </div>
                        </div>

                        <Divider />

                        <div>
                            <Title level={4}>图书简介</Title>
                            <Paragraph style={{ fontSize: '16px', lineHeight: '1.8' }}>
                                {book.description || '暂无详细介绍。'}
                            </Paragraph>
                        </div>

                        <Space size="middle">
                            <Button 
                                type="primary" 
                                size="large" 
                                icon={<ShoppingCart size={20} />} 
                                onClick={handleAddToCart}
                                style={{ height: '50px', padding: '0 40px' }}
                            >
                                加入购物车
                            </Button>
                            <Button size="large" style={{ height: '50px', padding: '0 40px' }}>
                                立即购买
                            </Button>
                        </Space>
                    </Space>
                </Col>
            </Row>
        </div>
    );
};

export default BookDetail;
