import { apiClient } from './client';
import type {
    ApiResponse, PageResponse, JournalResponse,
    JournalRequest, EmotionTrend
} from '@/types';

export const journalApi = {
    list: (page = 0, size = 10) =>
        apiClient.get<ApiResponse<PageResponse<JournalResponse>>>(
            '/journal', { params: { page, size } }),

    getByDate: (date: string) =>
        apiClient.get<ApiResponse<JournalResponse>>(`/journal/${date}`),

    search: (keyword: string, page = 0) =>
        apiClient.get<ApiResponse<PageResponse<JournalResponse>>>(
            '/journal/search', { params: { keyword, page } }),

    emotionTrend: (days = 30) =>
        apiClient.get<ApiResponse<EmotionTrend[]>>(
            '/journal/emotion-trend', { params: { days } }),

    save: (data: JournalRequest) =>
        apiClient.post<ApiResponse<JournalResponse>>('/journal', data),

    delete: (date: string) =>
        apiClient.delete<ApiResponse<{ message: string }>>(
            `/journal/${date}`),
};