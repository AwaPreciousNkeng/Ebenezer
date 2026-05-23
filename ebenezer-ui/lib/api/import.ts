import { apiClient } from './client';
import type { ApiResponse, ImportResult } from '@/types';

export const importApi = {
    csv: (file: File, accountId: string, brokerName: string) => {
        const form = new FormData();
        form.append('file', file);
        form.append('accountId', accountId);
        form.append('brokerName', brokerName);
        return apiClient.post<ApiResponse<ImportResult>>(
            '/import/csv', form,
            { headers: { 'Content-Type': 'multipart/form-data' } }
        );
    },
};