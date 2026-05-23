'use client';

import { useRouter } from 'next/navigation';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
    Select, SelectContent, SelectItem,
    SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PageHeader } from '@/components/shared/PageHeader';

import { tradesApi } from '@/lib/api/trades';
import { playbooksApi } from '@/lib/api/playbooks';
import { accountsApi } from '@/lib/api/accounts';
import type { TradeRequest } from '@/types';

// Helper to convert empty string inputs back to true undefined
const emptyToUndefined = z.literal('').transform(() => undefined);

const schema = z.object({
    accountId: z.string().min(1, 'Account is required'),
    symbol: z.string().min(1, 'Symbol is required'),
    assetClass: z.enum(['STOCK', 'FUTURES', 'FOREX', 'CRYPTO', 'OPTIONS']),
    direction: z.enum(['LONG', 'SHORT']),
    status: z.enum(['OPEN', 'CLOSED', 'PARTIAL']),

    entryPrice: z.coerce.number().positive('Must be positive'),
    quantity: z.coerce.number().positive('Must be positive'),

    // Union checks if it's a valid number OR an empty string/undefined, properly outputting number | undefined
    exitPrice: z.union([z.coerce.number().positive(), emptyToUndefined, z.undefined()]),
    stopLoss: z.union([z.coerce.number().positive(), emptyToUndefined, z.undefined()]),
    takeProfit: z.union([z.coerce.number().positive(), emptyToUndefined, z.undefined()]),
    plannedRisk: z.union([z.coerce.number().positive(), emptyToUndefined, z.undefined()]),

    commission: z.union([z.coerce.number().min(0), emptyToUndefined, z.undefined()]),
    executionRating: z.union([z.coerce.number().min(1).max(5), emptyToUndefined, z.undefined()]),

    entryDate: z.string().min(1, 'Required'),
    exitDate: z.union([z.string().min(1), emptyToUndefined, z.undefined()]),
    playbookId: z.union([z.string().min(1), emptyToUndefined, z.undefined()]),
    notes: z.string().optional(),
});

// 1. Differentiate between Raw Input (what RHF handles) and Output (what SubmitHandler receives)
type FormInput = z.input<typeof schema>;
type FormOutput = z.output<typeof schema>;

export default function NewTradePage() {
    const router = useRouter();
    const qc = useQueryClient();

    const { data: accounts } = useQuery({
        queryKey: ['accounts'],
        queryFn: async () => (await accountsApi.list()).data.data,
    });

    const { data: playbooks } = useQuery({
        queryKey: ['playbooks'],
        queryFn: async () => (await playbooksApi.list()).data.data,
    });

    // 2. Explicitly type useForm<Input, Context, Output> to eliminate TS2322 & TS2345
    const {
        register, handleSubmit, control,
        formState: { errors },
    } = useForm<FormInput, any, FormOutput>({
        resolver: zodResolver(schema),
        defaultValues: {
            status: 'CLOSED',
            direction: 'LONG',
            assetClass: 'STOCK',
            symbol: '',
            accountId: '',
            entryDate: '',
            notes: '',
        }
    });

    const mutation = useMutation({
        mutationFn: (data: TradeRequest) => tradesApi.create(data),
        onSuccess: async () => {
            toast.success('Trade added successfully');
            await qc.invalidateQueries({ queryKey: ['trades'] });
            router.push('/trades');
        },
        onError: () => toast.error('Failed to add trade'),
    });

    // 3. onSubmit now correctly accepts FormOutput
    const onSubmit = (data: FormOutput) => {
        mutation.mutate({
            ...data,
            entryDate: new Date(data.entryDate).toISOString(),
            exitDate: data.exitDate ? new Date(data.exitDate).toISOString() : undefined,
        } as TradeRequest);
    };

    return (
        <div className="max-w-3xl">
            <PageHeader
                title="Add Trade"
                description="Log a new trade entry"
                action={
                    <Button variant="outline" onClick={() => router.back()}>
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back
                    </Button>
                }
            />

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                {/* Core Info */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                            Trade Details
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Account *</Label>
                            <Controller name="accountId" control={control}
                                        render={({ field }) => (
                                            <Select value={field.value} onValueChange={field.onChange}>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select account" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {accounts?.map((a) => (
                                                        <SelectItem key={a.id} value={a.id}>
                                                            {a.accountName}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        )}
                            />
                            {errors.accountId && (
                                <p className="text-red-500 text-xs">{errors.accountId.message}</p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label>Symbol *</Label>
                            <Input
                                placeholder="AAPL, ES, EURUSD..."
                                {...register('symbol')}
                                className={errors.symbol ? 'border-red-500' : ''}
                            />
                            {errors.symbol && (
                                <p className="text-red-500 text-xs">{errors.symbol.message}</p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label>Asset Class *</Label>
                            <Controller name="assetClass" control={control}
                                        render={({ field }) => (
                                            <Select value={field.value} onValueChange={field.onChange}>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select class" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {['STOCK', 'FUTURES', 'FOREX', 'CRYPTO', 'OPTIONS'].map((v) => (
                                                        <SelectItem key={v} value={v}>{v}</SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        )}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label>Direction *</Label>
                            <Controller name="direction" control={control}
                                        render={({ field }) => (
                                            <Select value={field.value} onValueChange={field.onChange}>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Long or Short" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="LONG">Long</SelectItem>
                                                    <SelectItem value="SHORT">Short</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        )}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label>Status</Label>
                            <Controller name="status" control={control}
                                        render={({ field }) => (
                                            <Select value={field.value} onValueChange={field.onChange}>
                                                <SelectTrigger>
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="CLOSED">Closed</SelectItem>
                                                    <SelectItem value="OPEN">Open</SelectItem>
                                                    <SelectItem value="PARTIAL">Partial</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        )}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label>Execution Rating (1-5)</Label>
                            <Input
                                type="number" min={1} max={5}
                                placeholder="1-5"
                                {...register('executionRating')}
                            />
                        </div>
                    </CardContent>
                </Card>

                {/* Pricing */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                            Pricing & Timing
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Entry Price *</Label>
                            <Input type="number" step="any" placeholder="0.00"
                                   {...register('entryPrice')}
                                   className={errors.entryPrice ? 'border-red-500' : ''}
                            />
                            {errors.entryPrice && (
                                <p className="text-red-500 text-xs">{errors.entryPrice.message}</p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label>Exit Price</Label>
                            <Input type="number" step="any" placeholder="0.00" {...register('exitPrice')} />
                        </div>

                        <div className="space-y-2">
                            <Label>Quantity *</Label>
                            <Input type="number" step="any" placeholder="0"
                                   {...register('quantity')}
                                   className={errors.quantity ? 'border-red-500' : ''}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label>Commission</Label>
                            <Input type="number" step="any" placeholder="0.00" {...register('commission')} />
                        </div>

                        <div className="space-y-2">
                            <Label>Entry Date *</Label>
                            <Input type="datetime-local"
                                   {...register('entryDate')}
                                   className={errors.entryDate ? 'border-red-500' : ''}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label>Exit Date</Label>
                            <Input type="datetime-local" {...register('exitDate')} />
                        </div>
                    </CardContent>
                </Card>

                {/* Risk Management */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                            Risk Management
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="grid grid-cols-3 gap-4">
                        <div className="space-y-2">
                            <Label>Stop Loss</Label>
                            <Input type="number" step="any" placeholder="0.00" {...register('stopLoss')} />
                        </div>
                        <div className="space-y-2">
                            <Label>Take Profit</Label>
                            <Input type="number" step="any" placeholder="0.00" {...register('takeProfit')} />
                        </div>
                        <div className="space-y-2">
                            <Label>Planned Risk ($)</Label>
                            <Input type="number" step="any" placeholder="0.00" {...register('plannedRisk')} />
                        </div>
                    </CardContent>
                </Card>

                {/* Strategy & Notes */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                            Strategy & Notes
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label>Playbook</Label>
                            <Controller name="playbookId" control={control}
                                        render={({ field }) => (
                                            <Select value={field.value ?? ''} onValueChange={field.onChange}>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Link to playbook (optional)" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="">None</SelectItem>
                                                    {playbooks?.map((p) => (
                                                        <SelectItem key={p.id} value={p.id}>
                                                            {p.name}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        )}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label>Notes</Label>
                            <Textarea
                                placeholder="What was your thesis? What went well?"
                                rows={4}
                                {...register('notes')}
                            />
                        </div>
                    </CardContent>
                </Card>

                <div className="flex gap-3 justify-end">
                    <Button type="button" variant="outline" onClick={() => router.back()}>
                        Cancel
                    </Button>
                    <Button type="submit" disabled={mutation.isPending}>
                        {mutation.isPending && (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        )}
                        Save Trade
                    </Button>
                </div>
            </form>
        </div>
    );
}