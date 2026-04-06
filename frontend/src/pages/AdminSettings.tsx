import React, { useEffect, useState } from 'react';
import { message } from 'antd';
import api from '../api';

interface AdminSettingsState {
    storeName: string;
    supportEmail: string;
    supportPhone: string;
    lowStockThreshold: number;
    dashboardRange: '6m' | '12m';
    aiApiKey: string;
    aiModel: string;
    aiBaseUrl: string;
    aiTemperature: number;
    aiMaxTokens: number;
    aiSystemPrompt: string;
}

interface ApiTestResult {
    success: boolean;
    message: string;
    responseTime?: number;
    model?: string;
    baseUrl?: string;
}

const defaultSettings: AdminSettingsState = {
    storeName: 'JavaBooks',
    supportEmail: 'support@javabooks.com',
    supportPhone: '400-123-4567',
    lowStockThreshold: 10,
    dashboardRange: '6m',
    aiApiKey: '',
    aiModel: 'openrouter/free',
    aiBaseUrl: 'https://openrouter.ai/api/v1',
    aiTemperature: 0.7,
    aiMaxTokens: 2000,
    aiSystemPrompt: '',
};

const AdminSettings: React.FC = () => {
    const [settings, setSettings] = useState<AdminSettingsState>(defaultSettings);
    const [saving, setSaving] = useState(false);
    const [loading, setLoading] = useState(false);
    const [showApiKey, setShowApiKey] = useState(false);
    const [testing, setTesting] = useState(false);
    const [testResult, setTestResult] = useState<ApiTestResult | null>(null);

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

    const handleTestConnection = async () => {
        setTesting(true);
        setTestResult(null);
        try {
            const response = await api.post<ApiTestResult>('/ai/test-connection');
            setTestResult(response.data);
            if (response.data.success) {
                message.success('API 连接测试成功');
            } else {
                message.error('API 连接测试失败: ' + response.data.message);
            }
        } catch (error) {
            console.error('API test failed:', error);
            const errorMsg = (error as { response?: { data?: { message?: string } } })?.response?.data?.message || '连接测试失败';
            setTestResult({ success: false, message: errorMsg });
            message.error(errorMsg);
        } finally {
            setTesting(false);
        }
    };

    return (
        <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-6 h-full">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm p-6 flex flex-col gap-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="flex flex-col gap-2">
                        <label className="text-sm font-semibold text-slate-700 dark:text-slate-200">店铺名称</label>
                        <input
                            className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 text-slate-900 dark:text-white"
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
                            className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 text-slate-900 dark:text-white"
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
                            className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 text-slate-900 dark:text-white"
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
                            className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 text-slate-900 dark:text-white"
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
                                aria-label="6个月"
                                className={`px-4 py-2 rounded-lg text-sm font-semibold border ${settings.dashboardRange === '6m' ? 'bg-primary text-white border-primary' : 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300'}`}
                                onClick={() => setSettings(prev => ({ ...prev, dashboardRange: '6m' }))}
                                disabled={loading}
                            >
                                最近6个月
                            </button>
                            <button
                                aria-label="12个月"
                                className={`px-4 py-2 rounded-lg text-sm font-semibold border ${settings.dashboardRange === '12m' ? 'bg-primary text-white border-primary' : 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300'}`}
                                onClick={() => setSettings(prev => ({ ...prev, dashboardRange: '12m' }))}
                                disabled={loading}
                            >
                                最近12个月
                            </button>
                        </div>
                    </div>
                </div>

                {/* AI 荐书设置 */}
                <div className="border-t border-slate-200 dark:border-slate-700 pt-6">
                    <div className="flex items-center gap-2 mb-4">
                        <span className="material-symbols-outlined text-primary" aria-hidden="true">auto_awesome</span>
                        <h3 className="text-base font-bold text-slate-900 dark:text-white">AI 荐书设置</h3>
                    </div>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* API Key */}
                        <div className="flex flex-col gap-2 lg:col-span-2">
                            <label className="text-sm font-semibold text-slate-700 dark:text-slate-200">API Key</label>
                            <div className="relative">
                                <input
                                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 text-slate-900 dark:text-white pr-12"
                                    type={showApiKey ? 'text' : 'password'}
                                    value={settings.aiApiKey}
                                    onChange={(e) => setSettings(prev => ({ ...prev, aiApiKey: e.target.value }))}
                                    disabled={loading}
                                    placeholder="sk-xxxxxxxx"
                                />
                                <button type="button" onClick={() => setShowApiKey(!showApiKey)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                                    <span className="material-symbols-outlined text-[20px]" aria-hidden="true">{showApiKey ? 'visibility_off' : 'visibility'}</span>
                                </button>
                            </div>
                        </div>
                        {/* Model */}
                        <div className="flex flex-col gap-2">
                            <label className="text-sm font-semibold text-slate-700 dark:text-slate-200">模型名称</label>
                            <input className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 text-slate-900 dark:text-white" value={settings.aiModel} onChange={(e) => setSettings(prev => ({ ...prev, aiModel: e.target.value }))} disabled={loading} placeholder="openrouter/free" />
                        </div>
                        {/* Base URL */}
                        <div className="flex flex-col gap-2">
                            <label className="text-sm font-semibold text-slate-700 dark:text-slate-200">API 地址</label>
                            <input className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 text-slate-900 dark:text-white" value={settings.aiBaseUrl} onChange={(e) => setSettings(prev => ({ ...prev, aiBaseUrl: e.target.value }))} disabled={loading} placeholder="https://openrouter.ai/api/v1" />
                        </div>
                        {/* Temperature */}
                        <div className="flex flex-col gap-2">
                            <label className="text-sm font-semibold text-slate-700 dark:text-slate-200">Temperature ({settings.aiTemperature})</label>
                            <input type="range" min="0" max="2" step="0.1" value={settings.aiTemperature} onChange={(e) => setSettings(prev => ({ ...prev, aiTemperature: Number(e.target.value) }))} disabled={loading} className="w-full accent-primary" />
                            <div className="flex justify-between text-xs text-slate-400"><span>精确</span><span>创意</span></div>
                        </div>
                        {/* Max Tokens */}
                        <div className="flex flex-col gap-2">
                            <label className="text-sm font-semibold text-slate-700 dark:text-slate-200">最大 Token</label>
                            <input className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 text-slate-900 dark:text-white" type="number" min="100" max="8000" value={settings.aiMaxTokens} onChange={(e) => setSettings(prev => ({ ...prev, aiMaxTokens: Number(e.target.value) || 2000 }))} disabled={loading} />
                        </div>
                        {/* System Prompt */}
                        <div className="flex flex-col gap-2 lg:col-span-2">
                            <label className="text-sm font-semibold text-slate-700 dark:text-slate-200">系统提示词</label>
                            <textarea
                                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 text-slate-900 dark:text-white font-mono"
                                rows={8}
                                value={settings.aiSystemPrompt}
                                onChange={(e) => setSettings(prev => ({ ...prev, aiSystemPrompt: e.target.value }))}
                                disabled={loading}
                                placeholder="留空使用默认提示词。可用变量：{bookList} - 书库列表"
                            />
                            <p className="text-xs text-slate-500">
                                提示：留空将使用默认提示词。可用变量 <code className="bg-slate-100 dark:bg-slate-800 px-1 rounded">{'{bookList}'}</code> 会被替换为书库列表。
                                提示词需要求 AI 返回 JSON 格式：{'{"reply":"...","summary":"...","recommendations":[{"title":"...","author":"...","reason":"...","matchScore":90}]}'}
                            </p>
                        </div>
                    </div>
                </div>

                {/* API 连接测试 */}
                <div className="border-t border-slate-200 dark:border-slate-700 pt-6">
                    <div className="flex items-center gap-2 mb-4">
                        <span className="material-symbols-outlined text-primary" aria-hidden="true">speed</span>
                        <h3 className="text-base font-bold text-slate-900 dark:text-white">API 连接测试</h3>
                    </div>
                    <div className="flex items-center gap-4">
                        <button
                            onClick={handleTestConnection}
                            disabled={testing || loading || !settings.aiApiKey}
                            className="px-6 py-2.5 rounded-lg bg-green-600 text-white text-sm font-semibold shadow-md hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                        >
                            {testing ? (
                                <>
                                    <span className="material-symbols-outlined text-lg animate-spin">progress_activity</span>
                                    测试中...
                                </>
                            ) : (
                                <>
                                    <span className="material-symbols-outlined text-lg">play_arrow</span>
                                    测试连接
                                </>
                            )}
                        </button>
                        {testResult && (
                            <div className={`flex items-center gap-2 px-4 py-2 rounded-lg ${testResult.success ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400' : 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400'}`}>
                                <span className="material-symbols-outlined text-lg">
                                    {testResult.success ? 'check_circle' : 'error'}
                                </span>
                                <span className="text-sm font-medium">
                                    {testResult.success 
                                        ? `连接成功 (${testResult.responseTime}ms)` 
                                        : testResult.message}
                                </span>
                            </div>
                        )}
                    </div>
                    {testResult?.success && (
                        <div className="mt-3 p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                            <div className="grid grid-cols-2 gap-2 text-sm">
                                <div>
                                    <span className="text-slate-500">模型：</span>
                                    <span className="text-slate-900 dark:text-white font-medium">{testResult.model}</span>
                                </div>
                                <div>
                                    <span className="text-slate-500">响应时间：</span>
                                    <span className="text-slate-900 dark:text-white font-medium">{testResult.responseTime}ms</span>
                                </div>
                                <div className="col-span-2">
                                    <span className="text-slate-500">API 地址：</span>
                                    <span className="text-slate-900 dark:text-white font-medium">{testResult.baseUrl}</span>
                                </div>
                            </div>
                        </div>
                    )}
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
                        className="px-6 py-2.5 rounded-lg bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-300 text-sm font-semibold hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
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
