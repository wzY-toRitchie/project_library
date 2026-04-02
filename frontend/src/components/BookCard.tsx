import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import StarRating from './StarRating';
import { FALLBACK_COVER } from '../utils/constants';
import type { Book } from '../types';

interface BookCardProps {
    book: Book;
    variant?: 'default' | 'compact' | 'featured' | 'ranked';
    rank?: number;
    showRating?: boolean;
    showCart?: boolean;
    badge?: string;
}

const BookCard: React.FC<BookCardProps> = ({ book, variant = 'default', rank, showRating = true, showCart = true, badge }) => {
    const navigate = useNavigate();

    if (variant === 'ranked') {
        return (
            <Link to={`/book/${book.id}`} className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors group">
                {rank !== undefined && (
                    <span className={`w-8 h-8 flex items-center justify-center rounded-full text-sm font-bold shrink-0 ${rank <= 3 ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400'}`}>{rank}</span>
                )}
                <div className="w-10 h-14 flex-shrink-0 rounded overflow-hidden bg-slate-100 dark:bg-slate-800">
                    <img src={book.coverImage || FALLBACK_COVER} alt={book.title} className="w-full h-full object-cover" loading="lazy" width={40} height={56} />
                </div>
                <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-medium text-slate-900 dark:text-white line-clamp-1 group-hover:text-primary transition-colors">{book.title}</h3>
                    <p className="text-xs text-slate-500 mt-0.5 truncate">{book.author}</p>
                    {showRating && book.rating && <StarRating rating={book.rating} size="sm" />}
                </div>
                <span className="text-sm font-bold text-primary shrink-0">¥{book.price.toFixed(2)}</span>
            </Link>
        );
    }

    if (variant === 'compact') {
        return (
            <Link to={`/book/${book.id}`} className="card-elegant overflow-hidden shrink-0 w-[180px] cursor-pointer group card-hover-lift">
                <div className="relative aspect-[2/3] overflow-hidden bg-gray-50">
                    <div className="img-zoom absolute inset-0">
                        <img src={book.coverImage || FALLBACK_COVER} alt={book.title} loading="lazy" className="absolute inset-0 w-full h-full object-cover" width={180} height={270} />
                    </div>
                    {badge && <span className="absolute top-2 left-2 bg-primary text-white px-2 py-0.5 rounded-full text-xs font-bold">{badge}</span>}
                </div>
                <div className="p-3">
                    <h3 className="font-medium text-slate-900 dark:text-white text-sm line-clamp-1 group-hover:text-primary transition-colors">{book.title}</h3>
                    <p className="text-xs text-slate-500 mt-1 truncate">{book.author}</p>
                    <span className="text-primary font-bold text-sm mt-1.5 block">¥{book.price}</span>
                </div>
            </Link>
        );
    }

    return (
        <Link to={`/book/${book.id}`} className="card-elegant overflow-hidden flex flex-col h-full cursor-pointer group transition-all duration-300 hover:-translate-y-2 hover:shadow-xl">
            <div className="relative aspect-[2/3] overflow-hidden bg-gray-50">
                <div className="img-zoom absolute inset-0">
                    <img src={book.coverImage || FALLBACK_COVER} alt={book.title} loading="lazy" className="absolute inset-0 w-full h-full object-cover" width={300} height={450} />
                </div>
                {badge && <span className="absolute top-2 left-2 bg-primary text-white px-2 py-1 rounded-full text-xs font-bold">{badge}</span>}
                {variant === 'featured' && book.rating && <span className="absolute top-2 right-2 bg-amber-400 text-amber-900 px-2 py-1 rounded-full text-xs font-bold"><span className="material-symbols-outlined text-sm align-middle" style={{ fontVariationSettings: "'FILL' 1" }}>star</span> {book.rating.toFixed(1)}</span>}
                <div className="absolute inset-0 bg-primary/80 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-6 text-white">
                    {book.category && (
                        <p className="text-xs uppercase tracking-widest mb-2 opacity-80">{book.category.name}</p>
                    )}
                    <button
                        onClick={(e) => { e.preventDefault(); e.stopPropagation(); navigate(`/book/${book.id}`); }}
                        className="w-full py-2 bg-white text-primary rounded-lg font-bold text-sm hover:bg-slate-50 transition-colors"
                    >
                        Quick View
                    </button>
                </div>
            </div>
            <div className="p-4 flex flex-col flex-1">
                <div className="mb-auto">
                    <h3 className="font-display font-semibold text-ink dark:text-white line-clamp-1 text-base mb-1 group-hover:text-primary transition-colors" title={book.title}>{book.title}</h3>
                    <p className="text-xs text-ink-light dark:text-gray-400 font-body mb-2">{book.author}</p>
                    {showRating && <StarRating rating={book.rating || 0} size="sm" showValue />}
                </div>
                <div className="mt-3 flex items-center justify-between">
                    <span className="text-lg font-bold price-tag">¥{book.price}</span>
                    {showCart && (
                        <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); navigate(`/book/${book.id}`); }} className="w-9 h-9 rounded-lg bg-primary/10 hover:bg-primary hover:text-white text-primary flex items-center justify-center transition-all duration-200 active:scale-95" title="查看详情" aria-label={`查看 ${book.title}`}>
                            <span className="material-symbols-outlined text-[18px]" aria-hidden="true">add_shopping_cart</span>
                        </button>
                    )}
                </div>
            </div>
        </Link>
    );
};

export default BookCard;
