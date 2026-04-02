import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../api';
import type { Book, Category } from '../types';
import BookCard from '../components/BookCard';
import { BookGridSkeleton } from '../components/Skeleton';
import EmptyState from '../components/EmptyState';

const CategoryBrowse: React.FC = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [books, setBooks] = useState<Book[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [currentCat, setCurrentCat] = useState<Category | null>(null);
    const [loading, setLoading] = useState(true);
    const [sortBy, setSortBy] = useState('newest');
    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const categoryId = id ? Number(id) : null;

    useEffect(() => { api.get('/categories').then(r => setCategories(r.data || [])).catch(() => {}); }, []);

    useEffect(() => {
        if (!categoryId) return;
        const cat = categories.find(c => c.id === categoryId);
        setCurrentCat(cat || null);
    }, [categoryId, categories]);

    useEffect(() => {
        setLoading(true);
        const sortMap: Record<string, string> = { newest: 'createTime,desc', rating: 'rating,desc', price_asc: 'price,asc', price_desc: 'price,desc' };
        api.get('/books', { params: { categoryId, page, size: 12, sort: sortMap[sortBy] || 'createTime,desc' } })
            .then(r => { setBooks(r.data.content || []); setTotalPages(r.data.totalPages || 0); })
            .catch(() => setBooks([]))
            .finally(() => setLoading(false));
    }, [categoryId, sortBy, page]);

    useEffect(() => { setPage(0); }, [categoryId, sortBy]);

    return (
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="mb-8">
                <div className="flex items-center gap-2 text-sm text-slate-500 mb-3">
                    <Link to="/" className="hover:text-primary">首页</Link><span>/</span>
                    <span className="text-slate-900 dark:text-white">{currentCat?.name || '全部分类'}</span>
                </div>
                <div className="flex items-center justify-between">
                    <h1 className="text-3xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
                        <span className="material-symbols-outlined text-primary text-3xl" aria-hidden="true">category</span>
                        {currentCat?.name || '全部分类'}
                    </h1>
                    <select value={sortBy} onChange={e => setSortBy(e.target.value)} className="px-3 py-2 text-sm border rounded-lg dark:bg-slate-800 dark:border-slate-700 focus:ring-1 focus:ring-primary focus:border-primary">
                        <option value="newest">最新上架</option><option value="rating">好评优先</option><option value="price_asc">价格 ↑</option><option value="price_desc">价格 ↓</option>
                    </select>
                </div>
            </div>

            {/* Category Tags */}
            <div className="flex flex-wrap gap-2 mb-6">
                <button onClick={() => navigate('/category')} className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${!categoryId ? 'bg-primary text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'}`}>全部</button>
                {categories.map(c => (
                    <button key={c.id} onClick={() => navigate(`/category/${c.id}`)} className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${categoryId === c.id ? 'bg-primary text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'}`}>{c.name}</button>
                ))}
            </div>

            {loading ? <BookGridSkeleton count={12} /> : books.length === 0 ? (
                <EmptyState icon="category" title="暂无图书" description="该分类下暂无图书" action={{ label: '查看全部', to: '/category' }} />
            ) : (
                <>
                    <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">{books.map(b => <BookCard key={b.id} book={b} />)}</div>
                    {totalPages > 1 && (
                        <div className="flex justify-center items-center gap-2 mt-10">
                            <button onClick={() => setPage(p => Math.max(0, p - 1))} disabled={page === 0} className="px-4 py-2 rounded-lg border dark:border-slate-700 disabled:opacity-50 hover:bg-slate-50 dark:hover:bg-slate-800">上一页</button>
                            <div className="flex gap-1">{Array.from({ length: Math.min(5, totalPages) }, (_, i) => { let p = totalPages <= 5 ? i : page < 2 ? i : page > totalPages - 3 ? totalPages - 5 + i : page - 2 + i; return <button key={p} onClick={() => setPage(p)} className={`w-10 h-10 rounded-lg ${page === p ? 'bg-primary text-white' : 'border dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800'}`}>{p + 1}</button>; })}</div>
                            <button onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))} disabled={page >= totalPages - 1} className="px-4 py-2 rounded-lg border dark:border-slate-700 disabled:opacity-50 hover:bg-slate-50 dark:hover:bg-slate-800">下一页</button>
                        </div>
                    )}
                </>
            )}
        </div>
    );
};
export default CategoryBrowse;
