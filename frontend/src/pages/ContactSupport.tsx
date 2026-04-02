import React, { useEffect, useState } from 'react';
import { message } from 'antd';
import api from '../api';
import type { SystemSetting } from '../types';

const ContactSupport: React.FC = () => {
    const [settings, setSettings] = useState<SystemSetting | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const response = await api.get('/settings');
                setSettings(response.data);
            } catch (error) {
                console.error('Failed to fetch settings', error);
            } finally {
                setLoading(false);
            }
        };
        fetchSettings();
    }, []);

    if (loading) {
        return <div className="flex justify-center items-center h-96"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div></div>;
    }

    return (
        <div className="max-w-4xl mx-auto py-12 px-4">
            <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
                <div className="text-center mb-8">
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white">联系客服</h2>
                    <p className="text-slate-500 dark:text-slate-400 mt-2">
                        如果您有任何问题或建议，请随时联系我们。
                    </p>
                </div>

                <dl className="divide-y divide-slate-200 dark:divide-slate-700">
                    <div className="py-3 flex">
                        <dt className="w-24 text-sm font-medium text-slate-500 dark:text-slate-400 shrink-0">店铺名称</dt>
                        <dd className="text-sm text-slate-900 dark:text-white">{settings?.storeName || 'Online Bookstore'}</dd>
                    </div>
                    <div className="py-3 flex">
                        <dt className="w-24 text-sm font-medium text-slate-500 dark:text-slate-400 shrink-0">客服邮箱</dt>
                        <dd className="text-sm">
                            <a href={`mailto:${settings?.supportEmail}`} className="text-primary hover:underline">
                                {settings?.supportEmail || 'support@example.com'}
                            </a>
                        </dd>
                    </div>
                    <div className="py-3 flex">
                        <dt className="w-24 text-sm font-medium text-slate-500 dark:text-slate-400 shrink-0">客服电话</dt>
                        <dd className="text-sm">
                            <a href={`tel:${settings?.supportPhone}`} className="text-primary hover:underline">
                                {settings?.supportPhone || 'N/A'}
                            </a>
                        </dd>
                    </div>
                    <div className="py-3 flex">
                        <dt className="w-24 text-sm font-medium text-slate-500 dark:text-slate-400 shrink-0">工作时间</dt>
                        <dd className="text-sm text-slate-900 dark:text-white">周一至周五 9:00 - 18:00</dd>
                    </div>
                </dl>
            </div>
        </div>
    );
};

export default ContactSupport;
