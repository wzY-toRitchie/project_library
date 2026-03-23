import api from './index';

export interface DashboardSummary {
    totalSales: number;
    totalOrders: number;
    totalUsers: number;
    totalBooks: number;
    todayOrders: number;
    todaySales: number;
}

export interface SalesTrend {
    dates: string[];
    sales: number[];
}

export interface OrderStatus {
    data: { name: string; value: number }[];
}

export interface TopProducts {
    names: string[];
    sales: number[];
}

export interface CategorySales {
    data: { name: string; value: number }[];
}

export interface UserGrowth {
    dates: string[];
    counts: number[];
}

export interface TodoItems {
    pendingOrders: number;
    paidOrders: number;
    shippedOrders: number;
    lowStockBooks: number;
}

// 获取核心指标汇总
export const getDashboardSummary = async (): Promise<DashboardSummary> => {
    const response = await api.get('/dashboard/summary');
    return response.data;
};

// 获取销售趋势数据
export const getSalesTrend = async (days: number = 30): Promise<SalesTrend> => {
    const response = await api.get('/dashboard/sales-trend', { params: { days } });
    return response.data;
};

// 获取订单状态分布
export const getOrderStatusDistribution = async (): Promise<OrderStatus> => {
    const response = await api.get('/dashboard/order-status');
    return response.data;
};

// 获取热销商品排行
export const getTopProducts = async (limit: number = 10): Promise<TopProducts> => {
    const response = await api.get('/dashboard/top-products', { params: { limit } });
    return response.data;
};

// 获取分类销售数据
export const getCategorySales = async (): Promise<CategorySales> => {
    const response = await api.get('/dashboard/category-sales');
    return response.data;
};

// 获取用户增长趋势
export const getUserGrowth = async (days: number = 30): Promise<UserGrowth> => {
    const response = await api.get('/dashboard/user-growth', { params: { days } });
    return response.data;
};

// 获取待办事项统计
export const getTodoItems = async (): Promise<TodoItems> => {
    const response = await api.get('/dashboard/todos');
    return response.data;
};
