import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api';
import type { Book } from '../types';
import BookCard from '../components/BookCard';
import { BookGridSkeleton } from '../components/Skeleton';
import EmptyState from '../components/EmptyState';

const AuthorDetail: React.FC = () => {
    const { name } = useParams();
    const decodedName = decodeURIComponent(name || '');
    const [books, setBooks] = useState<Book[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchBooks = async () => {
            setLoading(true);
            try {
                const res = await api.get('/books', { params: { search: decodedName, size: 50 } });
                const filtered = (res.data.content || []).filter((b: Book) => b.author === decodedName);
                setBooks(filtered.length > 0 ? filtered : res.data.content || []);
            } catch { setBooks([]); }
            finally { setLoading(false); }
        };
        fetchBooks();
    }, [decodedName]);

    return (
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="mb-8">
                <div className="flex items-center gap-2 text-sm text-slate-500 mb-3">
                    <Link to="/" className="hover:text-primary">首页</Link><span>/</span>
                    <span className="text-slate-900 dark:text-white">{decodedName}</span>
                </div>
                <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-full bg-primary/10 text-primary flex items-center justify-center text-2xl font-bold">{decodedName.charAt(0)}</div>
                    <div>
                        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">{decodedName}</h1>
                        <p className="text-slate-500 mt-1">共 {books.length} 部作品</p>
                    </div>
                </div>
            </div>
            {loading ? <BookGridSkeleton count={8} /> : books.length === 0 ? (
                <EmptyState icon="person" title="暂无作品" description="该作者暂无作品" action={{ label: '返回首页', to: '/' }} />
            ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">{books.map(b => <BookCard key={b.id} book={b} />)}</div>
            )}
        </div>
    );
};
export default AuthorDetail;
