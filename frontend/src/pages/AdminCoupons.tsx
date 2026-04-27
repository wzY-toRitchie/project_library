import React, { useCallback, useEffect, useState } from 'react';
import { message, Modal } from 'antd';
import { getAllCoupons, createCoupon, updateCoupon, deleteCoupon } from '../api/coupons';
import type { Coupon } from '../types';

interface CouponForm {
    name: string;
    code: string;
    type: Coupon['type'];
    value: string;
    minAmount: string;
    totalCount: string;
    startTime: string;
    endTime: string;
    status: string;
    enablePointsRedeem: boolean;
    pointsCost: string;
    maxDailyRedeem: string;
}

const emptyForm: CouponForm = {
    name: '',
    code: '',
    type: 'FULL_REDUCE',
    value: '',
    minAmount: '0',
    totalCount: '100',
    startTime: '',
    endTime: '',
    status: 'ACTIVE',
    enablePointsRedeem: false,
    pointsCost: '',
    maxDailyRedeem: '1',
};

const getErrorMessage = (error: unknown, fallback: string) => {
    const data = (error as { response?: { data?: unknown } })?.response?.data;
    if (typeof data === 'string') return data;
    if (data && typeof data === 'object' && 'message' in data) {
        return String((data as { message?: unknown }).message || fallback);
    }
    return fallback;
};

const toInputDateTime = (value?: string) => (value ? value.slice(0, 16) : '');
const defaultStart = () => new Date().toISOString().slice(0, 16);
const defaultEnd = () => new Date(Date.now() + 90 * 86400000).toISOString().slice(0, 16);
const formatMoney = (value?: number) => `¥${Number(value || 0).toFixed(2)}`;

const statusLabel = (status: string) => {
    if (status === 'ACTIVE') return '生效中';
    if (status === 'EXPIRED') return '已过期';
    return '已禁用';
};

const statusColor = (status: string) => {
    if (status === 'ACTIVE') return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300';
    if (status === 'EXPIRED') return 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-300';
    return 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-300';
};

const typeLabel = (type: string) => {
    if (type === 'FULL_REDUCE') return '满减';
    if (type === 'DISCOUNT') return '折扣';
    return '包邮';
};

const couponValue = (coupon: Coupon) => {
    if (coupon.type === 'DISCOUNT') return `${(Number(coupon.value) * 10).toFixed(1).replace(/\.0$/, '')}折`;
    if (coupon.type === 'FREE_SHIPPING') return '包邮';
    return formatMoney(coupon.value);
};

const AdminCoupons: React.FC = () => {
    const [coupons, setCoupons] = useState<Coupon[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [editing, setEditing] = useState<Coupon | null>(null);
    const [form, setForm] = useState<CouponForm>(emptyForm);

    const fetchCoupons = useCallback(async () => {
        setLoading(true);
        try {
            setCoupons(await getAllCoupons());
        } catch (error) {
            message.error(getErrorMessage(error, '加载优惠券失败'));
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchCoupons();
    }, [fetchCoupons]);

    const openCreate = () => {
        setEditing(null);
        setForm({ ...emptyForm, startTime: defaultStart(), endTime: defaultEnd() });
        setShowModal(true);
    };

    const openEdit = (coupon: Coupon) => {
        const pointsRule = coupon.pointsRule;
        setEditing(coupon);
        setForm({
            name: coupon.name,
            code: coupon.code,
            type: coupon.type,
            value: String(coupon.value),
            minAmount: String(coupon.minAmount || 0),
            totalCount: String(coupon.totalCount),
            startTime: toInputDateTime(coupon.startTime),
            endTime: toInputDateTime(coupon.endTime),
            status: coupon.status,
            enablePointsRedeem: Boolean(pointsRule),
            pointsCost: pointsRule ? String(pointsRule.pointsCost) : '',
            maxDailyRedeem: pointsRule ? String(pointsRule.maxDailyRedeem || 1) : '1',
        });
        setShowModal(true);
    };

    const handleSave = async () => {
        if (!form.name.trim()) {
            message.error('请输入优惠券名称');
            return;
        }
        if (form.type !== 'FREE_SHIPPING' && (!form.value || Number(form.value) <= 0)) {
            message.error('请输入有效面值');
            return;
        }
        if (form.enablePointsRedeem && (!form.pointsCost || Number(form.pointsCost) <= 0)) {
            message.error('请输入有效积分价格');
            return;
        }

        setSaving(true);
        const payload = {
            name: form.name.trim(),
            code: form.code.trim() || undefined,
            type: form.type,
            value: form.type === 'FREE_SHIPPING' ? 0 : Number(form.value),
            minAmount: Number(form.minAmount) || 0,
            totalCount: Number(form.totalCount) || 100,
            startTime: form.startTime ? new Date(form.startTime).toISOString() : new Date().toISOString(),
            endTime: form.endTime ? new Date(form.endTime).toISOString() : new Date(Date.now() + 90 * 86400000).toISOString(),
            status: form.status,
            pointsRule: form.enablePointsRedeem
                ? {
                    pointsCost: Number(form.pointsCost),
                    maxDailyRedeem: Number(form.maxDailyRedeem) || 1,
                }
                : null,
        };

        try {
            if (editing) {
                await updateCoupon(editing.id, payload);
                message.success('优惠券已更新');
            } else {
                await createCoupon(payload);
                message.success('优惠券已创建');
            }
            setShowModal(false);
            await fetchCoupons();
        } catch (error) {
            message.error(getErrorMessage(error, '保存失败'));
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = (id: number) => {
        Modal.confirm({
            title: '确认删除',
            content: '删除后不可恢复，已领取的用户券也可能受影响。',
            okText: '删除',
            cancelText: '取消',
            okButtonProps: { danger: true },
            onOk: async () => {
                try {
                    await deleteCoupon(id);
                    message.success('已删除');
                    await fetchCoupons();
                } catch (error) {
                    message.error(getErrorMessage(error, '删除失败'));
                }
            },
        });
    };

    const filtered = coupons.filter(coupon => {
        const keyword = searchTerm.trim().toLowerCase();
        if (!keyword) return true;
        return coupon.name.toLowerCase().includes(keyword) || coupon.code.toLowerCase().includes(keyword);
    });

    return (
        <div className="flex-1 overflow-y-auto p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                <div>
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white">优惠券管理</h2>
                    <p className="text-sm text-slate-500">共 {coupons.length} 张优惠券，{coupons.filter(c => c.pointsRule).length} 张支持积分兑换</p>
                </div>
                <div className="flex items-center gap-3">
                    <input
                        value={searchTerm}
                        onChange={event => setSearchTerm(event.target.value)}
                        placeholder="搜索优惠券"
                        aria-label="搜索优惠券"
                        className="px-3 py-2 text-sm border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 focus:ring-1 focus:ring-primary focus:border-primary w-48"
                    />
                    <button onClick={openCreate} className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-bold hover:bg-blue-600 transition-colors">
                        新建优惠券
                    </button>
                </div>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
                <table className="w-full">
                    <thead className="bg-slate-50 dark:bg-slate-800">
                        <tr>
                            <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">名称</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">类型</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">面值</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">发放</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">积分兑换</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">有效期</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">状态</th>
                            <th className="px-4 py-3 text-right text-xs font-medium text-slate-500 uppercase">操作</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                        {loading ? (
                            <tr><td colSpan={8} className="px-4 py-8 text-center text-slate-400">加载中...</td></tr>
                        ) : filtered.length === 0 ? (
                            <tr><td colSpan={8} className="px-4 py-8 text-center text-slate-400">暂无优惠券</td></tr>
                        ) : filtered.map(coupon => (
                            <tr key={coupon.id} className="hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                                <td className="px-4 py-3">
                                    <div className="text-sm font-medium text-slate-900 dark:text-white">{coupon.name}</div>
                                    <div className="text-xs text-slate-400">{coupon.code}</div>
                                </td>
                                <td className="px-4 py-3 text-sm text-slate-600 dark:text-slate-300">{typeLabel(coupon.type)}</td>
                                <td className="px-4 py-3 text-sm font-bold text-primary">
                                    {couponValue(coupon)}
                                    {Number(coupon.minAmount || 0) > 0 && <span className="text-xs text-slate-400 ml-1">满 {formatMoney(coupon.minAmount)}</span>}
                                </td>
                                <td className="px-4 py-3 text-sm text-slate-600 dark:text-slate-300">{coupon.usedCount} / {coupon.totalCount}</td>
                                <td className="px-4 py-3 text-sm text-slate-600 dark:text-slate-300">
                                    {coupon.pointsRule ? (
                                        <div>
                                            <div className="font-semibold text-red-500">{coupon.pointsRule.pointsCost} 积分</div>
                                            <div className="text-xs text-slate-400">每日 {coupon.pointsRule.maxDailyRedeem} 张</div>
                                        </div>
                                    ) : (
                                        <span className="text-slate-400">未开启</span>
                                    )}
                                </td>
                                <td className="px-4 py-3 text-xs text-slate-500">{coupon.startTime?.slice(0, 10)} ~ {coupon.endTime?.slice(0, 10)}</td>
                                <td className="px-4 py-3"><span className={`px-2 py-1 rounded text-xs font-medium ${statusColor(coupon.status)}`}>{statusLabel(coupon.status)}</span></td>
                                <td className="px-4 py-3 text-right">
                                    <div className="flex items-center justify-end gap-2">
                                        <button onClick={() => openEdit(coupon)} className="p-1.5 text-slate-500 hover:text-primary hover:bg-blue-50 dark:hover:bg-slate-700 rounded" title="编辑" aria-label="编辑">
                                            <span className="material-symbols-outlined text-[18px]" aria-hidden="true">edit</span>
                                        </button>
                                        <button onClick={() => handleDelete(coupon.id)} className="p-1.5 text-slate-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-slate-700 rounded" title="删除" aria-label="删除">
                                            <span className="material-symbols-outlined text-[18px]" aria-hidden="true">delete</span>
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {showModal && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center" onClick={() => setShowModal(false)}>
                    <div className="bg-white dark:bg-slate-900 rounded-xl w-full max-w-lg mx-4 shadow-2xl max-h-[90vh] overflow-y-auto" onClick={event => event.stopPropagation()}>
                        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-700">
                            <h3 className="text-lg font-bold text-slate-900 dark:text-white">{editing ? '编辑优惠券' : '新建优惠券'}</h3>
                        </div>
                        <div className="p-6 grid grid-cols-2 gap-4">
                            <div className="col-span-2">
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">名称</label>
                                <input value={form.name} onChange={event => setForm(prev => ({ ...prev, name: event.target.value }))} className="w-full px-3 py-2 border rounded-lg dark:bg-slate-800 dark:border-slate-700 focus:ring-1 focus:ring-primary focus:border-primary" placeholder="例如：新用户专享" />
                            </div>
                            <div className="col-span-2">
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">券码</label>
                                <input value={form.code} onChange={event => setForm(prev => ({ ...prev, code: event.target.value }))} className="w-full px-3 py-2 border rounded-lg dark:bg-slate-800 dark:border-slate-700 focus:ring-1 focus:ring-primary focus:border-primary" placeholder="留空自动生成" disabled={Boolean(editing)} />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">类型</label>
                                <select value={form.type} onChange={event => setForm(prev => ({ ...prev, type: event.target.value as Coupon['type'] }))} className="w-full px-3 py-2 border rounded-lg dark:bg-slate-800 dark:border-slate-700 focus:ring-1 focus:ring-primary focus:border-primary">
                                    <option value="FULL_REDUCE">满减</option>
                                    <option value="DISCOUNT">折扣</option>
                                    <option value="FREE_SHIPPING">包邮</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">{form.type === 'DISCOUNT' ? '折扣率 (0-1)' : '面值 (元)'}</label>
                                <input type="number" step="0.01" value={form.value} onChange={event => setForm(prev => ({ ...prev, value: event.target.value }))} className="w-full px-3 py-2 border rounded-lg dark:bg-slate-800 dark:border-slate-700 focus:ring-1 focus:ring-primary focus:border-primary" disabled={form.type === 'FREE_SHIPPING'} />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">最低消费 (元)</label>
                                <input type="number" value={form.minAmount} onChange={event => setForm(prev => ({ ...prev, minAmount: event.target.value }))} className="w-full px-3 py-2 border rounded-lg dark:bg-slate-800 dark:border-slate-700 focus:ring-1 focus:ring-primary focus:border-primary" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">总数量</label>
                                <input type="number" value={form.totalCount} onChange={event => setForm(prev => ({ ...prev, totalCount: event.target.value }))} className="w-full px-3 py-2 border rounded-lg dark:bg-slate-800 dark:border-slate-700 focus:ring-1 focus:ring-primary focus:border-primary" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">生效时间</label>
                                <input type="datetime-local" value={form.startTime} onChange={event => setForm(prev => ({ ...prev, startTime: event.target.value }))} className="w-full px-3 py-2 border rounded-lg dark:bg-slate-800 dark:border-slate-700 focus:ring-1 focus:ring-primary focus:border-primary" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">过期时间</label>
                                <input type="datetime-local" value={form.endTime} onChange={event => setForm(prev => ({ ...prev, endTime: event.target.value }))} className="w-full px-3 py-2 border rounded-lg dark:bg-slate-800 dark:border-slate-700 focus:ring-1 focus:ring-primary focus:border-primary" />
                            </div>
                            <div className="col-span-2">
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">状态</label>
                                <select value={form.status} onChange={event => setForm(prev => ({ ...prev, status: event.target.value }))} className="w-full px-3 py-2 border rounded-lg dark:bg-slate-800 dark:border-slate-700 focus:ring-1 focus:ring-primary focus:border-primary">
                                    <option value="ACTIVE">生效中</option>
                                    <option value="DISABLED">已禁用</option>
                                    <option value="EXPIRED">已过期</option>
                                </select>
                            </div>

                            <div className="col-span-2 mt-2 border-t border-slate-200 dark:border-slate-700 pt-4">
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={form.enablePointsRedeem}
                                        onChange={event => setForm(prev => ({ ...prev, enablePointsRedeem: event.target.checked }))}
                                        className="rounded border-slate-300 text-primary focus:ring-primary"
                                    />
                                    <span className="text-sm font-medium text-slate-700 dark:text-slate-300">启用积分兑换</span>
                                </label>
                            </div>
                            {form.enablePointsRedeem && (
                                <>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">积分价格</label>
                                        <input type="number" value={form.pointsCost} onChange={event => setForm(prev => ({ ...prev, pointsCost: event.target.value }))} className="w-full px-3 py-2 border rounded-lg dark:bg-slate-800 dark:border-slate-700 focus:ring-1 focus:ring-primary focus:border-primary" placeholder="需要多少积分兑换" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">每日兑换上限</label>
                                        <input type="number" value={form.maxDailyRedeem} onChange={event => setForm(prev => ({ ...prev, maxDailyRedeem: event.target.value }))} className="w-full px-3 py-2 border rounded-lg dark:bg-slate-800 dark:border-slate-700 focus:ring-1 focus:ring-primary focus:border-primary" />
                                    </div>
                                </>
                            )}
                        </div>
                        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-slate-200 dark:border-slate-700">
                            <button onClick={() => setShowModal(false)} className="px-4 py-2 rounded-lg text-sm font-semibold border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800">取消</button>
                            <button onClick={handleSave} disabled={saving} className="px-4 py-2 rounded-lg text-sm font-semibold bg-primary text-white hover:bg-blue-600 disabled:opacity-60">{saving ? '保存中...' : '保存'}</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminCoupons;
