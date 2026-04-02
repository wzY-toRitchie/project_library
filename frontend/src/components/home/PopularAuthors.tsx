import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api';
import type { Book } from '../../types';
import { FALLBACK_COVER } from '../../utils/constants';

interface AuthorInfo {
    name: string;
    bookCount: number;
    topBook: Book;
}

const PopularAuthors: React.FC = () => {
    const [authors, setAuthors] = useState<AuthorInfo[]>([]);
    const [loading, setLoading] = useState(true);
    useEffect(() => {
        const fetchAuthors = async () => {
            setLoading(true);
            try {
                const response = await api.get('/books?size=100&sort=rating,desc');
                const books: Book[] = response.data.content || response.data;

                if (!Array.isArray(books)) return;

                const authorMap = new Map<string, { books: Book[]; topBook: Book }>();

                for (const book of books) {
                    if (!book.author) continue;
                    const existing = authorMap.get(book.author);
                    if (existing) {
                        existing.books.push(book);
                    } else {
                        authorMap.set(book.author, { books: [book], topBook: book });
                    }
                }

                const authorList: AuthorInfo[] = Array.from(authorMap.entries())
                    .map(([name, data]) => ({
                        name,
                        bookCount: data.books.length,
                        topBook: data.topBook,
                    }))
                    .sort((a, b) => b.topBook.rating! - a.topBook.rating!)
                    .slice(0, 5);

                setAuthors(authorList);
            } catch (error) {
                console.error('Failed to fetch popular authors:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchAuthors();
    }, []);

    if (loading) {
        return (
            <section className="mb-10 section-animate">
                <div className="h-8 w-32 bg-slate-200 dark:bg-slate-700 rounded mb-6 animate-pulse" />
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                    {Array.from({ length: 5 }).map((_, i) => (
                        <div key={i} className="bg-white dark:bg-slate-800 rounded-xl p-5 shadow-sm border border-slate-100 dark:border-slate-700 animate-pulse">
                            <div className="w-16 h-16 bg-slate-200 dark:bg-slate-700 rounded-full mx-auto mb-3" />
                            <div className="h-5 bg-slate-200 dark:bg-slate-700 rounded w-24 mx-auto mb-2" />
                            <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-16 mx-auto" />
                        </div>
                    ))}
                </div>
            </section>
        );
    }

    if (authors.length === 0) return null;

    const gradients = [
        'from-blue-500/10 to-indigo-500/10 dark:from-blue-500/20 dark:to-indigo-500/20',
        'from-emerald-500/10 to-teal-500/10 dark:from-emerald-500/20 dark:to-teal-500/20',
        'from-amber-500/10 to-orange-500/10 dark:from-amber-500/20 dark:to-orange-500/20',
        'from-rose-500/10 to-pink-500/10 dark:from-rose-500/20 dark:to-pink-500/20',
        'from-violet-500/10 to-purple-500/10 dark:from-violet-500/20 dark:to-purple-500/20',
    ];

    return (
        <section className="mb-10 section-animate">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-6">
                <span className="material-symbols-outlined text-primary" aria-hidden="true">groups</span>
                热门作者</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 stagger-entry">
                {authors.map((author, index) => (
                    <Link
                        key={author.name}
                        to={`/search?q=${encodeURIComponent(author.name)}`}
                        className={`bg-gradient-to-br ${gradients[index % gradients.length]} rounded-xl p-5 shadow-sm border border-slate-100 dark:border-slate-700 cursor-pointer card-hover-lift hover:shadow-md transition-colors,transition-transform hover:-translate-y-0.5`}
                    >
                        <div className="w-16 h-16 rounded-full bg-white dark:bg-slate-800 shadow-inner flex items-center justify-center mx-auto mb-3 overflow-hidden">
                            <img
                                src={author.topBook.coverImage || FALLBACK_COVER}
                                alt={author.name}
                                className="w-full h-full object-cover"
                                loading="lazy"
                                width={64}
                                height={64}
                            />
                        </div>
                        <h3 className="font-semibold text-slate-900 dark:text-white text-center line-clamp-1">
                            {author.name}
                        </h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400 text-center mt-1">
                            {author.bookCount} 部作品                        </p>
                        <div className="mt-3 flex items-center justify-center gap-1">
                            <span className="material-symbols-outlined text-sm text-yellow-500" aria-hidden="true">star</span>
                            <span className="text-xs text-slate-600 dark:text-slate-300 line-clamp-1">
                                {author.topBook.title}
                            </span>
                        </div>
                    </Link>
                ))}
            </div>
        </section>
    );
};

export default PopularAuthors;
