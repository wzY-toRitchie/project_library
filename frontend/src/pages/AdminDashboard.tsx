import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { message } from 'antd';
import { 
    DollarSign, 
    ShoppingCart, 
    Users, 
    Package,
    TrendingUp,
    Calendar,
    Bell,
    Download,
    Truck,
    Clock,
    AlertTriangle
} from 'lucide-react';
import { 
    getDashboardSummary, 
    getSalesTrend, 
    getOrderStatusDistribution,
    getTopProducts,
    getCategorySales,
    getUserGrowth,
    getTodoItems
} from '../api/dashboard';
import { exportOrders, exportUsers, exportBooks } from '../api/export';
import type { 
    DashboardSummary, 
    SalesTrend, 
    OrderStatus, 
    TopProducts,
    CategorySales,
    UserGrowth,
    TodoItems
} from '../api/dashboard';
import SalesTrendChart from '../components/charts/SalesTrendChart';
import OrderStatusChart from '../components/charts/OrderStatusChart';
import TopProductsChart from '../components/charts/TopProductsChart';
import CategorySalesChart from '../components/charts/CategorySalesChart';
import UserGrowthChart from '../components/charts/UserGrowthChart';

const AdminDashboard: React.FC = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [summary, setSummary] = useState<DashboardSummary | null>(null);
    const [salesTrend, setSalesTrend] = useState<SalesTrend | null>(null);
    const [orderStatus, setOrderStatus] = useState<OrderStatus | null>(null);
    const [topProducts, setTopProducts] = useState<TopProducts | null>(null);
    const [categorySales, setCategorySales] = useState<CategorySales | null>(null);
    const [userGrowth, setUserGrowth] = useState<UserGrowth | null>(null);
    const [todos, setTodos] = useState<TodoItems | null>(null);
    const [trendDays, setTrendDays] = useState(30);

    useEffect(() => {
        const fetchDashboardData = async () => {
            setLoading(true);
            try {
                const [summaryData, salesData, orderData, productsData, categoryData, userData, todosData] = await Promise.all([
                    getDashboardSummary(),
                    getSalesTrend(trendDays),
                    getOrderStatusDistribution(),
                    getTopProducts(10),
                    getCategorySales(),
                    getUserGrowth(trendDays),
                    getTodoItems()
                ]);
                
                setSummary(summaryData);
                setSalesTrend(salesData);
                setOrderStatus(orderData);
                setTopProducts(productsData);
                setCategorySales(categoryData);
                setUserGrowth(userData);
                setTodos(todosData);
                setUserGrowth(userData);
            } catch (error) {
                console.error('Failed to fetch dashboard data:', error);
                message.error('仪表盘数据加载失败');
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, [trendDays]);

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('zh-CN', {
            style: 'currency',
            currency: 'CNY',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(value);
    };

    if (loading) {
        return (
            <div className="flex-1 flex items-center justify-center h-full">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        );
    }

    return (
        <div className="flex-1 overflow-y-auto p-6 md:p-8 h-full bg-slate-50 dark:bg-slate-900">
            <div className="max-w-7xl mx-auto flex flex-col gap-8">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                            <TrendingUp className="text-primary" />
                            数据可视化大屏
                        </h1>
                        <p className="text-slate-500 dark:text-slate-400 mt-1">
                            实时监控店铺运营数据
                        </p>
                    </div>
                    <div className="flex items-center gap-2 bg-white dark:bg-slate-800 rounded-lg p-1 shadow-sm">
                        <button
                            onClick={() => setTrendDays(7)}
                            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                                trendDays === 7 
                                    ? 'bg-primary text-white' 
                                    : 'text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-700'
                            }`}
                        >
                            近7天
                        </button>
                        <button
                            onClick={() => setTrendDays(30)}
                            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                                trendDays === 30 
                                    ? 'bg-primary text-white' 
                                    : 'text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-700'
                            }`}
                        >
                            近30天
                        </button>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {/* Total Sales */}
                    <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-slate-200 dark:border-slate-700">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-slate-500 dark:text-slate-400">总销售额</p>
                                <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
                                    {formatCurrency(summary?.totalSales || 0)}
                                </p>
                                <p className="text-xs text-green-500 mt-2">
                                    今日: {formatCurrency(summary?.todaySales || 0)}
                                </p>
                            </div>
                            <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-xl">
                                <DollarSign className="w-6 h-6 text-green-600" />
                            </div>
                        </div>
                    </div>

                    {/* Total Orders */}
                    <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-slate-200 dark:border-slate-700">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-slate-500 dark:text-slate-400">订单总数</p>
                                <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
                                    {summary?.totalOrders || 0}
                                </p>
                                <p className="text-xs text-blue-500 mt-2">
                                    今日: {summary?.todayOrders || 0} 单
                                </p>
                            </div>
                            <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-xl">
                                <ShoppingCart className="w-6 h-6 text-blue-600" />
                            </div>
                        </div>
                    </div>

                    {/* Total Users */}
                    <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-slate-200 dark:border-slate-700">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-slate-500 dark:text-slate-400">用户总数</p>
                                <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
                                    {summary?.totalUsers || 0}
                                </p>
                            </div>
                            <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-xl">
                                <Users className="w-6 h-6 text-purple-600" />
                            </div>
                        </div>
                    </div>

                    {/* Total Books */}
                    <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-slate-200 dark:border-slate-700">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-slate-500 dark:text-slate-400">商品总数</p>
                                <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
                                    {summary?.totalBooks || 0}
                                </p>
                            </div>
                            <div className="p-3 bg-orange-100 dark:bg-orange-900/30 rounded-xl">
                                <Package className="w-6 h-6 text-orange-600" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Todo Items & Quick Actions */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Todo Items */}
                    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                <Bell className="w-5 h-5 text-primary" />
                                待办事项
                            </h3>
                        </div>
                        <div className="space-y-3">
                            <div 
                                onClick={() => navigate('/admin/orders')}
                                className="flex items-center justify-between p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg cursor-pointer hover:bg-yellow-100 dark:hover:bg-yellow-900/30 transition-colors"
                            >
                                <div className="flex items-center gap-3">
                                    <Clock className="w-5 h-5 text-yellow-600" />
                                    <span className="text-sm text-slate-700 dark:text-slate-300">待支付订单</span>
                                </div>
                                <span className="text-lg font-bold text-yellow-600">{todos?.pendingOrders || 0}</span>
                            </div>
                            <div 
                                onClick={() => navigate('/admin/orders')}
                                className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg cursor-pointer hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors"
                            >
                                <div className="flex items-center gap-3">
                                    <Truck className="w-5 h-5 text-blue-600" />
                                    <span className="text-sm text-slate-700 dark:text-slate-300">待发货订单</span>
                                </div>
                                <span className="text-lg font-bold text-blue-600">{todos?.paidOrders || 0}</span>
                            </div>
                            <div 
                                onClick={() => navigate('/admin/books')}
                                className="flex items-center justify-between p-3 bg-red-50 dark:bg-red-900/20 rounded-lg cursor-pointer hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors"
                            >
                                <div className="flex items-center gap-3">
                                    <AlertTriangle className="w-5 h-5 text-red-600" />
                                    <span className="text-sm text-slate-700 dark:text-slate-300">库存预警商品</span>
                                </div>
                                <span className="text-lg font-bold text-red-600">{todos?.lowStockBooks || 0}</span>
                            </div>
                        </div>
                    </div>

                    {/* Quick Actions */}
                    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-4">
                            <TrendingUp className="w-5 h-5 text-primary" />
                            快捷操作
                        </h3>
                        <div className="grid grid-cols-2 gap-3">
                            <button
                                onClick={() => navigate('/admin/orders')}
                                className="flex items-center gap-2 p-4 bg-primary/10 hover:bg-primary/20 rounded-lg transition-colors"
                            >
                                <Truck className="w-5 h-5 text-primary" />
                                <span className="text-sm font-medium text-primary">批量发货</span>
                            </button>
                            <button
                                onClick={async () => {
                                    try {
                                        await exportOrders();
                                        message.success('订单导出成功');
                                    } catch {
                                        message.error('导出失败');
                                    }
                                }}
                                className="flex items-center gap-2 p-4 bg-green-100 dark:bg-green-900/30 hover:bg-green-200 dark:hover:bg-green-900/50 rounded-lg transition-colors"
                            >
                                <Download className="w-5 h-5 text-green-600" />
                                <span className="text-sm font-medium text-green-600">导出订单</span>
                            </button>
                            <button
                                onClick={async () => {
                                    try {
                                        await exportUsers();
                                        message.success('用户导出成功');
                                    } catch {
                                        message.error('导出失败');
                                    }
                                }}
                                className="flex items-center gap-2 p-4 bg-purple-100 dark:bg-purple-900/30 hover:bg-purple-200 dark:hover:bg-purple-900/50 rounded-lg transition-colors"
                            >
                                <Download className="w-5 h-5 text-purple-600" />
                                <span className="text-sm font-medium text-purple-600">导出用户</span>
                            </button>
                            <button
                                onClick={async () => {
                                    try {
                                        await exportBooks();
                                        message.success('商品导出成功');
                                    } catch {
                                        message.error('导出失败');
                                    }
                                }}
                                className="flex items-center gap-2 p-4 bg-orange-100 dark:bg-orange-900/30 hover:bg-orange-200 dark:hover:bg-orange-900/50 rounded-lg transition-colors"
                            >
                                <Download className="w-5 h-5 text-orange-600" />
                                <span className="text-sm font-medium text-orange-600">导出商品</span>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Charts Row 1 */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Sales Trend */}
                    <div className="lg:col-span-2 bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
                        {salesTrend && <SalesTrendChart dates={salesTrend.dates} sales={salesTrend.sales} />}
                    </div>

                    {/* Order Status */}
                    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
                        {orderStatus && <OrderStatusChart data={orderStatus.data} />}
                    </div>
                </div>

                {/* Charts Row 2 */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Top Products */}
                    <div className="lg:col-span-2 bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
                        {topProducts && <TopProductsChart names={topProducts.names} sales={topProducts.sales} />}
                    </div>

                    {/* Category Sales */}
                    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
                        {categorySales && <CategorySalesChart data={categorySales.data} />}
                    </div>
                </div>

                {/* User Growth Chart */}
                <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
                    {userGrowth && <UserGrowthChart dates={userGrowth.dates} counts={userGrowth.counts} />}
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
