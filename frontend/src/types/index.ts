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
}

export interface OrderItem {
    id: number;
    quantity: number;
    price: number;
    book: Book;
}

export interface Order {
    id: number;
    totalPrice: number;
    status: string;
    createTime: string;
    items: OrderItem[];
}

export interface Review {
    id: number;
    user: User;
    book: Book;
    rating: number;
    comment: string;
    createTime: string;
}
