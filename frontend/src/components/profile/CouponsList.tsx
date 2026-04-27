import React, { useEffect, useMemo, useState } from 'react';
import { message } from 'antd';
import { getMyCoupons, getAvailableCoupons, claimCoupon } from '../../api/coupons';
import { getRedeemableCoupons, redeemCoupon } from '../../api/points';
import type { Coupon, RedeemableCoupon, UserCoupon } from '../../types';
import EmptyState from '../EmptyState';

type CouponTab = 'my' | 'available' | 'redeem';

interface CouponsListProps {
    userPoints: number;
    onPointsRefresh?: () => void | Promise<void>;
}

const getErrorMessage = (error: unknown, fallback: string) => {
    const data = (error as { response?: { data?: unknown } })?.response?.data;
    if (typeof data === 'string') return data;
    if (data && typeof data === 'object' && 'message' in data) {
        return String((data as { message?: unknown }).message || fallback);
    }
    return fallback;
};

const formatDate = (date: unknown) => {
    if (!date) return '-';
    if (Array.isArray(date)) {
        const [year, month, day] = date;
        return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    }
    return new Date(date as string).toLocaleDateString('zh-CN');
};

const formatMoney = (value?: number) => `¥${Number(value || 0).toFixed(2)}`;

const formatCouponValue = (coupon?: Coupon) => {
    if (!coupon) return '-';
    if (coupon.type === 'DISCOUNT') return `${(Number(coupon.value) * 10).toFixed(1).replace(/\.0$/, '')}折`;
    if (coupon.type === 'FREE_SHIPPING') return '包邮';
    return formatMoney(coupon.value);
};

const getCouponCondition = (coupon?: Coupon) => {
    if (!coupon || !coupon.minAmount || Number(coupon.minAmount) <= 0) return '无门槛';
    return `满 ${formatMoney(coupon.minAmount)} 可用`;
};

const getStatusLabel = (status: UserCoupon['status']) => {
    if (status === 'USED') return '已使用';
    if (status === 'EXPIRED') return '已过期';
    return '未使用';
};

const CouponCard: React.FC<{
    coupon?: Coupon;
    disabled?: boolean;
    badge?: string;
    meta?: React.ReactNode;
    action?: React.ReactNode;
}> = ({ coupon, disabled, badge, meta, action }) => (
    <div className={`relative bg-white dark:bg-slate-800 rounded-xl border overflow-hidden ${disabled ? 'opacity-60 border-slate-200 dark:border-slate-700' : 'border-primary/30'}`}>
        <div className="flex min-h-32">
            <div className={`w-28 flex-shrink-0 flex flex-col items-center justify-center p-4 ${disabled ? 'bg-slate-100 dark:bg-slate-700' : 'bg-primary/10'}`}>
                <span className={`text-2xl font-bold ${disabled ? 'text-slate-400' : 'text-primary'}`}>{formatCouponValue(coupon)}</span>
                <span className="mt-1 text-xs text-slate-500 dark:text-slate-400">{coupon?.type === 'DISCOUNT' ? '折扣券' : coupon?.type === 'FREE_SHIPPING' ? '包邮券' : '满减券'}</span>
            </div>
            <div className="flex-1 min-w-0 p-4">
                <h3 className="font-semibold text-slate-900 dark:text-white truncate">{coupon?.name}</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{getCouponCondition(coupon)}</p>
                <p className="text-xs text-slate-400 mt-2">有效期至 {formatDate(coupon?.endTime)}</p>
                {meta && <div className="mt-3">{meta}</div>}
            </div>
            {action && <div className="flex items-center pr-4">{action}</div>}
        </div>
        {badge && (
            <div className="absolute top-2 right-2 px-2 py-1 bg-slate-200 dark:bg-slate-600 text-slate-500 dark:text-slate-300 text-xs rounded">
                {badge}
            </div>
        )}
    </div>
);

const CouponsList: React.FC<CouponsListProps> = ({ userPoints, onPointsRefresh }) => {
    const [myCoupons, setMyCoupons] = useState<UserCoupon[]>([]);
    const [availableCoupons, setAvailableCoupons] = useState<Coupon[]>([]);
    const [redeemableCoupons, setRedeemableCoupons] = useState<RedeemableCoupon[]>([]);
    const [loading, setLoading] = useState(false);
    const [actionLoading, setActionLoading] = useState<number | null>(null);
    const [activeTab, setActiveTab] = useState<CouponTab>('my');

    const fetchCoupons = async () => {
        setLoading(true);
        try {
            const [myData, availableData, redeemData] = await Promise.all([
                getMyCoupons(),
                getAvailableCoupons(),
                getRedeemableCoupons(),
            ]);
            setMyCoupons(myData);
            setAvailableCoupons(availableData);
            setRedeemableCoupons(redeemData);
        } catch (error) {
            message.error(getErrorMessage(error, '获取优惠券失败'));
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCoupons();
    }, []);

    const unusedCount = useMemo(() => myCoupons.filter(item => item.status === 'UNUSED' && item.available).length, [myCoupons]);

    const handleClaim = async (couponId: number) => {
        setActionLoading(couponId);
        try {
            await claimCoupon(couponId);
            message.success('领取成功');
            await fetchCoupons();
            setActiveTab('my');
        } catch (error) {
            message.error(getErrorMessage(error, '领取失败'));
        } finally {
            setActionLoading(null);
        }
    };

    const handleRedeem = async (couponId: number) => {
        setActionLoading(couponId);
        try {
            await redeemCoupon(couponId);
            message.success('兑换成功，优惠券已放入我的券包');
            await onPointsRefresh?.();
            await fetchCoupons();
            setActiveTab('my');
        } catch (error) {
            message.error(getErrorMessage(error, '兑换失败'));
        } finally {
            setActionLoading(null);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
            </div>
        );
    }

    return (
        <div>
            <div className="mb-6 grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="rounded-xl border border-slate-200 dark:border-slate-700 p-4 bg-slate-50 dark:bg-slate-800">
                    <p className="text-xs text-slate-500 dark:text-slate-400">当前积分</p>
                    <p className="mt-1 text-2xl font-bold text-slate-900 dark:text-white">{userPoints}</p>
                </div>
                <div className="rounded-xl border border-slate-200 dark:border-slate-700 p-4 bg-slate-50 dark:bg-slate-800">
                    <p className="text-xs text-slate-500 dark:text-slate-400">可用优惠券</p>
                    <p className="mt-1 text-2xl font-bold text-slate-900 dark:text-white">{unusedCount}</p>
                </div>
                <div className="rounded-xl border border-slate-200 dark:border-slate-700 p-4 bg-slate-50 dark:bg-slate-800">
                    <p className="text-xs text-slate-500 dark:text-slate-400">可兑换券</p>
                    <p className="mt-1 text-2xl font-bold text-slate-900 dark:text-white">{redeemableCoupons.length}</p>
                </div>
            </div>

            <div className="flex flex-wrap gap-3 mb-6">
                {[
                    { key: 'my', label: `我的券 (${myCoupons.length})` },
                    { key: 'available', label: `可领取 (${availableCoupons.length})` },
                    { key: 'redeem', label: `积分兑换 (${redeemableCoupons.length})` },
                ].map(item => (
                    <button
                        key={item.key}
                        onClick={() => setActiveTab(item.key as CouponTab)}
                        className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                            activeTab === item.key
                                ? 'bg-primary text-white'
                                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                        }`}
                    >
                        {item.label}
                    </button>
                ))}
            </div>

            {activeTab === 'my' && (
                myCoupons.length === 0 ? (
                    <EmptyState icon="default" title="暂无优惠券" description="可领取或使用积分兑换优惠券" />
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {myCoupons.map(item => (
                            <CouponCard
                                key={item.id}
                                coupon={item.coupon}
                                disabled={item.status !== 'UNUSED' || !item.available}
                                badge={item.status === 'UNUSED' && item.available ? undefined : getStatusLabel(item.status)}
                                meta={<span className="text-xs text-slate-400">获得时间 {formatDate(item.getTime)}</span>}
                            />
                        ))}
                    </div>
                )
            )}

            {activeTab === 'available' && (
                availableCoupons.length === 0 ? (
                    <EmptyState icon="default" title="暂无可领取优惠券" description="当前没有可直接领取的优惠券" />
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {availableCoupons.map(coupon => (
                            <CouponCard
                                key={coupon.id}
                                coupon={coupon}
                                action={
                                    <button
                                        onClick={() => handleClaim(coupon.id)}
                                        disabled={actionLoading === coupon.id}
                                        className="px-4 py-2 bg-primary text-white text-sm font-medium rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
                                    >
                                        {actionLoading === coupon.id ? '领取中' : '领取'}
                                    </button>
                                }
                            />
                        ))}
                    </div>
                )
            )}

            {activeTab === 'redeem' && (
                redeemableCoupons.length === 0 ? (
                    <EmptyState icon="default" title="暂无可兑换优惠券" description="管理员尚未配置积分兑换券" />
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {redeemableCoupons.map(({ coupon, pointsRule }) => {
                            const disabled = userPoints < pointsRule.pointsCost;
                            return (
                                <CouponCard
                                    key={coupon.id}
                                    coupon={coupon}
                                    meta={
                                        <div className="flex flex-wrap items-center gap-3">
                                            <span className="text-sm font-bold text-red-500">{pointsRule.pointsCost} 积分</span>
                                            <span className="text-xs text-slate-400">每日限兑 {pointsRule.maxDailyRedeem} 张</span>
                                        </div>
                                    }
                                    action={
                                        <button
                                            onClick={() => handleRedeem(coupon.id)}
                                            disabled={disabled || actionLoading === coupon.id}
                                            className="px-4 py-2 bg-primary text-white text-sm font-medium rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            {disabled ? '积分不足' : actionLoading === coupon.id ? '兑换中' : '兑换'}
                                        </button>
                                    }
                                />
                            );
                        })}
                    </div>
                )
            )}
        </div>
    );
};

export default CouponsList;
