import React, { useCallback, useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import api from '../api';
import type { Order, Book, User } from '../types';
import ReviewModal from '../components/ReviewModal';
import { message } from 'antd';

import { useNavigate } from 'react-router-dom';

const Profile: React.FC = () => {
    const { user: authUser, login } = useAuth();
    const { addToCart } = useCart();
    const navigate = useNavigate();
    const [userProfile, setUserProfile] = useState<User | null>(null);
    const [activeSection, setActiveSection] = useState<'orders' | 'profile' | 'address' | 'password'>('orders');
    
    // Orders State
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(false);
    const [selectedBook, setSelectedBook] = useState<Book | null>(null);
    const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
    const [orderFilter, setOrderFilter] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');

    // Profile Form State
    const [profileForm, setProfileForm] = useState({
        fullName: '',
        phoneNumber: '',
        email: '',
        username: ''
    });

    // Address Form State
    const [addressForm, setAddressForm] = useState({
        address: ''
    });

    // Password Form State
    const [passwordForm, setPasswordForm] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });

    const getErrorMessage = (error: unknown, fallback: string) => {
        if (typeof error === 'object' && error !== null && 'response' in error) {
            const response = (error as { response?: { data?: unknown } }).response;
            const data = response?.data;
            if (typeof data === 'string') return data;
            if (typeof data === 'object' && data !== null && 'message' in data) {
                const messageValue = (data as { message?: unknown }).message;
                if (typeof messageValue === 'string') return messageValue;
            }
        }
        if (error instanceof Error && error.message) return error.message;
        return fallback;
    };

    const fetchUserProfile = useCallback(async () => {
        try {
            const response = await api.get('/users/me');
            setUserProfile(response.data);
        } catch (error) {
            console.error('Failed to fetch user profile:', error);
            message.error('获取用户信息失败');
        }
    }, []);

    const fetchOrders = useCallback(async () => {
        setLoading(true);
        try {
            const response = await api.get(`/orders/user/${authUser?.id}`);
            const data = Array.isArray(response.data) ? response.data : [];
            setOrders(data);
        } catch (error) {
            console.error('Failed to fetch orders:', error);
            message.error('获取订单列表失败');
            setOrders([]);
        } finally {
            setLoading(false);
        }
    }, [authUser?.id]);

    useEffect(() => {
        if (authUser?.id) {
            fetchUserProfile();
        }
    }, [authUser?.id, fetchUserProfile]);

    useEffect(() => {
        if (activeSection === 'orders' && authUser?.id) {
            fetchOrders();
        }
    }, [activeSection, authUser?.id, fetchOrders]);

    useEffect(() => {
        if (userProfile) {
            setProfileForm({
                fullName: userProfile.fullName || '',
                phoneNumber: userProfile.phoneNumber || '',
                email: userProfile.email || '',
                username: userProfile.username || ''
            });
            setAddressForm({
                address: userProfile.address || ''
            });
        }
    }, [userProfile]);

    const handleUpdateProfile = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const response = await api.put('/users/profile', {
                username: profileForm.username,
                email: profileForm.email,
                fullName: profileForm.fullName,
                phoneNumber: profileForm.phoneNumber,
                address: addressForm.address // Include address if it's part of profile update, or keep separate
            });
            setUserProfile(response.data);
            message.success('个人信息更新成功');
            // Update auth context if necessary
            if (authUser) {
                login({ ...authUser, ...response.data });
            }
        } catch (error: unknown) {
            message.error(getErrorMessage(error, '更新失败'));
        }
    };

    const handleUpdateAddress = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            // Using the same profile update endpoint for address as User entity has address
            const response = await api.put('/users/profile', {
                username: profileForm.username,
                email: profileForm.email,
                address: addressForm.address
            });
            setUserProfile(response.data);
            message.success('收货地址更新成功');
        } catch (error: unknown) {
            message.error(getErrorMessage(error, '更新失败'));
        }
    };

    const handleUpdatePassword = async (e: React.FormEvent) => {
        e.preventDefault();
        if (passwordForm.newPassword !== passwordForm.confirmPassword) {
            message.error('两次输入的密码不一致');
            return;
        }
        try {
            await api.put('/users/password', {
                currentPassword: passwordForm.currentPassword,
                newPassword: passwordForm.newPassword
            });
            message.success('密码修改成功');
            setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
        } catch (error: unknown) {
            message.error(getErrorMessage(error, '密码修改失败'));
        }
    };

    const handleOpenReview = (book: Book) => {
        setSelectedBook(book);
        setIsReviewModalOpen(true);
    };

    const handleDeleteOrder = async (orderId: number) => {
        if (!window.confirm('确定要删除该订单吗？此操作不可恢复。')) return;
        
        try {
            await api.delete(`/orders/${orderId}`);
            message.success('订单删除成功');
            setOrders(prev => prev.filter(o => o.id !== orderId));
        } catch (error: unknown) {
            console.error('Failed to delete order:', error);
            message.error(getErrorMessage(error, '删除订单失败'));
        }
    };

    const handleConfirmReceipt = async (orderId: number) => {
        if (!window.confirm('确认收到商品了吗？')) return;
        
        try {
            await api.patch(`/orders/${orderId}/status`, null, {
                params: { status: 'COMPLETED' }
            });
            message.success('已确认收货，您可以进行评价了');
            // Refresh orders locally
            setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: 'COMPLETED' } : o));
        } catch (error) {
            console.error('Failed to confirm receipt:', error);
            message.error('确认收货失败');
        }
    };

    const handleBuyAgain = (book: Book) => {
        addToCart(book);
        message.success('已加入购物车');
        navigate('/cart');
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'COMPLETED': return 'bg-green-100 text-green-600';
            case 'PENDING': return 'bg-blue-100 text-blue-600';
            case 'PAID': return 'bg-indigo-100 text-indigo-600';
            case 'SHIPPED': return 'bg-amber-100 text-amber-600';
            case 'CANCELLED': return 'bg-slate-100 text-slate-600';
            default: return 'bg-slate-100 text-slate-600';
        }
    };

    const getStatusText = (status: string) => {
        switch (status) {
            case 'COMPLETED': return '已完成';
            case 'PENDING': return '待付款';
            case 'PAID': return '待发货';
            case 'SHIPPED': return '已发货';
            case 'CANCELLED': return '已取消';
            default: return status;
        }
    };

    const formatDate = (dateInput: unknown) => {
        if (!dateInput) return '';
        if (Array.isArray(dateInput)) {
            const [year, month, day, hour, minute, second] = dateInput as Array<number | undefined>;
            if (typeof year !== 'number' || typeof month !== 'number' || typeof day !== 'number') return '';
            return new Date(year, month - 1, day, hour ?? 0, minute ?? 0, second ?? 0).toLocaleDateString();
        }
        return new Date(dateInput as string | number | Date).toLocaleDateString();
    };

    const filteredOrders = orders.filter(order => {
        // Search filter
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            const matchesOrder = order.id.toString().includes(query);
            const matchesBook = order.items?.some(item => 
                (item.book?.title?.toLowerCase().includes(query) || 
                item.book?.author?.toLowerCase().includes(query))
            ) ?? false;
            if (!matchesOrder && !matchesBook) return false;
        }

        if (orderFilter === 'all') return true;
        if (orderFilter === 'review') return order.status === 'COMPLETED'; // Assuming completed means ready for review
        return order.status === orderFilter;
    });

    const pendingPaymentCount = orders.filter(o => o.status === 'PENDING').length;
    const pendingShipmentCount = orders.filter(o => o.status === 'PAID').length;
    const pendingReceiptCount = orders.filter(o => o.status === 'SHIPPED').length;
    const pendingReviewCount = orders.filter(o => o.status === 'COMPLETED').length;

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex flex-col lg:flex-row gap-8">
                {/* Left Sidebar Navigation */}
                <aside className="w-full lg:w-64 flex-shrink-0">
                    <nav className="space-y-1">
                        <button 
                            onClick={() => setActiveSection('orders')}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg shadow-sm font-medium transition-all ${activeSection === 'orders' ? 'bg-primary text-white' : 'text-slate-600 dark:text-slate-400 hover:bg-primary/10 hover:text-primary'}`}
                        >
                            <span className="material-symbols-outlined">shopping_bag</span>
                            <span>我的订单</span>
                        </button>
                        <button 
                            onClick={() => setActiveSection('profile')}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${activeSection === 'profile' ? 'bg-primary text-white' : 'text-slate-600 dark:text-slate-400 hover:bg-primary/10 hover:text-primary'}`}
                        >
                            <span className="material-symbols-outlined">person</span>
                            <span>个人信息</span>
                        </button>
                        <button 
                            onClick={() => setActiveSection('address')}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${activeSection === 'address' ? 'bg-primary text-white' : 'text-slate-600 dark:text-slate-400 hover:bg-primary/10 hover:text-primary'}`}
                        >
                            <span className="material-symbols-outlined">location_on</span>
                            <span>收货地址</span>
                        </button>
                        <button 
                            onClick={() => setActiveSection('password')}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${activeSection === 'password' ? 'bg-primary text-white' : 'text-slate-600 dark:text-slate-400 hover:bg-primary/10 hover:text-primary'}`}
                        >
                            <span className="material-symbols-outlined">lock</span>
                            <span>修改密码</span>
                        </button>
                    </nav>

                    <div className="mt-10 p-4 rounded-xl bg-gradient-to-br from-primary to-blue-700 text-white shadow-lg overflow-hidden relative">
                        <div className="relative z-10">
                            <p className="text-xs font-semibold opacity-80 uppercase tracking-wider">书店会员</p>
                            <p className="text-lg font-bold mt-1">2,450 积分</p>
                            <p className="text-xs mt-3 opacity-90">积分可抵扣下次购物金额</p>
                            <button
                                onClick={() => message.info('积分兑换功能暂未开放')}
                                className="mt-4 w-full py-2 bg-white/20 hover:bg-white/30 rounded-lg text-sm font-semibold transition-colors"
                            >
                                立即兑换
                            </button>
                        </div>
                        <span className="material-symbols-outlined absolute -bottom-4 -right-4 text-7xl opacity-20 rotate-12">redeem</span>
                    </div>
                </aside>

                {/* Main Content Area */}
                <section className="flex-1">
                    {activeSection === 'orders' && (
                        <>
                            <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
                                <h1 className="text-2xl font-bold text-slate-900 dark:text-white">我的订单历史</h1>
                                <div className="relative">
                                    <input 
                                        className="pl-10 pr-4 py-2 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none text-sm w-full md:w-64" 
                                        placeholder="搜索订单..." 
                                        type="text"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                    />
                                    <span className="material-symbols-outlined absolute left-3 top-2 text-slate-400 text-lg">search</span>
                                </div>
                            </div>

                            <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-primary/5 overflow-hidden mb-8">
                                <div className="flex border-b border-slate-100 dark:border-slate-800 overflow-x-auto">
                                    <button 
                                        onClick={() => setOrderFilter('all')}
                                        className={`px-6 py-4 text-sm font-semibold whitespace-nowrap ${orderFilter === 'all' ? 'text-primary border-b-2 border-primary' : 'text-slate-500 hover:text-primary'}`}
                                    >
                                        全部订单
                                    </button>
                                    <button 
                                        onClick={() => setOrderFilter('PENDING')}
                                        className={`px-6 py-4 text-sm font-medium whitespace-nowrap relative ${orderFilter === 'PENDING' ? 'text-primary border-b-2 border-primary' : 'text-slate-500 hover:text-primary'}`}
                                    >
                                        待付款
                                        {pendingPaymentCount > 0 && <span className="ml-2 px-2 py-0.5 bg-red-100 text-red-600 text-[10px] rounded-full font-bold">{pendingPaymentCount}</span>}
                                    </button>
                                    <button 
                                        onClick={() => setOrderFilter('PAID')}
                                        className={`px-6 py-4 text-sm font-medium whitespace-nowrap relative ${orderFilter === 'PAID' ? 'text-primary border-b-2 border-primary' : 'text-slate-500 hover:text-primary'}`}
                                    >
                                        待发货
                                        {pendingShipmentCount > 0 && <span className="ml-2 px-2 py-0.5 bg-indigo-100 text-indigo-600 text-[10px] rounded-full font-bold">{pendingShipmentCount}</span>}
                                    </button>
                                    <button 
                                        onClick={() => setOrderFilter('SHIPPED')}
                                        className={`px-6 py-4 text-sm font-medium whitespace-nowrap relative ${orderFilter === 'SHIPPED' ? 'text-primary border-b-2 border-primary' : 'text-slate-500 hover:text-primary'}`}
                                    >
                                        待收货
                                        {pendingReceiptCount > 0 && <span className="ml-2 px-2 py-0.5 bg-amber-100 text-amber-600 text-[10px] rounded-full font-bold">{pendingReceiptCount}</span>}
                                    </button>
                                    <button 
                                        onClick={() => setOrderFilter('review')}
                                        className={`px-6 py-4 text-sm font-medium whitespace-nowrap relative ${orderFilter === 'review' ? 'text-primary border-b-2 border-primary' : 'text-slate-500 hover:text-primary'}`}
                                    >
                                        待评价
                                        {pendingReviewCount > 0 && <span className="ml-2 px-2 py-0.5 bg-green-100 text-green-600 text-[10px] rounded-full font-bold">{pendingReviewCount}</span>}
                                    </button>
                                </div>

                                <div className="p-1 min-h-[400px]">
                                    {loading ? (
                                        <div className="flex justify-center items-center h-64">
                                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                                        </div>
                                    ) : filteredOrders.length === 0 ? (
                                        <div className="flex flex-col items-center justify-center h-64 text-slate-500">
                                            <span className="material-symbols-outlined text-4xl mb-2">shopping_bag</span>
                                            <p>暂无相关订单</p>
                                        </div>
                                    ) : (
                                        filteredOrders.map((order) => (
                                            <div key={order.id} className="m-4 bg-background-light dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden hover:shadow-md transition-shadow">
                                                <div className="p-4 bg-white dark:bg-slate-800 flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-700">
                                                    <div className="flex gap-6">
                                                        <div>
                                                            <p className="text-[10px] uppercase font-bold text-slate-400">下单时间</p>
                                                            <p className="text-sm font-semibold">{formatDate(order.createTime)}</p>
                                                        </div>
                                                        <div>
                                                            <p className="text-[10px] uppercase font-bold text-slate-400">订单号</p>
                                                            <p className="text-sm font-semibold">ORD-{order.id.toString().padStart(6, '0')}</p>
                                                        </div>
                                                        <div>
                                                            <p className="text-[10px] uppercase font-bold text-slate-400">总价</p>
                                                            <p className="text-sm font-bold text-primary">¥{order.totalPrice.toFixed(2)}</p>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-4">
                                                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${getStatusColor(order.status)}`}>
                                                            <span className={`h-1.5 w-1.5 rounded-full ${order.status === 'COMPLETED' ? 'bg-green-600' : 'bg-slate-600'}`}></span>
                                                            {getStatusText(order.status)}
                                                        </span>
                                                        {order.status === 'PENDING' && (
                                                            <button 
                                                                onClick={() => navigate(`/payment/${order.id}`)}
                                                                className="px-3 py-1 bg-primary text-white text-xs font-bold rounded-full hover:bg-blue-600 transition-colors"
                                                            >
                                                                付款
                                                            </button>
                                                        )}
                                                        {order.status === 'SHIPPED' && (
                                                            <button 
                                                                onClick={() => handleConfirmReceipt(order.id)}
                                                                className="px-3 py-1 bg-green-600 text-white text-xs font-bold rounded-full hover:bg-green-700 transition-colors"
                                                            >
                                                                确认收货
                                                            </button>
                                                        )}
                                                        <button 
                                                            onClick={() => handleDeleteOrder(order.id)}
                                                            className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full transition-colors"
                                                            title="删除订单"
                                                        >
                                                            <span className="material-symbols-outlined text-xl">delete</span>
                                                        </button>
                                                    </div>
                                                </div>
                                                
                                                <div className="p-4 flex flex-col gap-4">
                                                    {order.items?.map((item) => (
                                                        <div key={item.id} className="flex flex-col md:flex-row gap-6 border-b border-slate-100 dark:border-slate-700 last:border-0 pb-4 last:pb-0">
                                                            <div className="flex-1 flex items-center gap-4">
                                                                <img 
                                                                    src={item.book?.coverImage || 'https://via.placeholder.com/150'} 
                                                                    alt={item.book?.title || 'Book'} 
                                                                    className="h-20 w-14 object-cover rounded shadow-sm border border-slate-200 dark:border-slate-700"
                                                                />
                                                                <div>
                                                                    <h4 className="font-semibold text-slate-900 dark:text-white leading-tight">{item.book?.title || 'Unknown Title'}</h4>
                                                                    <p className="text-xs text-slate-500 mt-1">{item.book?.author || 'Unknown Author'}</p>
                                                                    <p className="text-sm font-medium mt-1">数量: {item.quantity}</p>
                                                                </div>
                                                            </div>
                                                            <div className="flex flex-col justify-center items-end gap-3 min-w-[140px]">
                                                                {order.status === 'COMPLETED' && (
                                                                    <button 
                                                                        onClick={() => item.book && handleOpenReview(item.book)}
                                                                        className="w-full py-2 px-4 bg-primary text-white rounded-lg text-sm font-bold hover:bg-primary/90 transition-all flex items-center justify-center gap-2"
                                                                    >
                                                                        <span className="material-symbols-outlined text-lg">rate_review</span>
                                                                        写评价
                                                                    </button>
                                                                )}
                                                                <button 
                                                                    onClick={() => item.book && handleBuyAgain(item.book)}
                                                                    className="w-full py-2 px-4 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 rounded-lg text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-700 transition-all"
                                                                >
                                                                    再次购买
                                                                </button>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        </>
                    )}

                    {activeSection === 'profile' && (
                        <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-primary/5 p-8">
                            <h2 className="text-xl font-bold mb-6">个人信息</h2>
                            <form onSubmit={handleUpdateProfile} className="space-y-6 max-w-2xl">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">用户名</label>
                                    <input 
                                        type="text" 
                                        value={profileForm.username}
                                        disabled
                                        className="w-full px-4 py-2 border border-slate-200 rounded-lg bg-slate-50 text-slate-500 cursor-not-allowed"
                                    />
                                    <p className="text-xs text-slate-400 mt-1">用户名不可修改</p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">邮箱</label>
                                    <input 
                                        type="email" 
                                        value={profileForm.email}
                                        onChange={e => setProfileForm({...profileForm, email: e.target.value})}
                                        className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">真实姓名</label>
                                    <input 
                                        type="text" 
                                        value={profileForm.fullName}
                                        onChange={e => setProfileForm({...profileForm, fullName: e.target.value})}
                                        className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                                        placeholder="请输入真实姓名"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">联系电话</label>
                                    <input 
                                        type="tel" 
                                        value={profileForm.phoneNumber}
                                        onChange={e => setProfileForm({...profileForm, phoneNumber: e.target.value})}
                                        className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                                        placeholder="请输入手机号码"
                                    />
                                </div>
                                <button type="submit" className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors font-medium">
                                    保存修改
                                </button>
                            </form>
                        </div>
                    )}

                    {activeSection === 'address' && (
                        <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-primary/5 p-8">
                            <h2 className="text-xl font-bold mb-6">收货地址</h2>
                            <form onSubmit={handleUpdateAddress} className="space-y-6 max-w-2xl">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">默认收货地址</label>
                                    <textarea 
                                        value={addressForm.address}
                                        onChange={e => setAddressForm({...addressForm, address: e.target.value})}
                                        rows={4}
                                        className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                                        placeholder="请输入详细收货地址（省/市/区/街道/门牌号）"
                                    />
                                </div>
                                <button type="submit" className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors font-medium">
                                    保存地址
                                </button>
                            </form>
                        </div>
                    )}

                    {activeSection === 'password' && (
                        <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-primary/5 p-8">
                            <h2 className="text-xl font-bold mb-6">修改密码</h2>
                            <form onSubmit={handleUpdatePassword} className="space-y-6 max-w-2xl">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">当前密码</label>
                                    <input 
                                        type="password" 
                                        value={passwordForm.currentPassword}
                                        onChange={e => setPasswordForm({...passwordForm, currentPassword: e.target.value})}
                                        className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                                        placeholder="请输入当前密码"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">新密码</label>
                                    <input 
                                        type="password" 
                                        value={passwordForm.newPassword}
                                        onChange={e => setPasswordForm({...passwordForm, newPassword: e.target.value})}
                                        className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                                        placeholder="请输入新密码（至少6位）"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">确认新密码</label>
                                    <input 
                                        type="password" 
                                        value={passwordForm.confirmPassword}
                                        onChange={e => setPasswordForm({...passwordForm, confirmPassword: e.target.value})}
                                        className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                                        placeholder="请再次输入新密码"
                                    />
                                </div>
                                <button type="submit" className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors font-medium">
                                    确认修改
                                </button>
                            </form>
                        </div>
                    )}
                </section>
            </div>

            <ReviewModal 
                isOpen={isReviewModalOpen} 
                onClose={() => setIsReviewModalOpen(false)} 
                book={selectedBook}
            />
        </div>
    );
};

export default Profile;
