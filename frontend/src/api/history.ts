import api from './index';
import type { BrowsingHistory } from '../types';

// 获取用户浏览历史
export const getBrowsingHistory = async (): Promise<BrowsingHistory[]> => {
    const response = await api.get('/history');
    return response.data;
};

// 获取最近的浏览历史
export const getRecentBrowsingHistory = async (limit: number = 6): Promise<BrowsingHistory[]> => {
    const response = await api.get('/history/recent', { params: { limit } });
    return response.data;
};

// 记录浏览
export const recordBrowsing = async (bookId: number): Promise<BrowsingHistory> => {
    const response = await api.post(`/history/${bookId}`);
    return response.data;
};

// 删除单条浏览记录
export const deleteBrowsingHistory = async (bookId: number): Promise<void> => {
    await api.delete(`/history/${bookId}`);
};

// 清空所有浏览历史
export const clearBrowsingHistory = async (): Promise<void> => {
    await api.delete('/history');
};

// 获取浏览历史数量
export const getBrowsingHistoryCount = async (): Promise<number> => {
    const response = await api.get('/history/count');
    return response.data.count;
};
