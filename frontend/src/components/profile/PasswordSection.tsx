import React, { useMemo, useState } from 'react';
import { message } from 'antd';
import { getErrorMessage } from '../../utils/format';
import { getPasswordStrength, getPasswordStrengthLabel } from '../../utils/password';

interface PasswordSectionProps {
    onUpdate: (data: { currentPassword: string; newPassword: string }) => Promise<void>;
}

const PasswordSection: React.FC<PasswordSectionProps> = ({ onUpdate }) => {
    const [passwordForm, setPasswordForm] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const passwordStrength = useMemo(() => getPasswordStrength(passwordForm.newPassword), [passwordForm.newPassword]);
    const passwordStrengthLabel = getPasswordStrengthLabel(passwordStrength);
    const passwordStrengthPercent = Math.min(100, Math.max(10, passwordStrength * 25));

    const resetPasswordForm = () => {
        setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
        setShowCurrentPassword(false);
        setShowNewPassword(false);
        setShowConfirmPassword(false);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (passwordForm.newPassword !== passwordForm.confirmPassword) {
            message.error('两次输入的密码不一致');
            return;
        }
        try {
            await onUpdate({
                currentPassword: passwordForm.currentPassword,
                newPassword: passwordForm.newPassword
            });
            message.success('密码修改成功');
            setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
        } catch (error: unknown) {
            message.error(getErrorMessage(error, '密码修改失败'));
        }
    };

    return (
        <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
            <div className="p-8">
                <div className="mb-8">
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white">修改密码</h2>
                    <p className="text-slate-500 dark:text-slate-400 mt-2">建议定期更新密码，增强账户安全性。</p>
                </div>
                <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg flex items-center gap-3">
                    <span className="material-symbols-outlined text-blue-500" aria-hidden="true">info</span>
                    <p className="text-sm text-blue-800 dark:text-blue-300">请设置包含字母、数字和特殊字符的组合密码。</p>
                </div>
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-2">
                        <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">当前密码</label>
                        <div className="relative">
                            <input
                                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition-colors text-slate-900 dark:text-white"
                                type={showCurrentPassword ? 'text' : 'password'}
                                placeholder="请输入当前密码"
                                value={passwordForm.currentPassword}
                                onChange={e => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                            />
                            <button
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                                type="button"
                                onClick={() => setShowCurrentPassword(prev => !prev)}
                                aria-label={showCurrentPassword ? '隐藏密码' : '显示密码'}
                            >
                                <span className="material-symbols-outlined text-xl" aria-hidden="true">{showCurrentPassword ? 'visibility_off' : 'visibility'}</span>
                            </button>
                        </div>
                    </div>
                    <hr className="border-slate-100 dark:border-slate-800" />
                    <div className="space-y-2">
                        <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">新密码</label>
                        <div className="relative">
                            <input
                                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition-colors text-slate-900 dark:text-white"
                                type={showNewPassword ? 'text' : 'password'}
                                placeholder="请输入新密码"
                                value={passwordForm.newPassword}
                                onChange={e => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                            />
                            <button
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                                type="button"
                                onClick={() => setShowNewPassword(prev => !prev)}
                                aria-label={showNewPassword ? '隐藏密码' : '显示密码'}
                            >
                                <span className="material-symbols-outlined text-xl" aria-hidden="true">{showNewPassword ? 'visibility_off' : 'visibility'}</span>
                            </button>
                        </div>
                        <div className="mt-3 space-y-2">
                            <div className="flex justify-between items-center text-xs font-medium">
                                <span className="text-slate-500">
                                    密码强度'<span className="text-primary font-bold uppercase tracking-wider"> {passwordStrengthLabel}</span>
                                </span>
                                <span className="text-slate-400">{passwordStrengthPercent}%</span>
                            </div>
                            <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                <div className="h-full bg-primary rounded-full" style={{ width: `${passwordStrengthPercent}%` }} />
                            </div>
                        </div>
                    </div>
                    <div className="space-y-2">
                        <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">确认新密码</label>
                        <div className="relative">
                            <input
                                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition-colors text-slate-900 dark:text-white"
                                type={showConfirmPassword ? 'text' : 'password'}
                                placeholder="请再次输入新密码"
                                value={passwordForm.confirmPassword}
                                onChange={e => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                            />
                            <button
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                                type="button"
                                onClick={() => setShowConfirmPassword(prev => !prev)}
                                aria-label={showConfirmPassword ? '隐藏密码' : '显示密码'}
                            >
                                <span className="material-symbols-outlined text-xl" aria-hidden="true">{showConfirmPassword ? 'visibility_off' : 'visibility'}</span>
                            </button>
                        </div>
                        {passwordForm.confirmPassword && (
                            <p className={`text-[11px] mt-1 flex items-center gap-1 ${passwordForm.newPassword === passwordForm.confirmPassword ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-500'}`}>
                                <span className="material-symbols-outlined text-[14px]" aria-hidden="true">info</span>
                                {passwordForm.newPassword === passwordForm.confirmPassword ? '两次密码输入一致' : '两次密码输入不一致'}
                            </p>
                        )}
                    </div>
                    <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-lg border border-slate-100 dark:border-slate-800">
                        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">密码要求</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <div className={`flex items-center gap-2 text-sm ${passwordForm.newPassword.length >= 8 ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400'}`}>
                                <span className="material-symbols-outlined text-base" aria-hidden="true">{passwordForm.newPassword.length >= 8 ? 'check_circle' : 'cancel'}</span>
                                <span>至少 8 个字符</span>
                            </div>
                            <div className={`flex items-center gap-2 text-sm ${/[0-9]/.test(passwordForm.newPassword) ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400'}`}>
                                <span className="material-symbols-outlined text-base" aria-hidden="true">{/[0-9]/.test(passwordForm.newPassword) ? 'check_circle' : 'cancel'}</span>
                                <span>至少包含 1 个数字</span>
                            </div>
                            <div className={`flex items-center gap-2 text-sm ${/[^a-zA-Z0-9]/.test(passwordForm.newPassword) ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400'}`}>
                                <span className="material-symbols-outlined text-base" aria-hidden="true">{/[^a-zA-Z0-9]/.test(passwordForm.newPassword) ? 'check_circle' : 'cancel'}</span>
                                <span>包含特殊字符</span>
                            </div>
                            <div className={`flex items-center gap-2 text-sm ${/[A-Z]/.test(passwordForm.newPassword) ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400'}`}>
                                <span className="material-symbols-outlined text-base" aria-hidden="true">{/[A-Z]/.test(passwordForm.newPassword) ? 'check_circle' : 'cancel'}</span>
                                <span>包含大写字母</span>
                            </div>
                        </div>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-3 pt-4">
                        <button className="flex-1 bg-primary hover:bg-primary/90 text-white font-semibold py-2.5 px-4 rounded-lg transition-colors flex items-center justify-center gap-2 shadow-sm shadow-primary/20" type="submit">
                            <span className="material-symbols-outlined text-lg" aria-hidden="true">save</span>
                            更新密码
                        </button>
                        <button className="px-6 py-2.5 text-slate-600 dark:text-slate-400 font-semibold hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors" type="button" onClick={resetPasswordForm}>
                            取消
                        </button>
                    </div>
                </form>
            </div>
            <div className="px-8 py-4 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-200 dark:border-slate-800 flex items-center justify-center gap-2 text-xs text-slate-400 uppercase tracking-widest font-semibold">
                <span className="material-symbols-outlined text-sm" aria-hidden="true">lock</span>
                端到端加密保护</div>
        </div>
    );
};

export default PasswordSection;
