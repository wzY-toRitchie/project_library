import React, { useState } from 'react';
import api from '../../api';
import { message } from 'antd';

const PasswordChange: React.FC = () => {
    const [form, setForm] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });
    const [showPasswords, setShowPasswords] = useState({
        current: false,
        new: false,
        confirm: false
    });
    const [errors, setErrors] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });
    const [loading, setLoading] = useState(false);

    const validate = () => {
        const newErrors = { currentPassword: '', newPassword: '', confirmPassword: '' };
        let valid = true;

        if (!form.currentPassword) {
            newErrors.currentPassword = '请输入当前密码';
            valid = false;
        }

        if (!form.newPassword) {
            newErrors.newPassword = '请输入新密码';
            valid = false;
        } else if (form.newPassword.length < 8) {
            newErrors.newPassword = '密码至少8位';
            valid = false;
        } else if (!/[A-Z]/.test(form.newPassword)) {
            newErrors.newPassword = '密码需包含大写字母';
            valid = false;
        } else if (!/[a-z]/.test(form.newPassword)) {
            newErrors.newPassword = '密码需包含小写字母';
            valid = false;
        } else if (!/[0-9]/.test(form.newPassword)) {
            newErrors.newPassword = '密码需包含数字';
            valid = false;
        }

        if (!form.confirmPassword) {
            newErrors.confirmPassword = '请确认新密码';
            valid = false;
        } else if (form.newPassword !== form.confirmPassword) {
            newErrors.confirmPassword = '两次密码不一致';
            valid = false;
        }

        setErrors(newErrors);
        return valid;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validate()) return;

        setLoading(true);
        try {
            await api.put('/users/password', {
                currentPassword: form.currentPassword,
                newPassword: form.newPassword
            });
            message.success('密码修改成功');
            setForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
        } catch (error: any) {
            message.error(error.response?.data?.message || '密码修改失败');
        } finally {
            setLoading(false);
        }
    };

    const renderInput = (
        label: string,
        field: keyof typeof form,
        showField: keyof typeof showPasswords
    ) => (
        <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{label}</label>
            <div className="relative">
                <input
                    type={showPasswords[showField] ? 'text' : 'password'}
                    value={form[field]}
                    onChange={(e) => setForm({ ...form, [field]: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white pr-10"
                />
                <button
                    type="button"
                    onClick={() => setShowPasswords({ ...showPasswords, [showField]: !showPasswords[showField] })}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                >
                    <span className="material-symbols-outlined text-xl">
                        {showPasswords[showField] ? 'visibility_off' : 'visibility'}
                    </span>
                </button>
            </div>
            {errors[field] && <p className="text-red-500 text-sm mt-1">{errors[field]}</p>}
        </div>
    );

    return (
        <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">修改密码</h2>
            <form onSubmit={handleSubmit} className="max-w-md space-y-4">
                {renderInput('当前密码', 'currentPassword', 'current')}
                {renderInput('新密码', 'newPassword', 'new')}
                {renderInput('确认新密码', 'confirmPassword', 'confirm')}
                
                <div className="pt-4">
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full px-4 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
                    >
                        {loading ? '修改中...' : '修改密码'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default PasswordChange;
