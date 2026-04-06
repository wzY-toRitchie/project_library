import React, { useEffect, useState, useCallback } from 'react';
import { message, Modal } from 'antd';
import api from '../api';
import { getAllCoupons, createCoupon, updateCoupon, deleteCoupon } from '../api/coupons';
import type { Coupon } from '../types';

interface CouponForm {
    name: string;
    code: string;
    type: string;
    value: string;
    minAmount: string;
    totalCount: string;
    startTime: string;
    endTime: string;
    status: string;
    // 积分兑换规则
    enablePointsRedeem: boolean;
    pointsCost: string;
    maxDailyRedeem: string;
}

const emptyForm: CouponForm = {
    name: '', code: '', type: 'FULL_REDUCE', value: '', minAmount: '0',
    totalCount: '100', startTime: '', endTime: '', status: 'ACTIVE',
    enablePointsRedeem: false, pointsCost: '', maxDailyRedeem: '1',
};

const AdminCoupons: React.FC = () => {
    const [coupons, setCoupons] = useState<Coupon[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [editing, setEditing] = useState<Coupon | null>(null);
    const [form, setForm] = useState<CouponForm>(emptyForm);
    const [pointsRule, setPointsRule] = useState<{ pointsCost: number } | null>(null);

    const fetchCoupons = useCallback(async () => {
        setLoading(true);
        try {
            const data = await getAllCoupons();
            setCoupons(data);
        } catch { message.error('加载优惠券失败'); }
        finally { setLoading(false); }
    }, []);

    useEffect(() => { fetchCoupons(); }, [fetchCoupons]);

    const openCreate = () => {
        setEditing(null);
        setForm({ ...emptyForm, startTime: new Date().toISOString().slice(0, 16), endTime: new Date(Date.now() + 90 * 86400000).toISOString().slice(0, 16) });
        setPointsRule(null);
        setShowModal(true);
    };

    const openEdit = (c: Coupon) => {
        setEditing(c);
        setForm({
            name: c.name, code: c.code, type: c.type, value: String(c.value),
            minAmount: String(c.minAmount || 0), totalCount: String(c.totalCount),
            startTime: c.startTime?.slice(0, 16) || '', endTime: c.endTime?.slice(0, 16) || '', status: c.status,
            enablePointsRedeem: false, pointsCost: '', maxDailyRedeem: '1',
        });
        setPointsRule(null);
        // 加载积分规则
        api.get(`/coupons/${c.id}`).then(res => {
            if (res.data.pointsRule) {
                setPointsRule(res.data.pointsRule);
                setForm(prev => ({
                    ...prev,
                    enablePointsRedeem: true,
                    pointsCost: String(res.data.pointsRule.pointsCost),
                    maxDailyRedeem: String(res.data.pointsRule.maxDailyRedeem || 1),
                }));
            }
        }).catch(() => {});
        setShowModal(true);
    };

    const handleSave = async () => {
        if (!form.name || !form.value) { message.error('名称和面值不能为空'); return; }
        setSaving(true);

        const payload: Record<string, unknown> = {
            name: form.name, code: form.code || undefined, type: form.type,
            value: Number(form.value), minAmount: Number(form.minAmount) || 0,
            totalCount: Number(form.totalCount) || 100,
            startTime: form.startTime ? new Date(form.startTime).toISOString() : new Date().toISOString(),
            endTime: form.endTime ? new Date(form.endTime).toISOString() : new Date(Date.now() + 90 * 86400000).toISOString(),
            status: form.status,
        };

        if (form.enablePointsRedeem && form.pointsCost && Number(form.pointsCost) > 0) {
            payload.pointsRule = {
                pointsCost: Number(form.pointsCost),
                maxDailyRedeem: Number(form.maxDailyRedeem) || 1,
            };
        }

        try {
            if (editing) {
                await updateCoupon(editing.id, payload as any);
                message.success('优惠券已更新');
            } else {
                await createCoupon(payload as any);
                message.success('优惠券已创建');
            }
            setShowModal(false);
            fetchCoupons();
        } catch { message.error('保存失败'); }
        finally { setSaving(false); }
    };

    const handleDelete = (id: number) => {
        Modal.confirm({ title: '确认删除', content: '删除后不可恢复，确定吗？', onOk: async () => {
            await deleteCoupon(id); message.success('已删除'); fetchCoupons();
        }});
    };

    const filtered = coupons.filter(c => c.name.includes(searchTerm) || c.code.includes(searchTerm));
    const statusLabel = (s: string) => s === 'ACTIVE' ? '生效中' : s === 'EXPIRED' ? '已过期' : '已禁用';
    const statusColor = (s: string) => s === 'ACTIVE' ? 'bg-emerald-100 text-emerald-700' : s === 'EXPIRED' ? 'bg-slate-100 text-slate-500' : 'bg-red-100 text-red-600';
    const typeLabel = (t: string) => t === 'FULL_REDUCE' ? '满减' : t === 'DISCOUNT' ? '折扣' : '免邮';

    return (
        <div className="flex-1 overflow-y-auto p-6">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white">优惠券管理</h2>
                    <p className="text-sm text-slate-500">共 {coupons.length} 张优惠券</p>
                </div>
                <div className="flex items-center gap-3">
                    <input value={searchTerm} onChange={e => setSearchTerm(e.target.value)} placeholder="搜索优惠券…" aria-label="搜索优惠券" className="px-3 py-2 text-sm border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 focus:ring-1 focus:ring-primary focus:border-primary w-48" />
                    <button onClick={openCreate} className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-bold hover:bg-blue-600 transition-colors">+ 新建优惠券</button>
                </div>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
                <table className="w-full">
                    <thead className="bg-slate-50 dark:bg-slate-800">
                        <tr>
                            <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">名称</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">类型</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">面值</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">使用量</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">有效期</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">状态</th>
                            <th className="px-4 py-3 text-right text-xs font-medium text-slate-500 uppercase">操作</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                        {loading ? (
                            <tr><td colSpan={7} className="px-4 py-8 text-center text-slate-400">加载中…</td></tr>
                        ) : filtered.length === 0 ? (
                            <tr><td colSpan={7} className="px-4 py-8 text-center text-slate-400">暂无优惠券</td></tr>
                        ) : filtered.map(c => (
                            <tr key={c.id} className="hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                                <td className="px-4 py-3 text-sm font-medium text-slate-900 dark:text-white">{c.name}</td>
                                <td className="px-4 py-3 text-sm text-slate-600 dark:text-slate-300">{typeLabel(c.type)}</td>
                                <td className="px-4 py-3 text-sm font-bold text-primary">
                                    {c.type === 'DISCOUNT' ? `${(Number(c.value) * 10).toFixed(0)}折` : `¥${c.value}`}
                                    {c.minAmount > 0 && <span className="text-xs text-slate-400 ml-1">满{c.minAmount}</span>}
                                </td>
                                <td className="px-4 py-3 text-sm text-slate-600 dark:text-slate-300">{c.usedCount} / {c.totalCount}</td>
                                <td className="px-4 py-3 text-xs text-slate-500">{c.startTime?.slice(0, 10)} ~ {c.endTime?.slice(0, 10)}</td>
                                <td className="px-4 py-3"><span className={`px-2 py-1 rounded text-xs font-medium ${statusColor(c.status)}`}>{statusLabel(c.status)}</span></td>
                                <td className="px-4 py-3 text-right">
                                    <div className="flex items-center justify-end gap-2">
                                        <button onClick={() => openEdit(c)} className="p-1.5 text-slate-500 hover:text-primary hover:bg-blue-50 dark:hover:bg-slate-700 rounded" title="编辑" aria-label="编辑"><span className="material-symbols-outlined text-[18px]" aria-hidden="true">edit</span></button>
                                        <button onClick={() => handleDelete(c.id)} className="p-1.5 text-slate-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-slate-700 rounded" title="删除" aria-label="删除"><span className="material-symbols-outlined text-[18px]" aria-hidden="true">delete</span></button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Create/Edit Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center" onClick={() => setShowModal(false)}>
                    <div className="bg-white dark:bg-slate-900 rounded-xl w-full max-w-lg mx-4 shadow-2xl max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
                        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-700">
                            <h3 className="text-lg font-bold text-slate-900 dark:text-white">{editing ? '编辑优惠券' : '新建优惠券'}</h3>
                        </div>
                        <div className="p-6 grid grid-cols-2 gap-4">
                            <div className="col-span-2">
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">名称</label>
                                <input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} className="w-full px-3 py-2 border rounded-lg dark:bg-slate-800 dark:border-slate-700 focus:ring-1 focus:ring-primary focus:border-primary" placeholder="例如：新用户专享" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">类型</label>
                                <select value={form.type} onChange={e => setForm(p => ({ ...p, type: e.target.value }))} className="w-full px-3 py-2 border rounded-lg dark:bg-slate-800 dark:border-slate-700 focus:ring-1 focus:ring-primary focus:border-primary">
                                    <option value="FULL_REDUCE">满减</option>
                                    <option value="DISCOUNT">折扣</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">{form.type === 'DISCOUNT' ? '折扣率 (0-1)' : '面值 (元)'}</label>
                                <input type="number" step="0.01" value={form.value} onChange={e => setForm(p => ({ ...p, value: e.target.value }))} className="w-full px-3 py-2 border rounded-lg dark:bg-slate-800 dark:border-slate-700 focus:ring-1 focus:ring-primary focus:border-primary" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">最低消费 (元)</label>
                                <input type="number" value={form.minAmount} onChange={e => setForm(p => ({ ...p, minAmount: e.target.value }))} className="w-full px-3 py-2 border rounded-lg dark:bg-slate-800 dark:border-slate-700 focus:ring-1 focus:ring-primary focus:border-primary" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">总数量</label>
                                <input type="number" value={form.totalCount} onChange={e => setForm(p => ({ ...p, totalCount: e.target.value }))} className="w-full px-3 py-2 border rounded-lg dark:bg-slate-800 dark:border-slate-700 focus:ring-1 focus:ring-primary focus:border-primary" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">生效时间</label>
                                <input type="datetime-local" value={form.startTime} onChange={e => setForm(p => ({ ...p, startTime: e.target.value }))} className="w-full px-3 py-2 border rounded-lg dark:bg-slate-800 dark:border-slate-700 focus:ring-1 focus:ring-primary focus:border-primary" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">过期时间</label>
                                <input type="datetime-local" value={form.endTime} onChange={e => setForm(p => ({ ...p, endTime: e.target.value }))} className="w-full px-3 py-2 border rounded-lg dark:bg-slate-800 dark:border-slate-700 focus:ring-1 focus:ring-primary focus:border-primary" />
                            </div>

                            {/* 积分兑换规则 */}
                            <div className="col-span-2 mt-2 border-t border-slate-200 dark:border-slate-700 pt-4">
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={form.enablePointsRedeem}
                                        onChange={e => setForm(p => ({ ...p, enablePointsRedeem: e.target.checked }))}
                                        className="rounded border-slate-300 text-primary focus:ring-primary"
                                    />
                                    <span className="text-sm font-medium text-slate-700 dark:text-slate-300">启用积分兑换</span>
                                </label>
                            </div>
                            {form.enablePointsRedeem && (
                                <>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">积分价格</label>
                                        <input type="number" value={form.pointsCost} onChange={e => setForm(p => ({ ...p, pointsCost: e.target.value }))} className="w-full px-3 py-2 border rounded-lg dark:bg-slate-800 dark:border-slate-700 focus:ring-1 focus:ring-primary focus:border-primary" placeholder="需要多少积分兑换" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">每日兑换限制</label>
                                        <input type="number" value={form.maxDailyRedeem} onChange={e => setForm(p => ({ ...p, maxDailyRedeem: e.target.value }))} className="w-full px-3 py-2 border rounded-lg dark:bg-slate-800 dark:border-slate-700 focus:ring-1 focus:ring-primary focus:border-primary" />
                                    </div>
                                </>
                            )}
                        </div>
                        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-slate-200 dark:border-slate-700">
                            <button onClick={() => setShowModal(false)} className="px-4 py-2 rounded-lg text-sm font-semibold border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800">取消</button>
                            <button onClick={handleSave} disabled={saving} className="px-4 py-2 rounded-lg text-sm font-semibold bg-primary text-white hover:bg-blue-600 disabled:opacity-60">{saving ? '保存中…' : '保存'}</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminCoupons;
