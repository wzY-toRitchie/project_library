import React, { useEffect, useState } from 'react';
import { message } from 'antd';
import {
    getAlipaySandboxStatus,
    updateAlipaySandboxMock,
    type AlipaySandboxStatus,
} from '../api/alipaySandbox';

const statusItems: Array<{ key: keyof AlipaySandboxStatus; label: string }> = [
    { key: 'appIdConfigured', label: 'APP ID' },
    { key: 'privateKeyConfigured', label: '应用私钥' },
    { key: 'alipayPublicKeyConfigured', label: '支付宝公钥' },
];

const AdminAlipaySandbox: React.FC = () => {
    const [status, setStatus] = useState<AlipaySandboxStatus | null>(null);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);

    const fetchStatus = async () => {
        setLoading(true);
        try {
            setStatus(await getAlipaySandboxStatus());
        } catch (error) {
            console.error('Failed to fetch Alipay sandbox status:', error);
            message.error('获取支付宝沙箱状态失败');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStatus();
    }, []);

    const handleToggleMock = async () => {
        if (!status) return;
        setSaving(true);
        try {
            const nextStatus = await updateAlipaySandboxMock(!status.mockEnabled);
            setStatus(nextStatus);
            message.success(nextStatus.mockEnabled ? '已开启沙箱模拟模式' : '已关闭沙箱模拟模式');
        } catch (error) {
            console.error('Failed to update Alipay mock mode:', error);
            message.error('更新沙箱模拟模式失败');
        } finally {
            setSaving(false);
        }
    };

    const configuredCount = status
        ? statusItems.filter((item) => Boolean(status[item.key])).length
        : 0;

    return (
        <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-6 h-full">
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm">
                    <div className="flex items-center justify-between gap-4">
                        <div>
                            <p className="text-xs text-slate-500 font-semibold">运行模式</p>
                            <p className="mt-1 text-xl font-bold text-slate-900 dark:text-white">
                                {status?.effectiveMockMode ? '模拟沙箱' : '真实沙箱'}
                            </p>
                        </div>
                        <span className={`material-symbols-outlined text-3xl ${status?.effectiveMockMode ? 'text-orange-500' : 'text-emerald-500'}`} aria-hidden="true">
                            {status?.effectiveMockMode ? 'science' : 'verified'}
                        </span>
                    </div>
                </div>

                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm">
                    <div className="flex items-center justify-between gap-4">
                        <div>
                            <p className="text-xs text-slate-500 font-semibold">密钥配置</p>
                            <p className="mt-1 text-xl font-bold text-slate-900 dark:text-white">
                                {configuredCount}/{statusItems.length}
                            </p>
                        </div>
                        <span className={`material-symbols-outlined text-3xl ${status?.gatewayConfigured ? 'text-emerald-500' : 'text-rose-500'}`} aria-hidden="true">
                            key
                        </span>
                    </div>
                </div>

                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm">
                    <div className="flex items-center justify-between gap-4">
                        <div>
                            <p className="text-xs text-slate-500 font-semibold">网关环境</p>
                            <p className="mt-1 text-xl font-bold text-slate-900 dark:text-white">
                                {status?.sandbox ? '沙箱' : '生产'}
                            </p>
                        </div>
                        <span className="material-symbols-outlined text-3xl text-blue-500" aria-hidden="true">account_balance_wallet</span>
                    </div>
                </div>
            </div>

            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm overflow-hidden">
                <div className="px-6 py-5 border-b border-slate-200 dark:border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-xl font-bold text-slate-900 dark:text-white">支付宝沙箱控制台</h1>
                        <p className="text-sm text-slate-500 mt-1">当前配置来自后端环境变量，模拟模式为运行时开关。</p>
                    </div>
                    <button
                        onClick={fetchStatus}
                        disabled={loading}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-sm font-semibold hover:bg-slate-200 dark:hover:bg-slate-700 disabled:opacity-60"
                    >
                        <span className={`material-symbols-outlined text-lg ${loading ? 'animate-spin' : ''}`} aria-hidden="true">refresh</span>
                        刷新
                    </button>
                </div>

                <div className="p-6 grid grid-cols-1 lg:grid-cols-[1fr_1.2fr] gap-6">
                    <section className="border border-slate-200 dark:border-slate-800 rounded-xl p-5">
                        <div className="flex items-start justify-between gap-4">
                            <div>
                                <h2 className="text-base font-bold text-slate-900 dark:text-white">沙箱模拟模式</h2>
                                <p className="text-sm text-slate-500 mt-1">
                                    开启后支付查询、关闭订单和退款会在本地模拟成功。
                                </p>
                            </div>
                            <button
                                type="button"
                                onClick={handleToggleMock}
                                disabled={!status || saving}
                                className={`relative inline-flex h-7 w-12 flex-shrink-0 items-center rounded-full transition-colors disabled:opacity-60 ${status?.mockEnabled ? 'bg-primary' : 'bg-slate-300 dark:bg-slate-700'}`}
                                aria-pressed={Boolean(status?.mockEnabled)}
                                aria-label="切换支付宝沙箱模拟模式"
                            >
                                <span className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform ${status?.mockEnabled ? 'translate-x-6' : 'translate-x-1'}`} />
                            </button>
                        </div>

                        <div className="mt-5 grid grid-cols-1 gap-3">
                            {statusItems.map((item) => {
                                const enabled = Boolean(status?.[item.key]);
                                return (
                                    <div key={item.key} className="flex items-center justify-between rounded-lg bg-slate-50 dark:bg-slate-800 px-4 py-3">
                                        <span className="text-sm font-medium text-slate-700 dark:text-slate-200">{item.label}</span>
                                        <span className={`inline-flex items-center gap-1.5 text-xs font-bold ${enabled ? 'text-emerald-600' : 'text-rose-600'}`}>
                                            <span className="material-symbols-outlined text-base" aria-hidden="true">{enabled ? 'check_circle' : 'cancel'}</span>
                                            {enabled ? '已配置' : '未配置'}
                                        </span>
                                    </div>
                                );
                            })}
                        </div>
                    </section>

                    <section className="border border-slate-200 dark:border-slate-800 rounded-xl p-5">
                        <h2 className="text-base font-bold text-slate-900 dark:text-white mb-4">网关参数</h2>
                        <div className="grid grid-cols-1 gap-4">
                            <InfoRow label="签名方式" value={status?.signType || '-'} />
                            <InfoRow label="网关地址" value={status?.gateway || '-'} />
                            <InfoRow label="同步回调" value={status?.returnUrl || '-'} />
                            <InfoRow label="异步通知" value={status?.notifyUrl || '-'} />
                        </div>
                    </section>
                </div>
            </div>
        </div>
    );
};

function InfoRow({ label, value }: { label: string; value: string }) {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-[96px_1fr] gap-2">
            <span className="text-sm font-semibold text-slate-500">{label}</span>
            <code className="break-all rounded-lg bg-slate-50 dark:bg-slate-800 px-3 py-2 text-xs text-slate-700 dark:text-slate-200">
                {value}
            </code>
        </div>
    );
}

export default AdminAlipaySandbox;
