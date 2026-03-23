import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getBrowsingHistory, deleteBrowsingHistory, clearBrowsingHistory } from '../../api/history';
import { useCart } from '../../context/CartContext';
import type { BrowsingHistory } from '../../types';
import { message } from 'antd';
import EmptyState from '../EmptyState';

const BrowsingHistoryList: React.FC = () => {
    const { addToCart } = useCart();
    const [history, setHistory] = useState<BrowsingHistory[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchHistory = async () => {
            setLoading(true);
            try {
                const data = await getBrowsingHistory();
                setHistory(data);
            } catch (error) {
                console.error('Failed to fetch browsing history:', error);
                message.error('获取浏览历史失败');
            } finally {
                setLoading(false);
            }
        };
        fetchHistory();
    }, []);

    const handleDelete = async (id: number) => {
        try {
            await deleteBrowsingHistory(id);
            setHistory(prev => prev.filter(h => h.id !== id));
            message.success('已删除');
        } catch (error) {
            message.error('删除失败');
        }
    };

    const handleClearAll = async () => {
        try {
            await clearBrowsingHistory();
            setHistory([]);
            message.success('已清空浏览历史');
        } catch (error) {
            message.error('清空失败');
        }
    };

    const handleAddToCart = (item: BrowsingHistory) => {
        if (item.book) {
            addToCart({
                id: item.book.id,
                title: item.book.title,
                author: item.book.author,
                price: item.book.price ?? 0,
                coverImage: item.book.coverImage,
                stock: 99,
                rating: 5,
                description: '',
                categoryId: 0
            });
            message.success(`${item.book.title} 已加入购物车`);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
        );
    }

    if (history.length === 0) {
        return (
            <EmptyState
                icon="history"
                title="暂无浏览记录"
                description="您还没有浏览过任何书籍，快去发现好书吧"
                action={{ label: '去逛逛', to: '/' }}
            />
        );
    }

    return (
        <div>
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">浏览历史</h2>
                <button
                    onClick={handleClearAll}
                    className="text-sm text-slate-500 hover:text-red-500 transition-colors"
                >
                    清空全部
                </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {history.map((item) => item.book && (
                    <div key={item.id} className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4 flex gap-4">
                        <Link to={`/book/${item.book.id}`} className="flex-shrink-0">
                            <img
                                src={item.book.coverImage || 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?auto=format&fit=crop&q=80&w=300&h=400'}
                                alt={item.book.title}
                                className="w-20 h-28 object-cover rounded-lg"
                            />
                        </Link>
                        <div className="flex-1 min-w-0">
                            <Link to={`/book/${item.book.id}`} className="text-sm font-semibold text-slate-900 dark:text-white line-clamp-2 hover:text-primary">
                                {item.book.title}
                            </Link>
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{item.book.author}</p>
                            <p className="text-lg font-bold text-primary mt-2">¥{(item.book.price ?? 0).toFixed(2)}</p>
                            <div className="flex gap-2 mt-3">
                                <button
                                    onClick={() => handleAddToCart(item)}
                                    className="flex-1 px-3 py-1.5 bg-primary text-white text-xs font-medium rounded-lg hover:bg-primary/90 transition-colors"
                                >
                                    加入购物车
                                </button>
                                <button
                                    onClick={() => handleDelete(item.id)}
                                    className="px-3 py-1.5 border border-slate-200 dark:border-slate-700 text-slate-500 text-xs rounded-lg hover:bg-red-50 hover:text-red-500 hover:border-red-200 transition-colors"
                                >
                                    删除
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default BrowsingHistoryList;
