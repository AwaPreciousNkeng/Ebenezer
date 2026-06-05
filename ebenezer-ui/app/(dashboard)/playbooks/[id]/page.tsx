'use client';
import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
    ArrowLeft, Pencil, Target, Activity, Scale,
    ShieldCheck, ShieldAlert, Hash, Percent, Clock,
    ListChecks, Layers, TrendingUp,
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { PageHeader } from '@/components/shared/PageHeader';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { RecentTrades } from '@/components/trades/RecentTrades';
import { PlaybookFormDialog } from '@/components/playbooks/PlaybookFormDialog';
import { playbooksApi } from '@/lib/api/playbooks';
import { tradesApi } from '@/lib/api/trades';
import { cn, formatCurrency } from '@/lib/utils';
import { parseRules, rulesCount } from '@/lib/playbook-rules';

export default function PlaybookDetailPage() {
    const { id } = useParams<{ id: string }>();
    const router = useRouter();
    const [editOpen, setEditOpen] = useState(false);

    const { data: playbook, isLoading } = useQuery({
        queryKey: ['playbook', id],
        queryFn: async () => (await playbooksApi.get(id)).data.data,
    });

    const { data: stats } = useQuery({
        queryKey: ['playbook-stats'],
        queryFn: async () => (await playbooksApi.stats()).data.data,
    });

    const { data: trades, isLoading: loadingTrades } = useQuery({
        queryKey: ['trades-by-playbook', id],
        queryFn: async () => {
            const res = await tradesApi.list({ playbookId: id, size: 10, page: 0 });
            return res.data.data.content;
        },
    });

    if (isLoading) return <LoadingSpinner />;
    if (!playbook) return <p className="text-muted-foreground">Playbook not found.</p>;

    const stat = stats?.find((s) => s.playbookId === id);
    const trades_ = stat?.totalTrades ?? 0;
    const wins = stat?.winningTrades ?? 0;
    const losses = Math.max(trades_ - wins, 0);
    const pnl = stat?.totalPnl ?? 0;
    const winRate = trades_ > 0 ? (wins / trades_) * 100 : 0;
    const expectancy = trades_ > 0 ? pnl / trades_ : 0;
    const violations = stat?.ruleViolations ?? 0;
    const compliance = trades_ > 0 ? ((trades_ - violations) / trades_) * 100 : 100;

    const rules = parseRules(playbook.rules);
    const hasRules = rulesCount(rules) > 0;

    const sentiment = trades_ === 0 ? 'neutral' : pnl >= 0 ? 'win' : 'loss';
    const heroAccent = {
        win: 'from-emerald-500/10', loss: 'from-red-500/10', neutral: 'from-primary/5',
    }[sentiment];
    const pnlColor =
        trades_ === 0 ? 'text-muted-foreground' : pnl >= 0 ? 'text-emerald-500' : 'text-red-500';

    return (
        <div className="mx-auto max-w-5xl space-y-6">
            <PageHeader
                title={playbook.name}
                description={playbook.description ?? 'Trading strategy'}
                action={
                    <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={() => setEditOpen(true)}>
                            <Pencil className="mr-1.5 h-4 w-4" />
                            Edit
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => router.back()}>
                            <ArrowLeft className="mr-1.5 h-4 w-4" />
                            Back
                        </Button>
                    </div>
                }
            />

            {/* Hero performance band */}
            <div className={cn(
                'relative overflow-hidden rounded-2xl border border-border bg-card p-6',
            )}>
                <div className={cn(
                    'pointer-events-none absolute -right-20 -top-20 h-56 w-56 rounded-full',
                    'bg-gradient-to-br to-transparent blur-3xl', heroAccent,
                )} />
                <div className="relative flex flex-wrap items-end justify-between gap-6">
                    <div>
                        <p className="text-[11px] font-medium uppercase tracking-widest text-muted-foreground">
                            Net P&L · {trades_} trade{trades_ !== 1 ? 's' : ''}
                        </p>
                        <p className={cn('mt-1 text-4xl font-bold tabular-nums', pnlColor)}>
                            {trades_ > 0 ? formatCurrency(pnl) : '—'}
                        </p>
                        {trades_ > 0 && (
                            <p className="mt-1 text-sm text-muted-foreground">
                                Expectancy{' '}
                                <span className={cn('font-semibold',
                                    expectancy >= 0 ? 'text-emerald-500' : 'text-red-500')}>
                                    {expectancy >= 0 ? '+' : ''}{formatCurrency(expectancy)}
                                </span>{' '}
                                per trade
                            </p>
                        )}
                    </div>

                    {/* Win-rate ring */}
                    <div className="flex items-center gap-5">
                        <WinRateRing winRate={winRate} hasTrades={trades_ > 0} />
                        <div className="space-y-1.5 text-sm">
                            <div className="flex items-center gap-2">
                                <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
                                <span className="text-muted-foreground">Wins</span>
                                <span className="ml-auto font-semibold tabular-nums">{wins}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="h-2.5 w-2.5 rounded-full bg-red-500" />
                                <span className="text-muted-foreground">Losses</span>
                                <span className="ml-auto font-semibold tabular-nums">{losses}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Metric tiles */}
            <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
                <Metric icon={Target} label="Win Rate"
                    value={trades_ > 0 ? `${winRate.toFixed(1)}%` : '—'} />
                <Metric icon={Scale} label="Avg R:R"
                    value={stat?.avgRiskReward ? stat.avgRiskReward.toFixed(2) : '—'} />
                <Metric icon={Activity} label="Expectancy"
                    value={trades_ > 0 ? formatCurrency(expectancy) : '—'}
                    valueClass={trades_ > 0
                        ? expectancy >= 0 ? 'text-emerald-500' : 'text-red-500' : ''} />
                <Metric
                    icon={violations > 0 ? ShieldAlert : ShieldCheck}
                    label="Discipline"
                    value={trades_ > 0 ? `${compliance.toFixed(0)}%` : '—'}
                    sub={violations > 0 ? `${violations} violation${violations > 1 ? 's' : ''}` : 'Clean'}
                    valueClass={
                        trades_ === 0 ? '' :
                        compliance >= 90 ? 'text-emerald-500' :
                        compliance >= 70 ? 'text-yellow-500' : 'text-red-500'
                    }
                />
            </div>

            {/* Rules + Trades */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
                {/* Rule book */}
                <div className="lg:col-span-2">
                    <div className="rounded-2xl border border-border bg-card p-5">
                        <div className="mb-4 flex items-center gap-2">
                            <ListChecks className="h-4 w-4 text-primary" />
                            <h3 className="text-sm font-semibold uppercase tracking-wide">
                                Rule Book
                            </h3>
                        </div>

                        {!hasRules ? (
                            <div className="rounded-lg border border-dashed border-border py-8 text-center">
                                <p className="text-sm text-muted-foreground">No rules defined yet</p>
                                <Button variant="ghost" size="sm" className="mt-2"
                                    onClick={() => setEditOpen(true)}>
                                    Add rules
                                </Button>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {/* Guardrails */}
                                <div className="grid grid-cols-3 gap-2">
                                    {rules.maxRiskPercent != null && (
                                        <Guardrail icon={Percent} label="Max Risk"
                                            value={`${rules.maxRiskPercent}%`} />
                                    )}
                                    {rules.minRiskReward != null && (
                                        <Guardrail icon={Scale} label="Min R:R"
                                            value={rules.minRiskReward.toFixed(1)} />
                                    )}
                                    {rules.maxDailyTrades != null && (
                                        <Guardrail icon={Hash} label="Max/Day"
                                            value={String(rules.maxDailyTrades)} />
                                    )}
                                </div>

                                {/* Sessions */}
                                {rules.sessions && rules.sessions.length > 0 && (
                                    <div>
                                        <p className="mb-1.5 flex items-center gap-1.5 text-xs text-muted-foreground">
                                            <Clock size={12} /> Sessions
                                        </p>
                                        <div className="flex flex-wrap gap-1.5">
                                            {rules.sessions.map((s) => (
                                                <span key={s}
                                                    className="rounded-full border border-primary/30 bg-primary/10
                            px-2.5 py-0.5 text-xs font-medium text-primary">
                                                    {s}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Entry criteria */}
                                {rules.entryCriteria && rules.entryCriteria.length > 0 && (
                                    <div>
                                        <p className="mb-2 text-xs text-muted-foreground">Entry Criteria</p>
                                        <div className="space-y-1.5">
                                            {rules.entryCriteria.map((c, i) => (
                                                <div key={i}
                                                    className="flex items-start gap-2.5 rounded-lg bg-muted/40 px-3 py-2 text-sm">
                                                    <span className="flex h-5 w-5 shrink-0 items-center justify-center
                            rounded-md bg-primary/15 text-xs font-bold text-primary">
                                                        {i + 1}
                                                    </span>
                                                    <span className="leading-5">{c}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                {/* Trades */}
                <div className="lg:col-span-3">
                    <div className="mb-3 flex items-center gap-2">
                        <Layers className="h-4 w-4 text-primary" />
                        <h3 className="text-sm font-semibold uppercase tracking-wide">
                            Recent Trades
                        </h3>
                    </div>
                    <RecentTrades trades={trades ?? []} loading={loadingTrades} />
                </div>
            </div>

            <PlaybookFormDialog open={editOpen} onOpenChange={setEditOpen} editing={playbook} />
        </div>
    );
}

function WinRateRing({ winRate, hasTrades }: { winRate: number; hasTrades: boolean }) {
    const r = 30;
    const circ = 2 * Math.PI * r;
    const offset = circ - (winRate / 100) * circ;
    return (
        <div className="relative h-20 w-20">
            <svg className="h-20 w-20 -rotate-90" viewBox="0 0 72 72">
                <circle cx="36" cy="36" r={r} fill="none" strokeWidth="6"
                    className="stroke-muted" />
                {hasTrades && (
                    <circle cx="36" cy="36" r={r} fill="none" strokeWidth="6"
                        strokeLinecap="round"
                        className={cn(winRate >= 50 ? 'stroke-emerald-500' : 'stroke-red-500')}
                        strokeDasharray={circ}
                        strokeDashoffset={offset}
                        style={{ transition: 'stroke-dashoffset 0.6s ease' }} />
                )}
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-lg font-bold tabular-nums">
                    {hasTrades ? `${winRate.toFixed(0)}%` : '—'}
                </span>
                <span className="text-[9px] uppercase tracking-wider text-muted-foreground">win</span>
            </div>
        </div>
    );
}

function Metric({
    icon: Icon, label, value, sub, valueClass,
}: {
    icon: React.ElementType;
    label: string;
    value: string;
    sub?: string;
    valueClass?: string;
}) {
    return (
        <Card>
            <CardContent className="p-4">
                <div className="flex items-center gap-1.5 text-muted-foreground">
                    <Icon size={13} />
                    <span className="text-[10px] font-medium uppercase tracking-wider">{label}</span>
                </div>
                <p className={cn('mt-1.5 text-xl font-bold tabular-nums', valueClass)}>{value}</p>
                {sub && <p className="text-[11px] text-muted-foreground">{sub}</p>}
            </CardContent>
        </Card>
    );
}

function Guardrail({
    icon: Icon, label, value,
}: { icon: React.ElementType; label: string; value: string }) {
    return (
        <div className="rounded-lg border border-border bg-muted/30 p-2.5 text-center">
            <Icon className="mx-auto h-3.5 w-3.5 text-muted-foreground" />
            <p className="mt-1 text-sm font-bold tabular-nums">{value}</p>
            <p className="text-[9px] uppercase tracking-wide text-muted-foreground">{label}</p>
        </div>
    );
}
