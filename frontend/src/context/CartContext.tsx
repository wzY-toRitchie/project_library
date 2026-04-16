import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import type { Book } from '../types';
import api from '../api';
import { useAuth } from './AuthContext';
import { message } from 'antd';

interface CartItem extends Book {
    quantity: number;
}

interface CartContextType {
    cartItems: CartItem[];
    addToCart: (book: Book) => void;
    removeFromCart: (bookId: number) => void;
    updateQuantity: (bookId: number, quantity: number) => void;
    clearCart: () => void;
    totalPrice: number;
    cartCount: number;
    syncCart: () => Promise<void>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { isAuthenticated } = useAuth();
    const [cartItems, setCartItems] = useState<CartItem[]>(() => {
        const savedCart = localStorage.getItem('cart');
        return savedCart ? JSON.parse(savedCart) : [];
    });

    // 保存到 localStorage
    useEffect(() => {
        localStorage.setItem('cart', JSON.stringify(cartItems));
    }, [cartItems]);

    // 从后端同步购物车
    const syncCart = useCallback(async () => {
        if (!isAuthenticated) return;
        try {
            const response = await api.get('/cart');
            const backendItems = response.data.map((item: { book: CartItem; quantity: number }) => ({
                ...item.book,
                quantity: item.quantity
            }));
            setCartItems(backendItems);
        } catch (error: any) {
            if (error?.response?.status === 400) {
                setCartItems([]);
            } else if (error?.response?.status !== 401) {
                console.error('Failed to sync cart:', error);
            }
        }
    }, [isAuthenticated]);

    // 登录时从后端加载购物车
    useEffect(() => {
        if (!isAuthenticated) {
            const savedCart = localStorage.getItem('cart');
            setCartItems(savedCart ? JSON.parse(savedCart) : []);
            return;
        }
        syncCart();
    }, [isAuthenticated, syncCart]);

    useEffect(() => {
        const handleLogout = () => {
            const savedCart = localStorage.getItem('cart');
            setCartItems(savedCart ? JSON.parse(savedCart) : []);
        };

        window.addEventListener('auth:logout', handleLogout);
        return () => {
            window.removeEventListener('auth:logout', handleLogout);
        };
    }, []);

    const addToCart = async (book: Book) => {
        // 保存原始状态用于回滚
        const previousItems = [...cartItems];
        
        // 乐观更新本地状态
        setCartItems(prev => {
            const existingItem = prev.find(item => item.id === book.id);
            if (existingItem) {
                return prev.map(item =>
                    item.id === book.id ? { ...item, quantity: item.quantity + 1 } : item
                );
            }
            return [...prev, { ...book, quantity: 1 }];
        });

        // 同步到后端
        if (isAuthenticated) {
            try {
                await api.post(`/cart?bookId=${book.id}&quantity=1`);
                message.success('已添加到购物车');
            } catch (error) {
                console.error('Failed to add to cart:', error);
                // 回滚本地状态
                setCartItems(previousItems);
                message.error('添加购物车失败，请重试');
            }
        } else {
            message.success('已添加到购物车');
        }
    };

    const removeFromCart = async (bookId: number) => {
        const previousItems = [...cartItems];
        
        // 乐观更新
        setCartItems(prev => prev.filter(item => item.id !== bookId));

        if (isAuthenticated) {
            try {
                await api.delete(`/cart/${bookId}`);
                message.success('已从购物车移除');
            } catch (error) {
                console.error('Failed to remove from cart:', error);
                setCartItems(previousItems);
                message.error('移除失败，请重试');
            }
        }
    };

    const updateQuantity = async (bookId: number, quantity: number) => {
        if (quantity <= 0) {
            removeFromCart(bookId);
            return;
        }

        const previousItems = [...cartItems];
        
        // 乐观更新
        setCartItems(prev =>
            prev.map(item => (item.id === bookId ? { ...item, quantity } : item))
        );

        if (isAuthenticated) {
            try {
                await api.put(`/cart/${bookId}?quantity=${quantity}`);
            } catch (error) {
                console.error('Failed to update quantity:', error);
                setCartItems(previousItems);
                message.error('更新数量失败，请重试');
            }
        }
    };

    const clearCart = async () => {
        const previousItems = [...cartItems];
        
        // 乐观更新
        setCartItems([]);

        if (isAuthenticated) {
            try {
                await api.delete('/cart');
                message.success('购物车已清空');
            } catch (error) {
                console.error('Failed to clear cart:', error);
                setCartItems(previousItems);
                message.error('清空购物车失败，请重试');
            }
        }
    };

    const totalPrice = useMemo(() => cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0), [cartItems]);
    const cartCount = useMemo(() => cartItems.reduce((count, item) => count + item.quantity, 0), [cartItems]);

    return (
        <CartContext.Provider value={{ cartItems, addToCart, removeFromCart, updateQuantity, clearCart, totalPrice, cartCount, syncCart }}>
            {children}
        </CartContext.Provider>
    );
};

export const useCart = () => {
    const context = useContext(CartContext);
    if (!context) {
        throw new Error('useCart must be used within a CartProvider');
    }
    return context;
};
