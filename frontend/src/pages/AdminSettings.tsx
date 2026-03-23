import React, { useEffect, useState } from 'react';
import { message } from 'antd';
import api from '../api';

interface AdminSettingsState {
    storeName: string;
    supportEmail: string;
    supportPhone: string;
    lowStockThreshold: number;
    dashboardRange: '6m' | '12m';
}

const defaultSettings: AdminSettingsState = {
    storeName: 'JavaBooks',
    supportEmail: 'support@javabooks.com',
    supportPhone: '400-123-4567',
    lowStockThreshold: 10,
    dashboardRange: '6m'
};

const AdminSettings: React.FC = () => {
    const [settings, setSettings] = useState<AdminSettingsState>(defaultSettings);
    const [saving, setSaving] = useState(false);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchSettings = async () => {
            setLoading(true);
            try {
                const response = await api.get('/settings');
                setSettings({ ...defaultSettings, ...response.data });
            } catch (error) {
                console.error('Failed to fetch settings:', error);
                message.error('获取系统设置失败');
                setSettings(defaultSettings);
            } finally {
                setLoading(false);
            }
        };
        fetchSettings();
    }, []);

    const handleSave = async () => {
        setSaving(true);
        try {
            const response = await api.put('/settings', settings);
            setSettings({ ...defaultSettings, ...response.data });
            message.success('设置已保存');
        } catch (error) {
            console.error('Failed to save settings:', error);
            message.error('保存设置失败');
        } finally {
            setSaving(false);
        }
    };

    const handleReset = async () => {
        if (!window.confirm('确定要恢复默认设置吗？')) return;
        setSaving(true);
        try {
            const response = await api.put('/settings', defaultSettings);
            setSettings({ ...defaultSettings, ...response.data });
            message.success('已恢复默认设置');
        } catch (error) {
            console.error('Failed to reset settings:', error);
            message.error('恢复默认设置失败');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-6 h-full">
            <div className="bg-white dark:bg-[#1a2632] border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm p-6 flex flex-col gap-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="flex flex-col gap-2">
                        <label className="text-sm font-semibold text-slate-700 dark:text-slate-200">店铺名称</label>
                        <input
                            className="w-full px-4 py-2.5 bg-slate-50 dark:bg-[#111418] border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 text-slate-900 dark:text-white"
                            name="storeName"
                            data-testid="store-name-input"
                            value={settings.storeName}
                            onChange={(e) => setSettings(prev => ({ ...prev, storeName: e.target.value }))}
                            disabled={loading}
                        />
                    </div>
                    <div className="flex flex-col gap-2">
                        <label className="text-sm font-semibold text-slate-700 dark:text-slate-200">客服邮箱</label>
                        <input
                            className="w-full px-4 py-2.5 bg-slate-50 dark:bg-[#111418] border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 text-slate-900 dark:text-white"
                            name="supportEmail"
                            data-testid="support-email-input"
                            value={settings.supportEmail}
                            onChange={(e) => setSettings(prev => ({ ...prev, supportEmail: e.target.value }))}
                            disabled={loading}
                        />
                    </div>
                    <div className="flex flex-col gap-2">
                        <label className="text-sm font-semibold text-slate-700 dark:text-slate-200">客服电话</label>
                        <input
                            className="w-full px-4 py-2.5 bg-slate-50 dark:bg-[#111418] border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 text-slate-900 dark:text-white"
                            name="supportPhone"
                            data-testid="support-phone-input"
                            value={settings.supportPhone}
                            onChange={(e) => setSettings(prev => ({ ...prev, supportPhone: e.target.value }))}
                            disabled={loading}
                        />
                    </div>
                    <div className="flex flex-col gap-2">
                        <label className="text-sm font-semibold text-slate-700 dark:text-slate-200">库存预警阈值</label>
                        <input
                            className="w-full px-4 py-2.5 bg-slate-50 dark:bg-[#111418] border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 text-slate-900 dark:text-white"
                            type="number"
                            name="lowStockThreshold"
                            data-testid="low-stock-threshold-input"
                            min={1}
                            value={settings.lowStockThreshold}
                            onChange={(e) => setSettings(prev => ({ ...prev, lowStockThreshold: Number(e.target.value) || 1 }))}
                            disabled={loading}
                        />
                    </div>
                    <div className="flex flex-col gap-2">
                        <label className="text-sm font-semibold text-slate-700 dark:text-slate-200">仪表盘统计周期</label>
                        <div className="flex gap-3">
                            <button
                                className={`px-4 py-2 rounded-lg text-sm font-semibold border ${settings.dashboardRange === '6m' ? 'bg-primary text-white border-primary' : 'bg-slate-50 dark:bg-[#111418] border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300'}`}
                                onClick={() => setSettings(prev => ({ ...prev, dashboardRange: '6m' }))}
                                disabled={loading}
                            >
                                最近6个月
                            </button>
                            <button
                                className={`px-4 py-2 rounded-lg text-sm font-semibold border ${settings.dashboardRange === '12m' ? 'bg-primary text-white border-primary' : 'bg-slate-50 dark:bg-[#111418] border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300'}`}
                                onClick={() => setSettings(prev => ({ ...prev, dashboardRange: '12m' }))}
                                disabled={loading}
                            >
                                最近12个月
                            </button>
                        </div>
                    </div>
                </div>
                <div className="flex flex-wrap gap-3">
                    <button
                        className="px-6 py-2.5 rounded-lg bg-primary text-white text-sm font-semibold shadow-md shadow-blue-500/20 hover:bg-blue-600 transition-colors disabled:opacity-60"
                        onClick={handleSave}
                        disabled={saving || loading}
                    >
                        保存设置
                    </button>
                    <button
                        className="px-6 py-2.5 rounded-lg bg-slate-100 dark:bg-[#111418] text-slate-600 dark:text-slate-300 text-sm font-semibold hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                        onClick={handleReset}
                        disabled={saving || loading}
                    >
                        恢复默认
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AdminSettings;
