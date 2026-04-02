import api from './index';

export interface AiRecommendation {
    bookId: number;
    title: string;
    author: string;
    reason: string;
    matchScore: number;
    coverImage: string;
    price: number;
}

export interface AiRecommendResponse {
    reply: string;
    summary: string;
    recommendations: AiRecommendation[];
}

export async function getAiRecommendations(message: string): Promise<AiRecommendResponse> {
    const response = await api.post<AiRecommendResponse>('/ai/recommend', { message });
    return response.data;
}
