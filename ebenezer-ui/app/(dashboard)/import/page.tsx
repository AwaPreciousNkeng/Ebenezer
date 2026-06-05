'use client';
import React, { useState, useRef } from 'react';
import {
    Upload, FileText, CheckCircle2, XCircle,
    Loader2, AlertCircle,
} from 'lucide-react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import {
    Select, SelectContent, SelectItem,
    SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { PageHeader } from '@/components/shared/PageHeader';
import { importApi } from '@/lib/api/import';
import { accountsApi } from '@/lib/api/accounts';
import { cn, formatDate } from '@/lib/utils';
import type { ImportBatch } from '@/types';

export default function ImportPage() {
    const qc = useQueryClient();
    const fileRef = useRef<HTMLInputElement>(null);
    const [file, setFile] = useState<File | null>(null);
    const [accountId, setAccountId] = useState('');
    const [result, setResult] = useState<ImportBatch | null>(null);
    const [dragging, setDragging] = useState(false);

    const { data: accounts, isLoading: isLoadingAccounts } = useQuery({
        queryKey: ['accounts'],
        queryFn: async () => (await accountsApi.list()).data.data,
    });

    const mutation = useMutation({
        mutationFn: () => importApi.statement(file!, accountId),
        onSuccess: async (res) => {
            setResult(res.data);
            toast.success('Statement imported successfully');
            setFile(null);
            await qc.invalidateQueries({ queryKey: ['trades'] });
        },
        onError: (err: any) =>
            toast.error(err.response?.data?.message || 'Import failed'),
    });

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setDragging(false);
        const dropped = e.dataTransfer.files[0];
        if (dropped?.name.toLowerCase().endsWith('.pdf')) {
            setFile(dropped);
            setResult(null);
        } else {
            toast.error('Please drop a PDF file');
        }
    };

    const canSubmit = file && accountId;

    const statusBadge = (status: ImportBatch['status']) => {
        const map = {
            COMPLETED: { label: 'Completed', className: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20' },
            PROCESSING: { label: 'Processing', className: 'bg-blue-500/10 text-blue-600 border-blue-500/20' },
            FAILED:     { label: 'Failed',     className: 'bg-red-500/10 text-red-600 border-red-500/20' },
        };
        const { label, className } = map[status] ?? map.FAILED;
        return <Badge className={cn('border', className)}>{label}</Badge>;
    };

    return (
        <div className="max-w-2xl space-y-6">
            <PageHeader
                title="Import Statement"
                description="Upload your Exness trading statement (PDF)"
            />

            <Card>
                <CardHeader>
                    <CardTitle className="text-base">Upload Settings</CardTitle>
                </CardHeader>
                <CardContent className="space-y-5">
                    <div className="space-y-2">
                        <Label>Account *</Label>
                        <Select
                            value={accountId}
                            onValueChange={setAccountId}
                            disabled={isLoadingAccounts}
                        >
                            <SelectTrigger>
                                <SelectValue
                                    placeholder={
                                        isLoadingAccounts ? 'Loading...' : 'Select account'
                                    }
                                />
                            </SelectTrigger>
                            <SelectContent>
                                {accounts?.map((a) => (
                                    <SelectItem key={a.id} value={a.id}>
                                        <span>{a.accountName}</span>
                                        <span className="ml-2 text-xs text-muted-foreground">
                                            {a.brokerName ?? a.accountType} · {a.currency}
                                        </span>
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Drop Zone */}
                    <div
                        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
                        onDragLeave={() => setDragging(false)}
                        onDrop={handleDrop}
                        onClick={() => fileRef.current?.click()}
                        className={cn(
                            'border-2 border-dashed rounded-xl p-10',
                            'flex flex-col items-center justify-center gap-3',
                            'cursor-pointer transition-colors',
                            dragging
                                ? 'border-primary bg-primary/5'
                                : 'border-border hover:border-muted-foreground/50'
                        )}
                    >
                        <input
                            ref={fileRef}
                            type="file"
                            accept=".pdf"
                            className="hidden"
                            onChange={(e) => {
                                const f = e.target.files?.[0];
                                if (f) { setFile(f); setResult(null); }
                            }}
                        />
                        {file ? (
                            <>
                                <FileText className="w-10 h-10 text-primary" />
                                <p className="font-medium">{file.name}</p>
                                <p className="text-sm text-muted-foreground">
                                    {(file.size / 1024).toFixed(1)} KB
                                </p>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={(e) => { e.stopPropagation(); setFile(null); }}
                                >
                                    Remove
                                </Button>
                            </>
                        ) : (
                            <>
                                <Upload className="w-10 h-10 text-muted-foreground" />
                                <div className="text-center">
                                    <p className="font-medium">Drop your PDF here</p>
                                    <p className="text-sm text-muted-foreground">
                                        or click to browse files
                                    </p>
                                </div>
                            </>
                        )}
                    </div>

                    <Button
                        className="w-full"
                        disabled={!canSubmit || mutation.isPending}
                        onClick={() => mutation.mutate()}
                    >
                        {mutation.isPending
                            ? <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            : <Upload className="mr-2 h-4 w-4" />}
                        {mutation.isPending ? 'Importing...' : 'Import Statement'}
                    </Button>
                </CardContent>
            </Card>

            {/* Result */}
            {result && (
                <Card className={cn(
                    'border',
                    result.status === 'COMPLETED'
                        ? 'border-emerald-500/30 bg-emerald-500/5'
                        : result.status === 'FAILED'
                            ? 'border-red-500/30 bg-red-500/5'
                            : 'border-blue-500/30 bg-blue-500/5'
                )}>
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between mb-5">
                            <div className="flex items-center gap-3">
                                {result.status === 'COMPLETED'
                                    ? <CheckCircle2 className="w-6 h-6 text-emerald-500" />
                                    : result.status === 'FAILED'
                                        ? <XCircle className="w-6 h-6 text-red-500" />
                                        : <Loader2 className="w-6 h-6 text-blue-500 animate-spin" />}
                                <div>
                                    <p className="font-semibold">Import Result</p>
                                    <p className="text-xs text-muted-foreground truncate max-w-xs">
                                        {result.filename}
                                    </p>
                                </div>
                            </div>
                            {statusBadge(result.status)}
                        </div>

                        <div className="grid grid-cols-3 gap-3 text-center">
                            {[
                                {
                                    label: 'Imported',
                                    value: result.rowCount - result.rejectedCount,
                                    color: 'text-emerald-500',
                                },
                                {
                                    label: 'Rejected',
                                    value: result.rejectedCount,
                                    color: result.rejectedCount > 0
                                        ? 'text-yellow-500' : 'text-muted-foreground',
                                },
                                {
                                    label: 'Total Rows',
                                    value: result.rowCount,
                                    color: 'text-foreground',
                                },
                            ].map(({ label, value, color }) => (
                                <div key={label}
                                     className="p-3 rounded-lg bg-background/60 border border-border">
                                    <p className={cn('text-2xl font-bold', color)}>
                                        {value}
                                    </p>
                                    <p className="text-xs text-muted-foreground mt-0.5">
                                        {label}
                                    </p>
                                </div>
                            ))}
                        </div>

                        <p className="text-xs text-muted-foreground mt-4 text-right">
                            Imported {formatDate(result.importedAt)}
                        </p>
                    </CardContent>
                </Card>
            )}

            {/* Info */}
            <Card>
                <CardContent className="p-5">
                    <div className="flex gap-3">
                        <AlertCircle className="w-5 h-5 text-muted-foreground shrink-0 mt-0.5" />
                        <div className="space-y-1">
                            <p className="text-sm font-medium">Supported format</p>
                            <p className="text-sm text-muted-foreground">
                                Exness account statements in PDF format. Download your
                                statement from the Exness Personal Area under{' '}
                                <span className="font-medium text-foreground">
                                    Reports → Account History
                                </span>.
                            </p>
                            <p className="text-sm text-muted-foreground">
                                Duplicate trades are automatically detected and skipped.
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
