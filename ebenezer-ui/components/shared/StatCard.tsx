import { LucideIcon } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface StatCardProps {
    title: string;
    value: string;
    sub?: string;
    icon: LucideIcon;
    trend?: 'up' | 'down' | 'neutral';
    className?: string;
}

export function StatCard({
                             title, value, sub, icon: Icon, trend, className,
                         }: StatCardProps) {
    return (
        <Card className={cn('relative overflow-hidden', className)}>
            <CardContent className="p-6">
                <div className="flex items-start justify-between">
                    <div className="space-y-1">
                        <p className="text-sm text-muted-foreground">{title}</p>
                        <p className={cn(
                            'text-2xl font-bold',
                            trend === 'up' && 'text-emerald-500',
                            trend === 'down' && 'text-red-500',
                        )}>
                            {value}
                        </p>
                        {sub && (
                            <p className="text-xs text-muted-foreground">{sub}</p>
                        )}
                    </div>
                    <div className={cn(
                        'p-3 rounded-xl',
                        trend === 'up' ? 'bg-emerald-500/10' :
                            trend === 'down' ? 'bg-red-500/10' : 'bg-primary/10'
                    )}>
                        <Icon className={cn(
                            'h-5 w-5',
                            trend === 'up' ? 'text-emerald-500' :
                                trend === 'down' ? 'text-red-500' : 'text-primary'
                        )} />
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}