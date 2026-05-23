'use client';
import Link from 'next/link';
import { ArrowUpRight, ArrowDownLeft, AlertTriangle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatCurrency, formatDateTime, getPnlBg, cn } from '@/lib/utils';
import type { TradeResponse } from '@/types';

interface TradeCardProps {
    trade: TradeResponse;
}

export function TradeCard({ trade }: TradeCardProps) {
    const isLong = trade.direction === 'LONG';

    return (
        <Link href={`/trades/${trade.id}`}>
            <Card className="hover:border-primary/50 transition-colors cursor-pointer">
                <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className={cn(
                                'w-9 h-9 rounded-lg flex items-center justify-center',
                                isLong ? 'bg-emerald-500/10' : 'bg-red-500/10'
                            )}>
                                {isLong
                                    ? <ArrowUpRight className="w-4 h-4 text-emerald-500" />
                                    : <ArrowDownLeft className="w-4 h-4 text-red-500" />}
                            </div>
                            <div>
                                <div className="flex items-center gap-1.5">
                                    <span className="font-semibold">{trade.symbol}</span>
                                    {trade.isRuleViolated && (
                                        <AlertTriangle size={12}
                                                       className="text-yellow-500" />
                                    )}
                                </div>
                                <p className="text-xs text-muted-foreground">
                                    {formatDateTime(trade.entryDate)}
                                </p>
                            </div>
                        </div>
                        <div className="text-right">
              <span className={cn(
                  'px-2 py-0.5 rounded-md text-xs font-semibold',
                  getPnlBg(trade.netPnl)
              )}>
                {formatCurrency(trade.netPnl)}
              </span>
                            <div className="flex gap-1 mt-1 justify-end">
                                <Badge variant="outline"
                                       className="text-xs px-1.5 py-0">
                                    {trade.assetClass}
                                </Badge>
                            </div>
                        </div>
                    </div>

                    {trade.tags.length > 0 && (
                        <div className="flex gap-1 flex-wrap mt-3 pt-3
              border-t border-border">
                            {trade.tags.map((t) => (
                                <Badge key={t.id} variant="secondary"
                                       className="text-xs px-1.5 py-0">
                                    {t.tag}
                                </Badge>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>
        </Link>
    );
}