import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';
import type { Book } from '../types';
import { FALLBACK_COVER } from '../utils/constants';

interface RelatedBooksProps {
    currentBookId: number;
    categoryText: string;
}

const RelatedBooks: React.FC<RelatedBooksProps> = ({ currentBookId, categoryText }) => {
    const [books, setBooks] = useState<Book[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchRelated = async () => {
            setLoading(true);
            try {
                const response = await api.get('/books?size=8&sort=rating,desc');
                const allBooks: Book[] = response.data.content || response.data;
                const filtered = allBooks.filter(b => b.id !== currentBookId).slice(0, 4);
                setBooks(filtered);
            } catch {
                console.error('Failed to fetch related books');
            } finally {
                setLoading(false);
            }
        };
        fetchRelated();
    }, [currentBookId]);

    if (loading || books.length === 0) return null;

    return (
        <section className="border-t border-slate-200 dark:border-slate-800 pt-12 mt-12">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
                <span className="material-symbols-outlined text-primary" aria-hidden="true">recommend</span>
                你可能还喜欢
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {books.map((book) => (
                    <Link
                        key={book.id}
                        to={`/book/${book.id}`}
                        className="group bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-700 overflow-hidden hover:shadow-md transition-shadow"
                    >
                        <div className="aspect-[2/3] overflow-hidden bg-slate-100 dark:bg-slate-800">
                            <img
                                src={book.coverImage || FALLBACK_COVER}
                                alt={book.title}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                loading="lazy"
                                width={300}
                                height={400}
                            />
                        </div>
                        <div className="p-3">
                            <h3 className="font-medium text-slate-900 dark:text-white text-sm line-clamp-1">{book.title}</h3>
                            <p className="text-xs text-slate-500 mt-1">{book.author}</p>
                            <span className="text-primary font-bold text-sm mt-1 block">¥{(book.price ?? 0).toFixed(2)}</span>
                        </div>
                    </Link>
                ))}
            </div>
        </section>
    );
};

export default RelatedBooks;
