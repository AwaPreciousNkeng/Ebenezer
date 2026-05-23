'use client';
import Link from 'next/link';
import { ArrowUpRight, ArrowDownLeft,
    Trash2, AlertTriangle } from 'lucide-react';
import {
    Table, TableBody, TableCell, TableHead,
    TableHeader, TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { formatCurrency, formatDateTime, getPnlBg, cn } from '@/lib/utils';
import type { TradeResponse } from '@/types';

interface TradeTableProps {
    trades: TradeResponse[];
    onDelete: (id: string) => void;
}

export function TradeTable({ trades, onDelete }: TradeTableProps) {
    return (
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
                    {trades.map((trade) => (
                        <TableRow
                            key={trade.id}
                            className="cursor-pointer hover:bg-accent/50"
                        >
                            <TableCell>
                                <Link
                                    href={`/trades/${trade.id}`}
                                    className="flex items-center gap-2"
                                >
                                    <div className={cn(
                                        'w-7 h-7 rounded-md flex items-center justify-center',
                                        trade.direction === 'LONG'
                                            ? 'bg-emerald-500/10'
                                            : 'bg-red-500/10'
                                    )}>
                                        {trade.direction === 'LONG'
                                            ? <ArrowUpRight className="w-3.5 h-3.5 text-emerald-500" />
                                            : <ArrowDownLeft className="w-3.5 h-3.5 text-red-500" />}
                                    </div>
                                    <span className="font-semibold">
                    {trade.symbol}
                  </span>
                                </Link>
                            </TableCell>
                            <TableCell>
                                <Badge className={cn(
                                    'border-0 text-xs',
                                    trade.direction === 'LONG'
                                        ? 'bg-emerald-500/10 text-emerald-500'
                                        : 'bg-red-500/10 text-red-500'
                                )}>
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
                                        <Badge
                                            key={t.id}
                                            variant="secondary"
                                            className="text-xs px-1.5 py-0"
                                        >
                                            {t.tag}
                                        </Badge>
                                    ))}
                                    {trade.tags.length > 2 && (
                                        <Badge
                                            variant="secondary"
                                            className="text-xs px-1.5 py-0"
                                        >
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
                                        onDelete(trade.id);
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
    );
}