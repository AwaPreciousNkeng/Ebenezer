'use client';
import { useState } from 'react';
import { format, subDays, subMonths } from 'date-fns';
import { useQuery } from '@tanstack/react-query';
import { TrendingUp, TrendingDown, BarChart3,
    Target, Zap, Shield } from 'lucide-react';
import { PageHeader } from '@/components/shared/PageHeader';
import { StatCard } from '@/components/shared/StatCard';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { EquityCurve } from '@/components/analytics/EquityCurve';
import { PnlBySymbol } from '@/components/analytics/PnlBySymbol';
import { PnlByDay } from '@/components/analytics/PnlByDay';
import { analyticsApi } from '@/lib/api/analytics';
import { useAccountStore } from '@/store/accountStore';
import { formatCurrency, cn } from '@/lib/utils';

const RANGES = [
    { label: '7D',  days: 7 },
    { label: '30D', days: 30 },
    { label: '3M',  days: 90 },
    { label: '1Y',  days: 365 },
];

export default function AnalyticsPage() {
    const { selectedAccount } = useAccountStore();
    const accountId = selectedAccount?.id;
    const [range, setRange] = useState(30);

    const from = format(
        subDays(new Date(), range), "yyyy-MM-dd'T'HH:mm:ssxxx"
    );
    const to = format(new Date(), "yyyy-MM-dd'T'HH:mm:ssxxx");

    const { data: summary, isLoading } = useQuery({
        queryKey: ['analytics-summary', accountId, from, to],
        queryFn: async () =>
            (await analyticsApi.summary({ accountId, from, to })).data.data,
    });

    const { data: curve } = useQuery({
        queryKey: ['equity-curve', accountId, from, to],
        queryFn: async () =>
            (await analyticsApi.equityCurve({ accountId, from, to })).data.data,
    });

    const { data: bySymbol } = useQuery({
        queryKey: ['pnl-symbol', accountId],
        queryFn: async () =>
            (await analyticsApi.pnlBySymbol(accountId)).data.data,
    });

    const { data: byDay } = useQuery({
        queryKey: ['pnl-day', accountId],
        queryFn: async () =>
            (await analyticsApi.pnlByDay(accountId)).data.data,
    });

    const { data: drawdown } = useQuery({
        queryKey: ['drawdown', accountId],
        queryFn: async () =>
            (await analyticsApi.drawdown(accountId)).data.data,
    });

    const { data: streak } = useQuery({
        queryKey: ['streak', accountId],
        queryFn: async () =>
            (await analyticsApi.streak(accountId)).data.data,
    });

    if (isLoading) return <LoadingSpinner />;

    const winRate = summary && summary.totalTrades > 0
        ? ((summary.winningTrades / summary.totalTrades) * 100).toFixed(1)
        : '0';

    return (
        <div className="space-y-6">
            <PageHeader
                title="Analytics"
                description="Deep dive into your trading performance"
                action={
                    <div className="flex gap-1 p-1 bg-muted rounded-lg">
                        {RANGES.map(({ label, days }) => (
                            <button
                                key={label}
                                onClick={() => setRange(days)}
                                className={cn(
                                    'px-3 py-1.5 rounded-md text-sm font-medium transition-all',
                                    range === days
                                        ? 'bg-background shadow-sm text-foreground'
                                        : 'text-muted-foreground hover:text-foreground'
                                )}
                            >
                                {label}
                            </button>
                        ))}
                    </div>
                }
            />

            {/* Stats */}
            <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
                <StatCard
                    title="Net P&L"
                    value={formatCurrency(summary?.totalNetPnl)}
                    icon={summary?.totalNetPnl && summary.totalNetPnl >= 0
                        ? TrendingUp : TrendingDown}
                    trend={summary?.totalNetPnl && summary.totalNetPnl >= 0
                        ? 'up' : 'down'}
                />
                <StatCard
                    title="Win Rate"
                    value={`${winRate}%`}
                    sub={`${summary?.winningTrades}W / ${summary?.losingTrades}L`}
                    icon={Target}
                    trend={parseFloat(winRate) >= 50 ? 'up' : 'down'}
                />
                <StatCard
                    title="Profit Factor"
                    value={summary?.profitFactor?.toFixed(2) ?? '—'}
                    icon={BarChart3}
                    trend={summary?.profitFactor && summary.profitFactor >= 1
                        ? 'up' : 'down'}
                />
                <StatCard
                    title="Max Drawdown"
                    value={formatCurrency(drawdown?.maxDrawdown)}
                    icon={Shield}
                    trend="down"
                />
            </div>

            <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
                <StatCard
                    title="Avg Win"
                    value={formatCurrency(summary?.avgWin)}
                    icon={TrendingUp}
                    trend="up"
                />
                <StatCard
                    title="Avg Loss"
                    value={formatCurrency(summary?.avgLoss)}
                    icon={TrendingDown}
                    trend="down"
                />
                <StatCard
                    title="Avg R:R"
                    value={summary?.avgRiskReward?.toFixed(2) ?? '—'}
                    icon={Target}
                />
                <StatCard
                    title="Current Streak"
                    value={streak
                        ? streak.currentStreak > 0
                            ? `+${streak.currentStreak} 🔥`
                            : `${streak.currentStreak}`
                        : '—'}
                    sub={`Best: ${streak?.maxWinStreak ?? 0} wins`}
                    icon={Zap}
                    trend={streak?.currentStreak && streak.currentStreak > 0
                        ? 'up' : undefined}
                />
            </div>

            {/* Charts */}
            <EquityCurve data={curve ?? []} />

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                <PnlBySymbol data={bySymbol ?? []} />
                <PnlByDay data={byDay ?? []} />
            </div>
        </div>
    );
}