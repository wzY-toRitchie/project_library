import React, { useEffect, useRef, useState } from 'react';
import api from '../api';
import type { Book, Category } from '../types';
import { message } from 'antd'; // Keeping antd for message toast only
import { BookGridSkeleton } from '../components/Skeleton';
import EmptyState from '../components/EmptyState';

const AdminBooks: React.FC = () => {
    const [books, setBooks] = useState<Book[]>([]);
    const [loading, setLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterMode, setFilterMode] = useState<'all' | 'low' | 'out'>('all');
    const [categories, setCategories] = useState<Category[]>([]);
    const [lowStockThreshold, setLowStockThreshold] = useState(10);
    const [importing, setImporting] = useState(false);
    const [editingBook, setEditingBook] = useState<Book | null>(null);
    const [modalOpen, setModalOpen] = useState(false);
    const [saving, setSaving] = useState(false);
    const [bookForm, setBookForm] = useState({
        title: '',
        author: '',
        price: '',
        stock: '',
        description: '',
        categoryId: '',
        coverImage: ''
    });
    const importInputRef = useRef<HTMLInputElement | null>(null);
    const uploadInputRef = useRef<HTMLInputElement | null>(null);

    useEffect(() => {
        fetchBooks();
        fetchCategories();
        fetchSettings();
    }, []);

    const fetchBooks = async () => {
        setLoading(true);
        try {
            const response = await api.get('/books', { params: { size: 100 } });
            // API 返回分页数据，需要提取 content 字段
            const data = response.data;
            setBooks(data.content || data);
        } catch (error) {
            console.error('Failed to fetch books:', error);
            message.error('图书数据加载失败，请刷新页面');
        } finally {
            setLoading(false);
        }
    };

    const fetchCategories = async () => {
        try {
            const response = await api.get('/categories');
            setCategories(Array.isArray(response.data) ? response.data : []);
        } catch (error) {
            console.error('Failed to fetch categories:', error);
            message.error('获取分类失败');
        }
    };

    const fetchSettings = async () => {
        try {
            const response = await api.get('/settings');
            const threshold = Number(response.data?.lowStockThreshold);
            if (!Number.isNaN(threshold) && threshold > 0) {
                setLowStockThreshold(threshold);
            }
        } catch (error) {
            console.error('Failed to fetch settings:', error);
        }
    };

    const handleDelete = async (id: number) => {
        if (!window.confirm('确定要删除这本书吗？')) return;
        try {
            await api.delete(`/books/${id}`);
            message.success('删除成功');
            fetchBooks();
        } catch {
            message.error('删除失败');
        }
    };

    const openCreate = () => {
        setEditingBook(null);
        setBookForm({
            title: '',
            author: '',
            price: '',
            stock: '',
            description: '',
            categoryId: '',
            coverImage: ''
        });
        setModalOpen(true);
    };

    const openEdit = (book: Book) => {
        setEditingBook(book);
        setBookForm({
            title: book.title || '',
            author: book.author || '',
            price: book.price?.toString() || '',
            stock: book.stock?.toString() || '',
            description: book.description || '',
            categoryId: book.category?.id?.toString() || '',
            coverImage: book.coverImage || ''
        });
        setModalOpen(true);
    };

    const closeModal = () => {
        setModalOpen(false);
        setSaving(false);
    };

    const getApiOrigin = () => {
        try {
            return new URL(api.defaults.baseURL || window.location.origin).origin;
        } catch {
            return window.location.origin;
        }
    };

    const handleUploadCover = async (file: File) => {
        if (!file) return;
        const formData = new FormData();
        formData.append('file', file);
        setSaving(true);
        try {
            const response = await api.post('/uploads/books', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            const url = response.data?.url as string | undefined;
            if (url) {
                const fullUrl = url.startsWith('/') ? `${getApiOrigin()}${url}` : url;
                setBookForm(prev => ({ ...prev, coverImage: fullUrl }));
                message.success('封面上传成功');
            } else {
                message.error('封面上传失败');
            }
        } catch (error) {
            console.error('Failed to upload cover:', error);
            message.error('封面上传失败');
        } finally {
            setSaving(false);
            if (uploadInputRef.current) {
                uploadInputRef.current.value = '';
            }
        }
    };

    const saveBook = async () => {
        const title = bookForm.title.trim();
        const author = bookForm.author.trim();
        const priceValue = Number(bookForm.price);
        const stockValue = Number(bookForm.stock);
        if (!title || !author) {
            message.error('书名和作者不能为空');
            return;
        }
        if (Number.isNaN(priceValue) || priceValue < 0) {
            message.error('价格需为大于等于 0 的数字');
            return;
        }
        if (Number.isNaN(stockValue) || stockValue < 0) {
            message.error('库存需为大于等于 0 的数字');
            return;
        }
        setSaving(true);
        const payload = {
            title,
            author,
            price: priceValue,
            stock: stockValue,
            description: bookForm.description.trim(),
            coverImage: bookForm.coverImage.trim(),
            category: bookForm.categoryId ? { id: Number(bookForm.categoryId) } : null
        };
        try {
            if (editingBook) {
                await api.put(`/books/${editingBook.id}`, payload);
                message.success('图书已更新');
            } else {
                await api.post('/books', payload);
                message.success('图书已新增');
            }
            closeModal();
            fetchBooks();
        } catch (error) {
            console.error('Failed to save book:', error);
            message.error('保存图书失败');
            setSaving(false);
        }
    };

    type ImportRow = Record<string, string | number | null | undefined>;

    const parseCsvLine = (line: string) => {
        const result: string[] = [];
        let current = '';
        let inQuotes = false;
        for (let i = 0; i < line.length; i += 1) {
            const char = line[i];
            if (char === '"' && line[i + 1] === '"') {
                current += '"';
                i += 1;
                continue;
            }
            if (char === '"') {
                inQuotes = !inQuotes;
                continue;
            }
            if (char === ',' && !inQuotes) {
                result.push(current.trim());
                current = '';
                continue;
            }
            current += char;
        }
        result.push(current.trim());
        return result;
    };

    const normalizeImportRow = (row: unknown): ImportRow | null => {
        if (!row || typeof row !== 'object') return null;
        const normalized: ImportRow = {};
        Object.entries(row as Record<string, unknown>).forEach(([key, value]) => {
            if (value === null || value === undefined) {
                normalized[key] = value;
                return;
            }
            if (typeof value === 'string' || typeof value === 'number') {
                normalized[key] = value;
                return;
            }
            normalized[key] = String(value);
        });
        return normalized;
    };

    const toPayload = (row: ImportRow) => {
        const title = String(row.title ?? '').trim();
        const author = String(row.author ?? '').trim();
        const price = Number(row.price);
        const stock = Number(row.stock);
        const description = String(row.description ?? '').trim();
        const coverImage = String(row.coverImage ?? '').trim();
        const categoryId = row.categoryId ? Number(row.categoryId) : undefined;
        const categoryName = row.categoryName ? String(row.categoryName).trim() : '';
        const categoryByName = categoryName ? categories.find(c => c.name === categoryName) : undefined;
        const category = categoryId
            ? { id: categoryId }
            : categoryByName
            ? { id: categoryByName.id }
            : null;
        return {
            id: row.id ? Number(row.id) : undefined,
            title,
            author,
            price: Number.isNaN(price) ? 0 : price,
            stock: Number.isNaN(stock) ? 0 : stock,
            description,
            coverImage,
            category
        };
    };

    const importBooks = async (file: File) => {
        if (!file) return;
        setImporting(true);
        try {
            const text = await file.text();
            let items: ImportRow[] = [];
            if (file.name.toLowerCase().endsWith('.json')) {
                const parsed = JSON.parse(text);
                if (Array.isArray(parsed)) {
                    items = parsed
                        .map(normalizeImportRow)
                        .filter((row): row is ImportRow => Boolean(row));
                }
            } else {
                const lines = text.split(/\r?\n/).filter(line => line.trim());
                if (lines.length > 1) {
                    const headers = parseCsvLine(lines[0]).map(header => header.trim());
                    items = lines.slice(1).map(line => {
                        const values = parseCsvLine(line);
                        const row: ImportRow = {};
                        headers.forEach((header, index) => {
                            row[header] = values[index] ?? '';
                        });
                        return row;
                    });
                }
            }
            if (items.length === 0) {
                message.error('导入文件为空或格式不正确');
                setImporting(false);
                return;
            }

            // 并行处理所有导入请求
            const promises = items.map(async (raw) => {
                const payload = toPayload(raw);
                if (!payload.title || !payload.author) {
                    return { success: false };
                }
                try {
                    if (payload.id) {
                        await api.put(`/books/${payload.id}`, payload);
                    } else {
                        await api.post('/books', payload);
                    }
                    return { success: true };
                } catch {
                    return { success: false };
                }
            });

            const results = await Promise.all(promises);
            const successCount = results.filter(r => r.success).length;
            const failCount = results.filter(r => !r.success).length;
            if (successCount > 0) {
                message.success(`导入完成：成功 ${successCount} 条，失败 ${failCount} 条`);
                fetchBooks();
            } else {
                message.error(`导入失败：失败 ${failCount} 条`);
            }
        } catch (error) {
            console.error('Failed to import books:', error);
            message.error('批量导入失败');
        } finally {
            setImporting(false);
            if (importInputRef.current) {
                importInputRef.current.value = '';
            }
        }
    };

    const filteredBooks = books.filter(book => {
        const matchesQuery =
            book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            book.author.toLowerCase().includes(searchQuery.toLowerCase());
        if (!matchesQuery) return false;
        if (filterMode === 'low') return book.stock > 0 && book.stock <= lowStockThreshold;
        if (filterMode === 'out') return book.stock === 0;
        return true;
    });

    // Calculate stats
    const totalBooks = books.length;
    const inStock = books.filter(b => b.stock > 0).length;
    const lowStock = books.filter(b => b.stock > 0 && b.stock <= lowStockThreshold).length;
    const outOfStock = books.filter(b => b.stock === 0).length;

    return (
        <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-6 h-full">
            {/* Action Bar */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="relative w-full max-w-md">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 material-symbols-outlined">search</span>
                    <input 
                        className="w-full pl-11 pr-4 py-2.5 bg-white dark:bg-[#1a2632] border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 text-slate-900 dark:text-white shadow-sm transition-shadow" 
                        placeholder="搜索书名或作者..." 
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                <div className="flex gap-3">
                    <button
                        className="flex items-center gap-2 px-4 py-2.5 bg-white dark:bg-[#1a2632] border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors shadow-sm"
                        onClick={() => {
                            const next = filterMode === 'all' ? 'low' : filterMode === 'low' ? 'out' : 'all';
                            setFilterMode(next);
                            if (next === 'low') message.info(`已筛选：库存≤${lowStockThreshold}`);
                            else if (next === 'out') message.info('已筛选：已售罄');
                            else message.info('已显示：全部图书');
                        }}
                    >
                        <span className="material-symbols-outlined text-[20px]">filter_list</span>
                        {filterMode === 'all' ? '筛选：全部' : filterMode === 'low' ? `筛选：库存≤${lowStockThreshold}` : '筛选：已售罄'}
                    </button>
                    <button
                        className="flex items-center gap-2 px-4 py-2.5 bg-white dark:bg-[#1a2632] border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors shadow-sm disabled:opacity-60"
                        onClick={() => importInputRef.current?.click()}
                        disabled={importing}
                    >
                        <span className="material-symbols-outlined text-[20px]">upload</span>
                        {importing ? '导入中...' : '批量导入'}
                    </button>
                    <button 
                        className="flex items-center gap-2 px-4 py-2.5 bg-primary hover:bg-blue-600 text-white rounded-lg text-sm font-bold shadow-md shadow-blue-500/20 transition-all active:scale-95"
                        onClick={openCreate}
                    >
                        <span className="material-symbols-outlined text-[20px]">add</span>
                        添加新书
                    </button>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-white dark:bg-[#1a2632] p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center">
                        <span className="material-symbols-outlined fill">library_books</span>
                    </div>
                    <div>
                        <p className="text-xs text-slate-500 font-medium">图书总数</p>
                        <p className="text-lg font-bold text-slate-900 dark:text-white">{totalBooks}</p>
                    </div>
                </div>
                <div className="bg-white dark:bg-[#1a2632] p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center">
                        <span className="material-symbols-outlined fill">check_circle</span>
                    </div>
                    <div>
                        <p className="text-xs text-slate-500 font-medium">库存充足</p>
                        <p className="text-lg font-bold text-slate-900 dark:text-white">{inStock}</p>
                    </div>
                </div>
                <div className="bg-white dark:bg-[#1a2632] p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center">
                        <span className="material-symbols-outlined fill">warning</span>
                    </div>
                    <div>
                        <p className="text-xs text-slate-500 font-medium">库存紧张 (≤{lowStockThreshold})</p>
                        <p className="text-lg font-bold text-slate-900 dark:text-white">{lowStock}</p>
                    </div>
                </div>
                <div className="bg-white dark:bg-[#1a2632] p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center">
                        <span className="material-symbols-outlined fill">error</span>
                    </div>
                    <div>
                        <p className="text-xs text-slate-500 font-medium">已售罄</p>
                        <p className="text-lg font-bold text-slate-900 dark:text-white">{outOfStock}</p>
                    </div>
                </div>
            </div>

            {/* Table Container */}
            <div className="bg-white dark:bg-[#1a2632] border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm overflow-hidden flex flex-col flex-1">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50/50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-700">
                                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider w-20">ID</th>
                                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider w-24">封面</th>
                                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider min-w-[240px]">图书信息</th>
                                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">分类</th>
                                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">价格</th>
                                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">库存</th>
                                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">操作</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                            {loading ? (
                                <tr>
                                    <td colSpan={7} className="px-6 py-8">
                                        <div className="flex justify-center">
                                            <BookGridSkeleton count={4} />
                                        </div>
                                    </td>
                                </tr>
                            ) : filteredBooks.length === 0 ? (
                                <tr>
                                    <td colSpan={7}>
                                        <EmptyState
                                            icon="book"
                                            title="暂无图书数据"
                                            description="还没有添加任何图书，点击上方按钮开始添加"
                                            action={{ label: '添加图书', onClick: () => { setEditingBook(null); setForm({ title: '', author: '', price: '', stock: '', description: '', categoryId: '', coverImage: '' }); setPreviewImage(''); setModalOpen(true); } }}
                                        />
                                    </td>
                                </tr>
                            ) : (
                                filteredBooks.map((book) => (
                                    <tr key={book.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group">
                                        <td className="px-6 py-4 text-sm text-slate-500">{book.id}</td>
                                        <td className="px-6 py-4">
                                            <div className="w-12 h-16 bg-slate-200 rounded overflow-hidden shadow-sm relative">
                                                {book.coverImage ? (
                                                    <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${book.coverImage})` }}></div>
                                                ) : (
                                                    <div className="absolute inset-0 flex items-center justify-center text-xs text-slate-400">无图片</div>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col">
                                                <span className="text-sm font-semibold text-slate-900 dark:text-white group-hover:text-primary transition-colors cursor-pointer">{book.title}</span>
                                                <span className="text-xs text-slate-400 mt-0.5">作者: {book.author}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
                                                {book.category?.name || '未分类'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-sm font-medium text-slate-900 dark:text-white">¥{book.price}</span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <div className={`w-2 h-2 rounded-full ${book.stock > 0 && book.stock <= lowStockThreshold ? 'bg-amber-500' : book.stock === 0 ? 'bg-rose-500' : 'bg-emerald-500'}`}></div>
                                                <span className="text-sm text-slate-600 dark:text-slate-400">
                                                    {book.stock}
                                                    {book.stock > 0 && book.stock <= lowStockThreshold && (
                                                        <span className="text-xs text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded ml-1">紧张</span>
                                                    )}
                                                    {book.stock === 0 && (
                                                        <span className="text-xs text-rose-600 bg-rose-50 px-1.5 py-0.5 rounded ml-1">售罄</span>
                                                    )}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    className="p-1.5 text-slate-500 hover:text-primary hover:bg-blue-50 dark:hover:bg-slate-700 rounded transition-colors"
                                                    title="Edit"
                                                    onClick={() => openEdit(book)}
                                                >
                                                    <span className="material-symbols-outlined text-[20px]">edit</span>
                                                </button>
                                                <button 
                                                    className="p-1.5 text-slate-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-slate-700 rounded transition-colors" 
                                                    title="Delete"
                                                    onClick={() => handleDelete(book.id)}
                                                >
                                                    <span className="material-symbols-outlined text-[20px]">delete</span>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
            <input
                ref={importInputRef}
                type="file"
                accept=".csv,.json"
                className="hidden"
                onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                        importBooks(file);
                    }
                }}
            />
            {modalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
                    <div className="w-full max-w-3xl bg-white dark:bg-[#1a2632] rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700">
                        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-700">
                            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">{editingBook ? '编辑图书' : '新增图书'}</h3>
                            <button
                                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                                onClick={closeModal}
                            >
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>
                        <div className="px-6 py-5 grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="flex flex-col gap-2">
                                <label className="text-sm font-semibold text-slate-700 dark:text-slate-200">书名</label>
                                <input
                                    className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 bg-white dark:bg-[#111827] text-slate-900 dark:text-white"
                                    value={bookForm.title}
                                    onChange={(e) => setBookForm(prev => ({ ...prev, title: e.target.value }))}
                                />
                            </div>
                            <div className="flex flex-col gap-2">
                                <label className="text-sm font-semibold text-slate-700 dark:text-slate-200">作者</label>
                                <input
                                    className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 bg-white dark:bg-[#111827] text-slate-900 dark:text-white"
                                    value={bookForm.author}
                                    onChange={(e) => setBookForm(prev => ({ ...prev, author: e.target.value }))}
                                />
                            </div>
                            <div className="flex flex-col gap-2">
                                <label className="text-sm font-semibold text-slate-700 dark:text-slate-200">价格</label>
                                <input
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 bg-white dark:bg-[#111827] text-slate-900 dark:text-white"
                                    value={bookForm.price}
                                    onChange={(e) => setBookForm(prev => ({ ...prev, price: e.target.value }))}
                                />
                            </div>
                            <div className="flex flex-col gap-2">
                                <label className="text-sm font-semibold text-slate-700 dark:text-slate-200">库存</label>
                                <input
                                    type="number"
                                    min="0"
                                    className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 bg-white dark:bg-[#111827] text-slate-900 dark:text-white"
                                    value={bookForm.stock}
                                    onChange={(e) => setBookForm(prev => ({ ...prev, stock: e.target.value }))}
                                />
                            </div>
                            <div className="flex flex-col gap-2">
                                <label className="text-sm font-semibold text-slate-700 dark:text-slate-200">分类</label>
                                <select
                                    className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 bg-white dark:bg-[#111827] text-slate-900 dark:text-white"
                                    value={bookForm.categoryId}
                                    onChange={(e) => setBookForm(prev => ({ ...prev, categoryId: e.target.value }))}
                                >
                                    <option value="">未分类</option>
                                    {categories.map(category => (
                                        <option key={category.id} value={category.id}>
                                            {category.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="flex flex-col gap-2">
                                <label className="text-sm font-semibold text-slate-700 dark:text-slate-200">封面链接</label>
                                <input
                                    className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 bg-white dark:bg-[#111827] text-slate-900 dark:text-white"
                                    value={bookForm.coverImage}
                                    onChange={(e) => setBookForm(prev => ({ ...prev, coverImage: e.target.value }))}
                                />
                            </div>
                            <div className="flex flex-col gap-2">
                                <label className="text-sm font-semibold text-slate-700 dark:text-slate-200">封面上传</label>
                                <div className="flex items-center gap-3">
                                    <button
                                        className="px-3 py-2 rounded-lg text-sm font-semibold border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800"
                                        onClick={() => uploadInputRef.current?.click()}
                                        disabled={saving}
                                    >
                                        选择图片
                                    </button>
                                    <span className="text-xs text-slate-500">支持 jpg/png/webp</span>
                                </div>
                                {bookForm.coverImage && (
                                    <div className="w-20 h-28 rounded-lg border border-slate-200 dark:border-slate-700 overflow-hidden bg-slate-100">
                                        <img src={bookForm.coverImage} alt="cover" className="w-full h-full object-cover" />
                                    </div>
                                )}
                            </div>
                            <div className="md:col-span-2 flex flex-col gap-2">
                                <label className="text-sm font-semibold text-slate-700 dark:text-slate-200">图书简介</label>
                                <textarea
                                    className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 bg-white dark:bg-[#111827] text-slate-900 dark:text-white min-h-[120px]"
                                    value={bookForm.description}
                                    onChange={(e) => setBookForm(prev => ({ ...prev, description: e.target.value }))}
                                />
                            </div>
                        </div>
                        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-slate-200 dark:border-slate-700">
                            <button
                                className="px-4 py-2 rounded-lg text-sm font-semibold border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800"
                                onClick={closeModal}
                                disabled={saving}
                            >
                                取消
                            </button>
                            <button
                                className="px-4 py-2 rounded-lg text-sm font-semibold bg-primary text-white hover:bg-blue-600 disabled:opacity-60"
                                onClick={saveBook}
                                disabled={saving}
                            >
                                {saving ? '保存中...' : '保存'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
            <input
                ref={uploadInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                        handleUploadCover(file);
                    }
                }}
            />
        </div>
    );
};

export default AdminBooks;
