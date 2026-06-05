import { apiClient } from './client';
import type { ImportBatch } from '@/types';

export const importApi = {
    statement: (file: File, accountId: string) => {
        const form = new FormData();
        form.append('file', file);
        form.append('accountId', accountId);
        return apiClient.post<ImportBatch>(
            '/import/statement', form,
            { headers: { 'Content-Type': 'multipart/form-data' } }
        );
    },
};
