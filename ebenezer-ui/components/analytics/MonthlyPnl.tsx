'use client';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid,
    Tooltip, ResponsiveContainer, Cell, ReferenceLine,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatCurrency } from '@/lib/utils';
import type { MonthlyPnl } from '@/types';

const MONTH_ABBR = ['Jan','Feb','Mar','Apr','May','Jun',
                    'Jul','Aug','Sep','Oct','Nov','Dec'];

export function MonthlyPnlChart({ data }: { data: MonthlyPnl[] }) {
    if (!data || data.length === 0) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle className="text-base">Monthly P&L</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center justify-center h-[240px] text-sm text-muted-foreground">
                        No trade data
                    </div>
                </CardContent>
            </Card>
        );
    }

    const formatted = data.map((d) => ({
        ...d,
        label: `${MONTH_ABBR[d.month - 1]} ${String(d.year).slice(2)}`,
        totalPnl: Number(d.totalPnl),
    }));

    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-base">Monthly P&L</CardTitle>
            </CardHeader>
            <CardContent>
                <ResponsiveContainer width="100%" height={240}>
                    <BarChart data={formatted} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
                        <CartesianGrid
                            strokeDasharray="3 3"
                            stroke="hsl(var(--border))"
                            vertical={false}
                        />
                        <XAxis
                            dataKey="label"
                            tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
                            axisLine={false}
                            tickLine={false}
                        />
                        <YAxis
                            tickFormatter={(v) =>
                                v >= 1000 ? `$${(v / 1000).toFixed(1)}k`
                                : v <= -1000 ? `-$${Math.abs(v / 1000).toFixed(1)}k`
                                : `$${v}`
                            }
                            tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
                            axisLine={false}
                            tickLine={false}
                            width={56}
                        />
                        <ReferenceLine
                            y={0}
                            stroke="hsl(var(--muted-foreground))"
                            strokeDasharray="4 4"
                            strokeOpacity={0.4}
                        />
                        <Tooltip
                            formatter={(v: any) => [formatCurrency(Number(v)), 'Net P&L']}
                            labelFormatter={(label) => `Month: ${label}`}
                            contentStyle={{
                                backgroundColor: 'hsl(var(--card))',
                                border: '1px solid hsl(var(--border))',
                                borderRadius: '8px',
                                fontSize: '12px',
                            }}
                        />
                        <Bar dataKey="totalPnl" radius={[3, 3, 0, 0]} maxBarSize={40}>
                            {formatted.map((entry, i) => (
                                <Cell
                                    key={i}
                                    fill={entry.totalPnl >= 0 ? '#10b981' : '#ef4444'}
                                    fillOpacity={0.85}
                                />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
    );
}
