import React, { useState, useEffect } from 'react';
import api from '../../api';
import { message } from 'antd';

interface UserProfile {
    id: number;
    username: string;
    email: string;
    fullName?: string;
    phoneNumber?: string;
}

interface ProfileEditorProps {
    profile: UserProfile | null;
    onRefresh: () => void;
}

const ProfileEditor: React.FC<ProfileEditorProps> = ({ profile, onRefresh }) => {
    const [form, setForm] = useState({
        fullName: '',
        phoneNumber: '',
        email: ''
    });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (profile) {
            setForm({
                fullName: profile.fullName || '',
                phoneNumber: profile.phoneNumber || '',
                email: profile.email || ''
            });
        }
    }, [profile]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            await api.put('/users/me', form);
            message.success('资料更新成功');
            onRefresh();
        } catch (error: any) {
            message.error(error.response?.data?.message || '更新失败');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">个人资料</h2>
            
            <div className="flex items-center gap-4 mb-8">
                <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="material-symbols-outlined text-4xl text-primary">person</span>
                </div>
                <div>
                    <p className="font-semibold text-gray-900 dark:text-white">{profile?.username}</p>
                    <p className="text-sm text-gray-500">用户名不可修改</p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="max-w-md space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">姓名</label>
                    <input
                        type="text"
                        value={form.fullName}
                        onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                        placeholder="请输入姓名"
                        className="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">手机号码</label>
                    <input
                        type="tel"
                        value={form.phoneNumber}
                        onChange={(e) => setForm({ ...form, phoneNumber: e.target.value })}
                        placeholder="请输入手机号码"
                        className="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">邮箱</label>
                    <input
                        type="email"
                        value={form.email}
                        onChange={(e) => setForm({ ...form, email: e.target.value })}
                        placeholder="请输入邮箱"
                        className="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    />
                </div>

                <div className="pt-4">
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full px-4 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
                    >
                        {loading ? '保存中...' : '保存修改'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default ProfileEditor;
