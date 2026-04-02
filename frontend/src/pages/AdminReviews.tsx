import React, { useEffect, useState } from 'react';
import { message, Modal } from 'antd';
import api from '../api';
import StarRating from '../components/StarRating';

interface Review { id: number; user: { username: string }; book: { id: number; title: string }; rating: number; comment: string; createTime: string; }

const AdminReviews: React.FC = () => {
    const [reviews, setReviews] = useState<Review[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    const fetchReviews = async () => {
        setLoading(true);
        try { const res = await api.get('/reviews'); setReviews(res.data || []); }
        catch { message.error('加载评价失败'); }
        finally { setLoading(false); }
    };

    useEffect(() => { fetchReviews(); }, []);

    const handleDelete = (id: number) => {
        Modal.confirm({ title: '确认删除', content: '删除后不可恢复', onOk: async () => {
            try { await api.delete(`/reviews/${id}`); message.success('已删除'); fetchReviews(); }
            catch { message.error('删除失败'); }
        }});
    };

    const filtered = reviews.filter(r => r.user?.username?.includes(searchTerm) || r.book?.title?.includes(searchTerm) || r.comment?.includes(searchTerm));

    return (
        <div className="flex-1 overflow-y-auto p-6">
            <div className="flex items-center justify-between mb-6">
                <div><h2 className="text-xl font-bold text-slate-900 dark:text-white">评价管理</h2><p className="text-sm text-slate-500">共 {reviews.length} 条评价</p></div>
                <input value={searchTerm} onChange={e => setSearchTerm(e.target.value)} placeholder="搜索评价..." aria-label="搜索评价" className="px-3 py-2 text-sm border rounded-lg dark:bg-slate-800 dark:border-slate-700 focus:ring-1 focus:ring-primary w-48" />
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-xl border dark:border-slate-700 overflow-hidden">
                <table className="w-full">
                    <thead className="bg-slate-50 dark:bg-slate-800">
                        <tr>
                            <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">用户</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">图书</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">评分</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">评价</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">时间</th>
                            <th className="px-4 py-3 text-right text-xs font-medium text-slate-500 uppercase">操作</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                        {loading ? <tr><td colSpan={6} className="px-4 py-8 text-center text-slate-400">加载中...</td></tr> : filtered.length === 0 ? <tr><td colSpan={6} className="px-4 py-8 text-center text-slate-400">暂无评价</td></tr> : filtered.map(r => (
                            <tr key={r.id} className="hover:bg-slate-50 dark:hover:bg-slate-800">
                                <td className="px-4 py-3 text-sm font-medium text-slate-900 dark:text-white">{r.user?.username}</td>
                                <td className="px-4 py-3 text-sm text-slate-600 dark:text-slate-300">{r.book?.title}</td>
                                <td className="px-4 py-3"><StarRating rating={r.rating} size="sm" /></td>
                                <td className="px-4 py-3 text-sm text-slate-600 dark:text-slate-300 max-w-xs truncate">{r.comment}</td>
                                <td className="px-4 py-3 text-xs text-slate-500">{r.createTime?.slice(0, 10)}</td>
                                <td className="px-4 py-3 text-right"><button onClick={() => handleDelete(r.id)} className="p-1.5 text-slate-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-slate-700 rounded" aria-label="删除"><span className="material-symbols-outlined text-[18px]" aria-hidden="true">delete</span></button></td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};
export default AdminReviews;
