import api from './index';

// 创建支付宝支付
export const createPayment = async (orderId: number): Promise<{ paymentHtml: string; orderId: string }> => {
    const response = await api.post(`/payment/create/${orderId}`);
    return response.data;
};

// 查询支付状态
export const getPaymentStatus = async (orderId: number): Promise<{ status: string; orderId: string }> => {
    const response = await api.get(`/payment/status/${orderId}`);
    return response.data;
};

// 关闭订单
export const closePayment = async (orderId: number): Promise<{ success: boolean }> => {
    const response = await api.post(`/payment/close/${orderId}`);
    return response.data;
};

// 退款
export const refundPayment = async (orderId: number, amount?: string): Promise<{ success: boolean }> => {
    const response = await api.post(`/payment/refund/${orderId}`, null, {
        params: { amount: amount || '0' }
    });
    return response.data;
};