export interface Book {
    id: number;
    title: string;
    author: string;
    price: number;
    stock: number;
    description: string;
    category: Category;
    coverImage: string;
    rating?: number;
    categoryId?: number;
    featured?: boolean;
    isbn?: string;
    publisher?: string;
    publishDate?: string;
    pages?: number;
    originalPrice?: number;
}

export interface Category {
    id: number;
    name: string;
}

export interface User {
    id: number;
    username: string;
    email: string;
    roles: string[];
    fullName?: string;
    phoneNumber?: string;
    address?: string;
    avatar?: string;
}

export interface OrderItem {
    id: number;
    quantity: number;
    price: number;
    book: Book;
}

export interface OrderUser {
    id: number;
    username: string;
    email: string;
}

export interface Order {
    id: number;
    totalPrice: number;
    status: string;
    createTime: string;
    items: OrderItem[];
    user?: OrderUser;
}

export interface Review {
    id: number;
    user: User;
    book: Book;
    rating: number;
    comment: string;
    createTime: string;
}

export interface Notification {
    id: number;
    type: string;
    message: string;
    read: boolean;
    createTime: string;
}

export interface SystemSetting {
    id: number;
    storeName: string;
    supportEmail: string;
    supportPhone: string;
    lowStockThreshold: number;
    dashboardRange: string;
}

export interface Favorite {
    id: number;
    book: Book;
    createTime: string;
}

export interface BrowsingHistory {
    id: number;
    book: Book;
    viewCount: number;
    lastViewTime: string;
    createTime: string;
}

export interface PointsHistory {
    id: number;
    points: number;
    type: string;
    description: string;
    orderId?: number;
    createTime: string;
}

export interface UserPoints {
    points: number;
    signedInToday: boolean;
}

export interface Coupon {
    id: number;
    code: string;
    name: string;
    type: 'FULL_REDUCE' | 'DISCOUNT' | 'FREE_SHIPPING';
    minAmount?: number;
    value: number;
    totalCount: number;
    usedCount: number;
    startTime: string;
    endTime: string;
    status: string;
    createTime: string;
    available: boolean;
}

export interface UserCoupon {
    id: number;
    coupon: Coupon;
    orderId?: number;
    status: 'UNUSED' | 'USED' | 'EXPIRED';
    getTime: string;
    useTime?: string;
    available: boolean;
}
