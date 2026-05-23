'use client';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, TrendingUp, Target, BarChart3 } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import {
    Card, CardContent, CardHeader, CardTitle,
} from '@/components/ui/card';
import { PageHeader } from '@/components/shared/PageHeader';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { RecentTrades } from '@/components/trades/RecentTrades';
import { playbooksApi } from '@/lib/api/playbooks';
import { tradesApi } from '@/lib/api/trades';
import { formatCurrency } from '@/lib/utils';

export default function PlaybookDetailPage() {
    const { id } = useParams<{ id: string }>();
    const router = useRouter();

    const { data: playbook, isLoading } = useQuery({
        queryKey: ['playbook', id],
        queryFn: async () =>
            (await playbooksApi.get(id)).data.data,
    });

    const { data: stats } = useQuery({
        queryKey: ['playbook-stats'],
        queryFn: async () =>
            (await playbooksApi.stats()).data.data,
    });

    const { data: trades, isLoading: loadingTrades } = useQuery({
        queryKey: ['trades-by-playbook', id],
        queryFn: async () => {
            const res = await tradesApi.list({
                playbookId: id, size: 10, page: 0,
            });
            return res.data.data.content;
        },
    });

    if (isLoading) return <LoadingSpinner />;
    if (!playbook) return (
        <p className="text-muted-foreground">Playbook not found.</p>
    );

    const stat = stats?.find((s) => s.playbookId === id);
    const winRate = stat && stat.totalTrades > 0
        ? ((stat.winningTrades / stat.totalTrades) * 100).toFixed(1)
        : null;

    let rules: Record<string, unknown> | null = null;
    try {
        if (playbook.rules) rules = JSON.parse(playbook.rules);
    } catch {}

    return (
        <div className="max-w-4xl space-y-6">
            <PageHeader
                title={playbook.name}
                description={playbook.description ?? 'Trading strategy'}
                action={
                    <Button variant="outline" onClick={() => router.back()}>
                        <ArrowLeft className="mr-1.5 h-4 w-4" />
                        Back
                    </Button>
                }
            />

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4">
                <Card>
                    <CardContent className="p-5 flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-primary/10
              flex items-center justify-center">
                            <TrendingUp className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                            <p className="text-xs text-muted-foreground">
                                Total Trades
                            </p>
                            <p className="text-xl font-bold">
                                {stat?.totalTrades ?? 0}
                            </p>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-5 flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-emerald-500/10
              flex items-center justify-center">
                            <Target className="w-5 h-5 text-emerald-500" />
                        </div>
                        <div>
                            <p className="text-xs text-muted-foreground">Win Rate</p>
                            <p className="text-xl font-bold">
                                {winRate ? `${winRate}%` : '—'}
                            </p>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-5 flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-blue-500/10
              flex items-center justify-center">
                            <BarChart3 className="w-5 h-5 text-blue-500" />
                        </div>
                        <div>
                            <p className="text-xs text-muted-foreground">Net P&L</p>
                            <p className={`text-xl font-bold ${
                                stat?.totalPnl && stat.totalPnl >= 0
                                    ? 'text-emerald-500' : 'text-red-500'
                            }`}>
                                {stat?.totalPnl
                                    ? formatCurrency(stat.totalPnl) : '—'}
                            </p>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Rules */}
            {rules && (
                <Card>
                    <CardHeader>
                        <CardTitle className="text-sm text-muted-foreground
              uppercase tracking-wide">
                            Strategy Rules
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            {Object.entries(rules).map(([key, value]) => (
                                <div key={key}
                                     className="flex justify-between items-start">
                  <span className="text-sm text-muted-foreground
                    capitalize">
                    {key.replace(/_/g, ' ')}
                  </span>
                                    <span className="text-sm font-medium text-right
                    max-w-[60%]">
                    {Array.isArray(value)
                        ? (value as string[]).join(', ')
                        : String(value)}
                  </span>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Trades */}
            <RecentTrades
                trades={trades ?? []}
                loading={loadingTrades}
            />
        </div>
    );
}