'use client';
import {
    TrendingUp, TrendingDown, Target,
    BarChart3, Zap,
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { format, subDays } from 'date-fns';
import { StatCard } from '@/components/shared/StatCard';
import { EquityCurve } from '@/components/analytics/EquityCurve';
import { RecentTrades } from '@/components/trades/RecentTrades';
import { PageHeader } from '@/components/shared/PageHeader';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { analyticsApi } from '@/lib/api/analytics';
import { tradesApi } from '@/lib/api/trades';
import { useAccountStore } from '@/store/accountStore';
import { formatCurrency } from '@/lib/utils';
import { cn } from '@/lib/utils';

export default function DashboardPage() {
    const { selectedAccount } = useAccountStore();
    const accountId = selectedAccount?.id;

    const from = format(subDays(new Date(), 30), "yyyy-MM-dd'T'HH:mm:ssxxx");
    const to = format(new Date(), "yyyy-MM-dd'T'HH:mm:ssxxx");

    const { data: summary, isLoading: loadingSummary } = useQuery({
        queryKey: ['analytics-summary', accountId, from, to],
        queryFn: async () => {
            const res = await analyticsApi.summary({ accountId, from, to });
            return res.data.data;
        },
        retry: 2,
    });

    const { data: curve, isLoading: loadingCurve } = useQuery({
        queryKey: ['equity-curve', accountId, from, to],
        queryFn: async () => {
            const res = await analyticsApi.equityCurve({ accountId, from, to });
            return res.data.data;
        },
        retry: 2,
    });

    const { data: streak } = useQuery({
        queryKey: ['streak', accountId],
        queryFn: async () => {
            const res = await analyticsApi.streak(accountId);
            return res.data.data;
        },
        retry: 2,
    });

    const { data: recentTrades, isLoading: loadingTrades } = useQuery({
        queryKey: ['recent-trades', accountId],
        queryFn: async () => {
            const res = await tradesApi.list({
                accountId, size: 5, page: 0
            });
            return res.data.data.content;
        },
        retry: 2,
    });

    if (loadingSummary) return <LoadingSpinner />;

    const winRate = summary && summary.totalTrades > 0
        ? ((summary.winningTrades / summary.totalTrades) * 100).toFixed(1)
        : '0';

    const streakLabel = streak
        ? streak.currentStreak > 0
            ? `${streak.currentStreak} win streak 🔥`
            : streak.currentStreak < 0
                ? `${Math.abs(streak.currentStreak)} loss streak`
                : 'No streak'
        : '—';

    return (
        <div className="space-y-6">
            <PageHeader
                title="Dashboard"
                description="Your trading performance overview"
            />

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
                <StatCard
                    title="Net P&L (30d)"
                    value={formatCurrency(summary?.totalNetPnl)}
                    sub={`Gross: ${formatCurrency(summary?.totalGrossPnl)}`}
                    icon={summary?.totalNetPnl && summary.totalNetPnl >= 0
                        ? TrendingUp : TrendingDown}
                    trend={summary?.totalNetPnl && summary.totalNetPnl >= 0
                        ? 'up' : 'down'}
                />
                <StatCard
                    title="Win Rate"
                    value={`${winRate}%`}
                    sub={`${summary?.winningTrades ?? 0}W / ${summary?.losingTrades ?? 0}L`}
                    icon={Target}
                    trend={parseFloat(winRate) >= 50 ? 'up' : 'down'}
                />
                <StatCard
                    title="Profit Factor"
                    value={summary?.profitFactor?.toFixed(2) ?? '—'}
                    sub={`Avg Win: ${formatCurrency(summary?.avgWin)}`}
                    icon={BarChart3}
                    trend={summary?.profitFactor && summary.profitFactor >= 1
                        ? 'up' : 'down'}
                />
                <StatCard
                    title="Total Trades"
                    value={String(summary?.totalTrades ?? 0)}
                    sub={streakLabel}
                    icon={Zap}
                />
            </div>

            {/* Equity Curve */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
                <div className="xl:col-span-2">
                    {loadingCurve
                        ? <LoadingSpinner />
                        : <EquityCurve data={curve ?? []} />}
                </div>

                {/* Quick Stats */}
                <div className="space-y-4">
                    {[
                        {
                            label: 'Avg Win',
                            value: formatCurrency(summary?.avgWin),
                            color: 'text-emerald-500',
                        },
                        {
                            label: 'Avg Loss',
                            value: formatCurrency(summary?.avgLoss),
                            color: 'text-red-500',
                        },
                        {
                            label: 'Avg Risk:Reward',
                            value: summary?.avgRiskReward?.toFixed(2) ?? '—',
                            color: 'text-blue-500',
                        },
                        {
                            label: 'Best Streak',
                            value: `${streak?.maxWinStreak ?? 0} wins`,
                            color: 'text-yellow-500',
                        },
                    ].map(({ label, value, color }) => (
                        <div key={label}
                             className="p-4 rounded-xl bg-card border border-border
                flex justify-between items-center">
              <span className="text-sm text-muted-foreground">
                {label}
              </span>
                            <span className={cn('font-semibold', color)}>
                {value}
              </span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Recent Trades */}
            <RecentTrades
                trades={recentTrades ?? []}
                loading={loadingTrades}
            />
        </div>
    );
}