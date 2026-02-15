import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import api from '../api';
import type { Order, Book, User, Review } from '../types';
import ReviewModal from '../components/ReviewModal';
import { message } from 'antd';

import { useNavigate } from 'react-router-dom';

type AddressItem = {
    id: number;
    fullName: string;
    phoneNumber: string;
    address: string;
    isDefault: boolean;
};

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
    const [reviewedBooks, setReviewedBooks] = useState<Set<number>>(new Set());

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
    const [addresses, setAddresses] = useState<AddressItem[]>([]);
    const [addressEditor, setAddressEditor] = useState({
        id: null as number | null,
        fullName: '',
        phoneNumber: '',
        address: ''
    });
    const [isAddressEditorOpen, setIsAddressEditorOpen] = useState(false);
    const [addressErrors, setAddressErrors] = useState({
        fullName: '',
        phoneNumber: '',
        address: ''
    });
    const addressFormRef = useRef<HTMLDivElement | null>(null);

    // Password Form State
    const [passwordForm, setPasswordForm] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

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

    const fetchReviews = useCallback(async () => {
        if (!authUser?.id) return;
        try {
            const response = await api.get<Review[]>(`/reviews/user/${authUser.id}`);
            const reviews = response.data;
            const bookIds = new Set(reviews.map(r => r.book.id));
            setReviewedBooks(bookIds);
        } catch (error) {
            console.error('Failed to fetch reviews:', error);
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
            fetchReviews();
        }
    }, [activeSection, authUser?.id, fetchOrders, fetchReviews]);

    useEffect(() => {
        if (userProfile) {
            setProfileForm({
                fullName: userProfile.fullName || '',
                phoneNumber: userProfile.phoneNumber || '',
                email: userProfile.email || '',
                username: userProfile.username || ''
            });
        }
    }, [userProfile]);

    const applyAddressList = useCallback((list: AddressItem[]) => {
        setAddresses(list);
        const defaultAddress = list.find(item => item.isDefault);
        setAddressForm({ address: defaultAddress?.address || '' });
    }, []);

    const fetchAddresses = useCallback(async () => {
        if (!authUser?.id) return;
        try {
            const response = await api.get('/users/addresses');
            const data = Array.isArray(response.data) ? response.data : [];
            applyAddressList(data);
        } catch (error: unknown) {
            message.error(getErrorMessage(error, '获取地址失败'));
            applyAddressList([]);
        }
    }, [authUser?.id, applyAddressList]);

    useEffect(() => {
        if (authUser?.id) {
            fetchAddresses();
        }
    }, [authUser?.id, fetchAddresses]);

    const handleUpdateProfile = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const response = await api.put('/users/profile', {
                username: profileForm.username,
                email: profileForm.email,
                fullName: profileForm.fullName,
                phoneNumber: profileForm.phoneNumber
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


    const validateAddressForm = () => {
        const errors = {
            fullName: '',
            phoneNumber: '',
            address: ''
        };
        const fullName = addressEditor.fullName.trim();
        const username = profileForm.username.trim();
        if (!fullName && !username) {
            errors.fullName = '请填写收件人';
        }
        if (!addressEditor.phoneNumber.trim()) {
            errors.phoneNumber = '请填写手机号';
        }
        if (!addressEditor.address.trim()) {
            errors.address = '请填写详细地址';
        }
        setAddressErrors(errors);
        return Object.values(errors).every(value => !value);
    };

    const openAddressEditor = (entry?: AddressItem) => {
        if (entry) {
            setAddressEditor({
                id: entry.id,
                fullName: entry.fullName,
                phoneNumber: entry.phoneNumber,
                address: entry.address
            });
        } else {
            setAddressEditor({
                id: null,
                fullName: profileForm.fullName || profileForm.username || '',
                phoneNumber: profileForm.phoneNumber,
                address: ''
            });
        }
        setAddressErrors({ fullName: '', phoneNumber: '', address: '' });
        setIsAddressEditorOpen(true);
        setTimeout(() => {
            addressFormRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 0);
    };

    const handleUpdateAddress = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validateAddressForm()) {
            message.error('请完善收货地址信息');
            return;
        }
        try {
            const payload = {
                fullName: addressEditor.fullName.trim(),
                phoneNumber: addressEditor.phoneNumber.trim(),
                address: addressEditor.address.trim()
            };
            let response;
            if (addressEditor.id) {
                response = await api.put(`/users/addresses/${addressEditor.id}`, payload);
            } else {
                response = await api.post('/users/addresses', {
                    ...payload,
                    isDefault: addresses.length === 0
                });
            }
            const data = Array.isArray(response.data) ? response.data : [];
            applyAddressList(data);
            await fetchUserProfile();
            message.success(addressEditor.id ? '地址已更新' : '地址已新增');
            setIsAddressEditorOpen(false);
        } catch (error: unknown) {
            message.error(getErrorMessage(error, '更新失败'));
        }
    };

    const handleSetDefaultAddress = async (addressId: number) => {
        try {
            const response = await api.put(`/users/addresses/${addressId}/default`);
            const data = Array.isArray(response.data) ? response.data : [];
            applyAddressList(data);
            await fetchUserProfile();
            message.success('默认地址已更新');
        } catch (error: unknown) {
            message.error(getErrorMessage(error, '默认地址更新失败'));
        }
    };

    const handleDeleteAddress = async (addressId: number) => {
        if (!window.confirm('确定要删除该地址吗？')) return;
        try {
            const response = await api.delete(`/users/addresses/${addressId}`);
            const data = Array.isArray(response.data) ? response.data : [];
            applyAddressList(data);
            await fetchUserProfile();
            message.success('收货地址已删除');
        } catch (error: unknown) {
            message.error(getErrorMessage(error, '删除地址失败'));
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

    const passwordStrength = useMemo(() => {
        const password = passwordForm.newPassword;
        let score = 0;
        if (password.length >= 8) score += 1;
        if (/[0-9]/.test(password)) score += 1;
        if (/[^a-zA-Z0-9]/.test(password)) score += 1;
        if (/[A-Z]/.test(password)) score += 1;
        return score;
    }, [passwordForm.newPassword]);

    const passwordStrengthLabel = passwordStrength >= 3 ? '强' : passwordStrength === 2 ? '中' : '弱';
    const passwordStrengthPercent = Math.min(100, Math.max(10, passwordStrength * 25));

    const resetProfileForm = () => {
        if (!userProfile) return;
        setProfileForm({
            fullName: userProfile.fullName || '',
            phoneNumber: userProfile.phoneNumber || '',
            email: userProfile.email || '',
            username: userProfile.username || ''
        });
    };

    const resetAddressForm = () => {
        const defaultAddress = addresses.find(item => item.isDefault);
        setAddressForm({
            address: defaultAddress?.address || ''
        });
        setAddressEditor({
            id: null,
            fullName: userProfile?.fullName || userProfile?.username || '',
            phoneNumber: userProfile?.phoneNumber || '',
            address: defaultAddress?.address || ''
        });
        setAddressErrors({ fullName: '', phoneNumber: '', address: '' });
        setIsAddressEditorOpen(false);
    };

    const resetPasswordForm = () => {
        setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
        setShowCurrentPassword(false);
        setShowNewPassword(false);
        setShowConfirmPassword(false);
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

    const filteredOrders = useMemo(() => {
        let result = orders.filter(order => {
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
            if (orderFilter === 'review') {
                return order.status === 'COMPLETED' && 
                       order.items?.some(item => item.book && !reviewedBooks.has(item.book.id));
            }
            return order.status === orderFilter;
        });

        // Sort by createTime desc
        result = result.sort((a, b) => {
            const getTime = (value: unknown) => {
                if (Array.isArray(value)) {
                    const [year, month, day, hour = 0, minute = 0, second = 0] = value as number[];
                    return new Date(year, month - 1, day, hour, minute, second).getTime();
                }
                if (value instanceof Date) {
                    return value.getTime();
                }
                if (typeof value === 'string' || typeof value === 'number') {
                    return new Date(value).getTime();
                }
                return 0;
            };
            return getTime(b.createTime) - getTime(a.createTime);
        });

        return result;
    }, [orders, searchQuery, orderFilter, reviewedBooks]);

    const pendingPaymentCount = orders.filter(o => o.status === 'PENDING').length;
    const pendingShipmentCount = orders.filter(o => o.status === 'PAID').length;
    const pendingReceiptCount = orders.filter(o => o.status === 'SHIPPED').length;
    const pendingReviewCount = orders.filter(o => 
        o.status === 'COMPLETED' && 
        o.items?.some(item => item.book && !reviewedBooks.has(item.book.id))
    ).length;

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
                                                                {order.status === 'COMPLETED' && item.book && !reviewedBooks.has(item.book.id) && (
                                                                    <button 
                                                                        onClick={() => item.book && handleOpenReview(item.book)}
                                                                        className="w-full py-2 px-4 bg-primary text-white rounded-lg text-sm font-bold hover:bg-primary/90 transition-all flex items-center justify-center gap-2"
                                                                    >
                                                                        <span className="material-symbols-outlined text-lg">rate_review</span>
                                                                        写评价
                                                                    </button>
                                                                )}
                                                                {order.status === 'COMPLETED' && item.book && reviewedBooks.has(item.book.id) && (
                                                                    <div className="w-full py-2 px-4 bg-slate-100 dark:bg-slate-800 text-slate-500 rounded-lg text-sm font-bold flex items-center justify-center gap-2">
                                                                        <span className="material-symbols-outlined text-lg">check_circle</span>
                                                                        已评价
                                                                    </div>
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
                        <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
                            <div className="px-8 py-6 border-b border-slate-100 dark:border-slate-800">
                                <h2 className="text-2xl font-bold text-slate-900 dark:text-white">个人资料</h2>
                                <p className="text-slate-500 dark:text-slate-400 mt-1">更新你的基础信息并完善联系方式。</p>
                            </div>
                            <form onSubmit={handleUpdateProfile} className="p-8">
                                <div className="flex flex-col md:flex-row items-center gap-8 mb-10 pb-10 border-b border-slate-100 dark:border-slate-800">
                                    <div className="relative group">
                                        <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-slate-50 dark:border-slate-800 shadow-md">
                                            <img
                                                alt="用户头像"
                                                className="w-full h-full object-cover"
                                                src="https://lh3.googleusercontent.com/aida-public/AB6AXuDLWy4nRvzdwMEflfEcy-VsdRTdyRDszEX3k5UqIi3t0-pUKLh3ncOY2fo2M2x-5cPTiEHfvj-AmhRxvph0wpH3F0FTmTN3Zh8L3kh_AVgEAfiPWCbSGVdKApsC_0ihFxGybGZ2J40mZ0y2SDUPbZsBnI3KkFQKm4y26qRAKCDnIRbTTYx5-GVI75XcPhOWSiClCVFaThltNl09xR3SPJ9KdCCfkg2nT8AnTMG-n83il4GIL9oGVhnowxaHqOEtkUYqZcXnLiKm2lw"
                                            />
                                        </div>
                                        <label className="absolute bottom-1 right-1 bg-primary text-white p-2 rounded-full cursor-pointer shadow-lg hover:bg-blue-600 transition-colors" htmlFor="avatar-upload">
                                            <span className="material-symbols-outlined text-sm">photo_camera</span>
                                            <input className="hidden" id="avatar-upload" type="file" />
                                        </label>
                                    </div>
                                    <div className="flex-1 text-center md:text-left">
                                        <h3 className="text-lg font-semibold mb-1">个人头像</h3>
                                        <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">支持 PNG、JPG 或 GIF，最大 5MB。</p>
                                        <div className="flex flex-wrap justify-center md:justify-start gap-3">
                                            <button className="px-4 py-2 bg-primary/10 text-primary text-sm font-medium rounded-lg hover:bg-primary/20 transition-all" type="button">
                                                上传新头像
                                            </button>
                                            <button className="px-4 py-2 text-slate-500 text-sm font-medium hover:text-red-500 transition-all" type="button">
                                                移除
                                            </button>
                                        </div>
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                                    <div className="space-y-2">
                                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">用户名</label>
                                        <div className="relative">
                                            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xl">badge</span>
                                            <input
                                                type="text"
                                                value={profileForm.username}
                                                disabled
                                                className="w-full pl-10 pr-4 py-2.5 bg-slate-100 dark:bg-slate-800/50 border-slate-200 dark:border-slate-800 rounded-lg text-slate-400 cursor-not-allowed"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">邮箱地址</label>
                                        <div className="relative">
                                            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xl">mail</span>
                                            <input
                                                type="email"
                                                value={profileForm.email}
                                                onChange={e => setProfileForm({ ...profileForm, email: e.target.value })}
                                                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none"
                                                placeholder="请输入邮箱"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">姓名</label>
                                        <div className="relative">
                                            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xl">person</span>
                                            <input
                                                type="text"
                                                value={profileForm.fullName}
                                                onChange={e => setProfileForm({ ...profileForm, fullName: e.target.value })}
                                                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none"
                                                placeholder="请输入姓名"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">手机号</label>
                                        <div className="relative">
                                            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xl">phone_iphone</span>
                                            <input
                                                type="tel"
                                                value={profileForm.phoneNumber}
                                                onChange={e => setProfileForm({ ...profileForm, phoneNumber: e.target.value })}
                                                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none"
                                                placeholder="请输入手机号"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="block text-sm font-medium text-slate-500 dark:text-slate-400">用户 ID</label>
                                        <div className="relative">
                                            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xl">fingerprint</span>
                                            <input
                                                type="text"
                                                disabled
                                                value={userProfile?.id ? `BH-${userProfile.id.toString().padStart(7, '0')}` : '未分配'}
                                                className="w-full pl-10 pr-4 py-2.5 bg-slate-100 dark:bg-slate-800/50 border-slate-200 dark:border-slate-800 rounded-lg text-slate-400 cursor-not-allowed"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">默认收货地址（来自地址管理）</label>
                                        <div className="relative">
                                            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xl">location_on</span>
                                            <input
                                                type="text"
                                                value={addressForm.address}
                                                disabled
                                                className="w-full pl-10 pr-4 py-2.5 bg-slate-100 dark:bg-slate-800/50 border-slate-200 dark:border-slate-800 rounded-lg text-slate-400 cursor-not-allowed"
                                                placeholder="请输入默认收货地址"
                                            />
                                        </div>
                                    </div>
                                </div>
                                <div className="mt-10 pt-6 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-4">
                                    <button className="px-6 py-2.5 text-sm font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-all" type="button" onClick={resetProfileForm}>
                                        取消
                                    </button>
                                    <button className="px-8 py-2.5 bg-primary text-white text-sm font-bold rounded-lg hover:bg-blue-600 shadow-lg shadow-primary/20 transition-all flex items-center gap-2" type="submit">
                                        <span className="material-symbols-outlined text-sm">save</span>
                                        保存修改
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}

                    {activeSection === 'address' && (
                        <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
                            <div className="px-8 py-6 border-b border-slate-100 dark:border-slate-800">
                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                    <div>
                                        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">收货地址管理</h2>
                                        <p className="text-slate-500 dark:text-slate-400 mt-1">管理常用收货地址，快速完成结算。</p>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => openAddressEditor()}
                                        className="bg-primary hover:bg-primary/90 text-white px-5 py-2.5 rounded-lg font-medium flex items-center justify-center gap-2 transition-all shadow-lg shadow-primary/20"
                                    >
                                        <span className="material-symbols-outlined text-sm">add</span>
                                        新增地址
                                    </button>
                                </div>
                            </div>
                            <div className="p-8">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {addresses.map(address => (
                                        <div
                                            key={address.id}
                                            className={`bg-white dark:bg-slate-900 border-2 rounded-xl p-6 relative shadow-sm flex flex-col h-full ${address.isDefault ? 'border-primary' : 'border-slate-200 dark:border-slate-800'}`}
                                        >
                                            {address.isDefault && (
                                                <div className="absolute top-4 right-4 bg-primary text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                                                    默认
                                                </div>
                                            )}
                                            <div className="flex items-center gap-3 mb-4">
                                                <div className="bg-primary/10 p-2 rounded-lg">
                                                    <span className="material-symbols-outlined text-primary">person</span>
                                                </div>
                                                <div>
                                                    <h3 className="font-semibold text-slate-900 dark:text-white">{address.fullName || '未命名收件人'}</h3>
                                                    <p className="text-xs text-slate-500 font-medium">{address.phoneNumber || '未填写手机号'}</p>
                                                </div>
                                            </div>
                                            <div className="flex-grow">
                                                <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed mb-1">收货地址</p>
                                                <p className="text-sm text-slate-700 dark:text-slate-300 font-medium">{address.address || '暂未填写详细地址'}</p>
                                                <p className="text-xs text-slate-400 mt-2 italic">{address.address ? '请确保地址信息完整' : '新增地址后可用于快速结算'}</p>
                                            </div>
                                            <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                                                <div className="flex gap-4">
                                                    <button
                                                        type="button"
                                                        onClick={() => openAddressEditor(address)}
                                                        className="text-slate-600 hover:text-primary flex items-center gap-1 text-sm font-medium transition-colors"
                                                    >
                                                        <span className="material-symbols-outlined text-base">edit</span>
                                                        编辑
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => handleDeleteAddress(address.id)}
                                                        className="text-slate-600 hover:text-red-500 flex items-center gap-1 text-sm font-medium transition-colors"
                                                    >
                                                        <span className="material-symbols-outlined text-base">delete</span>
                                                        删除
                                                    </button>
                                                </div>
                                                {address.isDefault ? (
                                                    <div className="flex items-center text-primary text-xs font-semibold">
                                                        <span className="material-symbols-outlined text-sm mr-1">check_circle</span>
                                                        默认地址
                                                    </div>
                                                ) : (
                                                    <button
                                                        type="button"
                                                        onClick={() => handleSetDefaultAddress(address.id)}
                                                        className="text-xs font-semibold text-primary hover:text-primary/80 transition-colors"
                                                    >
                                                        设为默认
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                    <div
                                        className="border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-xl flex flex-col items-center justify-center p-8 bg-slate-50/50 dark:bg-slate-800/20 hover:border-primary/50 transition-colors cursor-pointer"
                                        onClick={() => openAddressEditor()}
                                    >
                                        <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-4">
                                            <span className="material-symbols-outlined text-slate-400">add</span>
                                        </div>
                                        <p className="text-sm font-medium text-slate-600 dark:text-slate-400">新增收货地址</p>
                                        <p className="text-xs text-slate-400 mt-1 text-center">支持保存多个地址便于礼物配送</p>
                                    </div>
                                </div>
                                {!addresses.length && (
                                    <div className="mt-6 text-sm text-slate-500 dark:text-slate-400">
                                        暂未添加收货地址，点击上方卡片开始创建。
                                    </div>
                                )}
                            </div>
                            {isAddressEditorOpen && (
                                <div className="px-8 pb-8" ref={addressFormRef}>
                                    <div className="max-w-2xl mx-auto bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden">
                                        <div className="bg-primary px-6 py-4 flex items-center justify-between">
                                            <h3 className="text-white font-semibold text-lg">新增/编辑收货地址</h3>
                                            <button type="button" onClick={resetAddressForm} className="text-white/80 hover:text-white">
                                                <span className="material-symbols-outlined">close</span>
                                            </button>
                                        </div>
                                        <form onSubmit={handleUpdateAddress} className="p-8 space-y-6" id="address-form">
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                <div className="space-y-1">
                                                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">收件人</label>
                                                    <input
                                                        className={`w-full bg-slate-50 dark:bg-slate-800 border rounded-lg focus:ring-primary focus:border-primary text-sm p-3 ${addressErrors.fullName ? 'border-red-300 dark:border-red-500' : 'border-slate-200 dark:border-slate-700'}`}
                                                        type="text"
                                                        value={addressEditor.fullName}
                                                        onChange={e => {
                                                            setAddressEditor({ ...addressEditor, fullName: e.target.value });
                                                            if (addressErrors.fullName) {
                                                                setAddressErrors(prev => ({ ...prev, fullName: '' }));
                                                            }
                                                        }}
                                                        placeholder="请输入收件人姓名"
                                                    />
                                                    {addressErrors.fullName && (
                                                        <p className="text-xs text-red-500">{addressErrors.fullName}</p>
                                                    )}
                                                </div>
                                                <div className="space-y-1">
                                                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">手机号</label>
                                                    <input
                                                        className={`w-full bg-slate-50 dark:bg-slate-800 border rounded-lg focus:ring-primary focus:border-primary text-sm p-3 ${addressErrors.phoneNumber ? 'border-red-300 dark:border-red-500' : 'border-slate-200 dark:border-slate-700'}`}
                                                        type="tel"
                                                        value={addressEditor.phoneNumber}
                                                        onChange={e => {
                                                            setAddressEditor({ ...addressEditor, phoneNumber: e.target.value });
                                                            if (addressErrors.phoneNumber) {
                                                                setAddressErrors(prev => ({ ...prev, phoneNumber: '' }));
                                                            }
                                                        }}
                                                        placeholder="请输入手机号"
                                                    />
                                                    {addressErrors.phoneNumber && (
                                                        <p className="text-xs text-red-500">{addressErrors.phoneNumber}</p>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="space-y-1">
                                                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">详细地址</label>
                                                <textarea
                                                    className={`w-full bg-slate-50 dark:bg-slate-800 border rounded-lg focus:ring-primary focus:border-primary text-sm p-3 ${addressErrors.address ? 'border-red-300 dark:border-red-500' : 'border-slate-200 dark:border-slate-700'}`}
                                                    rows={3}
                                                    value={addressEditor.address}
                                                    onChange={e => {
                                                        setAddressEditor({ ...addressEditor, address: e.target.value });
                                                        if (addressErrors.address) {
                                                            setAddressErrors(prev => ({ ...prev, address: '' }));
                                                        }
                                                    }}
                                                    placeholder="请输入省/市/区/街道/门牌号"
                                                />
                                                {addressErrors.address && (
                                                    <p className="text-xs text-red-500">{addressErrors.address}</p>
                                                )}
                                            </div>
                                            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                                                <button
                                                    className="px-6 py-2.5 text-sm font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg transition-colors"
                                                    type="button"
                                                    onClick={resetAddressForm}
                                                >
                                                    取消
                                                </button>
                                                <button
                                                    className="px-6 py-2.5 text-sm font-semibold text-white bg-primary hover:bg-primary/90 rounded-lg shadow-md shadow-primary/20 transition-all"
                                                    type="submit"
                                                >
                                                    保存地址
                                                </button>
                                            </div>
                                        </form>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {activeSection === 'password' && (
                        <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
                            <div className="p-8">
                                <div className="mb-8">
                                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white">修改密码</h2>
                                    <p className="text-slate-500 dark:text-slate-400 mt-2">建议定期更新密码，增强账户安全性。</p>
                                </div>
                                <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg flex items-center gap-3">
                                    <span className="material-symbols-outlined text-blue-500">info</span>
                                    <p className="text-sm text-blue-800 dark:text-blue-300">请设置包含字母、数字和特殊字符的组合密码。</p>
                                </div>
                                <form onSubmit={handleUpdatePassword} className="space-y-6">
                                    <div className="space-y-2">
                                        <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">当前密码</label>
                                        <div className="relative">
                                            <input
                                                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition-all text-slate-900 dark:text-white"
                                                type={showCurrentPassword ? 'text' : 'password'}
                                                placeholder="请输入当前密码"
                                                value={passwordForm.currentPassword}
                                                onChange={e => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                                            />
                                            <button
                                                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                                                type="button"
                                                onClick={() => setShowCurrentPassword(prev => !prev)}
                                            >
                                                <span className="material-symbols-outlined text-xl">{showCurrentPassword ? 'visibility_off' : 'visibility'}</span>
                                            </button>
                                        </div>
                                    </div>
                                    <hr className="border-slate-100 dark:border-slate-800" />
                                    <div className="space-y-2">
                                        <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">新密码</label>
                                        <div className="relative">
                                            <input
                                                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition-all text-slate-900 dark:text-white"
                                                type={showNewPassword ? 'text' : 'password'}
                                                placeholder="请输入新密码"
                                                value={passwordForm.newPassword}
                                                onChange={e => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                                            />
                                            <button
                                                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                                                type="button"
                                                onClick={() => setShowNewPassword(prev => !prev)}
                                            >
                                                <span className="material-symbols-outlined text-xl">{showNewPassword ? 'visibility_off' : 'visibility'}</span>
                                            </button>
                                        </div>
                                        <div className="mt-3 space-y-2">
                                            <div className="flex justify-between items-center text-xs font-medium">
                                                <span className="text-slate-500">
                                                    密码强度：
                                                    <span className="text-primary font-bold uppercase tracking-wider"> {passwordStrengthLabel}</span>
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
                                                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition-all text-slate-900 dark:text-white"
                                                type={showConfirmPassword ? 'text' : 'password'}
                                                placeholder="请再次输入新密码"
                                                value={passwordForm.confirmPassword}
                                                onChange={e => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                                            />
                                            <button
                                                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                                                type="button"
                                                onClick={() => setShowConfirmPassword(prev => !prev)}
                                            >
                                                <span className="material-symbols-outlined text-xl">{showConfirmPassword ? 'visibility_off' : 'visibility'}</span>
                                            </button>
                                        </div>
                                        {passwordForm.confirmPassword && (
                                            <p className={`text-[11px] mt-1 flex items-center gap-1 ${passwordForm.newPassword === passwordForm.confirmPassword ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-500'}`}>
                                                <span className="material-symbols-outlined text-[14px]">info</span>
                                                {passwordForm.newPassword === passwordForm.confirmPassword ? '两次密码输入一致' : '两次密码输入不一致'}
                                            </p>
                                        )}
                                    </div>
                                    <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-lg border border-slate-100 dark:border-slate-800">
                                        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">密码要求</h4>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                            <div className={`flex items-center gap-2 text-sm ${passwordForm.newPassword.length >= 8 ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400'}`}>
                                                <span className="material-symbols-outlined text-base">{passwordForm.newPassword.length >= 8 ? 'check_circle' : 'cancel'}</span>
                                                <span>至少 8 个字符</span>
                                            </div>
                                            <div className={`flex items-center gap-2 text-sm ${/[0-9]/.test(passwordForm.newPassword) ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400'}`}>
                                                <span className="material-symbols-outlined text-base">{/[0-9]/.test(passwordForm.newPassword) ? 'check_circle' : 'cancel'}</span>
                                                <span>至少包含 1 个数字</span>
                                            </div>
                                            <div className={`flex items-center gap-2 text-sm ${/[^a-zA-Z0-9]/.test(passwordForm.newPassword) ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400'}`}>
                                                <span className="material-symbols-outlined text-base">{/[^a-zA-Z0-9]/.test(passwordForm.newPassword) ? 'check_circle' : 'cancel'}</span>
                                                <span>包含特殊字符</span>
                                            </div>
                                            <div className={`flex items-center gap-2 text-sm ${/[A-Z]/.test(passwordForm.newPassword) ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400'}`}>
                                                <span className="material-symbols-outlined text-base">{/[A-Z]/.test(passwordForm.newPassword) ? 'check_circle' : 'cancel'}</span>
                                                <span>包含大写字母</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex flex-col sm:flex-row gap-3 pt-4">
                                        <button className="flex-1 bg-primary hover:bg-primary/90 text-white font-semibold py-2.5 px-4 rounded-lg transition-all flex items-center justify-center gap-2 shadow-sm shadow-primary/20" type="submit">
                                            <span className="material-symbols-outlined text-lg">save</span>
                                            更新密码
                                        </button>
                                        <button className="px-6 py-2.5 text-slate-600 dark:text-slate-400 font-semibold hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors" type="button" onClick={resetPasswordForm}>
                                            取消
                                        </button>
                                    </div>
                                </form>
                            </div>
                            <div className="px-8 py-4 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-200 dark:border-slate-800 flex items-center justify-center gap-2 text-xs text-slate-400 uppercase tracking-widest font-semibold">
                                <span className="material-symbols-outlined text-sm">lock</span>
                                端到端加密保护
                            </div>
                        </div>
                    )}
                </section>
            </div>

            <ReviewModal 
                isOpen={isReviewModalOpen} 
                onClose={() => setIsReviewModalOpen(false)} 
                book={selectedBook}
                onSuccess={() => {
                    fetchReviews();
                    setIsReviewModalOpen(false);
                }}
            />
        </div>
    );
};

export default Profile;
