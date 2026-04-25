import React, { useEffect, useState } from 'react';
import type { User, PointsHistory } from '../../types';
import { resolveAssetUrl } from '../../utils/url';

interface ProfileInfoSectionProps {
    user: User | null;
    addressForm: { address: string };
    pointsHistory: PointsHistory[];
    pointsLoading: boolean;
    onUpdate: (data: { fullName: string; phoneNumber: string; email: string }) => Promise<void>;
    onAvatarChange?: (file: File) => Promise<void>;
    onAvatarRemove?: () => Promise<void>;
}

const ProfileInfoSection: React.FC<ProfileInfoSectionProps> = ({
    user,
    addressForm,
    pointsHistory,
    pointsLoading,
    onUpdate,
    onAvatarChange,
    onAvatarRemove
}) => {
    const avatarUrl = resolveAssetUrl(user?.avatar);
    const [profileForm, setProfileForm] = useState({
        fullName: '',
        phoneNumber: '',
        email: '',
        username: ''
    });

    const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !onAvatarChange) return;
        await onAvatarChange(file);
        e.target.value = '';
    };

    useEffect(() => {
        if (user) {
            setProfileForm({
                fullName: user.fullName || '',
                phoneNumber: user.phoneNumber || '',
                email: user.email || '',
                username: user.username || ''
            });
        }
    }, [user]);

    const resetProfileForm = () => {
        if (!user) return;
        setProfileForm({
            fullName: user.fullName || '',
            phoneNumber: user.phoneNumber || '',
            email: user.email || '',
            username: user.username || ''
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        await onUpdate({
            fullName: profileForm.fullName,
            phoneNumber: profileForm.phoneNumber,
            email: profileForm.email
        });
    };

    return (
        <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
            <div className="px-8 py-6 border-b border-slate-100 dark:border-slate-800">
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white">个人资料</h2>
                <p className="text-slate-500 dark:text-slate-400 mt-1">更新你的基础信息并完善联系方式。</p>
            </div>
            <form onSubmit={handleSubmit} className="p-8">
                <div className="flex flex-col md:flex-row items-center gap-8 mb-10 pb-10 border-b border-slate-100 dark:border-slate-800">
                    <div className="relative group">
                        <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-slate-50 dark:border-slate-800 shadow-md">
                            {avatarUrl ? (
                                <img
                                    alt="用户头像"
                                    className="w-full h-full object-cover"
                                    src={avatarUrl}
                                    width={128}
                                    height={128}
                                />
                            ) : (
                                <div className="w-full h-full bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center">
                                    <span className="material-symbols-outlined text-5xl" aria-hidden="true">person</span>
                                </div>
                            )}
                        </div>
                        <label className="absolute bottom-1 right-1 bg-primary text-white p-2 rounded-full cursor-pointer shadow-lg hover:bg-blue-600 transition-colors" htmlFor="avatar-upload">
                            <span className="material-symbols-outlined text-sm" aria-hidden="true">photo_camera</span>
                        </label>
                        <input className="hidden" id="avatar-upload" type="file" accept="image/png,image/jpeg,image/gif,image/webp" onChange={handleAvatarChange} />
                    </div>
                    <div className="flex-1 text-center md:text-left">
                        <h3 className="text-lg font-semibold mb-1">个人头像</h3>
                        <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">支持 PNG、JPG 和 GIF，最大 5MB。</p>
                        <div className="flex flex-wrap justify-center md:justify-start gap-3">
                            <label className="px-4 py-2 bg-primary/10 text-primary text-sm font-medium rounded-lg hover:bg-primary/20 transition-colors cursor-pointer" htmlFor="avatar-upload">
                                上传新头像
                            </label>
                            <button className="px-4 py-2 text-slate-500 text-sm font-medium hover:text-red-500 transition-colors" type="button" onClick={onAvatarRemove}>
                                移除
                            </button>
                        </div>
                    </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">用户名</label>
                        <div className="relative">
                            <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" aria-hidden="true">badge</span>
                            <input
                                type="text"
                                value={profileForm.username}
                                disabled
                                className="w-full pl-11 pr-4 py-2.5 bg-slate-100 dark:bg-slate-800/50 border-slate-200 dark:border-slate-800 rounded-lg text-slate-400 cursor-not-allowed"
                            />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">邮箱地址</label>
                        <div className="relative">
                            <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" aria-hidden="true">mail</span>
                            <input
                                type="email"
                                value={profileForm.email}
                                onChange={e => setProfileForm({ ...profileForm, email: e.target.value })}
                                className="w-full pl-11 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors outline-none"
                                placeholder="请输入邮箱"
                            />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">姓名</label>
                        <div className="relative">
                            <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" aria-hidden="true">person</span>
                            <input
                                type="text"
                                value={profileForm.fullName}
                                onChange={e => setProfileForm({ ...profileForm, fullName: e.target.value })}
                                className="w-full pl-11 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors outline-none"
                                placeholder="请输入姓名"
                            />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">手机号</label>
                        <div className="relative">
                            <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" aria-hidden="true">phone_iphone</span>
                            <input
                                type="tel"
                                value={profileForm.phoneNumber}
                                onChange={e => setProfileForm({ ...profileForm, phoneNumber: e.target.value })}
                                className="w-full pl-11 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors outline-none"
                                placeholder="请输入手机号"
                            />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-slate-500 dark:text-slate-400">用户 ID</label>
                        <div className="relative">
                            <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" aria-hidden="true">fingerprint</span>
                            <input
                                type="text"
                                disabled
                                value={user?.id ? `BH-${user.id.toString().padStart(7, '0')}` : '未分配'}
                                className="w-full pl-11 pr-4 py-2.5 bg-slate-100 dark:bg-slate-800/50 border-slate-200 dark:border-slate-800 rounded-lg text-slate-400 cursor-not-allowed"
                            />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">默认收货地址（来自地址管理）</label>
                        <div className="relative">
                            <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" aria-hidden="true">location_on</span>
                            <input
                                type="text"
                                value={addressForm.address}
                                disabled
                                className="w-full pl-11 pr-4 py-2.5 bg-slate-100 dark:bg-slate-800/50 border-slate-200 dark:border-slate-800 rounded-lg text-slate-400 cursor-not-allowed"
                                placeholder="请输入默认收货地址"
                            />
                        </div>
                    </div>
                </div>
                <div className="mt-10 pt-6 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-4">
                    <button className="px-6 py-2.5 text-sm font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors" type="button" onClick={resetProfileForm}>
                        取消
                    </button>
                    <button className="px-8 py-2.5 bg-primary text-white text-sm font-bold rounded-lg hover:bg-blue-600 shadow-lg shadow-primary/20 transition-colors transition-transform flex items-center gap-2" type="submit">
                        <span className="material-symbols-outlined text-sm" aria-hidden="true">save</span>
                        保存修改
                    </button>
                </div>
            </form>

            {/* 积分历史 */}
            <div className="border-t border-slate-100 dark:border-slate-800">
                <div className="px-8 py-6 border-b border-slate-100 dark:border-slate-800">
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">积分明细</h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">查看积分获取和消耗记录</p>
                </div>
                <div className="p-8">
                    {pointsLoading ? (
                        <div className="flex justify-center items-center h-32">
                            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                        </div>
                    ) : pointsHistory.length === 0 ? (
                        <div className="text-center py-8 text-slate-500">
                            <span className="material-symbols-outlined text-4xl mb-2 text-slate-300" aria-hidden="true">stars</span>
                            <p>暂无积分记录</p>
                            <p className="text-sm mt-1">签到、购物、评价都可以获得积分</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {pointsHistory.slice(0, 10).map((history) => (
                                <div key={history.id} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                                    <div className="flex items-center gap-3">
                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                                            history.points > 0
                                                ? 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400'
                                                : 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400'
                                        }`}>
                                            <span className="material-symbols-outlined text-lg" aria-hidden="true">
                                                {history.type === 'SIGN_IN' ? 'event_available' :
                                                 history.type === 'PURCHASE' ? 'shopping_cart' :
                                                 history.type === 'REVIEW' ? 'rate_review' :
                                                 history.type === 'REGISTER' ? 'person_add' :
                                                 history.type === 'DEDUCT' ? 'remove_circle' : 'stars'}
                                            </span>
                                        </div>
                                        <div>
                                            <p className="font-medium text-slate-900 dark:text-white">{history.description}</p>
                                            <p className="text-xs text-slate-500">{new Date(history.createTime).toLocaleString()}</p>
                                        </div>
                                    </div>
                                    <div className={`font-bold ${history.points > 0 ? 'text-green-600' : 'text-red-600'}`}>
                                        {history.points > 0 ? '+' : ''}{history.points}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ProfileInfoSection;

