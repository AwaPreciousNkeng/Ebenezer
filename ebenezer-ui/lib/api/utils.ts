import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { format, parseISO } from 'date-fns';

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export function formatCurrency(
    value: number | null | undefined,
    currency = 'USD'
): string {
    if (value == null) return '—';
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency,
        minimumFractionDigits: 2,
    }).format(value);
}

export function formatPercent(value: number | null | undefined): string {
    if (value == null) return '—';
    return `${value >= 0 ? '+' : ''}${value.toFixed(2)}%`;
}

export function formatDate(dateStr: string, fmt = 'MMM dd, yyyy'): string {
    try {
        return format(parseISO(dateStr), fmt);
    } catch {
        return dateStr;
    }
}

export function formatDateTime(dateStr: string): string {
    return formatDate(dateStr, 'MMM dd, yyyy HH:mm');
}

export function getPnlColor(value: number | null | undefined): string {
    if (value == null) return 'text-muted-foreground';
    if (value > 0) return 'text-emerald-500';
    if (value < 0) return 'text-red-500';
    return 'text-muted-foreground';
}

export function getPnlBg(value: number | null | undefined): string {
    if (value == null) return 'bg-muted';
    if (value > 0) return 'bg-emerald-500/10 text-emerald-500';
    if (value < 0) return 'bg-red-500/10 text-red-500';
    return 'bg-muted text-muted-foreground';
}

export function getDayName(dayOfWeek: number): string {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    return days[dayOfWeek - 1] ?? '—';
}

export function getWinRate(
    winning: number, total: number
): string {
    if (!total) return '0%';
    return `${((winning / total) * 100).toFixed(1)}%`;
}