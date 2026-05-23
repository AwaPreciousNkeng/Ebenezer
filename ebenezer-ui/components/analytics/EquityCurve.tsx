'use client';
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid,
    Tooltip, ResponsiveContainer, ReferenceLine,
} from 'recharts';
import {
    Card, CardContent, CardHeader, CardTitle,
} from '@/components/ui/card';
import { formatCurrency, formatDate } from '@/lib/utils';
import type { EquityCurvePoint } from '@/types';

interface EquityCurveProps {
    data: EquityCurvePoint[];
}

function safeFormatDate(date: string): string {
    try {
        // Now safely expects a standard ISO string from Spring Boot
        return formatDate(date, 'MMM dd');
    } catch {
        return String(date);
    }
}

export function EquityCurve({ data }: EquityCurveProps) {
    if (!data || data.length === 0) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle className="text-base">Equity Curve</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center justify-center h-[240px]
            text-muted-foreground text-sm">
                        No trade data available
                    </div>
                </CardContent>
            </Card>
        );
    }

    const lastValue = data[data.length - 1].cumulativePnl;
    const isPositive = lastValue >= 0;
    const color = isPositive ? '#10b981' : '#ef4444';

    const formatted = data.map((d) => ({
        ...d,
        date: safeFormatDate(d.date as any),
        cumulativePnl: Number(d.cumulativePnl), // handle BigDecimal as string edge case
    }));

    // Min/Max for Y axis padding
    const values = formatted.map((d) => d.cumulativePnl);
    const minVal = Math.min(...values);
    const maxVal = Math.max(...values);
    const padding = Math.abs(maxVal - minVal) * 0.1 || 100;

    return (
        <Card>
            <CardHeader className="flex flex-row items-center
        justify-between">
                <CardTitle className="text-base">Equity Curve</CardTitle>
                <span className={`text-sm font-semibold ${
                    isPositive ? 'text-emerald-500' : 'text-red-500'
                }`}>
          {formatCurrency(lastValue)}
        </span>
            </CardHeader>
            <CardContent>
                <ResponsiveContainer width="100%" height={240}>
                    <AreaChart
                        data={formatted}
                        margin={{ top: 4, right: 4, bottom: 0, left: 0 }}
                    >
                        <defs>
                            <linearGradient
                                id="pnlGrad" x1="0" y1="0" x2="0" y2="1"
                            >
                                <stop
                                    offset="5%"
                                    stopColor={color}
                                    stopOpacity={0.2}
                                />
                                <stop
                                    offset="95%"
                                    stopColor={color}
                                    stopOpacity={0}
                                />
                            </linearGradient>
                        </defs>

                        <CartesianGrid
                            strokeDasharray="3 3"
                            stroke="hsl(var(--border))"
                            vertical={false}
                        />

                        <XAxis
                            dataKey="date"
                            tick={{
                                fontSize: 11,
                                fill: 'hsl(var(--muted-foreground))',
                            }}
                            axisLine={false}
                            tickLine={false}
                            interval="preserveStartEnd"
                        />

                        <YAxis
                            tickFormatter={(v) => `$${v >= 1000
                                ? `${(v / 1000).toFixed(1)}k` : v}`}
                            tick={{
                                fontSize: 11,
                                fill: 'hsl(var(--muted-foreground))',
                            }}
                            axisLine={false}
                            tickLine={false}
                            domain={[minVal - padding, maxVal + padding]}
                            width={60}
                        />

                        {/* Zero line */}
                        <ReferenceLine
                            y={0}
                            stroke="hsl(var(--muted-foreground))"
                            strokeDasharray="4 4"
                            strokeOpacity={0.5}
                        />

                        <Tooltip
                            formatter={(value: any) => [
                                formatCurrency(value), 'Cumulative P&L',
                            ]}
                            labelFormatter={(label) => `Date: ${label}`}
                            contentStyle={{
                                backgroundColor: 'hsl(var(--card))',
                                border: '1px solid hsl(var(--border))',
                                borderRadius: '8px',
                                fontSize: '12px',
                                color: 'hsl(var(--foreground))',
                            }}
                            cursor={{
                                stroke: 'hsl(var(--muted-foreground))',
                                strokeWidth: 1,
                                strokeDasharray: '4 4',
                            }}
                        />

                        <Area
                            type="monotone"
                            dataKey="cumulativePnl"
                            stroke={color}
                            strokeWidth={2}
                            fill="url(#pnlGrad)"
                            dot={false}
                            activeDot={{
                                r: 4,
                                fill: color,
                                stroke: 'hsl(var(--background))',
                                strokeWidth: 2,
                            }}
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
    );
}