import api from './index';
import type { PointsHistory, UserPoints, PointsRuleResponse } from '../types';

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

// 获取可积分兑换的优惠券列表
export const getRedeemableCoupons = async (): Promise<{ coupon: any; pointsRule: any }[]> => {
    const response = await api.get('/coupons/redeem');
    return response.data;
};

// 积分兑换优惠券
export const redeemCoupon = async (couponId: number) => {
    const response = await api.post(`/coupons/${couponId}/redeem`);
    return response.data;
};

// ============ 管理员接口 ============

// 获取积分规则
export const getRuleSettings = async (): Promise<PointsRuleResponse[]> => {
    const response = await api.get('/points/rules');
    return response.data;
};

// 更新积分规则
export const updateRuleSetting = async (ruleKey: string, ruleValue: number) => {
    const response = await api.put(`/points/rules/${ruleKey}`, { ruleValue });
    return response.data;
};

// 调整用户积分
export const adjustUserPoints = async (userId: number, points: number, reason: string) => {
    const response = await api.post('/points/adjust', { userId, points, reason });
    return response.data;
};
