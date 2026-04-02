import React, { useEffect, useMemo, useState } from 'react';
import api from '../api';
import { message, Modal } from 'antd';
import type { Order } from '../types';
import { TableSkeleton } from '../components/Skeleton';
import { TableEmpty } from '../components/EmptyState';

const statusText: Record<string, string> = {
    PENDING: '待支付',
    PAID: '已支付',
    SHIPPED: '已发货',
    COMPLETED: '已完成',
    CANCELLED: '已取消'
};

const statusStyles: Record<string, string> = {
    PENDING: 'bg-amber-50 text-amber-700',
    PAID: 'bg-blue-50 text-blue-700',
    SHIPPED: 'bg-indigo-50 text-indigo-700',
    COMPLETED: 'bg-emerald-50 text-emerald-700',
    CANCELLED: 'bg-rose-50 text-rose-700'
};

const AdminOrders: React.FC = () => {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState<'all' | 'PENDING' | 'PAID' | 'SHIPPED' | 'COMPLETED' | 'CANCELLED'>('all');
    const [detailOpen, setDetailOpen] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
    const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
    const [batchLoading, setBatchLoading] = useState(false);

    const fetchOrders = async () => {
        setLoading(true);
        try {
            const response = await api.get('/orders', { params: { size: 100 } });
            // API 返回分页数据，需要提取 content 字段
            const data = response.data;
            setOrders(Array.isArray(data.content) ? data.content : (Array.isArray(data) ? data : []));
        } catch (error) {
            console.error('Failed to fetch orders:', error);
            message.error('订单数据加载失败，请刷新页面');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrders();
    }, []);

    const filteredOrders = useMemo(() => {
        return orders.filter(order => {
            const query = searchQuery.trim().toLowerCase();
            if (query) {
                const orderIdMatch = order.id.toString().includes(query);
                const userMatch = order.user?.username?.toLowerCase().includes(query) || order.user?.email?.toLowerCase().includes(query);
                const bookMatch = order.items?.some(item => item.book?.title?.toLowerCase().includes(query) || item.book?.author?.toLowerCase().includes(query)) ?? false;
                if (!orderIdMatch && !userMatch && !bookMatch) return false;
            }
            if (statusFilter === 'all') return true;
            return order.status === statusFilter;
        });
    }, [orders, searchQuery, statusFilter]);

    const counts = useMemo(() => {
        const base = { PENDING: 0, PAID: 0, SHIPPED: 0, COMPLETED: 0, CANCELLED: 0 };
        orders.forEach(order => {
            if (base[order.status as keyof typeof base] !== undefined) {
                base[order.status as keyof typeof base] += 1;
            }
        });
        return base;
    }, [orders]);

    const updateStatus = async (orderId: number, status: string) => {
        try {
            await api.patch(`/orders/${orderId}/status`, undefined, { params: { status } });
            message.success('订单状态已更新');
            fetchOrders();
        } catch (error) {
            console.error('Failed to update order status:', error);
            message.error('订单状态更新失败');
        }
    };

    const cancelOrder = async (orderId: number) => {
        if (!window.confirm('确定要取消该订单吗？')) return;
        updateStatus(orderId, 'CANCELLED');
    };

    const openDetails = (order: Order) => {
        setSelectedOrder(order);
        setDetailOpen(true);
    };

    const closeDetails = () => {
        setDetailOpen(false);
        setSelectedOrder(null);
    };

    // 批量选择相关
    const toggleSelect = (id: number) => {
        setSelectedIds(prev => {
            const next = new Set(prev);
            if (next.has(id)) {
                next.delete(id);
            } else {
                next.add(id);
            }
            return next;
        });
    };

    const toggleSelectAll = () => {
        if (selectedIds.size === filteredOrders.length) {
            setSelectedIds(new Set());
        } else {
            setSelectedIds(new Set(filteredOrders.map(o => o.id)));
        }
    };

    const clearSelection = () => {
        setSelectedIds(new Set());
    };

    // 批量操作
    const batchUpdateStatus = async (status: string) => {
        if (selectedIds.size === 0) {
            message.warning('请先选择订单');
            return;
        }

        const statusMap: Record<string, string> = {
            'PAID': 'PENDING',
            'SHIPPED': 'PAID'
        };

        const validOrders = orders.filter(o => {
            return selectedIds.has(o.id) && o.status === statusMap[status];
        });

        if (validOrders.length === 0) {
            message.warning('没有符合条件的订单');
            return;
        }

        if (!window.confirm(`确定要将 ${validOrders.length} 个订单标记为${status === 'PAID' ? '已支付' : '已发货'}吗？`)) {
            return;
        }

        setBatchLoading(true);
        try {
            const response = await api.post('/orders/batch/status', {
                orderIds: validOrders.map(o => o.id),
                status
            });
            message.success(response.data.message || `成功更新 ${response.data.count} 个订单`);
            clearSelection();
            fetchOrders();
        } catch (error) {
            console.error('Batch update failed:', error);
            message.error('批量操作失败');
        } finally {
            setBatchLoading(false);
        }
    };

    const batchExport = async () => {
        if (selectedIds.size === 0) {
            message.warning('请先选择订单');
            return;
        }

        // 导出选中的订单为CSV
        const selectedOrders = orders.filter(o => selectedIds.has(o.id));
        const csv = ['订单号,用户,金额,状态,下单时间'];
        selectedOrders.forEach(order => {
            csv.push(`${'ORD-' + String(order.id).padStart(6, '0')},${order.user?.username || ''},${Number(order.totalPrice || 0).toFixed(2)},${statusText[order.status] || order.status},${order.createTime ? new Date(order.createTime).toLocaleString() : ''}`);
        });

        const blob = new Blob(['\ufeff' + csv.join('\n')], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'selected_orders.csv';
        link.click();
        URL.revokeObjectURL(url);
        message.success('导出成功');
    };

    const isAllSelected = filteredOrders.length > 0 && selectedIds.size === filteredOrders.length;
    const isIndeterminate = selectedIds.size > 0 && selectedIds.size < filteredOrders.length;

    return (
        <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-6 h-full">
            <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4">
                <div className="relative w-full max-w-md">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 material-symbols-outlined" aria-hidden="true">search</span>
                    <input
                        className="w-full pl-11 pr-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 text-slate-900 dark:text-white shadow-sm transition-shadow"
                        placeholder="搜索订单号、用户或图书..."
                        type="text"
                        aria-label="搜索订单"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                <div className="flex flex-wrap gap-2">
                    {(['all', 'PENDING', 'PAID', 'SHIPPED', 'COMPLETED', 'CANCELLED'] as const).map(status => (
                        <button
                            key={status}
                            onClick={() => setStatusFilter(status)}
                            className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors ${
                                statusFilter === status
                                    ? 'bg-primary text-white border-primary'
                                    : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                            }`}
                        >
                            {status === 'all' ? '全部' : statusText[status]}
                        </button>
                    ))}
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
                    <p className="text-xs text-slate-500 font-medium">待支付</p>
                    <p className="text-lg font-bold text-slate-900 dark:text-white">{counts.PENDING}</p>
                </div>
                <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
                    <p className="text-xs text-slate-500 font-medium">已支付</p>
                    <p className="text-lg font-bold text-slate-900 dark:text-white">{counts.PAID}</p>
                </div>
                <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
                    <p className="text-xs text-slate-500 font-medium">已发货</p>
                    <p className="text-lg font-bold text-slate-900 dark:text-white">{counts.SHIPPED}</p>
                </div>
                <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
                    <p className="text-xs text-slate-500 font-medium">已完成</p>
                    <p className="text-lg font-bold text-slate-900 dark:text-white">{counts.COMPLETED}</p>
                </div>
                <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
                    <p className="text-xs text-slate-500 font-medium">已取消</p>
                    <p className="text-lg font-bold text-slate-900 dark:text-white">{counts.CANCELLED}</p>
                </div>
            </div>

            {/* Batch Operations Toolbar */}
            {selectedIds.size > 0 && (
                <div className="bg-primary/5 dark:bg-primary/10 border border-primary/20 rounded-xl p-4 flex flex-wrap items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                            已选择 <span className="text-primary font-bold">{selectedIds.size}</span> 个订单
                        </span>
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => batchUpdateStatus('PAID')}
                            disabled={batchLoading}
                            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50"
                        >
                            批量支付
                        </button>
                        <button
                            onClick={() => batchUpdateStatus('SHIPPED')}
                            disabled={batchLoading}
                            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50"
                        >
                            批量发货
                        </button>
                        <button
                            onClick={batchExport}
                            disabled={batchLoading}
                            className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50"
                        >
                            批量导出
                        </button>
                        <button
                            onClick={clearSelection}
                            className="px-4 py-2 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300 text-sm font-medium rounded-lg transition-colors"
                        >
                            取消选择
                        </button>
                    </div>
                </div>
            )}

            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm overflow-hidden flex flex-col flex-1">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50/50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-700">
                                <th className="px-4 py-4 w-12">
                                    <input
                                        type="checkbox"
                                        checked={isAllSelected}
                                        ref={el => { if (el) el.indeterminate = isIndeterminate; }}
                                        onChange={toggleSelectAll}
                                        className="w-4 h-4 rounded border-slate-300 text-primary focus:ring-primary cursor-pointer"
                                    />
                                </th>
                                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider w-24">订单号</th>
                                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider min-w-[180px]">用户</th>
                                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">商品</th>
                                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">金额</th>
                                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">状态</th>
                                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">下单时间</th>
                                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">操作</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                            {loading ? (
                                <TableSkeleton rows={5} cols={8} />
                            ) : filteredOrders.length === 0 ? (
                                <TableEmpty colSpan={8} icon="order" title="暂无订单数据" />
                            ) : (
                                filteredOrders.map(order => {
                                    const itemCount = order.items?.reduce((sum, item) => sum + item.quantity, 0) ?? 0;
                                        return (
                                            <tr key={order.id} className={`hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors ${selectedIds.has(order.id) ? 'bg-primary/5' : ''}`}>
                                                <td className="px-4 py-4">
                                                    <input
                                                        type="checkbox"
                                                        checked={selectedIds.has(order.id)}
                                                        onChange={() => toggleSelect(order.id)}
                                                        className="w-4 h-4 rounded border-slate-300 text-primary focus:ring-primary cursor-pointer"
                                                    />
                                                </td>
                                                <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-300">ORD-{order.id.toString().padStart(6, '0')}</td>
                                            <td className="px-6 py-4">
                                                <div className="flex flex-col">
                                                    <span className="text-sm font-semibold text-slate-900 dark:text-white">{order.user?.username || '未知用户'}</span>
                                                    <span className="text-xs text-slate-400">{order.user?.email || '-'}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-300">{itemCount} 件</td>
                                            <td className="px-6 py-4 text-sm font-semibold text-slate-900 dark:text-white">¥{Number(order.totalPrice || 0).toFixed(2)}</td>
                                            <td className="px-6 py-4">
                                                <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${statusStyles[order.status] || 'bg-slate-100 text-slate-600'}`}>
                                                    {statusText[order.status] || order.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-slate-500">{order.createTime ? new Date(order.createTime).toLocaleString() : '-'}</td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <button
                                                        className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 text-slate-700 hover:bg-slate-200"
                                                        onClick={() => openDetails(order)}
                                                    >
                                                        详情
                                                    </button>
                                                    {order.status === 'PENDING' && (
                                                        <>
                                                            <button
                                                                className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-blue-600 text-white hover:bg-blue-700"
                                                                onClick={() => updateStatus(order.id, 'PAID')}
                                                            >
                                                                标记已支付
                                                            </button>
                                                            <button
                                                                className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-rose-500 text-white hover:bg-rose-600"
                                                                onClick={() => cancelOrder(order.id)}
                                                            >
                                                                取消
                                                            </button>
                                                        </>
                                                    )}
                                                    {order.status === 'PAID' && (
                                                        <button
                                                            className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-indigo-600 text-white hover:bg-indigo-700"
                                                            onClick={() => updateStatus(order.id, 'SHIPPED')}
                                                        >
                                                            发货
                                                        </button>
                                                    )}
                                                    {order.status === 'SHIPPED' && (
                                                        <button
                                                            className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-600 text-white hover:bg-emerald-700"
                                                            onClick={() => updateStatus(order.id, 'COMPLETED')}
                                                        >
                                                            完成
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
            <Modal
                title="订单详情"
                open={detailOpen}
                onCancel={closeDetails}
                footer={null}
                width={720}
            >
                {selectedOrder && (
                    <div className="flex flex-col gap-5">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="flex flex-col gap-1">
                                <span className="text-xs text-slate-400">订单号</span>
                                <span className="text-sm font-semibold">ORD-{selectedOrder.id.toString().padStart(6, '0')}</span>
                            </div>
                            <div className="flex flex-col gap-1">
                                <span className="text-xs text-slate-400">下单时间</span>
                                <span className="text-sm">{selectedOrder.createTime ? new Date(selectedOrder.createTime).toLocaleString() : '-'}</span>
                            </div>
                            <div className="flex flex-col gap-1">
                                <span className="text-xs text-slate-400">用户信息</span>
                                <span className="text-sm">{selectedOrder.user?.username || '未知用户'} ({selectedOrder.user?.email || '-'})</span>
                            </div>
                            <div className="flex flex-col gap-1">
                                <span className="text-xs text-slate-400">订单状态</span>
                                <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold w-fit ${statusStyles[selectedOrder.status] || 'bg-slate-100 text-slate-600'}`}>
                                    {statusText[selectedOrder.status] || selectedOrder.status}
                                </span>
                            </div>
                        </div>
                        <div className="border border-slate-200 rounded-lg overflow-hidden">
                            <table className="w-full text-left text-sm">
                                <thead className="bg-slate-50">
                                    <tr>
                                        <th className="px-4 py-3 text-xs font-semibold text-slate-500">图书</th>
                                        <th className="px-4 py-3 text-xs font-semibold text-slate-500">作者</th>
                                        <th className="px-4 py-3 text-xs font-semibold text-slate-500 text-center">数量</th>
                                        <th className="px-4 py-3 text-xs font-semibold text-slate-500 text-right">单价</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {selectedOrder.items?.map(item => (
                                        <tr key={item.id}>
                                            <td className="px-4 py-3">{item.book?.title || '未知图书'}</td>
                                            <td className="px-4 py-3 text-slate-500">{item.book?.author || '-'}</td>
                                            <td className="px-4 py-3 text-center">{item.quantity}</td>
                                            <td className="px-4 py-3 text-right">¥{Number(item.price || 0).toFixed(2)}</td>
                                        </tr>
                                    ))}
                                    {!selectedOrder.items?.length && (
                                        <tr>
                                            <td colSpan={4} className="px-4 py-4 text-center text-slate-400">暂无商品明细</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                        <div className="flex justify-end">
                            <div className="text-sm text-slate-500">合计：</div>
                            <div className="text-lg font-semibold text-slate-900 ml-2">¥{Number(selectedOrder.totalPrice || 0).toFixed(2)}</div>
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    );
};

export default AdminOrders;
