import React, { useEffect, useState } from 'react';
import { Card, List, Typography, Space, Input, Button, message } from 'antd';
import { ShoppingCart } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import type { Book } from '../types';
import { useCart } from '../context/CartContext';

const { Title, Text } = Typography;
const { Search } = Input;

const Home: React.FC = () => {
    const [books, setBooks] = useState<Book[]>([]);
    const [loading, setLoading] = useState(true);
    const { addToCart } = useCart();
    const navigate = useNavigate();

    useEffect(() => {
        fetchBooks();
    }, []);

    const fetchBooks = async () => {
        try {
            const response = await api.get('/books');
            setBooks(response.data);
        } catch (error) {
            console.error('Failed to fetch books:', error);
            message.error('获取图书列表失败');
        } finally {
            setLoading(false);
        }
    };

    const handleAddToCart = (book: Book) => {
        addToCart(book);
        message.success(`${book.title} 已添加到购物车`);
    };

    const onSearch = async (value: string) => {
        setLoading(true);
        try {
            const response = await api.get(`/books/search?title=${value}`);
            setBooks(response.data);
        } catch (error) {
            console.error('Search failed:', error);
            message.error('搜索失败');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <Title level={2}>图书商城</Title>
                <Search
                    placeholder="搜索图书标题..."
                    onSearch={onSearch}
                    style={{ width: 300 }}
                    enterButton
                />
            </div>
            
            <List
                grid={{ gutter: 24, xs: 1, sm: 2, md: 3, lg: 4, xl: 4, xxl: 5 }}
                dataSource={books}
                loading={loading}
                renderItem={(book) => (
                    <List.Item>
                        <Card
                            hoverable
                            cover={
                                <img 
                                    alt={book.title} 
                                    src={book.coverImage || 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?auto=format&fit=crop&q=80&w=300&h=400'} 
                                    style={{ height: 280, objectFit: 'cover' }} 
                                    onClick={() => navigate(`/book/${book.id}`)}
                                />
                            }
                            actions={[
                                <Button 
                                    type="primary" 
                                    icon={<ShoppingCart size={16} />} 
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleAddToCart(book);
                                    }}
                                    block
                                >
                                    加入购物车
                                </Button>
                            ]}
                            onClick={() => navigate(`/book/${book.id}`)}
                        >
                            <Card.Meta 
                                title={book.title} 
                                description={
                                    <Space direction="vertical" size={0}>
                                        <Text type="secondary">{book.author}</Text>
                                        <Text type="danger" strong style={{ fontSize: '18px' }}>¥{book.price}</Text>
                                    </Space>
                                } 
                            />
                        </Card>
                    </List.Item>
                )}
            />
        </div>
    );
};

export default Home;
