import { apiClient } from './client';
import type {
    ApiResponse, AccountResponse, AccountRequest
} from '@/types';

export const accountsApi = {
    list: () =>
        apiClient.get<ApiResponse<AccountResponse[]>>('/accounts'),

    create: (data: AccountRequest) =>
        apiClient.post<ApiResponse<AccountResponse>>('/accounts', data),

    update: (id: string, data: Partial<AccountRequest>) =>
        apiClient.put<ApiResponse<AccountResponse>>(`/accounts/${id}`, data),

    delete: (id: string) =>
        apiClient.delete<ApiResponse<{ message: string }>>(
            `/accounts/${id}`),
};