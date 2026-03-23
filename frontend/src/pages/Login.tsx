import React, { useState } from 'react';
import { message } from 'antd';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import api from '../api';
import { useAuth } from '../context/AuthContext';
import OAuth2Buttons from '../components/OAuth2Buttons';

const Login: React.FC = () => {
    const navigate = useNavigate();
    const { login } = useAuth();
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [formValues, setFormValues] = useState({
        username: '',
        password: '',
        remember: false
    });

    const onFinish = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const username = formValues.username.trim();
        const password = formValues.password;
        if (!username || !password) {
            message.error('请输入用户名和密码');
            return;
        }
        setLoading(true);
        try {
            const response = await api.post('/auth/signin', { username, password });
            login(response.data);
            message.success('登录成功！');
            
            if (response.data.roles && (response.data.roles.includes('ADMIN') || response.data.roles.includes('ROLE_ADMIN'))) {
                navigate('/admin');
            } else {
                navigate('/');
            }
        } catch (error) {
            console.error('Login failed:', error);
            let errorMessage = '登录失败，请稍后重试';
            
            if (axios.isAxiosError(error)) {
                const data = error.response?.data;
                if (typeof data === 'string') {
                    errorMessage = data;
                } else if (data && typeof data === 'object' && 'message' in data) {
                    errorMessage = (data as { message: string }).message;
                }
            }
            
            message.error(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex-1 flex items-center justify-center p-4">
            <div className="max-w-4xl w-full bg-white dark:bg-slate-900 rounded-2xl shadow-2xl overflow-hidden flex flex-col md:flex-row min-h-[600px]">
                {/* Left Panel - Atmospheric Bookstore */}
                <div className="hidden md:flex md:w-1/2 hero-pattern relative items-center justify-center p-12">
                    {/* Grain texture overlay */}
                    <div className="absolute inset-0 bg-noise"></div>
                    
                    <div className="z-10 text-center text-white">
                        <div className="inline-flex items-center justify-center w-20 h-20 bg-white/10 backdrop-blur-sm rounded-2xl mb-8 border border-white/20">
                            <span className="material-symbols-outlined text-4xl text-amber-300">auto_stories</span>
                        </div>
                        <h2 className="font-display text-4xl font-bold mb-4 leading-tight">
                            JavaBooks
                        </h2>
                        <p className="text-blue-100/70 font-body text-base leading-relaxed max-w-xs mx-auto mb-8">
                            你的专属知识入口，在书海中发现新的世界。
                        </p>
                        {/* Decorative book quote */}
                        <div className="mt-6 pt-6 border-t border-white/10">
                            <p className="font-display italic text-white/50 text-sm">
                                "书籍是人类进步的阶梯"
                            </p>
                        </div>
                    </div>
                    
                    {/* Floating decorative elements */}
                    <div className="absolute top-12 right-16 w-24 h-24 rounded-full bg-amber-400/10 blur-2xl animate-float"></div>
                    <div className="absolute bottom-16 left-12 w-32 h-32 rounded-full bg-blue-400/10 blur-2xl animate-float" style={{ animationDelay: '3s' }}></div>
                </div>

                {/* Right Panel - Form */}
                <div className="w-full md:w-1/2 p-8 lg:p-12 flex flex-col justify-center bg-paper">
                    <div className="mb-10 text-center md:text-left">
                        <div className="md:hidden flex justify-center mb-6">
                            <div className="inline-flex items-center justify-center w-14 h-14 hero-pattern rounded-xl">
                                <span className="material-symbols-outlined text-2xl text-amber-300">auto_stories</span>
                            </div>
                        </div>
                        <h1 className="font-display text-3xl font-bold text-ink dark:text-white mb-2">
                            欢迎回来
                        </h1>
                        <p className="text-ink-light dark:text-slate-400 font-body">
                            登录你的账户，继续探索好书。
                        </p>
                    </div>

                    <form className="space-y-5" onSubmit={onFinish}>
                        <div>
                            <label className="block text-sm font-semibold text-ink dark:text-slate-300 mb-2 font-body" htmlFor="username">
                                用户名
                            </label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-primary transition-colors">
                                    <span className="material-symbols-outlined text-[20px]">person</span>
                                </div>
                                <input
                                    className="input-elegant block w-full pl-11 pr-3 py-3 bg-white dark:bg-slate-800 text-ink dark:text-white placeholder-slate-400 font-body text-sm"
                                    id="username"
                                    name="username"
                                    placeholder="请输入用户名"
                                    required
                                    type="text"
                                    value={formValues.username}
                                    onChange={(event) => setFormValues(prev => ({ ...prev, username: event.target.value }))}
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-ink dark:text-slate-300 mb-2 font-body" htmlFor="password">
                                密码
                            </label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-primary transition-colors">
                                    <span className="material-symbols-outlined text-[20px]">lock</span>
                                </div>
                                <input
                                    className="input-elegant block w-full pl-11 pr-11 py-3 bg-white dark:bg-slate-800 text-ink dark:text-white placeholder-slate-400 font-body text-sm"
                                    id="password"
                                    name="password"
                                    placeholder="请输入密码"
                                    required
                                    type={showPassword ? 'text' : 'password'}
                                    value={formValues.password}
                                    onChange={(event) => setFormValues(prev => ({ ...prev, password: event.target.value }))}
                                />
                                <button
                                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-primary transition-colors"
                                    type="button"
                                    onClick={() => setShowPassword(prev => !prev)}
                                >
                                    <span className="material-symbols-outlined text-[20px]">{showPassword ? 'visibility' : 'visibility_off'}</span>
                                </button>
                            </div>
                        </div>

                        <div className="flex items-center justify-between">
                            <div className="flex items-center">
                                <input
                                    className="h-4 w-4 text-primary focus:ring-primary border-slate-300 dark:border-slate-700 rounded cursor-pointer"
                                    id="remember-me"
                                    name="remember-me"
                                    type="checkbox"
                                    checked={formValues.remember}
                                    onChange={(event) => setFormValues(prev => ({ ...prev, remember: event.target.checked }))}
                                />
                                <label className="ml-2 block text-sm text-ink-light dark:text-slate-400 cursor-pointer select-none font-body" htmlFor="remember-me">
                                    记住我
                                </label>
                            </div>
                            <div className="text-sm">
                                <button
                                    type="button"
                                    className="font-medium text-primary hover:text-accent transition-colors font-body"
                                >
                                    忘记密码？
                                </button>
                            </div>
                        </div>

                        <button
                            className="btn-primary w-full flex justify-center items-center py-3 text-sm font-body"
                            type="submit"
                            disabled={loading}
                        >
                            {loading ? (
                                <span className="flex items-center gap-2">
                                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                                    </svg>
                                    正在登录...
                                </span>
                            ) : '登录'}
                        </button>
                    </form>

                    <OAuth2Buttons />

                    <div className="mt-8 text-center">
                        <p className="text-sm text-ink-light dark:text-slate-400 font-body">
                            还没有账号？
                            <Link className="link-elegant font-semibold ml-1" to="/register">
                                立即注册
                            </Link>
                        </p>
                    </div>

                    {/* Footer branding */}
                    <div className="mt-auto pt-8 flex items-center justify-center">
                        <span className="text-[10px] text-slate-400 uppercase tracking-[0.2em] font-body font-semibold">
                            JavaBooks v1.0
                        </span>
                    </div>
                </div>
            </div>

            {/* Theme Toggle */}
            <div className="fixed bottom-6 right-6">
                <button
                    className="p-3 bg-white dark:bg-slate-800 shadow-lg rounded-full text-slate-600 dark:text-slate-300 hover:text-primary dark:hover:text-primary transition-colors"
                    onClick={() => document.documentElement.classList.toggle('dark')}
                    type="button"
                >
                    <span className="material-symbols-outlined block dark:hidden">dark_mode</span>
                    <span className="material-symbols-outlined hidden dark:block">light_mode</span>
                </button>
            </div>
        </div>
    );
};

export default Login;
