import React, { useState, useEffect } from 'react';
import { message } from 'antd';
import { getPointsHistory, getRedeemableCoupons, redeemCoupon } from '../../api/points';
import EmptyState from '../EmptyState';

interface PointsCenterSectionProps {
    userPoints: number;
    onPointsRefresh?: () => void;
}

const PointsCenterSection: React.FC<PointsCenterSectionProps> = ({ userPoints: propUserPoints, onPointsRefresh }) => {
    const [pointsHistory, setPointsHistory] = useState<any[]>([]);
    const [redeemableCoupons, setRedeemableCoupons] = useState<any[]>([]);
    const [activeTab, setActiveTab] = useState<'history' | 'redeem'>('history');
    const [historyLoading, setHistoryLoading] = useState(false);
    const [reloading, setReloading] = useState(false);

    const fetchHistory = async () => {
        setHistoryLoading(true);
        try {
            const history = await getPointsHistory();
            setPointsHistory(history);
        } catch {
            message.error('获取积分历史失败');
        } finally {
            setHistoryLoading(false);
        }
    };

    const fetchRedeemable = async () => {
        setReloading(true);
        try {
            const data = await getRedeemableCoupons();
            setRedeemableCoupons(data);
        } catch {
            message.error('获取可兑换优惠券失败');
        } finally {
            setReloading(false);
        }
    };

    useEffect(() => {
        if (activeTab === 'history') {
            fetchHistory();
        } else {
            fetchRedeemable();
        }
    }, [activeTab]);

    const handleRedeem = async (couponId: number) => {
        try {
            await redeemCoupon(couponId);
            message.success('兑换成功！');
            onPointsRefresh?.();
            await fetchHistory();
            await fetchRedeemable();
        } catch (e: unknown) {
            const errMsg = (e as { response?: { data?: string } })?.response?.data || '兑换失败';
            message.error(errMsg);
        }
    };

    const formatType = (type: string): { label: string; color: string } => {
        const map: Record<string, { label: string; color: string }> = {
            REGISTER: { label: '注册奖励', color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' },
            SIGN_IN: { label: '每日签到', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' },
            PURCHASE: { label: '消费返积分', color: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400' },
            REVIEW: { label: '评价奖励', color: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' },
            COUPON_REDEEM: { label: '积分兑换券', color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' },
            DEDUCT: { label: '积分抵扣', color: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400' },
            ADMIN_ADD: { label: '管理员增加', color: 'bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400' },
            ADMIN_DEDUCT: { label: '管理员扣减', color: 'bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-400' },
        };
        return map[type] || { label: type, color: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400' };
    };

    return (
        <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
            <div className="px-8 py-6 border-b border-slate-100 dark:border-slate-800">
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white">我的积分</h2>
                <p className="text-slate-500 dark:text-slate-400 mt-1">查看积分使用详情，兑换积分优惠券。</p>
            </div>

            {/* Points Balance Card */}
            <div className="px-8 py-6">
                <div className="flex items-center justify-between p-6 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 text-white">
                    <div>
                        <p className="text-sm font-medium opacity-80">当前积分</p>
                        <p className="text-4xl font-bold mt-2">{propUserPoints}</p>
                    </div>
                    <p className="text-sm opacity-70">通过侧边栏签到或消费获得积分</p>
                </div>
            </div>

            {/* Tabs */}
            <div className="px-8 flex gap-3 mb-4">
                <button
                    onClick={() => setActiveTab('history')}
                    className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                        activeTab === 'history'
                            ? 'bg-primary text-white'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                    }`}
                >
                    积分明细
                </button>
                <button
                    onClick={() => setActiveTab('redeem')}
                    className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                        activeTab === 'redeem'
                            ? 'bg-primary text-white'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                    }`}
                >
                    积分兑换
                </button>
            </div>

            {/* History Tab */}
            {activeTab === 'history' && (
                <div className="px-8 pb-8">
                    {historyLoading ? (
                        <div className="flex justify-center py-12">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                        </div>
                    ) : pointsHistory.length === 0 ? (
                        <EmptyState icon="default" title="暂无积分记录" description="签到或消费后即可获得积分" />
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="border-b border-slate-200 dark:border-slate-700">
                                        <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">类型</th>
                                        <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">积分</th>
                                        <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">描述</th>
                                        <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">时间</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                    {pointsHistory.map(item => {
                                        const typeInfo = formatType(item.type);
                                        return (
                                            <tr key={item.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                                <td className="px-4 py-3">
                                                    <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${typeInfo.color}`}>
                                                        {typeInfo.label}
                                                    </span>
                                                </td>
                                                <td className={`px-4 py-3 text-sm font-semibold ${item.points >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                                    {item.points >= 0 ? '+' : ''}{item.points}
                                                </td>
                                                <td className="px-4 py-3 text-sm text-slate-600 dark:text-slate-300">{item.description}</td>
                                                <td className="px-4 py-3 text-sm text-slate-400 text-right">
                                                    {new Date(item.createTime).toLocaleString('zh-CN')}
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            )}

            {/* Redeem Tab */}
            {activeTab === 'redeem' && (
                <div className="px-8 pb-8">
                    {reloading ? (
                        <div className="flex justify-center py-12">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                        </div>
                    ) : redeemableCoupons.length === 0 ? (
                        <EmptyState icon="default" title="暂无可兑换优惠券" description="管理员尚未上架积分兑换券，敬请期待" />
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {redeemableCoupons.map(({ coupon, pointsRule }: { coupon: any; pointsRule: any }) => (
                                <div
                                    key={coupon.id}
                                    className="relative bg-white dark:bg-slate-800 rounded-xl border border-primary/30 overflow-hidden"
                                >
                                    <div className="flex">
                                        <div className="w-24 flex-shrink-0 flex flex-col items-center justify-center p-4 bg-primary/10">
                                            <span className="text-2xl font-bold text-primary">
                                                {coupon.type === 'DISCOUNT'
                                                    ? `${coupon.value}折`
                                                    : coupon.type === 'FULL_REDUCE'
                                                        ? `¥${coupon.value}`
                                                        : '包邮'}
                                            </span>
                                        </div>
                                        <div className="flex-1 p-4">
                                            <h3 className="font-semibold text-slate-900 dark:text-white">{coupon.name}</h3>
                                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                                                {coupon.minAmount ? `满¥${coupon.minAmount}可用` : '无门槛'}
                                            </p>
                                            <div className="flex items-center gap-3 mt-2">
                                                <span className="text-sm font-bold text-red-500">{pointsRule.pointsCost} 积分</span>
                                                <span className="text-xs text-slate-400">每日限兑 {pointsRule.maxDailyRedeem} 张</span>
                                            </div>
                                        </div>
                                        <div className="flex items-center pr-4">
                                            <button
                                                onClick={() => handleRedeem(coupon.id)}
                                                className="px-4 py-2 bg-primary text-white text-sm font-medium rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                                disabled={propUserPoints < pointsRule.pointsCost}
                                                title={propUserPoints < pointsRule.pointsCost ? '积分不足' : '立即兑换'}
                                            >
                                                {propUserPoints < pointsRule.pointsCost ? '积分不足' : '立即兑换'}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default PointsCenterSection;
