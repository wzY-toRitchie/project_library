import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getFavorites, removeFavorite } from '../../api/favorites';
import { useCart } from '../../context/CartContext';
import type { Favorite } from '../../types';
import { message } from 'antd';
import EmptyState from '../EmptyState';

interface FavoritesListProps {
    onAddToCart?: (favorite: Favorite) => void;
}

const FavoritesList: React.FC<FavoritesListProps> = ({ onAddToCart }) => {
    const { addToCart } = useCart();
    const [favorites, setFavorites] = useState<Favorite[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchFavorites = async () => {
            setLoading(true);
            try {
                const data = await getFavorites();
                setFavorites(data);
            } catch (error) {
                console.error('Failed to fetch favorites:', error);
                message.error('获取收藏列表失败');
            } finally {
                setLoading(false);
            }
        };
        fetchFavorites();
    }, []);

    const handleRemove = async (bookId: number) => {
        try {
            await removeFavorite(bookId);
            setFavorites(prev => prev.filter(f => f.book.id !== bookId));
            message.success('已取消收藏');
        } catch (error) {
            message.error('取消收藏失败');
        }
    };

    const handleAddToCart = (favorite: Favorite) => {
        const book = favorite.book;
        if (!book) return;
        addToCart({
            id: book.id,
            title: book.title,
            author: book.author,
            price: book.price ?? 0,
            coverImage: book.coverImage,
            stock: 99,
            rating: 5,
            description: '',
            categoryId: 0
        });
        message.success(`${book.title} 已加入购物车`);
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
        );
    }

    if (favorites.length === 0) {
        return (
            <EmptyState
                icon="favorite"
                title="收藏夹空空如也"
                description="看到喜欢的书籍，点击收藏按钮就可以在这里找到啦"
                action={{ label: '去逛逛', to: '/' }}
            />
        );
    }

    return (
        <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6">我的收藏</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {favorites.map((favorite) => {
                    const book = favorite.book;
                    if (!book) return null;
                    return (
                        <div key={favorite.id} className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4 flex gap-4">
                            <Link to={`/book/${book.id}`} className="flex-shrink-0">
                                <img
                                    src={book.coverImage || 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?auto=format&fit=crop&q=80&w=300&h=400'}
                                    alt={book.title}
                                    className="w-20 h-28 object-cover rounded-lg"
                                />
                            </Link>
                            <div className="flex-1 min-w-0">
                                <Link to={`/book/${book.id}`} className="text-sm font-semibold text-slate-900 dark:text-white line-clamp-2 hover:text-primary">
                                    {book.title}
                                </Link>
                                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{book.author}</p>
                                <p className="text-lg font-bold text-primary mt-2">¥{(book.price ?? 0).toFixed(2)}</p>
                                <div className="flex gap-2 mt-3">
                                    <button
                                        onClick={() => handleAddToCart(favorite)}
                                        className="flex-1 px-3 py-1.5 bg-primary text-white text-xs font-medium rounded-lg hover:bg-primary/90 transition-colors"
                                    >
                                        加入购物车
                                    </button>
                                    <button
                                        onClick={() => handleRemove(book.id)}
                                        className="px-3 py-1.5 border border-slate-200 dark:border-slate-700 text-slate-500 text-xs rounded-lg hover:bg-red-50 hover:text-red-500 hover:border-red-200 transition-colors"
                                    >
                                        取消
                                    </button>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default FavoritesList;
