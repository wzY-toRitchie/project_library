export interface Book {
    id: number;
    title: string;
    author: string;
    price: number;
    stock: number;
    description: string;
    category: Category;
    coverImage: string;
}

export interface Category {
    id: number;
    name: string;
}
