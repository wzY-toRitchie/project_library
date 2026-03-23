import api from './index';
import type { Book } from '../types';

export interface SearchResponse {
    content: Book[];
    page: number;
    size: number;
    totalElements: number;
}

// 搜索图书
export const searchBooks = async (
    keyword: string,
    options?: {
        categoryId?: number;
        sortBy?: string;
        page?: number;
        size?: number;
    }
): Promise<SearchResponse> => {
    const params = new URLSearchParams();
    params.append('keyword', keyword);
    
    if (options?.categoryId) {
        params.append('categoryId', options.categoryId.toString());
    }
    if (options?.sortBy) {
        params.append('sortBy', options.sortBy);
    }
    if (options?.page !== undefined) {
        params.append('page', options.page.toString());
    }
    if (options?.size !== undefined) {
        params.append('size', options.size.toString());
    }
    
    const response = await api.get(`/books/search?${params.toString()}`);
    return response.data;
};

// 获取搜索建议
export const getSearchSuggestions = async (keyword: string): Promise<string[]> => {
    const response = await api.get(`/books/search/suggestions?keyword=${encodeURIComponent(keyword)}`);
    return response.data;
};

// 获取热门搜索
export const getHotSearches = async (): Promise<string[]> => {
    const response = await api.get('/books/search/hot');
    return response.data;
};
