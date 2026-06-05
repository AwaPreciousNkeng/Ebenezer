'use client';
import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
    ArrowLeft, ArrowUpRight, ArrowDownLeft,
    Pencil, Trash2, AlertTriangle,
    Star, Upload,
} from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    Card, CardContent, CardHeader, CardTitle,
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PageHeader } from '@/components/shared/PageHeader';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import { SecureImage } from '@/components/shared/SecureImage';
import { tradesApi } from '@/lib/api/trades';
import {
    formatCurrency, formatPrice, formatDateTime,
    getPnlColor, cn,
} from '@/lib/utils';

export default function TradeDetailPage() {
    const { id } = useParams<{ id: string }>();
    const router = useRouter();
    const qc = useQueryClient();
    const [deleteOpen, setDeleteOpen] = useState(false);
    const [uploading, setUploading] = useState(false);

    const { data: trade, isLoading } = useQuery({
        queryKey: ['trade', id],
        queryFn: async () =>
            (await tradesApi.get(id)).data.data,
    });

    const deleteMutation = useMutation({
        mutationFn: () => tradesApi.delete(id),
        onSuccess: () => {
            toast.success('Trade deleted');
            qc.invalidateQueries({ queryKey: ['trades'] });
            router.push('/trades');
        },
    });

    const uploadScreenshot = async (
        e: React.ChangeEvent<HTMLInputElement>
    ) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setUploading(true);
        try {
            await tradesApi.uploadScreenshot(id, file);
            toast.success('Screenshot uploaded');
            await qc.invalidateQueries({queryKey: ['trade', id]});
        } catch {
            toast.error('Upload failed');
        } finally {
            setUploading(false);
        }
    };

    const deleteScreenshot = async (screenshotId: string) => {
        try {
            await tradesApi.deleteScreenshot(id, screenshotId);
            toast.success('Screenshot deleted');
            await qc.invalidateQueries({queryKey: ['trade', id]});
        } catch {
            toast.error('Failed to delete screenshot');
        }
    };

    if (isLoading) return <LoadingSpinner />;
    if (!trade) return (
        <p className="text-muted-foreground">Trade not found.</p>
    );

    const isLong = trade.direction === 'LONG';

    return (
        <div className="max-w-4xl space-y-6">
            <PageHeader
                title={`${trade.symbol} — ${trade.direction}`}
                description={formatDateTime(trade.entryDate)}
                action={
                    <div className="flex gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => router.push(`/trades/new?edit=${id}`)}
                        >
                            <Pencil className="mr-1.5 h-4 w-4" />
                            Edit
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            className="text-red-500 hover:text-red-600"
                            onClick={() => setDeleteOpen(true)}
                        >
                            <Trash2 className="mr-1.5 h-4 w-4" />
                            Delete
                        </Button>
                        <Button variant="outline" size="sm"
                                onClick={() => router.back()}>
                            <ArrowLeft className="mr-1.5 h-4 w-4" />
                            Back
                        </Button>
                    </div>
                }
            />

            {/* Header Card */}
            <Card>
                <CardContent className="p-6">
                    <div className="flex flex-wrap items-center
            justify-between gap-4">
                        <div className="flex items-center gap-4">
                            <div className={cn(
                                'w-14 h-14 rounded-xl flex items-center justify-center',
                                isLong ? 'bg-emerald-500/10' : 'bg-red-500/10'
                            )}>
                                {isLong
                                    ? <ArrowUpRight className="w-7 h-7 text-emerald-500" />
                                    : <ArrowDownLeft className="w-7 h-7 text-red-500" />}
                            </div>
                            <div>
                                <div className="flex items-center gap-2">
                                    <h2 className="text-2xl font-bold">
                                        {trade.symbol}
                                    </h2>
                                    {trade.isRuleViolated && (
                                        <AlertTriangle className="w-5 h-5
                      text-yellow-500" />
                                    )}
                                </div>
                                <div className="flex items-center gap-2 mt-1">
                                    <Badge className={cn(
                                        'border-0',
                                        isLong
                                            ? 'bg-emerald-500/10 text-emerald-500'
                                            : 'bg-red-500/10 text-red-500'
                                    )}>
                                        {trade.direction}
                                    </Badge>
                                    <Badge variant="outline">{trade.assetClass}</Badge>
                                    <Badge variant="secondary">{trade.status}</Badge>
                                </div>
                            </div>
                        </div>

                        <div className="text-right">
                            <p className={cn(
                                'text-3xl font-bold',
                                getPnlColor(trade.netPnl)
                            )}>
                                {formatCurrency(trade.netPnl)}
                            </p>
                            <p className="text-sm text-muted-foreground">
                                Net P&L
                            </p>
                        </div>
                    </div>

                    {/* Execution Rating */}
                    {trade.executionRating && (
                        <div className="flex items-center gap-1 mt-4">
              <span className="text-sm text-muted-foreground mr-1">
                Execution:
              </span>
                            {Array.from({ length: 5 }).map((_, i) => (
                                <Star
                                    key={i}
                                    size={14}
                                    className={
                                        i < trade.executionRating!
                                            ? 'fill-yellow-400 text-yellow-400'
                                            : 'text-muted-foreground'
                                    }
                                />
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>

            <Tabs defaultValue="details">
                <TabsList>
                    <TabsTrigger value="details">Details</TabsTrigger>
                    <TabsTrigger value="screenshots">
                        Screenshots ({trade.screenshots.length})
                    </TabsTrigger>
                    <TabsTrigger value="notes">Notes</TabsTrigger>
                </TabsList>

                {/* Details Tab */}
                <TabsContent value="details" className="space-y-4 mt-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Pricing */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-sm text-muted-foreground
                  uppercase tracking-wide">
                                    Pricing
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                {[
                                    {
                                        label: 'Entry Price',
                                        value: formatPrice(trade.entryPrice),
                                    },
                                    {
                                        label: 'Exit Price',
                                        value: formatPrice(trade.exitPrice),
                                    },
                                    { label: 'Quantity', value: String(trade.quantity) },
                                    {
                                        label: 'Commission',
                                        value: formatCurrency(trade.commission),
                                    },
                                    {
                                        label: 'Gross P&L',
                                        value: formatCurrency(trade.grossPnl),
                                    },
                                    {
                                        label: 'Net P&L',
                                        value: formatCurrency(trade.netPnl),
                                        highlight: true,
                                    },
                                ].map(({ label, value, highlight }) => (
                                    <div key={label}
                                         className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">
                      {label}
                    </span>
                                        <span className={cn(
                                            'text-sm font-medium',
                                            highlight && getPnlColor(trade.netPnl)
                                        )}>
                      {value ?? '—'}
                    </span>
                                    </div>
                                ))}
                            </CardContent>
                        </Card>

                        {/* Risk */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-sm text-muted-foreground
                  uppercase tracking-wide">
                                    Risk Management
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                {[
                                    {
                                        label: 'Stop Loss',
                                        value: formatPrice(trade.stopLoss),
                                    },
                                    {
                                        label: 'Take Profit',
                                        value: formatPrice(trade.takeProfit),
                                    },
                                    {
                                        label: 'Planned Risk',
                                        value: formatCurrency(trade.plannedRisk),
                                    },
                                    {
                                        label: 'Risk : Reward',
                                        value: trade.riskReward?.toFixed(2) ?? '—',
                                    },
                                    {
                                        label: 'P&L %',
                                        value: trade.pnlPercent
                                            ? `${trade.pnlPercent}%`
                                            : '—',
                                    },
                                    {
                                        label: 'Rule Violated',
                                        value: trade.isRuleViolated ? '⚠️ Yes' : '✅ No',
                                    },
                                ].map(({ label, value }) => (
                                    <div key={label}
                                         className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">
                      {label}
                    </span>
                                        <span className="text-sm font-medium">
                      {value ?? '—'}
                    </span>
                                    </div>
                                ))}
                            </CardContent>
                        </Card>

                        {/* Timing */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-sm text-muted-foreground
                  uppercase tracking-wide">
                                    Timing
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                {[
                                    {
                                        label: 'Entry',
                                        value: formatDateTime(trade.entryDate),
                                    },
                                    {
                                        label: 'Exit',
                                        value: trade.exitDate
                                            ? formatDateTime(trade.exitDate)
                                            : '—',
                                    },
                                    {
                                        label: 'Playbook',
                                        value: trade.playbookName ?? '—',
                                    },
                                    {
                                        label: 'Source',
                                        value: trade.importSource ?? 'Manual',
                                    },
                                ].map(({ label, value }) => (
                                    <div key={label}
                                         className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">
                      {label}
                    </span>
                                        <span className="text-sm font-medium">{value}</span>
                                    </div>
                                ))}
                            </CardContent>
                        </Card>

                        {/* Tags */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-sm text-muted-foreground
                  uppercase tracking-wide">
                                    Tags
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                {trade.tags.length === 0 ? (
                                    <p className="text-sm text-muted-foreground">
                                        No tags
                                    </p>
                                ) : (
                                    <div className="flex flex-wrap gap-2">
                                        {trade.tags.map((t) => (
                                            <Badge key={t.id} variant="secondary">
                                                {t.tag}
                                            </Badge>
                                        ))}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                {/* Screenshots Tab */}
                <TabsContent value="screenshots" className="mt-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center
              justify-between">
                            <CardTitle className="text-base">Screenshots</CardTitle>
                            <label className="cursor-pointer">
                                <input
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    onChange={uploadScreenshot}
                                />
                                <Button
                                    variant="outline"
                                    size="sm"
                                    disabled={uploading}
                                    asChild
                                >
                  <span>
                    <Upload className="mr-1.5 h-4 w-4" />
                      {uploading ? 'Uploading...' : 'Upload'}
                  </span>
                                </Button>
                            </label>
                        </CardHeader>
                        <CardContent>
                            {trade.screenshots.length === 0 ? (
                                <p className="text-muted-foreground text-sm py-8
                  text-center">
                                    No screenshots yet. Upload chart images for
                                    this trade.
                                </p>
                            ) : (
                                <div className="grid grid-cols-2 gap-4">
                                    {trade.screenshots.map((s) => (
                                        <div key={s.id} className="relative group">
                                            <SecureImage
                                                src={s.url}
                                                alt={s.label ?? 'Screenshot'}
                                                className="w-full rounded-lg object-cover
                          aspect-video border border-border"
                                            />
                                            {s.label && (
                                                <p className="text-xs text-muted-foreground
                          mt-1">
                                                    {s.label}
                                                </p>
                                            )}
                                            <button
                                                onClick={() => deleteScreenshot(s.id)}
                                                className="absolute top-2 right-2
                          bg-red-500 text-white rounded-md
                          px-2 py-1 text-xs opacity-0
                          group-hover:opacity-100 transition-opacity"
                                            >
                                                Delete
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Notes Tab */}
                <TabsContent value="notes" className="mt-4">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base">Trade Notes</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {trade.notes ? (
                                <p className="text-sm leading-relaxed whitespace-pre-wrap">
                                    {trade.notes}
                                </p>
                            ) : (
                                <p className="text-sm text-muted-foreground">
                                    No notes for this trade.
                                </p>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>

            <ConfirmDialog
                open={deleteOpen}
                onOpenChange={setDeleteOpen}
                title="Delete Trade"
                description="This trade will be permanently deleted."
                onConfirm={() => deleteMutation.mutate()}
                loading={deleteMutation.isPending}
            />
        </div>
    );
}