import React, { useMemo, useState } from 'react';
import { message } from 'antd';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import api from '../api';

const Register: React.FC = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [formValues, setFormValues] = useState({
        username: '',
        email: '',
        phone: '',
        password: '',
        confirm: '',
        acceptedTerms: false
    });

    const strength = useMemo(() => {
        const password = formValues.password;
        let score = 0;
        if (password.length >= 8) score += 1;
        if (/[a-z]/.test(password)) score += 1;  // 小写字母
        if (/[A-Z]/.test(password)) score += 1;  // 大写字母
        if (/[0-9]/.test(password)) score += 1;  // 数字
        if (/[^a-zA-Z0-9]/.test(password)) score += 1;  // 特殊字符
        return score;
    }, [formValues.password]);

    const strengthLabel = strength >= 4 ? '强' : strength >= 3 ? '中' : strength >= 2 ? '弱' : '非常弱';
    const strengthColor = strength >= 4 ? 'text-green-500' : strength >= 3 ? 'text-yellow-500' : strength >= 2 ? 'text-orange-500' : 'text-red-500';

    const onFinish = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const username = formValues.username.trim();
        const email = formValues.email.trim();
        const password = formValues.password;
        const confirm = formValues.confirm;
        if (!username || !email || !password || !confirm) {
            message.error('请完整填写注册信息');
            return;
        }
        if (password !== confirm) {
            message.error('两次输入的密码不一致');
            return;
        }
        if (!formValues.acceptedTerms) {
            message.error('请同意服务条款与隐私政策');
            return;
        }
        if (password.length < 8) {
            message.error('密码长度不能少于8个字符');
            return;
        }
        if (!/[A-Z]/.test(password)) {
            message.error('密码必须包含至少一个大写字母');
            return;
        }
        if (!/[a-z]/.test(password)) {
            message.error('密码必须包含至少一个小写字母');
            return;
        }
        if (!/[0-9]/.test(password)) {
            message.error('密码必须包含至少一个数字');
            return;
        }
        setLoading(true);
        try {
            await api.post('/auth/signup', {
                username,
                email,
                password,
                role: ["user"]
            });
            message.success('注册成功，请登录！');
            navigate('/login');
        } catch (error) {
            console.error('Registration failed:', error);
            let errorMessage = '注册失败，请稍后再试';
            if (axios.isAxiosError(error)) {
                const data = error.response?.data;
                if (typeof data === 'string') {
                    errorMessage = data;
                } else if (data && typeof data.message === 'string') {
                    errorMessage = data.message;
                } else if (data && Array.isArray(data.errors) && data.errors[0]?.defaultMessage) {
                    errorMessage = data.errors[0].defaultMessage;
                }
            }
            message.error(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex-1 flex items-center justify-center p-6">
            <div className="w-full max-w-md">
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-xl mb-4">
                        <span className="material-symbols-outlined text-primary text-3xl">auto_stories</span>
                    </div>
                    <h1 className="text-3xl font-bold text-slate-900 dark:text-white">创建账号</h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-2">加入我们的线上书店社区。</p>
                </div>
                <div className="bg-white dark:bg-slate-900 shadow-xl shadow-primary/5 rounded-xl border border-slate-200/60 dark:border-slate-800 p-8">
                    <form className="space-y-5" onSubmit={onFinish}>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5" htmlFor="username">
                                用户名
                            </label>
                            <div className="relative group">
                                <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors">
                                    person
                                </span>
                                <input
                                    className="w-full pl-11 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all dark:text-white"
                                    id="username"
                                    name="username"
                                    placeholder="请输入用户名"
                                    type="text"
                                    required
                                    value={formValues.username}
                                    onChange={(event) => setFormValues(prev => ({ ...prev, username: event.target.value }))}
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5" htmlFor="email">
                                邮箱
                            </label>
                            <div className="relative group">
                                <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors">
                                    mail
                                </span>
                                <input
                                    className="w-full pl-11 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all dark:text-white"
                                    id="email"
                                    name="email"
                                    placeholder="请输入邮箱"
                                    type="email"
                                    required
                                    value={formValues.email}
                                    onChange={(event) => setFormValues(prev => ({ ...prev, email: event.target.value }))}
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5" htmlFor="phone">
                                手机号
                            </label>
                            <div className="relative group">
                                <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors">
                                    phone_iphone
                                </span>
                                <input
                                    className="w-full pl-11 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all dark:text-white"
                                    id="phone"
                                    name="phone"
                                    placeholder="选填"
                                    type="tel"
                                    value={formValues.phone}
                                    onChange={(event) => setFormValues(prev => ({ ...prev, phone: event.target.value }))}
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5" htmlFor="password">
                                密码
                            </label>
                            <div className="relative group">
                                <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors">
                                    lock
                                </span>
                                <input
                                    className="w-full pl-11 pr-10 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all dark:text-white"
                                    id="password"
                                    name="password"
                                    placeholder="请输入密码"
                                    type={showPassword ? 'text' : 'password'}
                                    required
                                    value={formValues.password}
                                    onChange={(event) => setFormValues(prev => ({ ...prev, password: event.target.value }))}
                                />
                                <button
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                                    type="button"
                                    onClick={() => setShowPassword(prev => !prev)}
                                >
                                    <span className="material-symbols-outlined text-xl">{showPassword ? 'visibility' : 'visibility_off'}</span>
                                </button>
                            </div>
                                <div className="mt-2">
                                <div className="flex items-center justify-between mb-1">
                                    <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                                        强度：<span className={strengthColor}>{strengthLabel}</span>
                                    </span>
                                </div>
                                <div className="h-1 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden flex gap-0.5">
                                    {[0, 1, 2, 3, 4].map((index) => (
                                        <div
                                            key={index}
                                            className={`h-full flex-1 ${
                                                strength > index 
                                                    ? strength >= 4 ? 'bg-green-500' : strength >= 3 ? 'bg-yellow-500' : strength >= 2 ? 'bg-orange-500' : 'bg-red-500'
                                                    : 'bg-slate-200 dark:bg-slate-700'
                                            }`}
                                        ></div>
                                    ))}
                                </div>
                                <p className="mt-1.5 text-[11px] text-slate-500 dark:text-slate-400">
                                    密码需至少8位，包含大小写字母和数字。
                                </p>
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5" htmlFor="confirm-password">
                                确认密码
                            </label>
                            <div className="relative group">
                                <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors">
                                    verified_user
                                </span>
                                <input
                                    className="w-full pl-11 pr-10 py-2.5 bg-slate-50 dark:bg-slate-800 border border-primary/50 dark:border-primary/50 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all dark:text-white"
                                    id="confirm-password"
                                    name="confirm-password"
                                    placeholder="请再次输入密码"
                                    type={showConfirm ? 'text' : 'password'}
                                    required
                                    value={formValues.confirm}
                                    onChange={(event) => setFormValues(prev => ({ ...prev, confirm: event.target.value }))}
                                />
                                <button
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                                    type="button"
                                    onClick={() => setShowConfirm(prev => !prev)}
                                >
                                    <span className="material-symbols-outlined text-xl">{showConfirm ? 'visibility' : 'visibility_off'}</span>
                                </button>
                            </div>
                        </div>
                        <div className="flex items-start gap-3 py-1">
                            <input
                                className="mt-1 w-4 h-4 text-primary bg-slate-50 border-slate-300 rounded focus:ring-primary focus:ring-offset-0"
                                id="terms"
                                name="terms"
                                type="checkbox"
                                checked={formValues.acceptedTerms}
                                onChange={(event) => setFormValues(prev => ({ ...prev, acceptedTerms: event.target.checked }))}
                            />
                            <label className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed" htmlFor="terms">
                                我已阅读并同意 <span className="text-primary hover:underline font-medium">服务条款</span> 与{' '}
                                <span className="text-primary hover:underline font-medium">隐私政策</span>。
                            </label>
                        </div>
                        <button
                            className="w-full bg-primary hover:bg-primary/90 text-white font-semibold py-3 px-4 rounded-lg shadow-lg shadow-primary/25 transition-all active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-60"
                            type="submit"
                            disabled={loading}
                        >
                            {loading ? '正在创建...' : '创建账号'}
                            <span className="material-symbols-outlined text-lg">arrow_forward</span>
                        </button>
                    </form>
                    <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800 text-center">
                        <p className="text-sm text-slate-600 dark:text-slate-400">
                            已有账号？
                            <Link className="text-primary font-semibold hover:underline decoration-2 underline-offset-4 ml-1" to="/login">
                                立即登录
                            </Link>
                        </p>
                    </div>
                </div>
                <footer className="mt-8 text-center space-y-4">
                    <div className="flex justify-center gap-6">
                        <button className="text-xs text-slate-500 hover:text-primary transition-colors" type="button">帮助中心</button>
                        <button className="text-xs text-slate-500 hover:text-primary transition-colors" type="button">联系支持</button>
                        <button className="text-xs text-slate-500 hover:text-primary transition-colors" type="button">文档</button>
                    </div>
                    <p className="text-[11px] text-slate-400 uppercase tracking-widest font-medium">书店系统 © 2024</p>
                </footer>
            </div>
            <div className="fixed top-0 right-0 -z-10 opacity-5 pointer-events-none">
                <div className="bg-primary w-[500px] h-[500px] rounded-full blur-[100px] -mr-64 -mt-64"></div>
            </div>
            <div className="fixed bottom-0 left-0 -z-10 opacity-5 pointer-events-none">
                <div className="bg-primary w-[500px] h-[500px] rounded-full blur-[100px] -ml-64 -mb-64"></div>
            </div>
        </div>
    );
};

export default Register;
