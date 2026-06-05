'use client';
import {
    RadialBarChart, RadialBar, Tooltip,
    ResponsiveContainer, Legend,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatCurrency } from '@/lib/utils';
import type { AssetClassPnl } from '@/types';

const PALETTE = ['#10b981', '#3b82f6', '#f59e0b', '#8b5cf6', '#ef4444', '#06b6d4'];

export function AssetClassPnlChart({ data }: { data: AssetClassPnl[] }) {
    if (!data || data.length === 0) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle className="text-base">P&L by Asset Class</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center justify-center h-[240px] text-sm text-muted-foreground">
                        No trade data
                    </div>
                </CardContent>
            </Card>
        );
    }

    const maxAbs = Math.max(...data.map((d) => Math.abs(Number(d.totalPnl))));

    const formatted = data.map((d, i) => ({
        name: d.assetClass,
        totalPnl: Number(d.totalPnl),
        totalTrades: d.totalTrades,
        fill: PALETTE[i % PALETTE.length],
        // RadialBar needs a value 0-100 for the bar fill
        value: maxAbs > 0 ? (Math.abs(Number(d.totalPnl)) / maxAbs) * 100 : 0,
    }));

    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-base">P&L by Asset Class</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-3">
                    {formatted.map((d) => (
                        <div key={d.name} className="space-y-1">
                            <div className="flex items-center justify-between text-sm">
                                <span className="font-medium">{d.name}</span>
                                <span className={
                                    d.totalPnl >= 0
                                        ? 'text-emerald-500 font-semibold'
                                        : 'text-red-500 font-semibold'
                                }>
                                    {formatCurrency(d.totalPnl)}
                                </span>
                            </div>
                            <div className="h-2 rounded-full bg-muted overflow-hidden">
                                <div
                                    className="h-full rounded-full transition-all"
                                    style={{
                                        width: `${d.value}%`,
                                        backgroundColor: d.totalPnl >= 0 ? '#10b981' : '#ef4444',
                                    }}
                                />
                            </div>
                            <p className="text-xs text-muted-foreground">
                                {d.totalTrades} trades
                            </p>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}
