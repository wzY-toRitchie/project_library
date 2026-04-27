import React, { useEffect, useState } from 'react';
import { message } from 'antd';
import { Link } from 'react-router-dom';
import { getPointsHistory } from '../../api/points';
import type { PointsHistory } from '../../types';
import EmptyState from '../EmptyState';

interface PointsCenterSectionProps {
    userPoints: number;
}

const typeMap: Record<string, { label: string; color: string }> = {
    REGISTER: { label: '注册奖励', color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' },
    SIGN_IN: { label: '每日签到', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' },
    PURCHASE: { label: '消费返积分', color: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400' },
    REVIEW: { label: '评价奖励', color: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' },
    COUPON_REDEEM: { label: '兑换优惠券', color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' },
    DEDUCT: { label: '积分抵扣', color: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400' },
    ADMIN_ADD: { label: '管理员增加', color: 'bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400' },
    ADMIN_DEDUCT: { label: '管理员扣减', color: 'bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-400' },
};

const formatType = (type: string) => typeMap[type] || { label: type, color: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400' };

const PointsCenterSection: React.FC<PointsCenterSectionProps> = ({ userPoints }) => {
    const [pointsHistory, setPointsHistory] = useState<PointsHistory[]>([]);
    const [historyLoading, setHistoryLoading] = useState(false);

    const fetchHistory = async () => {
        setHistoryLoading(true);
        try {
            setPointsHistory(await getPointsHistory());
        } catch {
            message.error('获取积分历史失败');
        } finally {
            setHistoryLoading(false);
        }
    };

    useEffect(() => {
        fetchHistory();
    }, []);

    return (
        <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
            <div className="px-8 py-6 border-b border-slate-100 dark:border-slate-800">
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white">我的积分</h2>
                <p className="text-slate-500 dark:text-slate-400 mt-1">查看积分余额和变动明细。</p>
            </div>

            <div className="px-8 py-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-6 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 text-white">
                    <div>
                        <p className="text-sm font-medium opacity-80">当前积分</p>
                        <p className="text-4xl font-bold mt-2">{userPoints}</p>
                    </div>
                    <Link
                        to="/profile?tab=coupons"
                        className="inline-flex items-center justify-center px-4 py-2 rounded-lg bg-white/20 hover:bg-white/30 text-sm font-semibold transition-colors"
                    >
                        去兑换优惠券
                    </Link>
                </div>
            </div>

            <div className="px-8 pb-8">
                <h3 className="text-base font-semibold text-slate-900 dark:text-white mb-4">积分明细</h3>
                {historyLoading ? (
                    <div className="flex justify-center py-12">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
                    </div>
                ) : pointsHistory.length === 0 ? (
                    <EmptyState icon="default" title="暂无积分记录" description="签到、消费或兑换后会产生积分明细" />
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-slate-200 dark:border-slate-700">
                                    <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">类型</th>
                                    <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">积分</th>
                                    <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">说明</th>
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
        </div>
    );
};

export default PointsCenterSection;
