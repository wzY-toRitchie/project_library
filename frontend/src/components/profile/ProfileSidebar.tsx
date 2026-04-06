import React from 'react';

interface ProfileSidebarProps {
    activeSection: string;
    onSectionChange: (section: string) => void;
    userPoints: number;
    signedInToday: boolean;
    onSignIn: () => void;
}

const navItems = [
    { key: 'orders', label: '我的订单', icon: 'shopping_bag' },
    { key: 'profile', label: '个人信息', icon: 'person' },
    { key: 'address', label: '收货地址', icon: 'location_on' },
    { key: 'password', label: '修改密码', icon: 'lock' },
    { key: 'favorites', label: '我的收藏', icon: 'favorite' },
    { key: 'history', label: '浏览历史', icon: 'history' },
    { key: 'coupons', label: '我的优惠券', icon: 'confirmation_number' },
    { key: 'points', label: '我的积分', icon: 'stars' },
];

const ProfileSidebar: React.FC<ProfileSidebarProps> = ({
    activeSection,
    onSectionChange,
    userPoints,
    signedInToday,
    onSignIn,
}) => {
    return (
        <aside className="w-full lg:w-64 flex-shrink-0">
            <nav className="space-y-1">
                {navItems.map((item, index) => (
                    <button
                        key={item.key}
                        onClick={() => onSectionChange(item.key)}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                            index === 0 && activeSection === item.key
                                ? 'bg-primary text-white shadow-sm font-medium'
                                : activeSection === item.key
                                    ? 'bg-primary text-white font-medium'
                                    : 'text-slate-600 dark:text-slate-400 hover:bg-primary/10 hover:text-primary'
                        }`}
                    >
                        <span className="material-symbols-outlined" aria-hidden="true">{item.icon}</span>
                        <span>{item.label}</span>
                    </button>
                ))}
            </nav>

            <div className="mt-10 p-4 rounded-xl bg-gradient-to-br from-primary to-blue-700 text-white shadow-lg overflow-hidden relative">
                <div className="relative z-10">
                    <p className="text-xs font-semibold opacity-80 uppercase tracking-wider">书店会员</p>
                    <p className="text-lg font-bold mt-1">{userPoints} 积分</p>
                    <p className="text-xs mt-3 opacity-90">积分可抵扣下次购物金额</p>
                    <button
                        onClick={onSignIn}
                        disabled={signedInToday}
                        className={`mt-4 w-full py-2 rounded-lg text-sm font-semibold transition-colors ${
                            signedInToday
                                ? 'bg-white/10 text-white/60 cursor-not-allowed'
                                : 'bg-white/20 hover:bg-white/30'
                        }`}
                    >
                        {signedInToday ? '今日已签到' : '签到领积分'}
                    </button>
                </div>
                <span className="material-symbols-outlined absolute -bottom-4 -right-4 text-7xl opacity-20 rotate-12" aria-hidden="true">redeem</span>
            </div>
        </aside>
    );
};

export default ProfileSidebar;
