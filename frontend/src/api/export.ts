import api from './index';

// 导出订单数据
export const exportOrders = async (): Promise<void> => {
    const response = await api.get('/export/orders', { responseType: 'blob' });
    downloadFile(response.data, 'orders.csv');
};

// 导出用户数据
export const exportUsers = async (): Promise<void> => {
    const response = await api.get('/export/users', { responseType: 'blob' });
    downloadFile(response.data, 'users.csv');
};

// 导出商品数据
export const exportBooks = async (): Promise<void> => {
    const response = await api.get('/export/books', { responseType: 'blob' });
    downloadFile(response.data, 'books.csv');
};

// 下载文件工具函数
const downloadFile = (data: Blob, filename: string) => {
    const url = window.URL.createObjectURL(new Blob([data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
};
