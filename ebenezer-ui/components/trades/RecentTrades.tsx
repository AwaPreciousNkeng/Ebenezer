'use client';
import Link from 'next/link';
import { ArrowUpRight, ArrowDownLeft } from 'lucide-react';
import {
    Card, CardContent, CardHeader,
    CardTitle, CardDescription,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { formatCurrency, formatDateTime, cn } from '@/lib/utils';
import type { TradeResponse } from '@/types';

export function RecentTrades({
                                 trades, loading,
                             }: {
    trades: TradeResponse[];
    loading: boolean;
}) {
    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between">
                <div>
                    <CardTitle className="text-base">Recent Trades</CardTitle>
                    <CardDescription>Your last 5 trades</CardDescription>
                </div>
                <Button variant="outline" size="sm" asChild>
                    <Link href="/trades">View All</Link>
                </Button>
            </CardHeader>
            <CardContent>
                {loading ? (
                    <LoadingSpinner size="sm" />
                ) : trades.length === 0 ? (
                    <p className="text-center text-muted-foreground py-8 text-sm">
                        No trades yet. Add your first trade!
                    </p>
                ) : (
                    <div className="space-y-2">
                        {trades.map((trade) => (
                            <Link
                                key={trade.id}
                                href={`/trades/${trade.id}`}
                                className="flex items-center justify-between
                  p-3 rounded-lg hover:bg-accent transition-colors"
                            >
                                <div className="flex items-center gap-3">
                                    <div className={cn(
                                        'w-8 h-8 rounded-lg flex items-center justify-center',
                                        trade.direction === 'LONG'
                                            ? 'bg-emerald-500/10'
                                            : 'bg-red-500/10'
                                    )}>
                                        {trade.direction === 'LONG'
                                            ? <ArrowUpRight className="w-4 h-4 text-emerald-500" />
                                            : <ArrowDownLeft className="w-4 h-4 text-red-500" />}
                                    </div>
                                    <div>
                                        <p className="font-medium text-sm">{trade.symbol}</p>
                                        <p className="text-xs text-muted-foreground">
                                            {formatDateTime(trade.entryDate)}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3">
                                    <Badge variant="outline" className="text-xs">
                                        {trade.assetClass}
                                    </Badge>
                                    <span className={cn(
                                        'font-semibold text-sm',
                                        trade.netPnl && trade.netPnl >= 0
                                            ? 'text-emerald-500'
                                            : 'text-red-500'
                                    )}>
                    {formatCurrency(trade.netPnl)}
                  </span>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}