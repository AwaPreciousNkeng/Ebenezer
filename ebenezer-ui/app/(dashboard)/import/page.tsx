'use client';
import React, { useState, useRef } from 'react';
import { Upload, FileText, CheckCircle, Loader2 } from 'lucide-react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import {
    Select, SelectContent, SelectItem,
    SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { PageHeader } from '@/components/shared/PageHeader';
import { importApi } from '@/lib/api/import';
import { accountsApi } from '@/lib/api/accounts';
import { cn } from '@/lib/utils';
import type { ImportResult } from '@/types';

const BROKERS = [
    { value: 'MT4',       label: 'MetaTrader 4' },
    { value: 'MT5',       label: 'MetaTrader 5' },
    { value: 'TRADOVATE', label: 'Tradovate' },
    { value: 'IBKR',      label: 'Interactive Brokers' },
    { value: 'WEBULL',    label: 'Webull' },
    { value: 'GENERIC',   label: 'Generic CSV' },
];

export default function ImportPage() {
    const qc = useQueryClient();
    const fileRef = useRef<HTMLInputElement>(null);
    const [file, setFile] = useState<File | null>(null);
    const [accountId, setAccountId] = useState('');
    const [broker, setBroker] = useState('');
    const [result, setResult] = useState<ImportResult | null>(null);
    const [dragging, setDragging] = useState(false);

    const { data: accounts, isLoading: isLoadingAccounts } = useQuery({
        queryKey: ['accounts'],
        queryFn: async () => (await accountsApi.list()).data.data,
    });

    const mutation = useMutation({
        mutationFn: () => importApi.csv(file!, accountId, broker),
        onSuccess: async (res) => {
            setResult(res.data.data);
            toast.success('Import completed!');
            setFile(null); // Clear file so they can import another
            await qc.invalidateQueries({ queryKey: ['trades'] }); // Promise handled!
        },
        onError: (err: any) =>
            toast.error(err.response?.data?.message || 'Import failed'),
    });

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setDragging(false);
        const dropped = e.dataTransfer.files[0];
        // Convert to lowercase to catch .CSV as well as .csv
        if (dropped?.name.toLowerCase().endsWith('.csv')) {
            setFile(dropped);
            setResult(null); // Reset previous results if uploading a new file
        } else {
            toast.error('Please drop a CSV file');
        }
    };

    const canSubmit = file && accountId && broker;

    return (
        <div className="max-w-2xl space-y-6">
            <PageHeader
                title="Import Trades"
                description="Upload a CSV file from your broker"
            />

            <Card>
                <CardHeader>
                    <CardTitle className="text-base">Upload Settings</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Account *</Label>
                            <Select
                                value={accountId}
                                onValueChange={setAccountId}
                                disabled={isLoadingAccounts}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder={isLoadingAccounts ? "Loading..." : "Select account"} />
                                </SelectTrigger>
                                <SelectContent>
                                    {accounts?.map((a) => (
                                        <SelectItem key={a.id} value={a.id}>
                                            {a.accountName}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label>Broker / Format *</Label>
                            <Select value={broker} onValueChange={setBroker}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select broker" />
                                </SelectTrigger>
                                <SelectContent>
                                    {BROKERS.map((b) => (
                                        <SelectItem key={b.value} value={b.value}>
                                            {b.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    {/* Drop Zone */}
                    <div
                        onDragOver={(e) => {
                            e.preventDefault();
                            setDragging(true);
                        }}
                        onDragLeave={() => setDragging(false)}
                        onDrop={handleDrop}
                        onClick={() => fileRef.current?.click()}
                        className={cn(
                            'border-2 border-dashed rounded-xl p-10',
                            'flex flex-col items-center justify-center gap-3',
                            'cursor-pointer transition-colors',
                            dragging
                                ? 'border-primary bg-primary/5'
                                : 'border-border hover:border-muted-foreground'
                        )}
                    >
                        <input
                            ref={fileRef}
                            type="file"
                            accept=".csv"
                            className="hidden"
                            onChange={(e) => {
                                const f = e.target.files?.[0];
                                if (f) {
                                    setFile(f);
                                    setResult(null);
                                }
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
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setFile(null);
                                    }}
                                >
                                    Remove
                                </Button>
                            </>
                        ) : (
                            <>
                                <Upload className="w-10 h-10 text-muted-foreground" />
                                <div className="text-center">
                                    <p className="font-medium">
                                        Drop your CSV here
                                    </p>
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
                        {mutation.isPending && (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        )}
                        Import Trades
                    </Button>
                </CardContent>
            </Card>

            {/* Result */}
            {result && (
                <Card className="border-emerald-500/30 bg-emerald-500/5">
                    <CardContent className="p-6">
                        <div className="flex items-center gap-3 mb-4">
                            <CheckCircle className="w-6 h-6 text-emerald-500" />
                            <h3 className="font-semibold">Import Complete</h3>
                        </div>
                        <div className="grid grid-cols-3 gap-4 text-center">
                            {[
                                { label: 'Total Rows', value: result.totalRows,
                                    color: 'text-foreground' },
                                { label: 'Imported', value: result.imported,
                                    color: 'text-emerald-500' },
                                { label: 'Skipped', value: result.skipped,
                                    color: 'text-yellow-500' },
                            ].map(({ label, value, color }) => (
                                <div key={label} className="p-3 rounded-lg bg-background">
                                    <p className={`text-2xl font-bold ${color}`}>
                                        {value}
                                    </p>
                                    <p className="text-sm text-muted-foreground">
                                        {label}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Format Guide */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-sm text-muted-foreground uppercase tracking-wide">
                        Generic CSV Format
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <code className="text-xs bg-muted p-3 rounded-lg block overflow-x-auto whitespace-nowrap">
                        symbol, direction, quantity, entryPrice, exitPrice, entryDate, exitDate, commission, assetClass
                    </code>
                    <p className="text-xs text-muted-foreground mt-2">
                        Date format: ISO 8601 — e.g.{' '}
                        <code>2024-01-15T09:30:00+00:00</code>
                    </p>
                </CardContent>
            </Card>
        </div>
    );
}