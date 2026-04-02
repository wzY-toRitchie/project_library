import React, { useState, useEffect } from 'react';
import { getMyCoupons, getAvailableCoupons, claimCoupon } from '../../api/coupons';
import type { UserCoupon, Coupon } from '../../types';
import { message } from 'antd';
import EmptyState from '../EmptyState';

const CouponsList: React.FC = () => {
    const [myCoupons, setMyCoupons] = useState<UserCoupon[]>([]);
    const [availableCoupons, setAvailableCoupons] = useState<Coupon[]>([]);
    const [loading, setLoading] = useState(false);
    const [activeTab, setActiveTab] = useState<'my' | 'available'>('my');

    useEffect(() => {
        const fetchCoupons = async () => {
            setLoading(true);
            try {
                const [myData, availableData] = await Promise.all([
                    getMyCoupons(),
                    getAvailableCoupons()
                ]);
                setMyCoupons(myData);
                setAvailableCoupons(availableData);
            } catch (error) {
                console.error('Failed to fetch coupons:', error);
                message.error('获取优惠券失败');
            } finally {
                setLoading(false);
            }
        };
        fetchCoupons();
    }, []);

    const handleClaim = async (couponId: number) => {
        try {
            await claimCoupon(couponId);
            message.success('领取成功');
            // Refresh lists
            const [myData, availableData] = await Promise.all([
                getMyCoupons(),
                getAvailableCoupons()
            ]);
            setMyCoupons(myData);
            setAvailableCoupons(availableData);
        } catch (error: unknown) {
            const errMsg = (error as { response?: { data?: { message?: string } } })?.response?.data?.message || '领取失败';
            message.error(errMsg);
        }
    };

    const formatDate = (date: unknown) => {
        if (!date) return '-';
        if (Array.isArray(date)) {
            const [year, month, day] = date;
            return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        }
        return new Date(date as string).toLocaleDateString();
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
        );
    }

    return (
        <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6">我的优惠券</h2>

            {/* Tabs */}
            <div className="flex gap-4 mb-6">
                <button
                    onClick={() => setActiveTab('my')}
                    className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${activeTab === 'my' ? 'bg-primary text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'}`}
                >
                    我的优惠券 ({myCoupons.length})
                </button>
                <button
                    onClick={() => setActiveTab('available')}
                    className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${activeTab === 'available' ? 'bg-primary text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'}`}
                >
                    可领取优惠券 ({availableCoupons.length})
                </button>
            </div>

            {/* My Coupons */}
            {activeTab === 'my' && (
                myCoupons.length === 0 ? (
                    <EmptyState
                        icon="default"
                        title="暂无优惠券"
                        description="还没有任何优惠券，去看看可领取的优惠券吧"
                    />
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {myCoupons.map((item) => (
                            <div
                                key={item.id}
                                className={`relative bg-white dark:bg-slate-800 rounded-xl border overflow-hidden ${item.status !== 'UNUSED' ? 'opacity-60 border-slate-200 dark:border-slate-700' : 'border-primary/30'}`}
                            >
                                <div className="flex">
                                    <div className={`w-24 flex-shrink-0 flex flex-col items-center justify-center p-4 ${item.status !== 'UNUSED' ? 'bg-slate-100 dark:bg-slate-700' : 'bg-primary/10'}`}>
                                        <span className={`text-2xl font-bold ${item.status !== 'UNUSED' ? 'text-slate-400' : 'text-primary'}`}>
                                            {item.coupon?.type === 'DISCOUNT'
                                                ? `${item.coupon.value}折`
                                                : item.coupon?.type === 'FULL_REDUCE'
                                                    ? `¥${item.coupon?.value}`
                                                    : '包邮'
                                            }
                                        </span>
                                    </div>
                                    <div className="flex-1 p-4">
                                        <h3 className="font-semibold text-slate-900 dark:text-white">{item.coupon?.name}</h3>
                                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                                            {item.coupon?.minAmount
                                                ? `满¥${item.coupon.minAmount}可用`
                                                : '无门槛'
                                            }
                                        </p>
                                        <p className="text-xs text-slate-400 mt-2">
                                            有效期至: {formatDate(item.coupon?.endTime)}
                                        </p>
                                    </div>
                                    {item.status !== 'UNUSED' && (
                                        <div className="absolute top-2 right-2 px-2 py-1 bg-slate-200 dark:bg-slate-600 text-slate-500 dark:text-slate-300 text-xs rounded">
                                            已使用
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )
            )}

            {/* Available Coupons */}
            {activeTab === 'available' && (
                availableCoupons.length === 0 ? (
                    <EmptyState
                        icon="default"
                        title="暂无可领取优惠券"
                        description="当前没有可领取的优惠券，敬请期待"
                    />
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {availableCoupons.map((coupon) => (
                            <div
                                key={coupon.id}
                                className="bg-white dark:bg-slate-800 rounded-xl border border-dashed border-primary/50 overflow-hidden"
                            >
                                <div className="flex">
                                    <div className="w-24 flex-shrink-0 flex flex-col items-center justify-center p-4 bg-primary/10">
                                        <span className="text-2xl font-bold text-primary">
                                            {coupon.type === 'DISCOUNT'
                                                ? `${coupon.value}折`
                                                : coupon.type === 'FULL_REDUCE'
                                                    ? `¥${coupon.value}`
                                                    : '包邮'
                                            }
                                        </span>
                                    </div>
                                    <div className="flex-1 p-4">
                                        <h3 className="font-semibold text-slate-900 dark:text-white">{coupon.name}</h3>
                                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                                            {coupon.minAmount
                                                ? `满¥${coupon.minAmount}可用`
                                                : '无门槛'
                                            }
                                        </p>
                                        <p className="text-xs text-slate-400 mt-2">
                                            有效期至: {formatDate(coupon.endTime)}
                                        </p>
                                    </div>
                                    <div className="flex items-center pr-4">
                                        <button
                                            onClick={() => handleClaim(coupon.id)}
                                            className="px-4 py-2 bg-primary text-white text-sm font-medium rounded-lg hover:bg-primary/90 transition-colors"
                                        >
                                            立即领取
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )
            )}
        </div>
    );
};

export default CouponsList;
