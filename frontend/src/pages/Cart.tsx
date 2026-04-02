
import React, { useState } from 'react';
import { message } from 'antd';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { FALLBACK_COVER } from '../utils/constants';

const Cart: React.FC = () => {
    const { cartItems, removeFromCart, updateQuantity, clearCart } = useCart();
    const { isAuthenticated } = useAuth();
    const navigate = useNavigate();
    const [selectedItems, setSelectedItems] = useState<Set<number>>(
        () => new Set(cartItems.map(item => item.id))
    );

    const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.checked) {
            setSelectedItems(new Set(cartItems.map(item => item.id)));
        } else {
            setSelectedItems(new Set());
        }
    };

    const handleSelectItem = (id: number) => {
        const newSelected = new Set(selectedItems);
        if (newSelected.has(id)) {
            newSelected.delete(id);
        } else {
            newSelected.add(id);
        }
        setSelectedItems(newSelected);
    };

    const selectedCartItems = cartItems.filter(item => selectedItems.has(item.id));
    const selectedTotal = selectedCartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const selectedCount = selectedCartItems.reduce((count, item) => count + item.quantity, 0);

    const handleCheckout = () => {
        if (!isAuthenticated) {
            message.warning('请先登录后再进行结算');
            navigate('/login');
            return;
        }

        if (selectedCartItems.length === 0) {
            message.warning('请至少选择一件商品');
            return;
        }

        navigate('/checkout', { 
            state: { 
                items: selectedCartItems,
                totalPrice: selectedTotal
            } 
        });
    };

    if (cartItems.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 text-center">
                <div className="bg-gray-100 dark:bg-gray-800 p-6 rounded-full mb-6">
                    <span className="material-symbols-outlined text-5xl text-gray-400" aria-hidden="true">shopping_cart</span>
                </div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">购物车空空如也</h2>
                <p className="text-gray-500 dark:text-gray-400 mb-8 max-w-md">
                    看起来您还没有添加任何书籍到购物车。去浏览一下我们的精选书籍吧！
                </p>
                <Link 
                    to="/" 
                    className="inline-flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-lg text-white bg-primary hover:bg-blue-600 transition-colors duration-200"
                >
                    去逛逛
                </Link>
            </div>
        );
    }

    return (
        <div className="mx-auto max-w-[1024px] px-4 py-8 sm:px-6 lg:px-8">
            {/* Breadcrumbs */}
            <nav className="mb-6 flex items-center text-sm text-slate-500 dark:text-slate-400">
                <Link to="/" className="hover:text-slate-900 dark:hover:text-slate-200 transition-colors">首页</Link>
                <span className="mx-2 text-slate-300 dark:text-slate-600">/</span>
                <span className="font-medium text-slate-900 dark:text-white">购物车</span>
            </nav>

            {/* Page Heading */}
            <div className="mb-8 flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">购物车</h1>
                    <p className="mt-1 text-slate-500 dark:text-slate-400">管理您的商品并进行结算。</p>
                </div>
                <div className="mt-4 sm:mt-0">
                    <span className="inline-flex items-center rounded-full bg-blue-50 dark:bg-blue-900/30 px-3 py-1 text-sm font-medium text-primary">
                        共 {cartItems.reduce((acc, item) => acc + item.quantity, 0)} 件商品
                    </span>
                </div>
            </div>

            {/* Cart Table & Actions */}
            <div className="flex flex-col gap-6">
                {/* Mobile Card View */}
                <div className="md:hidden flex flex-col gap-3">
                    {/* Mobile Select All */}
                    <div className="flex items-center gap-3 px-4 py-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700">
                        <input 
                            type="checkbox" 
                            className="size-4 rounded border-slate-300 bg-white text-primary focus:ring-primary dark:border-slate-600 dark:bg-slate-700 dark:checked:bg-primary"
                            checked={cartItems.length > 0 && selectedItems.size === cartItems.length}
                            onChange={handleSelectAll}
                        />
                        <span className="text-sm text-slate-600 dark:text-slate-300">全选</span>
                        <button 
                            onClick={clearCart}
                            className="ml-auto text-sm text-slate-400 hover:text-red-500 transition-colors"
                        >
                            清空
                        </button>
                    </div>

                    {cartItems.map((item) => (
                        <div key={item.id} className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 p-4">
                            <div className="flex gap-3">
                                <input 
                                    type="checkbox"
                                    className="mt-1 size-4 rounded border-slate-300 bg-white text-primary focus:ring-primary dark:border-slate-600 dark:bg-slate-700 dark:checked:bg-primary flex-shrink-0"
                                    checked={selectedItems.has(item.id)}
                                    onChange={() => handleSelectItem(item.id)}
                                />
                                <div className="h-20 w-14 flex-shrink-0 overflow-hidden rounded-lg bg-slate-200 dark:bg-slate-700">
                                    <img
                                        src={item.coverImage || FALLBACK_COVER}
                                        alt={item.title}
                                        className="h-full w-full object-cover"
                                        width={56}
                                        height={80}
                                    />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <Link to={`/book/${item.id}`} className="text-sm font-semibold text-slate-900 dark:text-white line-clamp-2">
                                        {item.title}
                                    </Link>
                                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{item.author}</p>
                                    <p className="text-sm font-bold text-primary mt-2">¥{item.price.toFixed(2)}</p>
                                </div>
                                <button 
                                    onClick={() => removeFromCart(item.id)}
                                    className="self-start p-1 text-slate-400 hover:text-red-500 transition-colors"
                                    aria-label="删除商品"
                                >
                                    <span className="material-symbols-outlined text-[16px]" aria-hidden="true">delete</span>
                                </button>
                            </div>
                            <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                                <div className="flex items-center gap-2">
                                    <span className="text-xs text-slate-500">数量:</span>
                                    <div className="flex items-center rounded-lg border border-slate-200 dark:border-slate-700">
                                        <button 
                                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                            className="flex w-11 h-11 items-center justify-center rounded-l-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
                                            aria-label="减少数量"
                                        >
                                            <span className="material-symbols-outlined text-[16px]" aria-hidden="true">remove</span>
                                        </button>
                                        <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
                                        <button 
                                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                            className="flex w-11 h-11 items-center justify-center rounded-r-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
                                            aria-label="增加数量"
                                        >
                                            <span className="material-symbols-outlined text-[12px]" aria-hidden="true">add</span>
                                        </button>
                                    </div>
                                </div>
                                <span className="text-sm font-bold text-slate-900 dark:text-white">
                                    小计: ¥{(item.price * item.quantity).toFixed(2)}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Desktop Table View */}
                <div className="hidden md:block overflow-hidden rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-sm">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-slate-50 dark:bg-slate-800/50">
                                <tr>
                                    <th className="w-16 px-6 py-4 text-center">
                                        <input 
                                            type="checkbox" 
                                            className="size-4 rounded border-slate-300 bg-white text-primary focus:ring-primary dark:border-slate-600 dark:bg-slate-700 dark:checked:bg-primary"
                                            checked={cartItems.length > 0 && selectedItems.size === cartItems.length}
                                            onChange={handleSelectAll}
                                        />
                                    </th>
                                    <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">商品信息</th>
                                    <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">单价</th>
                                    <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">数量</th>
                                    <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">小计</th>
                                    <th className="w-20 px-6 py-4 text-center text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">操作</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                {cartItems.map((item) => (
                                    <tr key={item.id} className="group hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                        <td className="px-6 py-4 text-center">
                                            <input 
                                                type="checkbox"
                                                className="size-4 rounded border-slate-300 bg-white text-primary focus:ring-primary dark:border-slate-600 dark:bg-slate-700 dark:checked:bg-primary"
                                                checked={selectedItems.has(item.id)}
                                                onChange={() => handleSelectItem(item.id)}
                                            />
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-4">
                                                <div className="h-16 w-12 flex-shrink-0 overflow-hidden rounded-md bg-slate-200 dark:bg-slate-700 border border-slate-200 dark:border-slate-700">
                                                    <img
                                                        src={item.coverImage || FALLBACK_COVER}
                                                        alt={item.title}
                                                        className="h-full w-full object-cover"
                                                        width={48}
                                                        height={64}
                                                    />
                                                </div>
                                                <div className="flex flex-col">
                                                    <Link to={`/book/${item.id}`} className="text-sm font-semibold text-slate-900 dark:text-white hover:text-primary transition-colors">
                                                        {item.title}
                                                    </Link>
                                                    <span className="text-xs text-slate-500 dark:text-slate-400">{item.author}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-sm font-medium text-slate-600 dark:text-slate-300">¥{item.price.toFixed(2)}</td>
                                        <td className="px-6 py-4">
                                            <div className="flex w-fit items-center rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900">
                                                <button 
                                                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                                    className="flex w-11 h-11 items-center justify-center rounded-l-lg text-slate-500 hover:bg-slate-100 hover:text-primary dark:text-slate-400 dark:hover:bg-slate-800 transition-colors"
                                                    aria-label="减少数量"
                                                >
                                                    <span className="material-symbols-outlined text-[16px]" aria-hidden="true">remove</span>
                                                </button>
                                                <input 
                                                    type="text" 
                                                    value={item.quantity} 
                                                    readOnly
                                                    className="h-11 w-10 border-none bg-transparent text-center text-sm font-medium text-slate-900 focus:ring-0 dark:text-white"
                                                />
                                                <button 
                                                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                                    className="flex w-11 h-11 items-center justify-center rounded-r-lg text-slate-500 hover:bg-slate-100 hover:text-primary dark:text-slate-400 dark:hover:bg-slate-800 transition-colors"
                                                    aria-label="增加数量"
                                                >
                                                    <span className="material-symbols-outlined text-[16px]" aria-hidden="true">add</span>
                                                </button>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-sm font-bold text-slate-900 dark:text-white">
                                            ¥{(item.price * item.quantity).toFixed(2)}
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <button 
                                                onClick={() => removeFromCart(item.id)}
                                                className="flex w-11 h-11 items-center justify-center rounded-full text-slate-400 hover:bg-red-50 hover:text-red-500 dark:text-slate-500 dark:hover:bg-red-900/20 dark:hover:text-red-400 transition-colors"
                                                title="删除商品"
                                                aria-label="删除商品"
                                            >
                                                <span className="material-symbols-outlined text-[18px]" aria-hidden="true">delete</span>
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    
                    {/* Desktop Footer */}
                    <div className="border-t border-slate-200 dark:border-slate-800 bg-slate-50 px-6 py-3 dark:bg-slate-800/50">
                        <div className="flex items-center justify-between">
                            <button 
                                onClick={clearCart}
                                className="text-sm font-medium text-slate-500 hover:text-red-600 dark:text-slate-400 dark:hover:text-red-400 transition-colors"
                            >
                                清空购物车
                            </button>
                            <Link to="/" className="text-sm font-medium text-primary hover:underline">
                                继续购物
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Action Panel / Summary Footer */}
                <div className="sticky bottom-4 z-10 sm:relative sm:bottom-0">
                    <div className="flex flex-col rounded-xl border border-slate-200 bg-white p-6 shadow-lg dark:border-slate-700 dark:bg-slate-900 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-8">
                            <div className="flex flex-col">
                                <span className="text-sm text-slate-500 dark:text-slate-400">
                                    总计 ({cartItems.reduce((acc, item) => acc + item.quantity, 0)} 件):
                                </span>
                                <span className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
                                    ¥{selectedTotal.toFixed(2)}
                                </span>
                            </div>
                            <div className="hidden h-10 w-px bg-slate-200 dark:bg-slate-700 sm:block"></div>
                            <div className="flex flex-col">
                                <span className="text-sm text-slate-500 dark:text-slate-400">已选择:</span>
                                <span className="text-base font-semibold text-primary">{selectedCount} 件商品</span>
                            </div>
                        </div>
                        <div className="mt-6 flex flex-col gap-3 sm:mt-0 sm:flex-row sm:items-center">
                            <div className="flex items-center gap-2">
                                <input
                                    type="text"
                                    placeholder="输入优惠券代码…"
                                    className="w-40 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm focus:ring-1 focus:ring-primary focus:border-primary"
                                    aria-label="优惠券代码"
                                />
                                <button className="rounded-lg border border-primary text-primary px-4 py-2 text-sm font-medium hover:bg-primary/5 transition-colors">
                                    使用
                                </button>
                            </div>
                            <button 
                                onClick={handleCheckout}
                                disabled={selectedCartItems.length === 0}
                                className={`flex w-full items-center justify-center gap-2 rounded-lg px-8 py-3.5 text-sm font-bold text-white shadow-md transition-colors,transition-transform sm:w-auto ${
                                    selectedCartItems.length === 0 
                                    ? 'bg-slate-400 cursor-not-allowed' 
                                    : 'bg-primary shadow-blue-500/20 hover:bg-blue-600 active:scale-[0.98]'
                                }`}
                            >
                                去结算
                                <span className="material-symbols-outlined text-[20px]" aria-hidden="true">arrow_forward</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Cart;
