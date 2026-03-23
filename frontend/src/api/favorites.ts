import api from './index';
import type { Favorite } from '../types';

// 获取用户收藏列表
export const getFavorites = async (): Promise<Favorite[]> => {
    const response = await api.get('/favorites');
    return response.data;
};

// 检查是否收藏了某本图书
export const checkFavorite = async (bookId: number): Promise<boolean> => {
    const response = await api.get(`/favorites/check/${bookId}`);
    return response.data.isFavorited;
};

// 添加收藏
export const addFavorite = async (bookId: number): Promise<Favorite> => {
    const response = await api.post(`/favorites/${bookId}`);
    return response.data;
};

// 取消收藏
export const removeFavorite = async (bookId: number): Promise<void> => {
    await api.delete(`/favorites/${bookId}`);
};

// 切换收藏状态
export const toggleFavorite = async (bookId: number): Promise<boolean> => {
    const response = await api.post(`/favorites/toggle/${bookId}`);
    return response.data.isFavorited;
};

// 获取用户收藏数量
export const getFavoriteCount = async (): Promise<number> => {
    const response = await api.get('/favorites/count');
    return response.data.count;
};

// 清空所有收藏
export const clearFavorites = async (): Promise<void> => {
    await api.delete('/favorites');
};
