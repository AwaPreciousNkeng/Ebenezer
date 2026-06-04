import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { UserDto } from '@/types';

interface AuthState {
    user: UserDto | null;
    accessToken: string | null;
    refreshToken: string | null;
    isAuthenticated: boolean;
    setAuth: (user: UserDto, accessToken: string, refreshToken: string) => void;
    setUser: (user: UserDto) => void;
    setTokens: (accessToken: string, refreshToken?: string) => void;
    clearAuth: () => void;
}

export const useAuthStore = create<AuthState>()(
    persist(
        (set) => ({
            user: null,
            accessToken: null,
            refreshToken: null,
            isAuthenticated: false,

            setAuth: (user, accessToken, refreshToken) => {
                set({ user, accessToken, refreshToken, isAuthenticated: true });
            },

            setUser: (user) => set({ user }),

            setTokens: (accessToken, refreshToken) => {
                set((state) => ({
                    accessToken,
                    refreshToken: refreshToken ?? state.refreshToken,
                }));
            },

            clearAuth: () => {
                set({
                    user: null,
                    accessToken: null,
                    refreshToken: null,
                    isAuthenticated: false,
                });
            },
        }),
        {
            name: 'ebenezer-auth',
            partialize: (s) => ({
                user: s.user,
                accessToken: s.accessToken,
                refreshToken: s.refreshToken,
                isAuthenticated: s.isAuthenticated,
            }),
        }
    )
);