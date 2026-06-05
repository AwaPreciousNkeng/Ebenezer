'use client';
import { useMemo, useState } from 'react';
import { Plus, BookMarked, Layers, Trophy, TrendingDown } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/shared/PageHeader';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { EmptyState } from '@/components/shared/EmptyState';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import { PlaybookCard } from '@/components/playbooks/PlaybookCard';
import { PlaybookFormDialog } from '@/components/playbooks/PlaybookFormDialog';
import { playbooksApi } from '@/lib/api/playbooks';
import { cn, formatCurrency } from '@/lib/utils';
import type { PlaybookResponse, PlaybookStats } from '@/types';

export default function PlaybooksPage() {
    const qc = useQueryClient();
    const [formOpen, setFormOpen] = useState(false);
    const [editing, setEditing] = useState<PlaybookResponse | null>(null);
    const [deleteId, setDeleteId] = useState<string | null>(null);

    const { data: playbooks, isLoading } = useQuery({
        queryKey: ['playbooks'],
        queryFn: async () => (await playbooksApi.list()).data.data,
    });

    const { data: stats } = useQuery({
        queryKey: ['playbook-stats'],
        queryFn: async () => (await playbooksApi.stats()).data.data,
    });

    const statMap = useMemo(
        () => (stats ?? []).reduce<Record<string, PlaybookStats>>(
            (acc, s) => ({ ...acc, [s.playbookId]: s }), {}),
        [stats]
    );

    const deleteMutation = useMutation({
        mutationFn: (id: string) => playbooksApi.delete(id),
        onSuccess: () => {
            toast.success('Playbook deleted');
            qc.invalidateQueries({ queryKey: ['playbooks'] });
            qc.invalidateQueries({ queryKey: ['playbook-stats'] });
            setDeleteId(null);
        },
    });

    const openNew = () => { setEditing(null); setFormOpen(true); };
    const openEdit = (p: PlaybookResponse) => { setEditing(p); setFormOpen(true); };

    // Aggregate summary across all playbooks
    const summary = useMemo(() => {
        const list = stats ?? [];
        const totalPnl = list.reduce((sum, s) => sum + (s.totalPnl ?? 0), 0);
        const best = list
            .filter((s) => s.totalTrades > 0)
            .sort((a, b) => b.totalPnl - a.totalPnl)[0];
        const worst = list
            .filter((s) => s.totalTrades > 0)
            .sort((a, b) => a.totalPnl - b.totalPnl)[0];
        return { count: playbooks?.length ?? 0, totalPnl, best, worst };
    }, [stats, playbooks]);

    if (isLoading) return <LoadingSpinner />;

    return (
        <div className="space-y-6">
            <PageHeader
                title="Playbooks"
                description="Your strategy library — track what works, retire what doesn't"
                action={
                    <Button onClick={openNew}>
                        <Plus className="mr-2 h-4 w-4" />
                        New Playbook
                    </Button>
                }
            />

            {!playbooks?.length ? (
                <EmptyState
                    icon={BookMarked}
                    title="No playbooks yet"
                    description="A playbook is a documented setup. Tag your trades to one and watch which strategies actually make you money."
                    action={{ label: 'Create your first playbook', onClick: openNew }}
                />
            ) : (
                <>
                    {/* Aggregate summary strip */}
                    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
                        <SummaryTile
                            icon={Layers}
                            label="Strategies"
                            value={String(summary.count)}
                        />
                        <SummaryTile
                            icon={summary.totalPnl >= 0 ? Trophy : TrendingDown}
                            label="Combined P&L"
                            value={formatCurrency(summary.totalPnl)}
                            valueClass={summary.totalPnl >= 0 ? 'text-emerald-500' : 'text-red-500'}
                        />
                        <SummaryTile
                            icon={Trophy}
                            label="Top Performer"
                            value={summary.best?.playbookName ?? '—'}
                            sub={summary.best ? formatCurrency(summary.best.totalPnl) : undefined}
                            subClass="text-emerald-500"
                            truncate
                        />
                        <SummaryTile
                            icon={TrendingDown}
                            label="Needs Review"
                            value={summary.worst && summary.worst.totalPnl < 0
                                ? summary.worst.playbookName : '—'}
                            sub={summary.worst && summary.worst.totalPnl < 0
                                ? formatCurrency(summary.worst.totalPnl) : undefined}
                            subClass="text-red-500"
                            truncate
                        />
                    </div>

                    {/* Card grid */}
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                        {playbooks.map((p) => (
                            <PlaybookCard
                                key={p.id}
                                playbook={p}
                                stats={statMap[p.id]}
                                onEdit={openEdit}
                                onDelete={setDeleteId}
                            />
                        ))}
                    </div>
                </>
            )}

            <PlaybookFormDialog
                open={formOpen}
                onOpenChange={setFormOpen}
                editing={editing}
            />

            <ConfirmDialog
                open={!!deleteId}
                onOpenChange={(o) => !o && setDeleteId(null)}
                title="Delete Playbook"
                description="Trades linked to this playbook will be unlinked, but not deleted."
                onConfirm={() => deleteId && deleteMutation.mutate(deleteId)}
                loading={deleteMutation.isPending}
            />
        </div>
    );
}

function SummaryTile({
    icon: Icon, label, value, sub, valueClass, subClass, truncate,
}: {
    icon: React.ElementType;
    label: string;
    value: string;
    sub?: string;
    valueClass?: string;
    subClass?: string;
    truncate?: boolean;
}) {
    return (
        <div className="flex items-center gap-3 rounded-xl border border-border bg-card p-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                <Icon className="h-5 w-5 text-primary" />
            </div>
            <div className="min-w-0">
                <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                    {label}
                </p>
                <p className={cn('font-bold tabular-nums', truncate && 'truncate', valueClass)}>
                    {value}
                </p>
                {sub && <p className={cn('text-xs font-medium tabular-nums', subClass)}>{sub}</p>}
            </div>
        </div>
    );
}
