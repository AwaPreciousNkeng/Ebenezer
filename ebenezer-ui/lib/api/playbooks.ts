import { apiClient } from './client';
import type {
    ApiResponse, PlaybookResponse, PlaybookRequest, PlaybookStats
} from '@/types';

export const playbooksApi = {
    list: () =>
        apiClient.get<ApiResponse<PlaybookResponse[]>>('/playbooks'),

    get: (id: string) =>
        apiClient.get<ApiResponse<PlaybookResponse>>(`/playbooks/${id}`),

    stats: () =>
        apiClient.get<ApiResponse<PlaybookStats[]>>('/playbooks/stats'),

    create: (data: PlaybookRequest) =>
        apiClient.post<ApiResponse<PlaybookResponse>>('/playbooks', data),

    update: (id: string, data: Partial<PlaybookRequest>) =>
        apiClient.put<ApiResponse<PlaybookResponse>>(
            `/playbooks/${id}`, data),

    delete: (id: string) =>
        apiClient.delete<ApiResponse<{ message: string }>>(
            `/playbooks/${id}`),
};