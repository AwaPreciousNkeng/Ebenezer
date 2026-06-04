import { apiClient } from './client';
import type {
    AuthResponse, ApiResponse, RegisterRequest,
    LoginRequest, UserDto
} from '@/types';

export const authApi = {
    register: (data: RegisterRequest) =>
        apiClient.post<ApiResponse<{ message: string }>>('/auth/register', data),

    login: (data: LoginRequest) =>
        apiClient.post<AuthResponse>('/auth/authenticate', data),

    logout: () =>
        apiClient.post<ApiResponse<{ message: string }>>('/auth/logout'),

    refresh: (refreshToken: string) =>
        apiClient.post<ApiResponse<AuthResponse>>('/auth/refresh-token', { refreshToken }),

    verifyEmail: (token: string) =>
        apiClient.get<ApiResponse<{ message: string }>>(
            `/auth/verify-email?token=${token}`),

    forgotPassword: (email: string) =>
        apiClient.post<ApiResponse<{ message: string }>>(
            '/auth/forgot-password', { email }),

    resetPassword: (token: string, newPassword: string) =>
        apiClient.post<ApiResponse<{ message: string }>>(
            '/auth/reset-password', { token, newPassword }),

    getMe: () =>
        apiClient.get<ApiResponse<UserDto>>('/users/me'),

    updateProfile: (data: { fullName?: string; timezone?: string }) =>
        apiClient.put<ApiResponse<UserDto>>('/users/me', data),

    changePassword: (data: {
        currentPassword: string; newPassword: string
    }) =>
        apiClient.put<ApiResponse<{ message: string }>>(
            '/users/me/password', data),

    uploadAvatar: (file: File) => {
        const form = new FormData();
        form.append('file', file);
        return apiClient.post<ApiResponse<UserDto>>(
            '/users/me/avatar', form,
            { headers: { 'Content-Type': 'multipart/form-data' } }
        );
    },
};