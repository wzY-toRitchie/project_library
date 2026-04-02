import api from './index';
import type { Book, Category } from '../types';

export interface HomePageData {
    bestsellers: Book[];
    newArrivals: Book[];
    topRated: Book[];
    featured: Book[];
    categories: Category[];
}

export async function getBestsellers(size: number = 10): Promise<Book[]> {
    const response = await api.get<Book[]>(`/home/bestsellers?size=${size}`);
    return response.data;
}

export async function getNewArrivals(size: number = 8): Promise<Book[]> {
    const response = await api.get<Book[]>(`/home/new-arrivals?size=${size}`);
    return response.data;
}

export async function getTopRated(size: number = 8): Promise<Book[]> {
    const response = await api.get<Book[]>(`/home/top-rated?size=${size}`);
    return response.data;
}

export async function getFeatured(size: number = 8): Promise<Book[]> {
    const response = await api.get<Book[]>(`/home/featured?size=${size}`);
    return response.data;
}

export async function getHomePageData(): Promise<HomePageData> {
    const response = await api.get<HomePageData>('/home/all');
    return response.data;
}
