import api from './index';
import type { PointsHistory, UserPoints } from '../types';

// 获取用户积分余额
export const getUserPoints = async (): Promise<UserPoints> => {
    const response = await api.get('/points');
    return response.data;
};

// 获取用户积分历史
export const getPointsHistory = async (): Promise<PointsHistory[]> => {
    const response = await api.get('/points/history');
    return response.data;
};

// 每日签到
export const signIn = async (): Promise<{ points: number; message: string }> => {
    const response = await api.post('/points/sign-in');
    return response.data;
};

// 获取签到状态
export const getSignInStatus = async (): Promise<boolean> => {
    const response = await api.get('/points/sign-in/status');
    return response.data.signedInToday;
};
