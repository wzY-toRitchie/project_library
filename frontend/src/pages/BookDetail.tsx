import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { message } from 'antd';
import api from '../api';
import type { Book, Review } from '../types';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

const BookDetail: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [book, setBook] = useState<Book | null>(null);
    const [reviews, setReviews] = useState<Review[]>([]);
    const [activeTab, setActiveTab] = useState<'description' | 'reviews'>('description');
    const [loading, setLoading] = useState(true);
    const [quantity, setQuantity] = useState(1);
    const { addToCart } = useCart();
    const { isAuthenticated } = useAuth();

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [bookRes, reviewsRes] = await Promise.all([
                    api.get(`/books/${id}`),
                    api.get(`/reviews/book/${id}`)
                ]);
                setBook(bookRes.data);
                setReviews(reviewsRes.data);
            } catch (error) {
                console.error('Failed to fetch data:', error);
                message.error('获取图书详情失败');
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [id]);

    useEffect(() => {
        setQuantity(1);
    }, [book?.id]);

    const handleAddToCart = () => {
        if (book) {
            for (let i = 0; i < quantity; i += 1) {
                addToCart(book);
            }
            message.success(`已加入购物车 x${quantity}`);
        }
    };

    const handleBuyNow = () => {
        if (!book) return;
        if (!isAuthenticated) {
            message.warning('请先登录后再购买');
            navigate('/login');
            return;
        }
        navigate('/checkout', {
            state: {
                items: [
                    {
                        id: book.id,
                        title: book.title,
                        author: book.author,
                        price: book.price,
                        quantity,
                        coverImage: book.coverImage
                    }
                ],
                totalPrice: book.price * quantity
            }
        });
    };

    const reviewsCount = reviews.length;
    const averageRating = reviews.length > 0 
        ? reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length 
        : (book?.rating ?? 5);
    const ratingValue = Math.max(0, Math.min(5, Math.round(averageRating)));
    const ratingText = averageRating.toFixed(1);

    const isbnText = book?.id ? `BK-${book.id.toString().padStart(10, '0')}` : '暂无';
    const stockText = book?.stock ?? 0;
    const authorText = book?.author || '未知作者';
    const descriptionText = book?.description || '暂无图书简介。';
    const categoryText = book?.category?.name || '未分类';
    
    const maxQuantity = book?.stock && book.stock > 0 ? book.stock : 1;
    const canIncrease = quantity < maxQuantity;
    const canDecrease = quantity > 1;
    const handleIncrease = () => setQuantity(prev => Math.min(maxQuantity, prev + 1));
    const handleDecrease = () => setQuantity(prev => Math.max(1, prev - 1));
    const coverImage =
        book?.coverImage ||
        'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?auto=format&fit=crop&q=80&w=600&h=800';

    if (loading) {
        return (
            <div className="flex items-center justify-center py-20">
                <div className="h-10 w-10 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            </div>
        );
    }
    if (!book) {
        return (
            <div className="flex flex-col items-center justify-center py-24 text-slate-500">
                <span className="material-symbols-outlined text-4xl mb-3">menu_book</span>
                <p>未找到该图书</p>
            </div>
        );
    }

    return (
        <div className="bg-background-light dark:bg-background-dark text-slate-900 dark:text-slate-100">
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <nav aria-label="Breadcrumb" className="flex mb-8 text-sm">
                    <ol className="flex items-center space-x-2 text-slate-500 dark:text-slate-400">
                        <li>
                            <button onClick={() => navigate('/')} className="hover:text-primary transition-colors">
                                首页
                            </button>
                        </li>
                        <li>
                            <span className="material-symbols-outlined text-xs">chevron_right</span>
                        </li>
                        <li className="font-medium text-slate-900 dark:text-white">{categoryText}</li>
                        <li>
                            <span className="material-symbols-outlined text-xs">chevron_right</span>
                        </li>
                        <li className="font-medium text-slate-900 dark:text-white line-clamp-1 max-w-[260px]">{book.title}</li>
                    </ol>
                </nav>

                <div className="grid grid-cols-1 md:grid-cols-12 gap-8 lg:gap-16 mb-16">
                    <div className="md:col-span-5 lg:col-span-4">
                        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800">
                            <img alt={book.title} className="w-full h-auto rounded-lg shadow-md object-cover aspect-[3/4]" src={coverImage} />
                        </div>
                    </div>
                    <div className="md:col-span-7 lg:col-span-8 flex flex-col">
                        <div className="mb-6">
                            <h1 className="text-3xl lg:text-4xl font-bold text-slate-900 dark:text-white mb-2 leading-tight">{book.title}</h1>
                            <p className="text-lg text-slate-600 dark:text-slate-400">
                                作者：
                                <span className="text-primary font-medium ml-2">{authorText}</span>
                            </p>
                        </div>
                        <div className="flex flex-wrap items-center gap-4 mb-8">
                            <div className="flex text-amber-400">
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <span key={star} className="material-symbols-outlined text-sm">
                                        {star <= ratingValue ? 'star' : 'star_outline'}
                                    </span>
                                ))}
                            </div>
                            <span className="text-sm font-medium text-slate-500">({reviewsCount} 条评价)</span>
                            <span className="h-4 w-px bg-slate-300 dark:bg-slate-700" />
                            <span className="text-sm font-mono text-slate-500">编号：{isbnText}</span>
                        </div>
                        <div className="mb-8 flex items-baseline gap-4">
                            <span className="text-4xl font-bold text-primary">¥{book.price.toFixed(2)}</span>
                            <span className="bg-primary/10 text-primary px-2 py-1 rounded text-xs font-bold">热销中</span>
                        </div>
                        <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm max-w-lg">
                            <div className="flex items-center justify-between mb-6">
                                <div className="flex flex-col">
                                    <span className="text-xs uppercase tracking-wider text-slate-400 font-bold mb-1">库存状态</span>
                                    <div className="flex items-center gap-2">
                                        <span className={`flex h-2 w-2 rounded-full ${stockText > 0 ? 'bg-emerald-500' : 'bg-red-500'}`} />
                                        <span className={`text-sm font-semibold ${stockText > 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-500'}`}>
                                            {stockText > 0 ? `库存充足：${stockText} 本` : '暂时缺货'}
                                        </span>
                                    </div>
                                </div>
                                <div className="flex flex-col items-end">
                                    <span className="text-xs uppercase tracking-wider text-slate-400 font-bold mb-1">分类</span>
                                    <span className="text-sm font-medium">{categoryText}</span>
                                </div>
                            </div>
                            <div className="flex flex-wrap items-center gap-4 mb-6">
                                <div className="flex items-center border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden h-12">
                                    <button
                                        className={`px-3 transition-colors ${canDecrease ? 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400' : 'text-slate-300 dark:text-slate-600 cursor-not-allowed'}`}
                                        onClick={handleDecrease}
                                        type="button"
                                        disabled={!canDecrease}
                                    >
                                        <span className="material-symbols-outlined text-lg">remove</span>
                                    </button>
                                    <input className="w-12 text-center border-none focus:ring-0 bg-transparent font-medium text-slate-900 dark:text-white" readOnly type="number" value={quantity} />
                                    <button
                                        className={`px-3 transition-colors ${canIncrease ? 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400' : 'text-slate-300 dark:text-slate-600 cursor-not-allowed'}`}
                                        onClick={handleIncrease}
                                        type="button"
                                        disabled={!canIncrease}
                                    >
                                        <span className="material-symbols-outlined text-lg">add</span>
                                    </button>
                                </div>
                                <button
                                    className="flex-1 min-w-[200px] h-12 bg-primary hover:bg-primary/90 text-white font-bold rounded-lg transition-all shadow-md flex items-center justify-center gap-2"
                                    onClick={handleBuyNow}
                                >
                                    <span className="material-symbols-outlined">shopping_bag</span>
                                    立即购买
                                </button>
                            </div>
                            <button
                                className="w-full h-12 border-2 border-primary/20 text-primary hover:bg-primary/5 font-bold rounded-lg transition-all flex items-center justify-center gap-2"
                                onClick={handleAddToCart}
                            >
                                <span className="material-symbols-outlined">add_shopping_cart</span>
                                加入购物车
                            </button>
                            <p className="mt-4 text-[10px] text-center text-slate-400">满 199 元免运费，支持 30 天无忧退换。</p>
                        </div>
                    </div>
                </div>

                <div className="border-t border-slate-200 dark:border-slate-800 pt-12">
                    <div className="flex gap-8 mb-8 border-b border-slate-200 dark:border-slate-800">
                        <button 
                            onClick={() => setActiveTab('description')}
                            className={`pb-4 text-sm font-bold border-b-2 transition-colors tracking-wide ${activeTab === 'description' ? 'border-primary text-primary' : 'border-transparent text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'}`} 
                            type="button"
                        >
                            图书简介
                        </button>
                        <button 
                            onClick={() => setActiveTab('reviews')}
                            className={`pb-4 text-sm font-bold border-b-2 transition-colors tracking-wide ${activeTab === 'reviews' ? 'border-primary text-primary' : 'border-transparent text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'}`} 
                            type="button"
                        >
                            用户评价（{reviewsCount}）
                        </button>
                    </div>
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                        <div className="lg:col-span-2 space-y-6">
                            {activeTab === 'description' ? (
                                <>
                                    <div className="prose dark:prose-invert max-w-none">
                                        <p className="text-slate-600 dark:text-slate-400 leading-relaxed text-lg italic">
                                            “一本充满张力与希望的作品，值得细细品读。”
                                        </p>
                                        <p className="text-slate-600 dark:text-slate-400 leading-relaxed">{descriptionText}</p>
                                    </div>
                                    <div className="grid grid-cols-2 md:grid-cols-3 gap-6 pt-6">
                                        <div>
                                            <span className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">作者</span>
                                            <span className="text-slate-900 dark:text-white font-medium">{authorText}</span>
                                        </div>
                                        <div>
                                            <span className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">库存</span>
                                            <span className="text-slate-900 dark:text-white font-medium">{stockText} 本</span>
                                        </div>
                                        <div>
                                            <span className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">分类</span>
                                            <span className="text-slate-900 dark:text-white font-medium">{categoryText}</span>
                                        </div>
                                        <div>
                                            <span className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">评分</span>
                                            <span className="text-slate-900 dark:text-white font-medium">{ratingText} / 5</span>
                                        </div>
                                    </div>
                                </>
                            ) : (
                                <div className="space-y-6">
                                    {reviews.length === 0 ? (
                                        <div className="text-center py-10 text-slate-500">
                                            <span className="material-symbols-outlined text-4xl mb-2">rate_review</span>
                                            <p>暂无评价，快来抢沙发吧！</p>
                                        </div>
                                    ) : (
                                        reviews.map((review) => (
                                            <div key={review.id} className="border-b border-slate-100 dark:border-slate-800 pb-6 last:border-0">
                                                <div className="flex items-center justify-between mb-2">
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs">
                                                            {review.user?.username?.charAt(0).toUpperCase() || 'A'}
                                                        </div>
                                                        <span className="text-sm font-bold text-slate-900 dark:text-white">{review.user?.username || '匿名用户'}</span>
                                                    </div>
                                                    <span className="text-xs text-slate-400">{new Date(review.createTime).toLocaleDateString()}</span>
                                                </div>
                                                <div className="flex text-amber-400 mb-2 ml-10">
                                                    {[1, 2, 3, 4, 5].map((star) => (
                                                        <span key={star} className="material-symbols-outlined text-sm">
                                                            {star <= review.rating ? 'star' : 'star_outline'}
                                                        </span>
                                                    ))}
                                                </div>
                                                <p className="text-slate-600 dark:text-slate-300 leading-relaxed ml-10">{review.comment}</p>
                                            </div>
                                        ))
                                    )}
                                </div>
                            )}
                        </div>
                        <div className="lg:col-span-1">
                            <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 sticky top-24">
                                <h3 className="text-lg font-bold mb-4">顾客评分</h3>
                                <div className="flex items-center gap-4 mb-6">
                                    <span className="text-4xl font-bold text-slate-900 dark:text-white">{ratingText}</span>
                                    <div className="flex flex-col">
                                        <div className="flex text-amber-400">
                                            {[1, 2, 3, 4, 5].map((star) => (
                                                <span key={star} className="material-symbols-outlined text-sm">
                                                    {star <= ratingValue ? 'star' : 'star_outline'}
                                                </span>
                                            ))}
                                        </div>
                                        <span className="text-xs text-slate-500 font-medium">满分 5 分</span>
                                    </div>
                                </div>
                                <div className="space-y-6">
                                    {reviews.slice(0, 3).map((review) => (
                                        <div key={review.id} className="border-b border-slate-100 dark:border-slate-800 pb-4 last:border-0">
                                            <div className="flex items-center justify-between mb-2">
                                                <span className="text-sm font-bold">{review.user?.username || '匿名用户'}</span>
                                                <span className="text-[10px] text-slate-400 font-medium">{new Date(review.createTime).toLocaleDateString()}</span>
                                            </div>
                                            <div className="flex text-amber-400 mb-1">
                                                {[1, 2, 3, 4, 5].map((star) => (
                                                    <span key={star} className="material-symbols-outlined text-xs">
                                                        {star <= review.rating ? 'star' : 'star_outline'}
                                                    </span>
                                                ))}
                                            </div>
                                            <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2">{review.comment}</p>
                                        </div>
                                    ))}
                                </div>
                                <button 
                                    onClick={() => setActiveTab('reviews')}
                                    className="w-full mt-6 py-3 text-sm font-bold text-primary hover:bg-primary/5 transition-colors border border-primary/20 rounded-lg" 
                                    type="button"
                                >
                                    查看全部评价
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default BookDetail;
