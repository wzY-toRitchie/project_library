import React, { useEffect, useState } from 'react';
import api from '../../api';
import type { Book } from '../../types';
import BookCard from '../BookCard';

interface FeaturedBooksProps {
    onAddToCart?: (book: Book) => void;
}

const FeaturedBooks: React.FC<FeaturedBooksProps> = () => {
    const [books, setBooks] = useState<Book[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchFeatured = async () => {
            try {
                const response = await api.get('/home/featured?size=8');
                setBooks(response.data.content || response.data || []);
            } catch {
                try {
                    const fallback = await api.get('/books?sort=rating,desc&size=8');
                    setBooks(fallback.data.content || fallback.data || []);
                } catch (e) {
                    console.error('Failed to fetch featured books:', e);
                }
            } finally {
                setLoading(false);
            }
        };
        fetchFeatured();
    }, []);

    if (loading) {
        return (
            <section className="mb-10">
                <div className="flex items-center justify-between mb-6">
                    <div className="h-7 bg-slate-200 dark:bg-slate-700 rounded w-32" />
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
                    {Array.from({ length: 8 }).map((_, i) => (
                        <div key={i} className="card-elegant overflow-hidden">
                            <div className="aspect-[2/3] skeleton-shimmer" />
                            <div className="p-4 space-y-2">
                                <div className="h-5 skeleton-shimmer rounded w-3/4" />
                                <div className="h-4 skeleton-shimmer rounded w-1/2" />
                                <div className="h-6 skeleton-shimmer rounded w-1/3 mt-2" />
                            </div>
                        </div>
                    ))}
                </div>
            </section>
        );
    }

    return (
        <section className="mb-10">
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary" aria-hidden="true">auto_awesome</span>
                    编辑精选
                </h2>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
                {books.map((book) => (
                    <BookCard key={book.id} book={book} variant="featured" />
                ))}
            </div>
        </section>
    );
};

export default FeaturedBooks;
