'use client';
import { ArrowUpRight, ArrowDownLeft,
    AlertTriangle, Star } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { formatCurrency, formatDateTime, getPnlColor, cn } from '@/lib/utils';
import type { TradeResponse } from '@/types';

export function TradeDetail({ trade }: { trade: TradeResponse }) {
    const isLong = trade.direction === 'LONG';

    return (
        <div className="space-y-4">
            {/* Symbol Header */}
            <div className="flex items-center gap-4">
                <div className={cn(
                    'w-12 h-12 rounded-xl flex items-center justify-center',
                    isLong ? 'bg-emerald-500/10' : 'bg-red-500/10'
                )}>
                    {isLong
                        ? <ArrowUpRight className="w-6 h-6 text-emerald-500" />
                        : <ArrowDownLeft className="w-6 h-6 text-red-500" />}
                </div>
                <div>
                    <div className="flex items-center gap-2">
                        <h3 className="text-xl font-bold">{trade.symbol}</h3>
                        {trade.isRuleViolated && (
                            <AlertTriangle size={16} className="text-yellow-500" />
                        )}
                    </div>
                    <div className="flex gap-2 mt-1">
                        <Badge className={cn(
                            'border-0 text-xs',
                            isLong
                                ? 'bg-emerald-500/10 text-emerald-500'
                                : 'bg-red-500/10 text-red-500'
                        )}>
                            {trade.direction}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                            {trade.assetClass}
                        </Badge>
                    </div>
                </div>
                <div className="ml-auto text-right">
                    <p className={cn('text-2xl font-bold',
                        getPnlColor(trade.netPnl))}>
                        {formatCurrency(trade.netPnl)}
                    </p>
                    {trade.pnlPercent != null && (
                        <p className={cn('text-sm', getPnlColor(trade.pnlPercent))}>
                            {trade.pnlPercent > 0 ? '+' : ''}{trade.pnlPercent}%
                        </p>
                    )}
                </div>
            </div>

            <Separator />

            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-3 text-sm">
                {[
                    { label: 'Entry', value: formatCurrency(trade.entryPrice) },
                    { label: 'Exit', value: formatCurrency(trade.exitPrice) },
                    { label: 'Qty', value: String(trade.quantity) },
                    { label: 'Commission', value: formatCurrency(trade.commission) },
                    { label: 'Stop Loss', value: formatCurrency(trade.stopLoss) },
                    { label: 'Take Profit', value: formatCurrency(trade.takeProfit) },
                    { label: 'Planned Risk',
                        value: formatCurrency(trade.plannedRisk) },
                    { label: 'R:R',
                        value: trade.riskReward?.toFixed(2) ?? '—' },
                    { label: 'Entry Time',
                        value: formatDateTime(trade.entryDate) },
                    { label: 'Exit Time',
                        value: trade.exitDate
                            ? formatDateTime(trade.exitDate) : '—' },
                ].map(({ label, value }) => (
                    <div key={label}
                         className="flex justify-between items-center
              p-2 rounded-lg bg-muted/50">
                        <span className="text-muted-foreground">{label}</span>
                        <span className="font-medium">{value ?? '—'}</span>
                    </div>
                ))}
            </div>

            {/* Tags */}
            {trade.tags.length > 0 && (
                <>
                    <Separator />
                    <div className="flex flex-wrap gap-2">
                        {trade.tags.map((t) => (
                            <Badge key={t.id} variant="secondary">
                                {t.tag}
                            </Badge>
                        ))}
                    </div>
                </>
            )}

            {/* Rating */}
            {trade.executionRating && (
                <>
                    <Separator />
                    <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">
              Execution:
            </span>
                        <div className="flex gap-0.5">
                            {Array.from({ length: 5 }).map((_, i) => (
                                <Star key={i} size={14} className={
                                    i < trade.executionRating!
                                        ? 'fill-yellow-400 text-yellow-400'
                                        : 'text-muted-foreground'
                                } />
                            ))}
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}