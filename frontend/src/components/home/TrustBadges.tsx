import React from 'react';

const TrustBadges: React.FC = () => {
    const badges = [
        {
            icon: 'verified',
            title: '正品保障',
            description: '所有图书均为正版，假一赔十',
        },
        {
            icon: 'autorenew',
            title: '7天退换',
            description: '不满意可无理由退换货',
        },
        {
            icon: 'local_shipping',
            title: '满99包邮',
            description: '订单满99元享受包邮服务。',
        },
        {
            icon: 'redeem',
            title: '积分兑换',
            description: '购物累积积分，兑换好礼',
        },
    ];

    return (
        <section className="mb-10 section-animate bg-paper-texture">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {badges.map((badge) => (
                    <div
                        key={badge.title}
                        className="flex items-center gap-3 bg-white dark:bg-slate-800 rounded-xl p-4 shadow-sm border border-slate-100 dark:border-slate-700 card-hover-lift hover:shadow-md transition-shadow"
                    >
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                            <span className="material-symbols-outlined text-xl text-primary" aria-hidden="true">{badge.icon}</span>
                        </div>
                        <div className="min-w-0">
                            <h3 className="font-semibold text-slate-900 dark:text-white text-sm">{badge.title}</h3>
                            <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1">{badge.description}</p>
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
};

export default TrustBadges;
