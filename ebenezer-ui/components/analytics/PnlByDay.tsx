'use client';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid,
    Tooltip, ResponsiveContainer, Rectangle,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatCurrency, getDayName } from '@/lib/utils';
import type { DayOfWeekPnl } from '@/types';

export function PnlByDay({ data }: { data: DayOfWeekPnl[] }) {
    const formatted = data.map((d) => ({
        ...d, day: getDayName(d.dayOfWeek),
    }));

    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-base">P&L by Day of Week</CardTitle>
            </CardHeader>
            <CardContent>
                <ResponsiveContainer width="100%" height={240}>
                    <BarChart data={formatted}>
                        <CartesianGrid
                            strokeDasharray="3 3"
                            stroke="hsl(var(--border))"
                        />
                        <XAxis
                            dataKey="day"
                            tick={{
                                fontSize: 12,
                                fill: 'hsl(var(--muted-foreground))'
                            }}
                            axisLine={false} tickLine={false}
                        />
                        <YAxis
                            tickFormatter={(v) => `$${v}`}
                            tick={{
                                fontSize: 12,
                                fill: 'hsl(var(--muted-foreground))'
                            }}
                            axisLine={false} tickLine={false}
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
                                        // Round the top for winning days, bottom for losing days
                                        radius={isPositive ? [4, 4, 0, 0] : [0, 0, 4, 4]}
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