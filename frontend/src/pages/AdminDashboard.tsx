import React, { useEffect, useMemo, useState } from 'react';
import api from '../api';
import { message } from 'antd';

interface DashboardOrderItem {
    quantity: number;
    book?: {
        id: number;
        title?: string;
        author?: string;
    };
}

interface DashboardOrder {
    id: number;
    totalPrice: number | string;
    status: string;
    createTime?: string;
    items?: DashboardOrderItem[];
}

interface DashboardUser {
    id: number;
    username: string;
    email: string;
    createTime?: string;
}

interface DashboardBook {
    id: number;
    title: string;
    author: string;
    stock: number;
}

interface AdminSettingsState {
    storeName: string;
    supportEmail: string;
    supportPhone: string;
    lowStockThreshold: number;
    dashboardRange: '6m' | '12m';
}

const defaultSettings: AdminSettingsState = {
    storeName: 'JavaBooks',
    supportEmail: 'support@javabooks.com',
    supportPhone: '400-123-4567',
    lowStockThreshold: 10,
    dashboardRange: '6m'
};

const AdminDashboard: React.FC = () => {
    const [orders, setOrders] = useState<DashboardOrder[]>([]);
    const [users, setUsers] = useState<DashboardUser[]>([]);
    const [books, setBooks] = useState<DashboardBook[]>([]);
    const [settings, setSettings] = useState<AdminSettingsState>(defaultSettings);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchDashboard = async () => {
            setLoading(true);
            try {
                const [ordersRes, usersRes, booksRes, settingsRes] = await Promise.all([
                    api.get('/orders'),
                    api.get('/users'),
                    api.get('/books'),
                    api.get('/settings')
                ]);
                setOrders(Array.isArray(ordersRes.data) ? ordersRes.data : []);
                setUsers(Array.isArray(usersRes.data) ? usersRes.data : []);
                setBooks(Array.isArray(booksRes.data) ? booksRes.data : []);
                setSettings({ ...defaultSettings, ...settingsRes.data });
            } catch (error) {
                console.error('Failed to load dashboard data:', error);
                message.error('仪表盘数据加载失败');
                setSettings(defaultSettings);
            } finally {
                setLoading(false);
            }
        };
        fetchDashboard();
    }, []);

    const revenueOrders = useMemo(() => orders.filter(order => order.status !== 'CANCELLED'), [orders]);
    const totalRevenue = useMemo(() => revenueOrders.reduce((sum, order) => sum + Number(order.totalPrice || 0), 0), [revenueOrders]);

    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    const newUsersThisMonth = useMemo(() => users.filter(user => {
        if (!user.createTime) return false;
        const date = new Date(user.createTime);
        return date.getFullYear() === currentYear && date.getMonth() === currentMonth;
    }).length, [users, currentMonth, currentYear]);

    const lowStockThreshold = settings.lowStockThreshold || 10;
    const stockAlerts = useMemo(() => books.filter(book => book.stock <= lowStockThreshold).length, [books, lowStockThreshold]);

    const rangeMonths = settings.dashboardRange === '12m' ? 12 : 6;
    const monthlySales = useMemo(() => {
        const data = Array.from({ length: rangeMonths }, (_, index) => {
            const date = new Date(currentYear, currentMonth - (rangeMonths - 1 - index), 1);
            return { month: date.getMonth(), year: date.getFullYear(), total: 0 };
        });
        revenueOrders.forEach(order => {
            if (!order.createTime) return;
            const date = new Date(order.createTime);
            data.forEach(bucket => {
                if (bucket.month === date.getMonth() && bucket.year === date.getFullYear()) {
                    bucket.total += Number(order.totalPrice || 0);
                }
            });
        });
        return data;
    }, [revenueOrders, rangeMonths, currentMonth, currentYear]);

    const currentMonthRevenue = monthlySales[monthlySales.length - 1]?.total || 0;
    const previousMonthRevenue = monthlySales[monthlySales.length - 2]?.total || 0;
    const revenueChange = previousMonthRevenue === 0 ? (currentMonthRevenue > 0 ? 100 : 0) : ((currentMonthRevenue - previousMonthRevenue) / previousMonthRevenue) * 100;

    const topBooks = useMemo(() => {
        const stats = new Map<string, { key: string; title: string; author?: string; sold: number }>();
        orders.forEach(order => {
            order.items?.forEach(item => {
                const title = item.book?.title || '未知图书';
                const key = `${item.book?.id || title}`;
                const current = stats.get(key) || { key, title, author: item.book?.author, sold: 0 };
                current.sold += item.quantity;
                stats.set(key, current);
            });
        });
        return Array.from(stats.values()).sort((a, b) => b.sold - a.sold).slice(0, 5);
    }, [orders]);

    const maxMonthly = Math.max(...monthlySales.map(item => item.total), 1);

    return (
        <div className="flex-1 overflow-y-auto p-6 md:p-8 h-full">
            <div className="max-w-7xl mx-auto flex flex-col gap-8">
                {/* Stats Row */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Total Sales */}
                    <div className="bg-white dark:bg-[#1a2632] p-6 rounded-xl border border-[#e5e7eb] dark:border-[#2a3b4d] shadow-sm flex flex-col justify-between h-36">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-sm font-medium text-[#637588] dark:text-[#9ca3af]">总收入</p>
                                <h3 className="text-3xl font-bold mt-2">¥{totalRevenue.toFixed(2)}</h3>
                            </div>
                            <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg text-green-600 dark:text-green-400">
                                <span className="material-symbols-outlined">payments</span>
                            </div>
                        </div>
                        <div className="flex items-center gap-2 mt-auto">
                            <span className="material-symbols-outlined text-green-600 text-sm">trending_up</span>
                            <span className="text-sm font-medium text-green-600">{revenueChange >= 0 ? `+${revenueChange.toFixed(1)}%` : `${revenueChange.toFixed(1)}%`}</span>
                            <span className="text-sm text-[#637588] dark:text-[#9ca3af]">较上月</span>
                        </div>
                    </div>
                    
                    {/* Total Users */}
                    <div className="bg-white dark:bg-[#1a2632] p-6 rounded-xl border border-[#e5e7eb] dark:border-[#2a3b4d] shadow-sm flex flex-col justify-between h-36">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-sm font-medium text-[#637588] dark:text-[#9ca3af]">用户总数</p>
                                <h3 className="text-3xl font-bold mt-2">{users.length}</h3>
                            </div>
                            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg text-blue-600 dark:text-blue-400">
                                <span className="material-symbols-outlined">group_add</span>
                            </div>
                        </div>
                        <div className="flex items-center gap-2 mt-auto">
                            <span className="material-symbols-outlined text-green-600 text-sm">trending_up</span>
                            <span className="text-sm font-medium text-green-600">+{newUsersThisMonth}</span>
                            <span className="text-sm text-[#637588] dark:text-[#9ca3af]">本月新增</span>
                        </div>
                    </div>
                    
                    {/* Stock Alerts */}
                    <div className="bg-white dark:bg-[#1a2632] p-6 rounded-xl border border-[#e5e7eb] dark:border-[#2a3b4d] shadow-sm flex flex-col justify-between h-36 relative overflow-hidden group cursor-pointer hover:border-red-200 transition-colors">
                        <div className="absolute right-0 top-0 h-full w-1 bg-red-500"></div>
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-sm font-medium text-[#637588] dark:text-[#9ca3af]">库存预警</p>
                                <h3 className="text-3xl font-bold mt-2 text-[#111418] dark:text-white">{stockAlerts}</h3>
                            </div>
                            <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg text-red-600 dark:text-red-400">
                                <span className="material-symbols-outlined">warning</span>
                            </div>
                        </div>
                        <div className="flex items-center gap-2 mt-auto">
                            <span className="text-sm font-medium text-red-600">库存不足</span>
                            <span className="text-sm text-[#637588] dark:text-[#9ca3af]">- {lowStockThreshold} 以下</span>
                        </div>
                    </div>
                </div>

                {/* Charts & Lists Row */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-auto lg:h-[500px]">
                    {/* Chart Section */}
                    <div className="lg:col-span-2 bg-white dark:bg-[#1a2632] rounded-xl border border-[#e5e7eb] dark:border-[#2a3b4d] shadow-sm flex flex-col">
                        <div className="p-6 border-b border-[#e5e7eb] dark:border-[#2a3b4d] flex justify-between items-center">
                            <h3 className="font-bold text-lg">月度销售趋势</h3>
                            <div className="flex gap-2">
                                <button className={`text-xs font-medium px-3 py-1 rounded-full ${settings.dashboardRange === '6m' ? 'bg-primary/10 text-primary' : 'text-[#637588] hover:bg-[#f0f2f4] dark:hover:bg-[#2a3b4d]'}`}>近6个月</button>
                                <button className={`text-xs font-medium px-3 py-1 rounded-full ${settings.dashboardRange === '12m' ? 'bg-primary/10 text-primary' : 'text-[#637588] hover:bg-[#f0f2f4] dark:hover:bg-[#2a3b4d]'}`}>近1年</button>
                            </div>
                        </div>
                        <div className="flex-1 p-6 flex flex-col justify-end">
                            <div className="flex h-full items-end gap-4 md:gap-8 justify-between px-2">
                                {monthlySales.map((item, index) => {
                                    const height = Math.max(4, Math.round((item.total / maxMonthly) * 100));
                                    return (
                                        <div key={`${item.year}-${item.month}-${index}`} className="flex flex-col items-center gap-2 group w-full">
                                            <div className="relative w-full bg-[#f0f2f4] dark:bg-[#2a3b4d] rounded-t-lg h-64 overflow-hidden">
                                                <div className="absolute bottom-0 w-full bg-primary/80 group-hover:bg-primary transition-all duration-300 rounded-t-lg" style={{ height: `${height}%` }}></div>
                                            </div>
                                            <span className="text-xs font-medium text-[#637588]">{item.month + 1}月</span>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                    
                    {/* Top Ranking Section */}
                    <div className="lg:col-span-1 bg-white dark:bg-[#1a2632] rounded-xl border border-[#e5e7eb] dark:border-[#2a3b4d] shadow-sm flex flex-col overflow-hidden">
                        <div className="p-6 border-b border-[#e5e7eb] dark:border-[#2a3b4d]">
                            <h3 className="font-bold text-lg">热销图书榜</h3>
                        </div>
                        <div className="flex-1 overflow-y-auto">
                            <table className="w-full text-left text-sm">
                                <thead className="bg-[#f9fafb] dark:bg-[#2a3b4d] text-[#637588] font-medium sticky top-0">
                                    <tr>
                                        <th className="px-4 py-3 w-12 text-center">#</th>
                                        <th className="px-4 py-3">书名</th>
                                        <th className="px-4 py-3 text-right">销量</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-[#e5e7eb] dark:divide-[#2a3b4d]">
                                    {topBooks.map((book, index) => (
                                        <tr key={book.key} className="group hover:bg-gray-50 dark:hover:bg-[#23303e] transition-colors">
                                            <td className="px-4 py-3 text-center font-bold text-[#111418] dark:text-white">{index + 1}</td>
                                            <td className="px-4 py-3">
                                                <div className="flex flex-col">
                                                    <span className="font-medium text-[#111418] dark:text-white line-clamp-1">{book.title}</span>
                                                    <span className="text-xs text-[#637588]">{book.author || '-'}</span>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3 text-right font-medium text-[#111418] dark:text-white">{book.sold.toLocaleString()}</td>
                                        </tr>
                                    ))}
                                    {!loading && topBooks.length === 0 && (
                                        <tr>
                                            <td colSpan={3} className="px-4 py-6 text-center text-sm text-[#637588]">暂无数据</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
