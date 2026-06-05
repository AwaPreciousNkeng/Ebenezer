'use client';
import { useRouter } from 'next/navigation';
import {
    Pencil, Trash2, ShieldCheck, ShieldAlert,
    Scale, Activity, ArrowUpRight, ListChecks,
} from 'lucide-react';
import { cn, formatCurrency } from '@/lib/utils';
import { parseRules, rulesCount } from '@/lib/playbook-rules';
import type { PlaybookResponse, PlaybookStats } from '@/types';

interface PlaybookCardProps {
    playbook: PlaybookResponse;
    stats?: PlaybookStats;
    onEdit: (p: PlaybookResponse) => void;
    onDelete: (id: string) => void;
}

export function PlaybookCard({ playbook, stats, onEdit, onDelete }: PlaybookCardProps) {
    const router = useRouter();

    const trades = stats?.totalTrades ?? 0;
    const wins = stats?.winningTrades ?? 0;
    const losses = Math.max(trades - wins, 0);
    const pnl = stats?.totalPnl ?? 0;
    const winRate = trades > 0 ? (wins / trades) * 100 : 0;
    const expectancy = trades > 0 ? pnl / trades : 0;
    const violations = stats?.ruleViolations ?? 0;
    const compliance = trades > 0 ? ((trades - violations) / trades) * 100 : 100;
    const ruleN = rulesCount(parseRules(playbook.rules));

    // Sentiment drives the accent color
    const sentiment = trades === 0 ? 'neutral' : pnl >= 0 ? 'win' : 'loss';
    const accent = {
        win:     { edge: 'before:bg-emerald-500', glow: 'from-emerald-500/[0.07]', text: 'text-emerald-500' },
        loss:    { edge: 'before:bg-red-500',     glow: 'from-red-500/[0.07]',     text: 'text-red-500' },
        neutral: { edge: 'before:bg-border',      glow: 'from-primary/[0.04]',     text: 'text-muted-foreground' },
    }[sentiment];

    return (
        <div
            onClick={() => router.push(`/playbooks/${playbook.id}`)}
            className={cn(
                'group relative cursor-pointer overflow-hidden rounded-2xl border border-border',
                'bg-card transition-all duration-300',
                'hover:-translate-y-1 hover:shadow-xl hover:shadow-black/20 hover:border-border/80',
                // left accent edge
                'before:absolute before:left-0 before:top-0 before:h-full before:w-1 before:transition-all',
                accent.edge,
            )}
        >
            {/* corner glow */}
            <div className={cn(
                'pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full',
                'bg-gradient-to-br to-transparent blur-2xl', accent.glow,
            )} />

            <div className="relative p-5">
                {/* Header */}
                <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                        <div className="flex items-center gap-2">
                            <h3 className="truncate font-semibold tracking-tight">
                                {playbook.name}
                            </h3>
                            <ArrowUpRight className="h-3.5 w-3.5 shrink-0 text-muted-foreground
                opacity-0 -translate-x-1 transition-all
                group-hover:opacity-100 group-hover:translate-x-0" />
                        </div>
                        {playbook.description ? (
                            <p className="mt-0.5 line-clamp-1 text-xs text-muted-foreground">
                                {playbook.description}
                            </p>
                        ) : (
                            <p className="mt-0.5 text-xs italic text-muted-foreground/60">
                                No description
                            </p>
                        )}
                    </div>

                    <div className="flex shrink-0 gap-0.5 opacity-0 transition-opacity group-hover:opacity-100">
                        <button
                            onClick={(e) => { e.stopPropagation(); onEdit(playbook); }}
                            className="rounded-md p-1.5 text-muted-foreground hover:bg-accent hover:text-foreground"
                        >
                            <Pencil size={13} />
                        </button>
                        <button
                            onClick={(e) => { e.stopPropagation(); onDelete(playbook.id); }}
                            className="rounded-md p-1.5 text-muted-foreground hover:bg-red-500/10 hover:text-red-500"
                        >
                            <Trash2 size={13} />
                        </button>
                    </div>
                </div>

                {/* Hero P&L */}
                <div className="mt-4 flex items-end justify-between">
                    <div>
                        <p className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground">
                            Net P&L
                        </p>
                        <p className={cn('text-2xl font-bold tabular-nums', accent.text)}>
                            {trades > 0 ? formatCurrency(pnl) : '—'}
                        </p>
                    </div>
                    {ruleN > 0 && (
                        <div className="flex items-center gap-1 rounded-full border border-border
              bg-muted/40 px-2 py-1 text-[10px] font-medium text-muted-foreground">
                            <ListChecks size={11} />
                            {ruleN} rule{ruleN > 1 ? 's' : ''}
                        </div>
                    )}
                </div>

                {/* Win-rate split bar */}
                <div className="mt-4 space-y-1.5">
                    <div className="flex items-center justify-between text-[11px]">
                        <span className="font-medium text-emerald-500">{wins}W</span>
                        <span className="font-semibold tabular-nums">
                            {trades > 0 ? `${winRate.toFixed(0)}%` : '—'}
                        </span>
                        <span className="font-medium text-red-500">{losses}L</span>
                    </div>
                    <div className="flex h-1.5 overflow-hidden rounded-full bg-muted">
                        {trades > 0 ? (
                            <>
                                <div className="bg-emerald-500 transition-all" style={{ width: `${winRate}%` }} />
                                <div className="bg-red-500/70 transition-all" style={{ width: `${100 - winRate}%` }} />
                            </>
                        ) : (
                            <div className="w-full bg-muted" />
                        )}
                    </div>
                </div>

                {/* Micro-stats */}
                <div className="mt-4 grid grid-cols-3 gap-2 border-t border-border pt-3">
                    <MicroStat
                        icon={Activity}
                        label="Expectancy"
                        value={trades > 0
                            ? `${expectancy >= 0 ? '+' : ''}${formatCurrency(expectancy)}`
                            : '—'}
                        valueClass={trades > 0
                            ? expectancy >= 0 ? 'text-emerald-500' : 'text-red-500'
                            : ''}
                    />
                    <MicroStat
                        icon={Scale}
                        label="Avg R:R"
                        value={stats?.avgRiskReward
                            ? stats.avgRiskReward.toFixed(2)
                            : '—'}
                    />
                    <MicroStat
                        icon={violations > 0 ? ShieldAlert : ShieldCheck}
                        label="Discipline"
                        value={trades > 0 ? `${compliance.toFixed(0)}%` : '—'}
                        valueClass={
                            trades === 0 ? '' :
                            compliance >= 90 ? 'text-emerald-500' :
                            compliance >= 70 ? 'text-yellow-500' : 'text-red-500'
                        }
                    />
                </div>
            </div>
        </div>
    );
}

function MicroStat({
    icon: Icon, label, value, valueClass,
}: {
    icon: React.ElementType;
    label: string;
    value: string;
    valueClass?: string;
}) {
    return (
        <div className="space-y-0.5">
            <div className="flex items-center gap-1 text-muted-foreground">
                <Icon size={11} />
                <span className="text-[9px] font-medium uppercase tracking-wider">{label}</span>
            </div>
            <p className={cn('text-sm font-semibold tabular-nums', valueClass)}>{value}</p>
        </div>
    );
}
