'use client';
import {
    PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { TradeSummary } from '@/types';

interface WinLossDonutProps {
    summary: TradeSummary | undefined;
}

const COLORS = {
    wins: '#10b981',
    losses: '#ef4444',
    breakeven: '#94a3b8',
};

export function WinLossDonut({ summary }: WinLossDonutProps) {
    if (!summary || summary.totalTrades === 0) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle className="text-base">Win / Loss Rate</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center justify-center h-[220px] text-sm text-muted-foreground">
                        No trade data
                    </div>
                </CardContent>
            </Card>
        );
    }

    const breakeven = summary.totalTrades - summary.winningTrades - summary.losingTrades;
    const data = [
        { name: 'Wins', value: summary.winningTrades, color: COLORS.wins },
        { name: 'Losses', value: summary.losingTrades, color: COLORS.losses },
        ...(breakeven > 0 ? [{ name: 'Breakeven', value: breakeven, color: COLORS.breakeven }] : []),
    ].filter((d) => d.value > 0);

    const winRate = ((summary.winningTrades / summary.totalTrades) * 100).toFixed(1);

    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-base">Win / Loss Rate</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="relative">
                    <ResponsiveContainer width="100%" height={220}>
                        <PieChart>
                            <Pie
                                data={data}
                                cx="50%"
                                cy="50%"
                                innerRadius={65}
                                outerRadius={90}
                                paddingAngle={3}
                                dataKey="value"
                                strokeWidth={0}
                            >
                                {data.map((entry, index) => (
                                    <Cell key={index} fill={entry.color} />
                                ))}
                            </Pie>
                            <Tooltip
                                formatter={(value: any, name: any) => [
                                    `${value} trades`,
                                    String(name ?? ''),
                                ]}
                                contentStyle={{
                                    backgroundColor: 'hsl(var(--card))',
                                    border: '1px solid hsl(var(--border))',
                                    borderRadius: '8px',
                                    fontSize: '12px',
                                }}
                            />
                            <Legend
                                iconType="circle"
                                iconSize={8}
                                formatter={(value) => (
                                    <span className="text-xs text-muted-foreground">
                                        {value}
                                    </span>
                                )}
                            />
                        </PieChart>
                    </ResponsiveContainer>
                    {/* Center label */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none pb-6">
                        <p className="text-2xl font-bold">{winRate}%</p>
                        <p className="text-xs text-muted-foreground">win rate</p>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
