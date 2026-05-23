import { apiClient } from './client';
import type {
    ApiResponse, PageResponse, TradeResponse,
    TradeRequest, TradeFilterParams, TradeScreenshotResponse
} from '@/types';

export const tradesApi = {
    list: (params: TradeFilterParams) =>
        apiClient.get<ApiResponse<PageResponse<TradeResponse>>>(
            '/trades', { params }),

    get: (id: string) =>
        apiClient.get<ApiResponse<TradeResponse>>(`/trades/${id}`),

    create: (data: TradeRequest) =>
        apiClient.post<ApiResponse<TradeResponse>>('/trades', data),

    update: (id: string, data: Partial<TradeRequest>) =>
        apiClient.put<ApiResponse<TradeResponse>>(`/trades/${id}`, data),

    delete: (id: string) =>
        apiClient.delete<ApiResponse<{ message: string }>>(`/trades/${id}`),

    uploadScreenshot: (tradeId: string, file: File, label?: string) => {
        const form = new FormData();
        form.append('file', file);
        if (label) form.append('label', label);
        return apiClient.post<ApiResponse<TradeScreenshotResponse>>(
            `/trades/${tradeId}/screenshots`, form,
            { headers: { 'Content-Type': 'multipart/form-data' } }
        );
    },

    deleteScreenshot: (tradeId: string, screenshotId: string) =>
        apiClient.delete<ApiResponse<{ message: string }>>(
            `/trades/${tradeId}/screenshots/${screenshotId}`),
};