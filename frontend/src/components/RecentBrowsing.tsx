import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getRecentBrowsingHistory } from '../api/history';
import type { Book } from '../types';
import { useAuth } from '../context/AuthContext';

interface RecentBrowsingProps {
    onAddToCart?: (book: Book) => void;
}

const RecentBrowsing: React.FC<RecentBrowsingProps> = ({ onAddToCart }) => {
    const [books, setBooks] = useState<Book[]>([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    const { isAuthenticated } = useAuth();

    useEffect(() => {
        const fetchRecentBooks = async () => {
            if (!isAuthenticated) {
                setLoading(false);
                return;
            }
            try {
                const data = await getRecentBrowsingHistory(4);
                setBooks(data.map(h => h.book));
            } catch (error) {
                console.error('Failed to fetch recent browsing:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchRecentBooks();
    }, [isAuthenticated]);

    if (loading) {
        return (
            <div className="animate-pulse">
                <div className="h-8 w-32 bg-slate-200 dark:bg-slate-700 rounded mb-4"></div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[1, 2, 3, 4].map(i => (
                        <div key={i} className="h-48 bg-slate-200 dark:bg-slate-700 rounded"></div>
                    ))}
                </div>
            </div>
        );
    }

    if (!isAuthenticated || books.length === 0) {
        return null;
    }

    return (
        <section className="mb-8">
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary">history</span>
                    最近浏览
                </h2>
                <button
                    onClick={() => navigate('/profile')}
                    className="text-sm text-primary hover:underline"
                >
                    查看全部 →
                </button>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {books.map((book) => (
                    <div
                        key={book.id}
                        className="group bg-white dark:bg-slate-800 rounded-lg shadow-sm hover:shadow-md transition-all cursor-pointer border border-slate-100 dark:border-slate-700"
                        onClick={() => navigate(`/book/${book.id}`)}
                    >
                        <div className="relative aspect-[3/4] overflow-hidden rounded-t-lg">
                            <img
                                src={book.coverImage || 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?auto=format&fit=crop&q=80&w=300&h=400'}
                                alt={book.title}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                loading="lazy"
                            />
                        </div>
                        <div className="p-3">
                            <h3 className="font-medium text-slate-900 dark:text-white line-clamp-1 text-sm">
                                {book.title}
                            </h3>
                            <p className="text-xs text-slate-500 mt-1">{book.author}</p>
                            <div className="flex items-center justify-between mt-2">
                                <span className="text-primary font-bold">¥{book.price.toFixed(2)}</span>
                                {onAddToCart && (
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            onAddToCart(book);
                                        }}
                                        className="p-1 rounded-full hover:bg-primary/10 text-primary"
                                    >
                                        <span className="material-symbols-outlined text-lg">add_shopping_cart</span>
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
};

export default RecentBrowsing;
