import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';
import type { Book } from '../types';
import BookCard from '../components/BookCard';
import { BookGridSkeleton } from '../components/Skeleton';
import EmptyState from '../components/EmptyState';

const NewArrivals: React.FC = () => {
    const [books, setBooks] = useState<Book[]>([]);
    const [loading, setLoading] = useState(true);
    const [sortBy, setSortBy] = useState('newest');
    const [currentPage, setCurrentPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [totalElements, setTotalElements] = useState(0);
    const pageSize = 12;

    useEffect(() => {
        const fetchBooks = async () => {
            setLoading(true);
            try {
                const sortMap: Record<string, string> = {
                    newest: 'createTime,desc',
                    rating: 'rating,desc',
                    price_asc: 'price,asc',
                    price_desc: 'price,desc',
                };
                const response = await api.get('/books', {
                    params: { page: currentPage, size: pageSize, sort: sortMap[sortBy] || 'createTime,desc' }
                });
                setBooks(response.data.content || []);
                setTotalPages(response.data.totalPages || 0);
                setTotalElements(response.data.totalElements || 0);
            } catch (error) {
                console.error('Failed to fetch books:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchBooks();
    }, [sortBy, currentPage]);

    useEffect(() => { setCurrentPage(0); }, [sortBy]);

    return (
        <div className="flex-1 max-w-[1440px] mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
            <div className="mb-8">
                <div className="flex items-center gap-2 text-sm text-slate-500 mb-3">
                    <Link to="/" className="hover:text-primary transition-colors">首页</Link>
                    <span>/</span>
                    <span className="text-slate-900 dark:text-white">新品上架</span>
                </div>
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
                            <span className="material-symbols-outlined text-primary text-3xl" aria-hidden="true">new_releases</span>
                            新品上架
                        </h1>
                        <p className="text-slate-500 mt-1">最新上架的图书，共 {totalElements} 本</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <label htmlFor="sort-new" className="text-sm text-slate-500">排序</label>
                        <select id="sort-new" value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="px-3 py-2 text-sm border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 focus:ring-1 focus:ring-primary focus:border-primary">
                            <option value="newest">最新上架</option>
                            <option value="rating">好评优先</option>
                            <option value="price_asc">价格从低到高</option>
                            <option value="price_desc">价格从高到低</option>
                        </select>
                    </div>
                </div>
            </div>

            {loading ? (
                <BookGridSkeleton count={12} />
            ) : books.length === 0 ? (
                <EmptyState icon="library_books" title="暂无图书" description="书库暂时没有图书，请稍后再来" action={{ label: '返回首页', to: '/' }} />
            ) : (
                <>
                    <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
                        {books.map((book) => (
                            <BookCard key={book.id} book={book} badge="NEW" />
                        ))}
                    </div>
                    {totalPages > 1 && (
                        <div className="flex justify-center items-center gap-2 mt-10">
                            <button onClick={() => setCurrentPage(prev => Math.max(0, prev - 1))} disabled={currentPage === 0} className="px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">上一页</button>
                            <div className="flex gap-1">
                                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                                    let p = totalPages <= 5 ? i : currentPage < 2 ? i : currentPage > totalPages - 3 ? totalPages - 5 + i : currentPage - 2 + i;
                                    return <button key={p} onClick={() => setCurrentPage(p)} className={`w-11 h-11 rounded-lg transition-colors ${currentPage === p ? 'bg-primary text-white' : 'border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800'}`}>{p + 1}</button>;
                                })}
                            </div>
                            <button onClick={() => setCurrentPage(prev => Math.min(totalPages - 1, prev + 1))} disabled={currentPage >= totalPages - 1} className="px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">下一页</button>
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default NewArrivals;
