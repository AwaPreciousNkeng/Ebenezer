import { apiClient } from './client';
import type {
    ApiResponse, TradeSummary, EquityCurvePoint,
    SymbolPnl, DayOfWeekPnl, DrawdownResponse,
    StreakResponse, AnalyticsFilterParams
} from '@/types';

export const analyticsApi = {
    summary: (params: AnalyticsFilterParams) =>
        apiClient.get<ApiResponse<TradeSummary>>(
            '/analytics/summary', { params }),

    equityCurve: (params: AnalyticsFilterParams) =>
        apiClient.get<ApiResponse<EquityCurvePoint[]>>(
            '/analytics/equity-curve', { params }),

    pnlBySymbol: (accountId?: string) =>
        apiClient.get<ApiResponse<SymbolPnl[]>>(
            '/analytics/pnl-by-symbol', { params: { accountId } }),

    pnlByDay: (accountId?: string) =>
        apiClient.get<ApiResponse<DayOfWeekPnl[]>>(
            '/analytics/pnl-by-day', { params: { accountId } }),

    drawdown: (accountId?: string) =>
        apiClient.get<ApiResponse<DrawdownResponse>>(
            '/analytics/drawdown', { params: { accountId } }),

    streak: (accountId?: string) =>
        apiClient.get<ApiResponse<StreakResponse>>(
            '/analytics/streak', { params: { accountId } }),
};