'use client';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid,
    Tooltip, ResponsiveContainer, Rectangle,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatCurrency } from '@/lib/utils';
import type { SymbolPnl } from '@/types';

export function PnlBySymbol({ data }: { data: SymbolPnl[] }) {
    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-base">P&L by Symbol</CardTitle>
            </CardHeader>
            <CardContent>
                <ResponsiveContainer width="100%" height={240}>
                    <BarChart data={data} layout="vertical">
                        <CartesianGrid
                            strokeDasharray="3 3"
                            stroke="hsl(var(--border))"
                            horizontal={false}
                        />
                        <XAxis
                            type="number"
                            tickFormatter={(v) => `$${v}`}
                            tick={{
                                fontSize: 11,
                                fill: 'hsl(var(--muted-foreground))'
                            }}
                            axisLine={false} tickLine={false}
                        />
                        <YAxis
                            type="category"
                            dataKey="symbol"
                            tick={{
                                fontSize: 11,
                                fill: 'hsl(var(--muted-foreground))'
                            }}
                            axisLine={false} tickLine={false}
                            width={50}
                        />
                        <Tooltip
                            formatter={(v: any) => [formatCurrency(Number(v) || 0), 'P&L']}
                            contentStyle={{
                                backgroundColor: 'hsl(var(--card))',
                                border: '1px solid hsl(var(--border))',
                                borderRadius: '8px',
                            }}
                        />
                        <Bar
                            dataKey="totalPnl"
                            shape={(props: any) => {
                                const { totalPnl } = props.payload;
                                const isPositive = Number(totalPnl) >= 0;

                                return (
                                    <Rectangle
                                        {...props}
                                        fill={isPositive ? '#10b981' : '#ef4444'}
                                        // Round the right side for wins, left side for losses
                                        radius={isPositive ? [0, 4, 4, 0] : [4, 0, 0, 4]}
                                    />
                                );
                            }}
                        />
                    </BarChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
    );
}