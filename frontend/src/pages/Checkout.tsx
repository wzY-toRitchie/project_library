import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { message } from 'antd';
import { 
    MapPin, 
    ShoppingBag, 
    CreditCard, 
    Check, 
    ChevronRight, 
    Lock, 
    ArrowRight, 
    Plus,
    MessageSquare, // For WeChat
    Truck // For COD
} from 'lucide-react';
import api from '../api';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

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
    const [paymentMethod, setPaymentMethod] = useState<'credit_card' | 'wechat' | 'cod'>('credit_card');

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

    // Redirect if no items
    if (hasNoItems) {
        return null;
    }

    const handleSubmitOrder = async () => {
        setLoading(true);
        try {
            const orderData = {
                user: { id: user?.id },
                totalPrice: totalPrice,
                status: 'PENDING',
                items: items.map(item => ({
                    book: { id: item.id },
                    quantity: item.quantity,
                    price: item.price
                }))
            };

            const response = await api.post('/orders', orderData);
            message.success('订单提交成功！');
            
            // Clear purchased items from cart
            items.forEach(item => removeFromCart(item.id));
            
            if (response.data && response.data.id) {
                navigate(`/payment/${response.data.id}`);
            } else {
                // Fallback if backend doesn't return the order object
                navigate('/orders');
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
                                {/* Selected Address Card */}
                                <div className="relative flex items-start gap-4 p-4 rounded-lg border-2 border-primary bg-primary/5 dark:bg-primary/10 cursor-pointer transition-all">
                                    <div className="absolute top-4 right-4 text-primary">
                                        <Check size={24} className="fill-current" />
                                    </div>
                                    <div className="flex flex-col gap-1">
                                        <div className="flex items-center gap-2">
                                            <p className="text-[#111418] dark:text-white text-base font-bold">{user?.fullName || user?.username || '用户'}</p>
                                            <span className="px-2 py-0.5 rounded bg-primary/20 text-primary text-xs font-bold">默认</span>
                                        </div>
                                        <p className="text-[#617589] dark:text-gray-400 text-sm mt-1">{user?.phoneNumber || '暂无电话'}</p>
                                        <p className="text-[#617589] dark:text-gray-400 text-sm">{user?.address || '暂无收货地址，请添加'}</p>
                                    </div>
                                </div>
                                
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

                        {/* Payment Method Section */}
                        <section className="bg-white dark:bg-[#111418] rounded-xl shadow-sm border border-[#f0f2f4] dark:border-[#293038] overflow-hidden">
                            <div className="p-6 border-b border-[#f0f2f4] dark:border-[#293038]">
                                <h2 className="text-lg font-bold leading-tight flex items-center gap-2 text-slate-900 dark:text-white">
                                    <CreditCard className="text-primary" size={24} />
                                    支付方式
                                </h2>
                            </div>
                            <div className="p-6">
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                    {/* Credit Card */}
                                    <label className="cursor-pointer relative">
                                        <input 
                                            type="radio" 
                                            name="payment" 
                                            className="peer sr-only" 
                                            checked={paymentMethod === 'credit_card'}
                                            onChange={() => setPaymentMethod('credit_card')}
                                        />
                                        <div className="h-full p-4 rounded-lg border border-[#f0f2f4] dark:border-[#293038] hover:border-primary peer-checked:border-primary peer-checked:bg-primary/5 dark:peer-checked:bg-primary/10 transition-all flex flex-col items-center justify-center gap-3 text-center">
                                            <CreditCard size={32} className={`text-[#617589] ${paymentMethod === 'credit_card' ? 'text-primary' : ''}`} />
                                            <span className="font-medium text-sm text-slate-900 dark:text-white">银行卡</span>
                                        </div>
                                        <div className={`absolute top-2 right-2 text-primary transition-opacity ${paymentMethod === 'credit_card' ? 'opacity-100' : 'opacity-0'}`}>
                                            <Check size={20} />
                                        </div>
                                    </label>
                                    
                                    {/* WeChat Pay */}
                                    <label className="cursor-pointer relative">
                                        <input 
                                            type="radio" 
                                            name="payment" 
                                            className="peer sr-only"
                                            checked={paymentMethod === 'wechat'}
                                            onChange={() => setPaymentMethod('wechat')}
                                        />
                                        <div className="h-full p-4 rounded-lg border border-[#f0f2f4] dark:border-[#293038] hover:border-primary peer-checked:border-primary peer-checked:bg-primary/5 dark:peer-checked:bg-primary/10 transition-all flex flex-col items-center justify-center gap-3 text-center">
                                            <MessageSquare size={32} className={`text-[#617589] ${paymentMethod === 'wechat' ? 'text-green-600' : ''}`} />
                                            <span className="font-medium text-sm text-slate-900 dark:text-white">微信支付</span>
                                        </div>
                                        <div className={`absolute top-2 right-2 text-primary transition-opacity ${paymentMethod === 'wechat' ? 'opacity-100' : 'opacity-0'}`}>
                                            <Check size={20} />
                                        </div>
                                    </label>
                                    
                                    {/* Cash on Delivery */}
                                    <label className="cursor-pointer relative">
                                        <input 
                                            type="radio" 
                                            name="payment" 
                                            className="peer sr-only"
                                            checked={paymentMethod === 'cod'}
                                            onChange={() => setPaymentMethod('cod')}
                                        />
                                        <div className="h-full p-4 rounded-lg border border-[#f0f2f4] dark:border-[#293038] hover:border-primary peer-checked:border-primary peer-checked:bg-primary/5 dark:peer-checked:bg-primary/10 transition-all flex flex-col items-center justify-center gap-3 text-center">
                                            <Truck size={32} className={`text-[#617589] ${paymentMethod === 'cod' ? 'text-orange-600' : ''}`} />
                                            <span className="font-medium text-sm text-slate-900 dark:text-white">货到付款</span>
                                        </div>
                                        <div className={`absolute top-2 right-2 text-primary transition-opacity ${paymentMethod === 'cod' ? 'opacity-100' : 'opacity-0'}`}>
                                            <Check size={20} />
                                        </div>
                                    </label>
                                </div>
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
                                    <div className="flex justify-between items-center text-[#617589] dark:text-slate-400">
                                        <span>优惠</span>
                                        <span className="font-medium text-green-600">-¥0.00</span>
                                    </div>
                                    <div className="h-px bg-[#f0f2f4] dark:bg-[#293038] my-2"></div>
                                    <div className="flex justify-between items-end">
                                        <span className="font-bold text-lg text-[#111418] dark:text-white">订单总计</span>
                                        <div className="flex flex-col items-end">
                                            <span className="text-3xl font-black text-primary tracking-tight">¥{totalPrice.toFixed(2)}</span>
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
                                    <div className="mt-4 flex items-center justify-center gap-2 text-[#617589] dark:text-slate-400 text-xs">
                                        <Lock size={16} />
                                        安全支付保障
                                    </div>
                                </div>
                            </div>

                            {/* Help / Support Mini Card */}
                            <div className="p-4 rounded-lg bg-white dark:bg-[#111418] border border-[#f0f2f4] dark:border-[#293038] text-center">
                                <p className="text-sm text-[#617589] dark:text-slate-400">需要帮助？</p>
                                <button
                                    type="button"
                                    className="text-primary text-sm font-medium hover:underline mt-1 inline-block"
                                    onClick={() => message.info('客服功能暂未开放，请稍后再试')}
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
