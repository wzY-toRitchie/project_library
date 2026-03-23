import api from './index';
import type { Coupon, UserCoupon } from '../types';

// 获取可用优惠券列表
export const getAvailableCoupons = async (): Promise<Coupon[]> => {
    const response = await api.get('/coupons');
    return response.data;
};

// 获取我的优惠券
export const getMyCoupons = async (): Promise<UserCoupon[]> => {
    const response = await api.get('/coupons/my');
    return response.data;
};

// 获取我的可用优惠券
export const getAvailableUserCoupons = async (): Promise<UserCoupon[]> => {
    const response = await api.get('/coupons/available');
    return response.data;
};

// 领取优惠券
export const claimCoupon = async (couponId: number): Promise<UserCoupon> => {
    const response = await api.post(`/coupons/${couponId}/claim`);
    return response.data;
};

// 应用优惠券
export const applyCoupon = async (userCouponId: number, orderAmount: number): Promise<{ discount: number; message: string }> => {
    const response = await api.post('/coupons/apply', { userCouponId, orderAmount });
    return response.data;
};

// 创建优惠券（管理员）
export const createCoupon = async (coupon: Partial<Coupon>): Promise<Coupon> => {
    const response = await api.post('/coupons', coupon);
    return response.data;
};

// 更新优惠券（管理员）
export const updateCoupon = async (id: number, coupon: Partial<Coupon>): Promise<Coupon> => {
    const response = await api.put(`/coupons/${id}`, coupon);
    return response.data;
};

// 删除优惠券（管理员）
export const deleteCoupon = async (id: number): Promise<void> => {
    await api.delete(`/coupons/${id}`);
};
