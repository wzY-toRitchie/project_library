import React, { useEffect, useState, useCallback } from 'react';
import { message } from 'antd';
import { getRuleSettings, updateRuleSetting } from '../api/points';
import type { PointsRuleResponse } from '../types';

const ruleDescriptions: Record<string, string> = {
    REGISTER_POINTS: '注册奖励积分',
    REVIEW_POINTS: '评价奖励积分',
    SIGN_IN_POINTS: '每日签到奖励积分',
    PURCHASE_RATE: '消费返积分比例 (乘以100后整数，如10=10%)',
    DEDUCT_RATE: '积分抵扣比例 (X积分=1元)',
};

const AdminPointsRules: React.FC = () => {
    const [rules, setRules] = useState<PointsRuleResponse[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState<string | null>(null);
    const [editingValue, setEditingValue] = useState<Record<string, string>>({});

    const fetchRules = useCallback(async () => {
        setLoading(true);
        try {
            const data = await getRuleSettings();
            setRules(data);
        } catch {
            message.error('加载积分规则失败');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { fetchRules(); }, [fetchRules]);

    const handleSave = async (ruleKey: string) => {
        const value = parseInt(editingValue[ruleKey]);
        if (isNaN(value) || value < 0) {
            message.error('请输入有效的正整数');
            return;
        }
        setSaving(ruleKey);
        try {
            await updateRuleSetting(ruleKey, value);
            message.success('规则已更新');
            fetchRules();
        } catch {
            message.error('保存失败');
        } finally {
            setSaving(null);
        }
    };

    const labelFromKey = (key: string) => {
        return key.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
    };

    return (
        <div className="flex-1 overflow-y-auto p-6">
            <div className="mb-6">
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">积分规则管理</h2>
                <p className="text-sm text-slate-500">调整系统全局积分规则参数</p>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
                <table className="w-full">
                    <thead className="bg-slate-50 dark:bg-slate-800">
                        <tr>
                            <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">规则名称</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">描述</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">当前值</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">更新时间</th>
                            <th className="px-4 py-3 text-right text-xs font-medium text-slate-500 uppercase">操作</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                        {loading ? (
                            <tr><td colSpan={5} className="px-4 py-8 text-center text-slate-400">加载中…</td></tr>
                        ) : rules.length === 0 ? (
                            <tr><td colSpan={5} className="px-4 py-8 text-center text-slate-400">暂无规则，请确保已初始化</td></tr>
                        ) : rules.map(r => (
                            <tr key={r.ruleKey} className="hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                                <td className="px-4 py-3 text-sm font-medium text-slate-900 dark:text-white">{labelFromKey(r.ruleKey)}</td>
                                <td className="px-4 py-3 text-sm text-slate-500">{r.description || ruleDescriptions[r.ruleKey] || '-'}</td>
                                <td className="px-4 py-3 text-sm">
                                    <input
                                        type="number"
                                        min="0"
                                        value={editingValue[r.ruleKey] ?? r.ruleValue}
                                        onChange={e => setEditingValue(prev => ({ ...prev, [r.ruleKey]: e.target.value }))}
                                        className="w-24 px-2 py-1 text-sm border rounded dark:bg-slate-800 dark:border-slate-700 focus:ring-1 focus:ring-primary focus:border-primary"
                                    />
                                </td>
                                <td className="px-4 py-3 text-xs text-slate-400">{r.updateTime ? new Date(r.updateTime).toLocaleString('zh-CN') : r.updater ? r.updater : '-'}</td>
                                <td className="px-4 py-3 text-right">
                                    <button
                                        onClick={() => handleSave(r.ruleKey)}
                                        disabled={saving === r.ruleKey}
                                        className="px-3 py-1 text-xs font-semibold rounded bg-primary text-white hover:bg-blue-600 disabled:opacity-60"
                                    >
                                        {saving === r.ruleKey ? '保存中…' : '保存'}
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default AdminPointsRules;
