import React, { useEffect, useMemo, useState } from 'react';
import api from '../api';
import type { Category } from '../types';
import axios from 'axios';
import { message } from 'antd';

const AdminCategories: React.FC = () => {
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [modalOpen, setModalOpen] = useState(false);
    const [saving, setSaving] = useState(false);
    const [editingCategory, setEditingCategory] = useState<Category | null>(null);
    const [formName, setFormName] = useState('');

    useEffect(() => {
        fetchCategories();
    }, []);

    const getErrorMessage = (error: unknown, fallback: string) => {
        if (axios.isAxiosError(error)) {
            const data = error.response?.data;
            if (typeof data === 'string') return data;
            if (typeof data === 'object' && data !== null && 'message' in data) {
                const messageValue = (data as { message?: unknown }).message;
                if (typeof messageValue === 'string') return messageValue;
            }
        }
        if (error instanceof Error && error.message) return error.message;
        return fallback;
    };

    const fetchCategories = async () => {
        setLoading(true);
        try {
            const response = await api.get('/categories');
            setCategories(Array.isArray(response.data) ? response.data : []);
        } catch (error) {
            console.error('Failed to fetch categories:', error);
            message.error('获取分类失败');
        } finally {
            setLoading(false);
        }
    };

    const filteredCategories = useMemo(() => {
        const query = searchQuery.trim().toLowerCase();
        if (!query) return categories;
        return categories.filter(category => category.name?.toLowerCase().includes(query));
    }, [categories, searchQuery]);

    const openCreate = () => {
        setEditingCategory(null);
        setFormName('');
        setModalOpen(true);
    };

    const openEdit = (category: Category) => {
        setEditingCategory(category);
        setFormName(category.name || '');
        setModalOpen(true);
    };

    const closeModal = () => {
        setModalOpen(false);
        setSaving(false);
    };

    const handleSave = async () => {
        if (!formName.trim()) {
            message.warning('请输入分类名称');
            return;
        }
        setSaving(true);
        try {
            if (editingCategory) {
                await api.put(`/categories/${editingCategory.id}`, { name: formName.trim() });
                message.success('分类已更新');
            } else {
                await api.post('/categories', { name: formName.trim() });
                message.success('分类已新增');
            }
            closeModal();
            fetchCategories();
        } catch (error: unknown) {
            message.error(getErrorMessage(error, '保存分类失败'));
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (category: Category) => {
        if (!window.confirm(`确定删除分类「${category.name}」吗？`)) return;
        try {
            await api.delete(`/categories/${category.id}`);
            message.success('删除成功');
            fetchCategories();
        } catch (error: unknown) {
            message.error(getErrorMessage(error, '删除分类失败'));
        }
    };

    return (
        <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-6 h-full">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
                <div>
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white">图书分类管理</h2>
                    <p className="text-sm text-slate-500 dark:text-slate-400">维护前台展示的图书分类列表</p>
                </div>
                <button
                    className="px-4 py-2 rounded-lg bg-primary text-white text-sm font-semibold shadow-md shadow-blue-500/20 hover:bg-blue-600 transition-colors"
                    onClick={openCreate}
                >
                    新增分类
                </button>
            </div>

            <div className="flex flex-col gap-4">
                <div className="relative w-full max-w-md">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 material-symbols-outlined">search</span>
                    <input
                        className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-[#1a2632] border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 text-slate-900 dark:text-white shadow-sm transition-shadow"
                        placeholder="搜索分类名称..."
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
            </div>

            <div className="bg-white dark:bg-[#1a2632] border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm overflow-hidden flex flex-col flex-1">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50/50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-700">
                                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider w-20">ID</th>
                                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">分类名称</th>
                                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">操作</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan={3} className="px-6 py-10 text-center text-slate-500">加载中...</td>
                                </tr>
                            ) : filteredCategories.length === 0 ? (
                                <tr>
                                    <td colSpan={3} className="px-6 py-10 text-center text-slate-500">暂无分类</td>
                                </tr>
                            ) : (
                                filteredCategories.map(category => (
                                    <tr key={category.id} className="border-b border-slate-100 dark:border-slate-800">
                                        <td className="px-6 py-4 text-sm text-slate-500">{category.id}</td>
                                        <td className="px-6 py-4 text-sm font-medium text-slate-900 dark:text-white">{category.name}</td>
                                        <td className="px-6 py-4 text-sm text-right">
                                            <button
                                                className="text-primary hover:underline mr-4"
                                                onClick={() => openEdit(category)}
                                            >
                                                编辑
                                            </button>
                                            <button
                                                className="text-rose-500 hover:underline"
                                                onClick={() => handleDelete(category)}
                                            >
                                                删除
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {modalOpen && (
                <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4">
                    <div className="bg-white dark:bg-[#1a2632] rounded-xl shadow-lg p-6 w-full max-w-md border border-slate-200 dark:border-slate-700">
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">
                            {editingCategory ? '编辑分类' : '新增分类'}
                        </h3>
                        <div className="flex flex-col gap-2 mb-6">
                            <label className="text-sm font-semibold text-slate-700 dark:text-slate-200">分类名称</label>
                            <input
                                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-[#111418] border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 text-slate-900 dark:text-white"
                                value={formName}
                                onChange={(e) => setFormName(e.target.value)}
                            />
                        </div>
                        <div className="flex justify-end gap-3">
                            <button
                                className="px-4 py-2 rounded-lg bg-slate-100 dark:bg-[#111418] text-slate-600 dark:text-slate-300 text-sm font-semibold hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                                onClick={closeModal}
                                disabled={saving}
                            >
                                取消
                            </button>
                            <button
                                className="px-4 py-2 rounded-lg bg-primary text-white text-sm font-semibold shadow-md shadow-blue-500/20 hover:bg-blue-600 transition-colors disabled:opacity-60"
                                onClick={handleSave}
                                disabled={saving}
                            >
                                保存
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminCategories;
