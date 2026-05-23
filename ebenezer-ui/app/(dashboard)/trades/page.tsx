'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Plus, ArrowUpRight, ArrowDownLeft,
    AlertTriangle, Trash2 } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    Table, TableBody, TableCell,
    TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import { PageHeader } from '@/components/shared/PageHeader';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { EmptyState } from '@/components/shared/EmptyState';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import { TradeFilters } from '@/components/trades/TradeFilters';
import { tradesApi } from '@/lib/api/trades';
import { useAccountStore } from '@/store/accountStore';
import {
    formatCurrency, formatDateTime, cn, getPnlBg,
} from '@/lib/utils';
import type { TradeFilterParams, TradeResponse } from '@/types';

export default function TradesPage() {
    const router = useRouter();
    const qc = useQueryClient();
    const { selectedAccount } = useAccountStore();
    const [filters, setFilters] = useState<TradeFilterParams>({ page: 0 });
    const [deleteId, setDeleteId] = useState<string | null>(null);

    const { data, isLoading } = useQuery({
        queryKey: ['trades', selectedAccount?.id, filters],
        queryFn: async () => {
            const res = await tradesApi.list({
                ...filters,
                accountId: selectedAccount?.id,
            });
            return res.data.data;
        },
        retry: 2,
    });

    const deleteMutation = useMutation({
        mutationFn: (id: string) => tradesApi.delete(id),
        onSuccess: () => {
            toast.success('Trade deleted');
            qc.invalidateQueries({ queryKey: ['trades'] });
            setDeleteId(null);
        },
        onError: () => toast.error('Failed to delete trade'),
    });

    return (
        <div className="space-y-6">
            <PageHeader
                title="Trades"
                description={`${data?.totalElements ?? 0} trades`}
                action={
                    <Button asChild>
                        <Link href="/trades/new">
                            <Plus className="mr-2 h-4 w-4" />
                            Add Trade
                        </Link>
                    </Button>
                }
            />

            <TradeFilters filters={filters} onChange={setFilters} />

            {isLoading ? (
                <LoadingSpinner />
            ) : !data?.content.length ? (
                <EmptyState
                    icon={ArrowUpRight}
                    title="No trades found"
                    description="Start logging your trades to see them here"
                    action={{
                        label: 'Add First Trade',
                        onClick: () => router.push('/trades/new'),
                    }}
                />
            ) : (
                <>
                    <div className="rounded-xl border border-border overflow-hidden">
                        <Table>
                            <TableHeader>
                                <TableRow className="bg-muted/50">
                                    <TableHead>Symbol</TableHead>
                                    <TableHead>Direction</TableHead>
                                    <TableHead>Entry</TableHead>
                                    <TableHead>Exit</TableHead>
                                    <TableHead>Qty</TableHead>
                                    <TableHead>Net P&L</TableHead>
                                    <TableHead>R:R</TableHead>
                                    <TableHead>Date</TableHead>
                                    <TableHead>Tags</TableHead>
                                    <TableHead className="w-12" />
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {data.content.map((trade: TradeResponse) => (
                                    <TableRow
                                        key={trade.id}
                                        className="cursor-pointer hover:bg-accent/50"
                                    >
                                        <TableCell>
                                            <Link href={`/trades/${trade.id}`}
                                                  className="flex items-center gap-2">
                                                <div className={cn(
                                                    'w-7 h-7 rounded-md flex items-center justify-center',
                                                    trade.direction === 'LONG'
                                                        ? 'bg-emerald-500/10'
                                                        : 'bg-red-500/10'
                                                )}>
                                                    {trade.direction === 'LONG'
                                                        ? <ArrowUpRight className="w-3.5 h-3.5
                                text-emerald-500" />
                                                        : <ArrowDownLeft className="w-3.5 h-3.5
                                text-red-500" />}
                                                </div>
                                                <span className="font-semibold">{trade.symbol}</span>
                                            </Link>
                                        </TableCell>
                                        <TableCell>
                                            <Badge
                                                className={cn(
                                                    'text-xs',
                                                    trade.direction === 'LONG'
                                                        ? 'bg-emerald-500/10 text-emerald-500 border-0'
                                                        : 'bg-red-500/10 text-red-500 border-0'
                                                )}
                                            >
                                                {trade.direction}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-sm">
                                            {formatCurrency(trade.entryPrice)}
                                        </TableCell>
                                        <TableCell className="text-sm">
                                            {trade.exitPrice
                                                ? formatCurrency(trade.exitPrice)
                                                : '—'}
                                        </TableCell>
                                        <TableCell className="text-sm">
                                            {trade.quantity}
                                        </TableCell>
                                        <TableCell>
                      <span className={cn(
                          'px-2 py-0.5 rounded-md text-xs font-semibold',
                          getPnlBg(trade.netPnl)
                      )}>
                        {formatCurrency(trade.netPnl)}
                      </span>
                                        </TableCell>
                                        <TableCell className="text-sm">
                                            {trade.riskReward?.toFixed(2) ?? '—'}
                                        </TableCell>
                                        <TableCell className="text-xs text-muted-foreground">
                                            {formatDateTime(trade.entryDate)}
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex gap-1 flex-wrap">
                                                {trade.isRuleViolated && (
                                                    <AlertTriangle className="w-3.5 h-3.5
                            text-yellow-500" />
                                                )}
                                                {trade.tags.slice(0, 2).map((t) => (
                                                    <Badge key={t.id} variant="secondary"
                                                           className="text-xs px-1.5 py-0">
                                                        {t.tag}
                                                    </Badge>
                                                ))}
                                                {trade.tags.length > 2 && (
                                                    <Badge variant="secondary"
                                                           className="text-xs px-1.5 py-0">
                                                        +{trade.tags.length - 2}
                                                    </Badge>
                                                )}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-7 w-7 text-muted-foreground
                          hover:text-red-500"
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    setDeleteId(trade.id);
                                                }}
                                            >
                                                <Trash2 size={14} />
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>

                    {/* Pagination */}
                    <div className="flex items-center justify-between">
                        <p className="text-sm text-muted-foreground">
                            Page {(data.number + 1)} of {data.totalPages}
                        </p>
                        <div className="flex gap-2">
                            <Button
                                variant="outline" size="sm"
                                disabled={data.first}
                                onClick={() => setFilters((f) => ({
                                    ...f, page: (f.page ?? 0) - 1,
                                }))}
                            >
                                Previous
                            </Button>
                            <Button
                                variant="outline" size="sm"
                                disabled={data.last}
                                onClick={() => setFilters((f) => ({
                                    ...f, page: (f.page ?? 0) + 1,
                                }))}
                            >
                                Next
                            </Button>
                        </div>
                    </div>
                </>
            )}

            <ConfirmDialog
                open={!!deleteId}
                onOpenChange={(o) => !o && setDeleteId(null)}
                title="Delete Trade"
                description="This action cannot be undone."
                onConfirm={() => deleteId && deleteMutation.mutate(deleteId)}
                loading={deleteMutation.isPending}
            />
        </div>
    );
}