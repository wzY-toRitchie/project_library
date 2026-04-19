import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { message } from 'antd';
import api from '../api';
import { getAvailableUserCoupons } from '../api/coupons';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import type { UserCoupon } from '../types';
import { FALLBACK_COVER } from '../utils/constants';

interface CheckoutItem {
    id: number;
    title: string;
    author: string;
    price: number;
    quantity: number;
    coverImage?: string;
}

interface LocationState {
    items: CheckoutItem[];
    totalPrice: number;
}

const CHECKOUT_STORAGE_KEY = 'checkout:pending';

const Checkout: React.FC = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { user, login } = useAuth();
    const { cartItems, clearCart } = useCart();

    const checkoutState = useMemo(() => {
        const routeState = location.state as LocationState | null;
        if (routeState?.items?.length) {
            return routeState;
        }

        const savedCheckout = sessionStorage.getItem(CHECKOUT_STORAGE_KEY);
        if (savedCheckout) {
            try {
                const parsed = JSON.parse(savedCheckout) as LocationState;
                if (parsed?.items?.length) {
                    return parsed;
                }
            } catch {
                sessionStorage.removeItem(CHECKOUT_STORAGE_KEY);
            }
        }

        if (cartItems.length > 0) {
            return {
                items: cartItems.map(item => ({
                    id: item.id,
                    title: item.title,
                    author: item.author,
                    price: item.price,
                    quantity: item.quantity,
                    coverImage: item.coverImage
                })),
                totalPrice: cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0)
            };
        }

        return null;
    }, [cartItems, location.state]);
    const items = checkoutState?.items || [];
    const totalPrice = checkoutState?.totalPrice || 0;

    const [loading, setLoading] = useState(false);
    
    // Coupon State
    const [availableCoupons, setAvailableCoupons] = useState<UserCoupon[]>([]);
    const [selectedCoupon, setSelectedCoupon] = useState<UserCoupon | null>(null);
    const [showCouponList, setShowCouponList] = useState(false);
    const [discountAmount, setDiscountAmount] = useState(0);

    // Address State
    const [addresses, setAddresses] = useState<Array<{
        id: number;
        fullName: string;
        phoneNumber: string;
        address: string;
        isDefault: boolean;
    }>>([]);
    const [selectedAddressId, setSelectedAddressId] = useState<number | null>(null);
    const [hasFetchedAddresses, setHasFetchedAddresses] = useState(false);

    const hasNoItems = items.length === 0;

    useEffect(() => {
        if (checkoutState?.items?.length) {
            sessionStorage.setItem(CHECKOUT_STORAGE_KEY, JSON.stringify(checkoutState));
        } else {
            sessionStorage.removeItem(CHECKOUT_STORAGE_KEY);
        }
    }, [checkoutState]);

    useEffect(() => {
        if (hasNoItems) {
            message.error('无结算商品，请先选择商品');
            navigate('/cart', { replace: true });
        }
    }, [hasNoItems, navigate]);

    // Fetch latest user profile to ensure address is up to date
    useEffect(() => {
        const fetchProfile = async () => {
            if (user?.id) {
                try {
                    const response = await api.get('/users/me');
                    // Merge current user (with token) and new profile data
                    login({ ...user, ...response.data });
                } catch (error) {
                    console.error('Failed to refresh user profile', error);
                }
            }
        };
        fetchProfile();
    }, [login, user]);

    // Fetch available coupons
    useEffect(() => {
        const fetchCoupons = async () => {
            try {
                const coupons = await getAvailableUserCoupons();
                setAvailableCoupons(coupons);
            } catch (error) {
                console.error('Failed to fetch coupons:', error);
            }
        };
        fetchCoupons();
    }, []);

    // Fetch addresses and auto-select default
    useEffect(() => {
        const fetchAddresses = async () => {
            if (!user?.id || hasFetchedAddresses) return;
            try {
                const response = await api.get('/users/addresses');
                const addrList = response.data;
                setAddresses(addrList);
                // Auto-select default address
                const defaultAddr = addrList.find((a: { isDefault: boolean }) => a.isDefault);
                if (defaultAddr) {
                    setSelectedAddressId(defaultAddr.id);
                } else if (addrList.length > 0) {
                    setSelectedAddressId(addrList[0].id);
                }
                setHasFetchedAddresses(true);
            } catch (error) {
                console.error('Failed to fetch addresses:', error);
            }
        };
        fetchAddresses();
    }, [user?.id, hasFetchedAddresses]);

    // Calculate discount when coupon or totalPrice changes
    const calculateDiscount = useCallback((coupon: UserCoupon | null, price: number) => {
        if (!coupon || !coupon.coupon) {
            setDiscountAmount(0);
            return;
        }
        const c = coupon.coupon;
        const value = Number(c.value) || 0;
        const minAmount = Number(c.minAmount) || 0;
        if (c.type === 'FULL_REDUCE') {
            setDiscountAmount(price >= minAmount ? value : 0);
        } else if (c.type === 'DISCOUNT') {
            setDiscountAmount(price * (1 - value));
        } else {
            setDiscountAmount(0);
        }
    }, []);

    useEffect(() => {
        calculateDiscount(selectedCoupon, totalPrice);
    }, [selectedCoupon, totalPrice, calculateDiscount]);

    // Handle coupon selection - calculate discount immediately
    const handleSelectCoupon = useCallback((coupon: UserCoupon) => {
        setSelectedCoupon(coupon);
        setShowCouponList(false);
        calculateDiscount(coupon, totalPrice);
    }, [totalPrice, calculateDiscount]);

    // Clear coupon selection
    const handleClearCoupon = useCallback(() => {
        setSelectedCoupon(null);
        setDiscountAmount(0);
    }, []);

    // Format discount display
    const formatDiscount = (coupon: UserCoupon['coupon']) => {
        const value = Number(coupon.value) || 0;
        const minAmount = Number(coupon.minAmount) || 0;
        if (coupon.type === 'FULL_REDUCE') {
            return `满${minAmount}减${value}`;
        } else if (coupon.type === 'DISCOUNT') {
            return `${(value * 10).toFixed(0)}折`;
        }
        return '优惠';
    };

    // Redirect if no items
    if (hasNoItems) {
        return null;
    }

    const handleSubmitOrder = async () => {
        setLoading(true);
        try {
            const orderData: {
                items: { bookId: number; quantity: number }[];
                couponId?: number;
            } = {
                items: items.map(item => ({
                    bookId: item.id,
                    quantity: item.quantity
                }))
            };

            // Add coupon if selected
            if (selectedCoupon) {
                orderData.couponId = selectedCoupon.id;
            }

            const response = await api.post('/orders', orderData);
            message.success('订单提交成功！');
            sessionStorage.removeItem(CHECKOUT_STORAGE_KEY);

            await clearCart();
            
            if (response.data && response.data.id) {
                navigate(`/payment/${response.data.id}`);
            } else {
                // Fallback if backend doesn't return the order object
                navigate('/profile?tab=orders');
            }
        } catch (error) {
            console.error('Checkout failed:', error);
            message.error('璁㈠崟鎻愪氦澶辫触锛岃绋嶅悗鍐嶈瘯');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex-1 flex flex-col items-center py-8 px-4 sm:px-6 lg:px-8">
            <div className="w-full max-w-[1024px] flex flex-col gap-8">
                {/* Breadcrumbs & Heading */}
                <div className="flex flex-col gap-4">
                    <div className="flex flex-wrap items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                        <Link to="/" className="hover:text-primary transition-colors">首页</Link>
                        <span className="material-symbols-outlined text-[16px]" aria-hidden="true">chevron_right</span>
                        <Link to="/cart" className="hover:text-primary transition-colors">购物车</Link>
                        <span className="material-symbols-outlined text-[16px]" aria-hidden="true">chevron_right</span>
                        <span className="text-slate-900 dark:text-white font-medium">订单结算</span>
                    </div>
                    <h1 className="text-slate-900 dark:text-white text-3xl sm:text-4xl font-black leading-tight tracking-[-0.033em]">
                        订单结算
                    </h1>

                    {/* Progress Steps */}
                    <div className="flex items-center gap-2 mt-6">
                        <div className="flex items-center gap-1.5 text-primary">
                            <span className="w-6 h-6 rounded-full bg-primary text-white text-xs flex items-center justify-center font-bold">1</span>
                            <span className="text-sm font-medium">收货地址</span>
                        </div>
                        <div className="flex-1 h-px bg-primary/30" />
                        <div className="flex items-center gap-1.5 text-primary">
                            <span className="w-6 h-6 rounded-full bg-primary text-white text-xs flex items-center justify-center font-bold">2</span>
                            <span className="text-sm font-medium">确认订单</span>
                        </div>
                        <div className="flex-1 h-px bg-slate-200 dark:bg-slate-700" />
                        <div className="flex items-center gap-1.5 text-slate-400">
                            <span className="w-6 h-6 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-500 text-xs flex items-center justify-center font-bold">3</span>
                            <span className="text-sm font-medium">支付</span>
                        </div>
                    </div>
                </div>

                {/* Main Content Layout */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column: Address & Items */}
                    <div className="lg:col-span-2 flex flex-col gap-8">
                        {/* Shipping Address Section */}
                        <section className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden">
                            <div className="p-6 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center">
                                <h2 className="text-lg font-bold leading-tight flex items-center gap-2 text-slate-900 dark:text-white">
                                    <span className="material-symbols-outlined text-primary text-2xl" aria-hidden="true">location_on</span>
                                    收货地址
                                </h2>
                                <button 
                                    onClick={() => navigate('/profile?tab=address')}
                                    className="text-primary text-sm font-medium hover:underline"
                                >
                                    管理地址
                                </button>
                            </div>
                            <div className="p-6 grid gap-4">
                                {/* Address List */}
                                {addresses.length > 0 ? (
                                    <div className="grid gap-3">
                                        {addresses.map(addr => (
                                            <button
                                                key={addr.id}
                                                onClick={() => setSelectedAddressId(addr.id)}
                                                className={`relative flex items-start gap-4 p-4 rounded-lg border-2 cursor-pointer transition-colors text-left w-full ${
                                                    selectedAddressId === addr.id
                                                        ? 'border-primary bg-primary/5 dark:bg-primary/10'
                                                        : 'border-slate-200 dark:border-slate-700 hover:border-primary/50'
                                                }`}
                                            >
                                                {selectedAddressId === addr.id && (
                                                    <div className="absolute top-4 right-4 text-primary">
                                                        <span className="material-symbols-outlined text-[20px]" aria-hidden="true">check</span>
                                                    </div>
                                                )}
                                                <div className="flex flex-col gap-1">
                                                    <div className="flex items-center gap-2">
                                                        <p className="text-slate-900 dark:text-white text-base font-bold">{addr.fullName}</p>
                                                        {addr.isDefault && (
                                                            <span className="px-2 py-0.5 rounded bg-primary/20 text-primary text-xs font-bold">默认</span>
                                                        )}
                                                    </div>
                                                    <p className="text-slate-500 dark:text-gray-400 text-sm mt-1">{addr.phoneNumber}</p>
                                                    <p className="text-slate-500 dark:text-gray-400 text-sm">{addr.address}</p>
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="relative flex items-start gap-4 p-4 rounded-lg border-2 border-dashed border-slate-300 dark:border-slate-600">
                                        <div className="flex flex-col gap-1">
                                            <p className="text-slate-500 dark:text-gray-400 text-sm">暂无收货地址，请先添加地址</p>
                                        </div>
                                    </div>
                                )}
                                
                                <button
                                    onClick={() => navigate('/profile?tab=address')}
                                    className="flex items-center justify-center gap-2 w-full py-3 mt-2 border border-dashed border-slate-500 rounded-lg text-slate-500 hover:text-primary hover:border-primary hover:bg-primary/5 transition-colors"
                                >
                                    <span className="material-symbols-outlined text-[20px]" aria-hidden="true">add</span>
                                    <span className="font-medium">添加/修改地址</span>
                                </button>
                            </div>
                        </section>

                        {/* Order Items Section */}
                        <section className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden">
                            <div className="p-6 border-b border-slate-100 dark:border-slate-700">
                                <h2 className="text-lg font-bold leading-tight flex items-center gap-2 text-slate-900 dark:text-white">
                                    <span className="material-symbols-outlined text-primary text-2xl" aria-hidden="true">shopping_bag</span>
                                    订单商品 ({items.reduce((acc, item) => acc + item.quantity, 0)})
                                </h2>
                            </div>
                            <div className="divide-y divide-slate-100 dark:divide-slate-700">
                                {items.map((item) => (
                                    <div key={item.id} className="p-6 flex flex-col sm:flex-row gap-6 items-start sm:items-center">
                                        <img 
                                            src={item.coverImage || FALLBACK_COVER}
                                            alt={item.title}
                                            className="w-20 h-28 object-cover rounded shadow-sm"
                                            loading="lazy"
                                            width={80}
                                            height={112}
                                        />
                                        <div className="flex-1 min-w-0">
                                            <h3 className="text-slate-900 dark:text-white font-bold text-lg truncate">{item.title}</h3>
                                            <p className="text-slate-500 dark:text-gray-400 text-sm mt-1">{item.author}</p>
                                            <p className="text-slate-500 dark:text-gray-400 text-sm mt-1">平装本</p>
                                        </div>
                                        <div className="flex items-center justify-between sm:justify-end gap-8 w-full sm:w-auto mt-2 sm:mt-0">
                                            <div className="text-slate-500 dark:text-gray-400 text-sm">
                                                数量: <span className="text-slate-900 dark:text-white font-semibold">{item.quantity}</span>
                                            </div>
                                            <div className="text-slate-900 dark:text-white font-bold text-lg">¥{item.price.toFixed(2)}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </section>
                    </div>

                    {/* Right Column: Order Summary (Sticky) */}
                    <div className="lg:col-span-1">
                        <div className="sticky top-24 flex flex-col gap-6">
                            <div className="bg-white dark:bg-slate-900 rounded-xl shadow-lg border border-slate-100 dark:border-slate-700 overflow-hidden">
                                <div className="p-6 border-b border-slate-100 dark:border-slate-700">
                                    <h2 className="text-lg font-bold leading-tight text-slate-900 dark:text-white">订单摘要</h2>
                                </div>
                                <div className="p-6 flex flex-col gap-4">
                                    <div className="flex justify-between items-center text-slate-500 dark:text-slate-400">
                                        <span>商品小计 ({items.length} 件)</span>
                                        <span className="font-medium text-slate-900 dark:text-white">¥{totalPrice.toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between items-center text-slate-500 dark:text-slate-400">
                                        <span>运费</span>
                                        <span className="font-medium text-slate-900 dark:text-white">¥0.00</span>
                                    </div>
                                    
                                    {/* Coupon Selection */}
                                    <div className="relative">
                                        {selectedCoupon ? (
                                            <div className="flex items-center justify-between p-3 rounded-lg bg-primary/5 border border-primary/20">
                                                <div className="flex items-center gap-2">
                                                    <span className="material-symbols-outlined text-[18px] text-primary" aria-hidden="true">confirmation_number</span>
                                                    <div>
                                                        <p className="text-sm font-medium text-slate-900 dark:text-white">
                                                            {selectedCoupon.coupon.name}
                                                        </p>
                                                        <p className="text-xs text-slate-500">
                                                            {formatDiscount(selectedCoupon.coupon)}
                                                        </p>
                                                    </div>
                                                </div>
                                                <button 
                                                    onClick={handleClearCoupon}
                                                    className="p-1 hover:bg-primary/10 rounded-full transition-colors"
                                                    aria-label="清除优惠券"
                                                >
                                                    <span className="material-symbols-outlined text-[16px] text-slate-500" aria-hidden="true">close</span>
                                                </button>
                                            </div>
                                        ) : (
                                            <button 
                                                onClick={() => setShowCouponList(!showCouponList)}
                                                className="w-full flex items-center justify-between p-3 rounded-lg border border-dashed border-slate-300 dark:border-slate-600 hover:border-primary hover:bg-primary/5 transition-colors"
                                            >
                                                <span className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                                                    <span className="material-symbols-outlined text-[18px]" aria-hidden="true">confirmation_number</span>
                                                    <span className="text-sm">选择优惠券</span>
                                                </span>
                                                <span className="material-symbols-outlined text-[18px] text-slate-400 transition-transform" style={{ transform: showCouponList ? 'rotate(180deg)' : undefined }} aria-hidden="true">expand_more</span>
                                            </button>
                                        )}
                                        
                                        {/* Coupon Dropdown */}
                                        {showCouponList && !selectedCoupon && (
                                            <div className="absolute z-20 w-full mt-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg shadow-xl max-h-60 overflow-auto">
                                                {availableCoupons.length === 0 ? (
                                                    <div className="p-4 text-center text-slate-500 text-sm">
                                                        暂无可用优惠券
                                                    </div>
                                                ) : (
                                                    availableCoupons.map((userCoupon) => {
                                                        const canUse = totalPrice >= (Number(userCoupon.coupon.minAmount) || 0);
                                                        return (
                                                            <div 
                                                                key={userCoupon.id}
                                                                role="button"
                                                                tabIndex={canUse ? 0 : -1}
                                                                onClick={() => canUse && handleSelectCoupon(userCoupon)}
                                                                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); canUse && handleSelectCoupon(userCoupon); } }}
                                                                className={`p-3 border-b border-slate-100 dark:border-slate-700 last:border-0 ${
                                                                    canUse 
                                                                        ? 'hover:bg-primary/5 cursor-pointer' 
                                                                        : 'opacity-50 cursor-not-allowed'
                                                                }`}
                                                            >
                                                                <div className="flex justify-between items-start">
                                                                    <div>
                                                                        <p className="font-medium text-slate-900 dark:text-white text-sm">
                                                                            {userCoupon.coupon.name}
                                                                        </p>
                                                                        <p className="text-xs text-slate-500 mt-1">
                                                                            {formatDiscount(userCoupon.coupon)}
                                                                            {userCoupon.coupon.minAmount && ` · 满${userCoupon.coupon.minAmount}可用`}
                                                                        </p>
                                                                    </div>
                                                                    <span className={`text-sm font-bold ${canUse ? 'text-primary' : 'text-slate-400'}`}>
                                                                        -¥{canUse ? userCoupon.coupon.value.toFixed(2) : '0.00'}
                                                                    </span>
                                                                </div>
                                                                {!canUse && (
                                                                    <p className="text-xs text-red-500 mt-1">
                                                                        还需¥{(userCoupon.coupon.minAmount || 0) - totalPrice}可用
                                                                    </p>
                                                                )}
                                                            </div>
                                                        );
                                                    })
                                                )}
                                            </div>
                                        )}
                                    </div>
                                    
                                    {discountAmount > 0 && (
                                        <div className="flex justify-between items-center text-slate-500 dark:text-slate-400">
                                            <span>优惠</span>
                                            <span className="font-medium text-green-600">-¥{discountAmount.toFixed(2)}</span>
                                        </div>
                                    )}
                                    
                                    <div className="h-px bg-slate-100 dark:bg-slate-700 my-2"></div>
                                    <div className="flex justify-between items-end">
                                        <span className="font-bold text-lg text-slate-900 dark:text-white">订单总计</span>
                                        <div className="flex flex-col items-end">
                                            {discountAmount > 0 && (
                                                <span className="text-sm text-slate-400 line-through">¥{totalPrice.toFixed(2)}</span>
                                            )}
                                            <span className="text-3xl font-black text-primary tracking-tight">¥{(totalPrice - discountAmount).toFixed(2)}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="p-4 bg-slate-50 dark:bg-slate-900 border-t border-slate-100 dark:border-slate-700">
                                    <button 
                                        onClick={handleSubmitOrder}
                                        disabled={loading}
                                        className="w-full flex items-center justify-center gap-2 rounded-lg bg-primary py-4 px-6 text-white font-bold text-lg hover:bg-blue-600 transition-colors shadow-md hover:shadow-lg active:scale-[0.98] transform duration-100 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {loading ? '提交中…' : '提交订单'}
                                        {!loading && <span className="material-symbols-outlined text-[20px]" aria-hidden="true">arrow_forward</span>}
                                    </button>
                                    <p className="mt-4 text-center text-xs text-slate-500 dark:text-slate-400">
                                        提交订单后可选择支付方式
                                    </p>
                                </div>
                            </div>

                            {/* Help / Support Mini Card */}
                            <div className="p-4 rounded-lg bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-700 text-center">
                                <p className="text-sm text-slate-500 dark:text-slate-400">需要帮助？</p>
                                <button
                                    type="button"
                                    className="text-primary text-sm font-medium hover:underline mt-1 inline-block"
                                    onClick={() => navigate('/contact')}
                                >
                                    联系客服支持
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Checkout;



