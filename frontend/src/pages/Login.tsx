import React, { useState } from 'react';
import { message } from 'antd';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import api from '../api';
import { useAuth } from '../context/AuthContext';

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
            
            // Redirect based on role
            if (response.data.roles && (response.data.roles.includes('ADMIN') || response.data.roles.includes('ROLE_ADMIN'))) {
                navigate('/admin');
            } else {
                navigate('/');
            }
        } catch (error) {
            console.error('Login failed:', error);
            const errorMessage = axios.isAxiosError(error)
                ? (typeof error.response?.data === 'string' ? error.response?.data : '用户名或密码错误')
                : '用户名或密码错误';
            message.error(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex-1 flex items-center justify-center p-4">
            <div className="max-w-4xl w-full bg-white dark:bg-slate-900 rounded-xl shadow-2xl overflow-hidden flex flex-col md:flex-row min-h-[600px]">
                <div className="hidden md:flex md:w-1/2 bg-primary/10 relative items-center justify-center p-12 border-r border-slate-100 dark:border-slate-800">
                    <div className="z-10 text-center">
                        <div className="inline-flex items-center justify-center w-20 h-20 bg-primary/20 rounded-2xl mb-6">
                            <span className="material-symbols-outlined text-primary text-5xl">auto_stories</span>
                        </div>
                        <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-4">
                            清爽书店
                        </h2>
                        <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed max-w-xs mx-auto">
                            你的专属知识入口，管理藏书并发现新故事。
                        </p>
                    </div>
                    <div className="absolute top-0 left-0 w-full h-full opacity-40 pointer-events-none">
                        <div className="absolute top-10 left-10 w-32 h-32 bg-primary/10 rounded-full blur-3xl"></div>
                        <div className="absolute bottom-10 right-10 w-48 h-48 bg-primary/20 rounded-full blur-3xl"></div>
                    </div>
                    <img
                        alt="Library background"
                        className="absolute inset-0 w-full h-full object-cover mix-blend-overlay opacity-20"
                        src="https://lh3.googleusercontent.com/aida-public/AB6AXuCx4_8kcfrKcJWfYVjFinWk_ZsZgUe9MXIKZ20PvcuDjQ_rYeysm3oDkaNuvUhOMOyAEICHAfWjzOgf3YzPh-iGWUVmoQB7FF5cpQOqlypCLkjj7NIXK_0zfmwp9zgf_l3nvwaWe_bvhdZpQKji3_zeeEocwhrXr8XW1QHtinjnjCc5Pyq7iGrXHPHD9qSllQA4Hv4cnFLx1whecNYSg0XxxaeJUIUCRQjbtyZZW2HH1qnJX3g18oNYDip1xvHq8Qqf1Pz_O_CFyhk"
                    />
                </div>
                <div className="w-full md:w-1/2 p-8 lg:p-12 flex flex-col justify-center">
                    <div className="mb-10 text-center md:text-left">
                        <div className="md:hidden flex justify-center mb-6">
                            <span className="material-symbols-outlined text-primary text-4xl">auto_stories</span>
                        </div>
                        <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
                            欢迎回来
                        </h1>
                        <p className="text-slate-500 dark:text-slate-400">
                            请输入账号信息继续登录。
                        </p>
                    </div>
                    <form className="space-y-6" onSubmit={onFinish}>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5" htmlFor="username">
                                用户名或邮箱
                            </label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 group-focus-within:text-primary transition-colors">
                                    <span className="material-symbols-outlined text-[20px]">person</span>
                                </div>
                                <input
                                    className="block w-full pl-10 pr-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all text-sm"
                                    id="username"
                                    name="username"
                                    placeholder="请输入用户名或邮箱"
                                    required
                                    type="text"
                                    value={formValues.username}
                                    onChange={(event) => setFormValues(prev => ({ ...prev, username: event.target.value }))}
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5" htmlFor="password">
                                密码
                            </label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 group-focus-within:text-primary transition-colors">
                                    <span className="material-symbols-outlined text-[20px]">lock</span>
                                </div>
                                <input
                                    className="block w-full pl-10 pr-10 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all text-sm"
                                    id="password"
                                    name="password"
                                    placeholder="请输入密码"
                                    required
                                    type={showPassword ? 'text' : 'password'}
                                    value={formValues.password}
                                    onChange={(event) => setFormValues(prev => ({ ...prev, password: event.target.value }))}
                                />
                                <button
                                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
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
                                    className="h-4 w-4 text-primary focus:ring-primary border-slate-300 dark:border-slate-700 rounded transition-colors cursor-pointer"
                                    id="remember-me"
                                    name="remember-me"
                                    type="checkbox"
                                    checked={formValues.remember}
                                    onChange={(event) => setFormValues(prev => ({ ...prev, remember: event.target.checked }))}
                                />
                                <label className="ml-2 block text-sm text-slate-600 dark:text-slate-400 cursor-pointer select-none" htmlFor="remember-me">
                                记住我
                                </label>
                            </div>
                            <div className="text-sm">
                                <button
                                    type="button"
                                    className="font-medium text-primary hover:text-primary/80 transition-colors"
                                >
                                    忘记密码？
                                </button>
                            </div>
                        </div>
                        <button
                            className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-semibold text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-all active:scale-[0.98] disabled:opacity-60"
                            type="submit"
                            disabled={loading}
                        >
                            {loading ? '正在登录...' : '登录'}
                        </button>
                    </form>
                    <div className="mt-10 text-center">
                        <p className="text-sm text-slate-600 dark:text-slate-400">
                            还没有账号？
                            <Link className="font-semibold text-primary hover:text-primary/80 transition-colors ml-1" to="/register">
                                立即注册
                            </Link>
                        </p>
                    </div>
                    <div className="mt-auto pt-8 flex items-center justify-center space-x-4 opacity-50 grayscale hover:grayscale-0 transition-all">
                        <span className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">
                            JavaWeb Bookstore 项目 v1.0
                        </span>
                    </div>
                </div>
            </div>
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
