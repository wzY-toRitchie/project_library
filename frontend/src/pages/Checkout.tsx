import React, { useEffect, useState, useCallback } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { message } from 'antd';
import { 
    MapPin, 
    ShoppingBag, 
    ChevronRight, 
    ArrowRight, 
    Plus,
    Ticket,
    ChevronDown,
    X
} from 'lucide-react';
import api from '../api';
import { getAvailableUserCoupons } from '../api/coupons';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import type { UserCoupon } from '../types';

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

const Checkout: React.FC = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { user, login } = useAuth();
    const { removeFromCart } = useCart();
    
    // Retrieve passed state
    const state = location.state as LocationState;
    const items = state?.items || [];
    const totalPrice = state?.totalPrice || 0;

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

    const hasNoItems = !state || items.length === 0;

    useEffect(() => {
        if (hasNoItems) {
            message.error('无结算商品，请先选择商品');
            navigate('/cart');
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

    // Get selected address
    const selectedAddress = addresses.find(a => a.id === selectedAddressId);

    // Calculate discount amount
    useEffect(() => {
        if (selectedCoupon && selectedCoupon.coupon) {
            const coupon = selectedCoupon.coupon;
            if (coupon.type === 'FULL_REDUCE') {
                if (totalPrice >= (coupon.minAmount || 0)) {
                    setDiscountAmount(coupon.value);
                } else {
                    setDiscountAmount(0);
                }
            } else if (coupon.type === 'DISCOUNT') {
                setDiscountAmount(totalPrice * (1 - coupon.value));
            }
        } else {
            setDiscountAmount(0);
        }
    }, [selectedCoupon, totalPrice]);

    // Handle coupon selection
    const handleSelectCoupon = useCallback((coupon: UserCoupon) => {
        setSelectedCoupon(coupon);
        setShowCouponList(false);
    }, []);

    // Clear coupon selection
    const handleClearCoupon = useCallback(() => {
        setSelectedCoupon(null);
    }, []);

    // Format discount display
    const formatDiscount = (coupon: UserCoupon['coupon']) => {
        if (coupon.type === 'FULL_REDUCE') {
            return `满${coupon.minAmount}减${coupon.value}`;
        } else if (coupon.type === 'DISCOUNT') {
            return `${(coupon.value * 10).toFixed(0)}折`;
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
            
            // Clear purchased items from cart
            items.forEach(item => removeFromCart(item.id));
            
            if (response.data && response.data.id) {
                navigate(`/payment/${response.data.id}`);
            } else {
                // Fallback if backend doesn't return the order object
                navigate('/profile?tab=orders');
            }
        } catch (error) {
            console.error('Checkout failed:', error);
            message.error('订单提交失败，请稍后再试');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex-1 flex flex-col items-center py-8 px-4 sm:px-6 lg:px-8">
            <div className="w-full max-w-[1024px] flex flex-col gap-8">
                {/* Breadcrumbs & Heading */}
                <div className="flex flex-col gap-4">
                    <div className="flex flex-wrap items-center gap-2 text-sm text-[#617589] dark:text-slate-400">
                        <Link to="/" className="hover:text-primary transition-colors">首页</Link>
                        <ChevronRight size={16} />
                        <Link to="/cart" className="hover:text-primary transition-colors">购物车</Link>
                        <ChevronRight size={16} />
                        <span className="text-[#111418] dark:text-white font-medium">订单结算</span>
                    </div>
                    <h1 className="text-[#111418] dark:text-white text-3xl sm:text-4xl font-black leading-tight tracking-[-0.033em]">
                        订单结算
                    </h1>
                </div>

                {/* Main Content Layout */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column: Address & Items */}
                    <div className="lg:col-span-2 flex flex-col gap-8">
                        {/* Shipping Address Section */}
                        <section className="bg-white dark:bg-[#111418] rounded-xl shadow-sm border border-[#f0f2f4] dark:border-[#293038] overflow-hidden">
                            <div className="p-6 border-b border-[#f0f2f4] dark:border-[#293038] flex justify-between items-center">
                                <h2 className="text-lg font-bold leading-tight flex items-center gap-2 text-slate-900 dark:text-white">
                                    <MapPin className="text-primary" size={24} />
                                    收货地址
                                </h2>
                                <button 
                                    onClick={() => navigate('/profile')}
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
                                            <div
                                                key={addr.id}
                                                onClick={() => setSelectedAddressId(addr.id)}
                                                className={`relative flex items-start gap-4 p-4 rounded-lg border-2 cursor-pointer transition-all ${
                                                    selectedAddressId === addr.id
                                                        ? 'border-primary bg-primary/5 dark:bg-primary/10'
                                                        : 'border-slate-200 dark:border-slate-700 hover:border-primary/50'
                                                }`}
                                            >
                                                {selectedAddressId === addr.id && (
                                                    <div className="absolute top-4 right-4 text-primary">
                                                        <Check size={20} className="fill-current" />
                                                    </div>
                                                )}
                                                <div className="flex flex-col gap-1">
                                                    <div className="flex items-center gap-2">
                                                        <p className="text-[#111418] dark:text-white text-base font-bold">{addr.fullName}</p>
                                                        {addr.isDefault && (
                                                            <span className="px-2 py-0.5 rounded bg-primary/20 text-primary text-xs font-bold">默认</span>
                                                        )}
                                                    </div>
                                                    <p className="text-[#617589] dark:text-gray-400 text-sm mt-1">{addr.phoneNumber}</p>
                                                    <p className="text-[#617589] dark:text-gray-400 text-sm">{addr.address}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="relative flex items-start gap-4 p-4 rounded-lg border-2 border-dashed border-slate-300 dark:border-slate-600">
                                        <div className="flex flex-col gap-1">
                                            <p className="text-[#617589] dark:text-gray-400 text-sm">暂无收货地址，请先添加地址</p>
                                        </div>
                                    </div>
                                )}
                                
                                <button 
                                    onClick={() => navigate('/profile')}
                                    className="flex items-center justify-center gap-2 w-full py-3 mt-2 border border-dashed border-[#617589] rounded-lg text-[#617589] hover:text-primary hover:border-primary hover:bg-primary/5 transition-all"
                                >
                                    <Plus size={20} />
                                    <span className="font-medium">添加/修改地址</span>
                                </button>
                            </div>
                        </section>

                        {/* Order Items Section */}
                        <section className="bg-white dark:bg-[#111418] rounded-xl shadow-sm border border-[#f0f2f4] dark:border-[#293038] overflow-hidden">
                            <div className="p-6 border-b border-[#f0f2f4] dark:border-[#293038]">
                                <h2 className="text-lg font-bold leading-tight flex items-center gap-2 text-slate-900 dark:text-white">
                                    <ShoppingBag className="text-primary" size={24} />
                                    订单商品 ({items.reduce((acc, item) => acc + item.quantity, 0)})
                                </h2>
                            </div>
                            <div className="divide-y divide-[#f0f2f4] dark:divide-[#293038]">
                                {items.map((item) => (
                                    <div key={item.id} className="p-6 flex flex-col sm:flex-row gap-6 items-start sm:items-center">
                                        <div 
                                            className="w-20 h-28 bg-gray-100 rounded-sm shrink-0 overflow-hidden shadow-sm bg-cover bg-center"
                                            style={{ backgroundImage: `url(${item.coverImage || 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?auto=format&fit=crop&q=80&w=300&h=400'})` }}
                                        />
                                        <div className="flex-1 min-w-0">
                                            <h3 className="text-[#111418] dark:text-white font-bold text-lg truncate">{item.title}</h3>
                                            <p className="text-[#617589] dark:text-gray-400 text-sm mt-1">{item.author}</p>
                                            <p className="text-[#617589] dark:text-gray-400 text-sm mt-1">平装本</p>
                                        </div>
                                        <div className="flex items-center justify-between sm:justify-end gap-8 w-full sm:w-auto mt-2 sm:mt-0">
                                            <div className="text-[#617589] dark:text-gray-400 text-sm">
                                                数量: <span className="text-[#111418] dark:text-white font-semibold">{item.quantity}</span>
                                            </div>
                                            <div className="text-[#111418] dark:text-white font-bold text-lg">¥{item.price.toFixed(2)}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </section>
                    </div>

                    {/* Right Column: Order Summary (Sticky) */}
                    <div className="lg:col-span-1">
                        <div className="sticky top-24 flex flex-col gap-6">
                            <div className="bg-white dark:bg-[#111418] rounded-xl shadow-lg border border-[#f0f2f4] dark:border-[#293038] overflow-hidden">
                                <div className="p-6 border-b border-[#f0f2f4] dark:border-[#293038]">
                                    <h2 className="text-lg font-bold leading-tight text-slate-900 dark:text-white">订单摘要</h2>
                                </div>
                                <div className="p-6 flex flex-col gap-4">
                                    <div className="flex justify-between items-center text-[#617589] dark:text-slate-400">
                                        <span>商品小计 ({items.length} 件)</span>
                                        <span className="font-medium text-[#111418] dark:text-white">¥{totalPrice.toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between items-center text-[#617589] dark:text-slate-400">
                                        <span>运费</span>
                                        <span className="font-medium text-[#111418] dark:text-white">¥0.00</span>
                                    </div>
                                    
                                    {/* Coupon Selection */}
                                    <div className="relative">
                                        {selectedCoupon ? (
                                            <div className="flex items-center justify-between p-3 rounded-lg bg-primary/5 border border-primary/20">
                                                <div className="flex items-center gap-2">
                                                    <Ticket size={18} className="text-primary" />
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
                                                >
                                                    <X size={16} className="text-slate-500" />
                                                </button>
                                            </div>
                                        ) : (
                                            <button 
                                                onClick={() => setShowCouponList(!showCouponList)}
                                                className="w-full flex items-center justify-between p-3 rounded-lg border border-dashed border-slate-300 dark:border-slate-600 hover:border-primary hover:bg-primary/5 transition-all"
                                            >
                                                <span className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                                                    <Ticket size={18} />
                                                    <span className="text-sm">选择优惠券</span>
                                                </span>
                                                <ChevronDown size={18} className={`text-slate-400 transition-transform ${showCouponList ? 'rotate-180' : ''}`} />
                                            </button>
                                        )}
                                        
                                        {/* Coupon Dropdown */}
                                        {showCouponList && !selectedCoupon && (
                                            <div className="absolute z-20 w-full mt-1 bg-white dark:bg-[#1a232e] border border-slate-200 dark:border-slate-700 rounded-lg shadow-xl max-h-60 overflow-auto">
                                                {availableCoupons.length === 0 ? (
                                                    <div className="p-4 text-center text-slate-500 text-sm">
                                                        暂无可用优惠券
                                                    </div>
                                                ) : (
                                                    availableCoupons.map((userCoupon) => {
                                                        const canUse = totalPrice >= (userCoupon.coupon.minAmount || 0);
                                                        return (
                                                            <div 
                                                                key={userCoupon.id}
                                                                onClick={() => canUse && handleSelectCoupon(userCoupon)}
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
                                                                            {userCoupon.coupon.minAmount && ` · 满¥${userCoupon.coupon.minAmount}可用`}
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
                                        <div className="flex justify-between items-center text-[#617589] dark:text-slate-400">
                                            <span>优惠</span>
                                            <span className="font-medium text-green-600">-¥{discountAmount.toFixed(2)}</span>
                                        </div>
                                    )}
                                    
                                    <div className="h-px bg-[#f0f2f4] dark:bg-[#293038] my-2"></div>
                                    <div className="flex justify-between items-end">
                                        <span className="font-bold text-lg text-[#111418] dark:text-white">订单总计</span>
                                        <div className="flex flex-col items-end">
                                            {discountAmount > 0 && (
                                                <span className="text-sm text-slate-400 line-through">¥{totalPrice.toFixed(2)}</span>
                                            )}
                                            <span className="text-3xl font-black text-primary tracking-tight">¥{(totalPrice - discountAmount).toFixed(2)}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="p-4 bg-[#f8f9fa] dark:bg-[#1a232e] border-t border-[#f0f2f4] dark:border-[#293038]">
                                    <button 
                                        onClick={handleSubmitOrder}
                                        disabled={loading}
                                        className="w-full flex items-center justify-center gap-2 rounded-lg bg-primary py-4 px-6 text-white font-bold text-lg hover:bg-blue-600 transition-colors shadow-md hover:shadow-lg active:scale-[0.98] transform duration-100 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {loading ? '提交中...' : '提交订单'}
                                        {!loading && <ArrowRight size={20} />}
                                    </button>
                                    <p className="mt-4 text-center text-xs text-[#617589] dark:text-slate-400">
                                        提交订单后可选择支付方式
                                    </p>
                                </div>
                            </div>

                            {/* Help / Support Mini Card */}
                            <div className="p-4 rounded-lg bg-white dark:bg-[#111418] border border-[#f0f2f4] dark:border-[#293038] text-center">
                                <p className="text-sm text-[#617589] dark:text-slate-400">需要帮助？</p>
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
