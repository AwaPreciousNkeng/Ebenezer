'use client';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2 } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
    Select, SelectContent, SelectItem,
    SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
    Card, CardContent, CardHeader, CardTitle,
} from '@/components/ui/card';
import { accountsApi } from '@/lib/api/accounts';
import { playbooksApi } from '@/lib/api/playbooks';
import type { TradeRequest } from '@/types'; // ← removed unused TradeResponse

const schema = z.object({
    accountId: z.string().min(1, 'Account is required'),
    symbol: z.string().min(1, 'Symbol is required'),
    assetClass: z.enum([
        'STOCK', 'FUTURES', 'FOREX', 'CRYPTO', 'OPTIONS',
    ]),
    direction: z.enum(['LONG', 'SHORT']),
    status: z.enum(['OPEN', 'CLOSED', 'PARTIAL']).catch('CLOSED'),
    entryPrice: z.string().or(z.number()).pipe(
        z.coerce.number().positive()
    ),
    exitPrice: z.string().or(z.number()).optional().nullable(),
    quantity: z.string().or(z.number()).pipe(
        z.coerce.number().positive()
    ),
    entryDate: z.string().min(1, 'Required'),
    exitDate: z.string().optional(),
    commission: z.string().or(z.number()).optional().nullable(),
    stopLoss: z.string().or(z.number()).optional().nullable(),
    takeProfit: z.string().or(z.number()).optional().nullable(),
    plannedRisk: z.string().or(z.number()).optional().nullable(),
    executionRating: z.string().or(z.number()).optional().nullable(),
    playbookId: z.string().optional(),
    notes: z.string().optional(),
}).superRefine((data, ctx) => {
    if (data.exitPrice && Number(data.exitPrice) <= 0) {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ['exitPrice'],
            message: 'Must be positive',
        });
    }
    if (data.stopLoss && Number(data.stopLoss) <= 0) {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ['stopLoss'],
            message: 'Must be positive',
        });
    }
    if (data.takeProfit && Number(data.takeProfit) <= 0) {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ['takeProfit'],
            message: 'Must be positive',
        });
    }
    if (data.plannedRisk && Number(data.plannedRisk) <= 0) {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ['plannedRisk'],
            message: 'Must be positive',
        });
    }
    if (data.executionRating) {
        const rating = Number(data.executionRating);
        if (rating < 1 || rating > 5) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                path: ['executionRating'],
                message: 'Must be between 1 and 5',
            });
        }
    }
});

export type TradeFormData = z.infer<typeof schema>;

interface TradeFormProps {
    defaultValues?: Partial<TradeFormData>;
    onSubmit: (data: TradeRequest) => void;
    isLoading?: boolean;
    onCancel: () => void;
}

export function TradeForm({
                              defaultValues, onSubmit, isLoading, onCancel,
                          }: TradeFormProps) {
    const { data: accounts } = useQuery({
        queryKey: ['accounts'],
        queryFn: async () => (await accountsApi.list()).data.data,
    });

    const { data: playbooks } = useQuery({
        queryKey: ['playbooks'],
        queryFn: async () => (await playbooksApi.list()).data.data,
    });

    const {
        register, handleSubmit, control,
        formState: { errors },
    } = useForm<TradeFormData>({
        resolver: zodResolver(schema),
        defaultValues,
    });

    const handleFormSubmit = (data: TradeFormData) => {
        onSubmit({
            ...data,
            status: data.status || 'CLOSED',
            entryPrice: Number(data.entryPrice),
            quantity: Number(data.quantity),
            entryDate: new Date(data.entryDate).toISOString(),
            exitDate: data.exitDate
                ? new Date(data.exitDate).toISOString()
                : undefined,
            exitPrice: data.exitPrice && data.exitPrice !== ''
                ? Number(data.exitPrice) : undefined,
            commission: data.commission && data.commission !== ''
                ? Number(data.commission) : undefined,
            stopLoss: data.stopLoss && data.stopLoss !== ''
                ? Number(data.stopLoss) : undefined,
            takeProfit: data.takeProfit && data.takeProfit !== ''
                ? Number(data.takeProfit) : undefined,
            plannedRisk: data.plannedRisk && data.plannedRisk !== ''
                ? Number(data.plannedRisk) : undefined,
            executionRating: data.executionRating && data.executionRating !== ''
                ? Number(data.executionRating) : undefined,
        } as TradeRequest);
    };

    return (
        <form
            onSubmit={handleSubmit(handleFormSubmit)}
            className="space-y-6"
        >
            {/* Core */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-sm text-muted-foreground
            uppercase tracking-wide">
                        Trade Details
                    </CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label>Account *</Label>
                        <Controller name="accountId" control={control}
                                    render={({ field }) => (
                                        <Select value={field.value}
                                                onValueChange={field.onChange}>
                                            <SelectTrigger
                                                className={errors.accountId
                                                    ? 'border-red-500' : ''}>
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
                            <p className="text-red-500 text-xs">
                                {errors.accountId.message}
                            </p>
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
                            <p className="text-red-500 text-xs">
                                {errors.symbol.message}
                            </p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <Label>Asset Class *</Label>
                        <Controller name="assetClass" control={control}
                                    render={({ field }) => (
                                        <Select value={field.value}
                                                onValueChange={field.onChange}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {[
                                                    'STOCK', 'FUTURES', 'FOREX',
                                                    'CRYPTO', 'OPTIONS',
                                                ].map((v) => (
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
                                        <Select value={field.value}
                                                onValueChange={field.onChange}>
                                            <SelectTrigger
                                                className={errors.direction
                                                    ? 'border-red-500' : ''}>
                                                <SelectValue placeholder="Long or Short" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {/* ← Fixed corrupted emoji characters */}
                                                <SelectItem value="LONG">🟢 Long</SelectItem>
                                                <SelectItem value="SHORT">🔴 Short</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    )}
                        />
                        {errors.direction && (
                            <p className="text-red-500 text-xs">
                                {errors.direction.message}
                            </p>
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* Pricing */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-sm text-muted-foreground
            uppercase tracking-wide">
                        Pricing & Timing
                    </CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label>Entry Price *</Label>
                        <Input
                            type="number" step="any" placeholder="0.00"
                            {...register('entryPrice')}
                            className={errors.entryPrice ? 'border-red-500' : ''}
                        />
                        {errors.entryPrice && (
                            <p className="text-red-500 text-xs">
                                {errors.entryPrice.message}
                            </p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <Label>Exit Price</Label>
                        <Input
                            type="number" step="any" placeholder="0.00"
                            {...register('exitPrice')}
                            className={errors.exitPrice ? 'border-red-500' : ''}
                        />
                        {errors.exitPrice && (
                            <p className="text-red-500 text-xs">
                                {errors.exitPrice.message}
                            </p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <Label>Quantity *</Label>
                        <Input
                            type="number" step="any" placeholder="0"
                            {...register('quantity')}
                            className={errors.quantity ? 'border-red-500' : ''}
                        />
                        {errors.quantity && (
                            <p className="text-red-500 text-xs">
                                {errors.quantity.message}
                            </p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <Label>Commission</Label>
                        <Input
                            type="number" step="any" placeholder="0.00"
                            {...register('commission')}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label>Entry Date *</Label>
                        <Input
                            type="datetime-local"
                            {...register('entryDate')}
                            className={errors.entryDate ? 'border-red-500' : ''}
                        />
                        {errors.entryDate && (
                            <p className="text-red-500 text-xs">
                                {errors.entryDate.message}
                            </p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <Label>Exit Date</Label>
                        <Input
                            type="datetime-local"
                            {...register('exitDate')}
                        />
                    </div>
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
                <CardContent className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                        <Label>Stop Loss</Label>
                        <Input
                            type="number" step="any" placeholder="0.00"
                            {...register('stopLoss')}
                            className={errors.stopLoss ? 'border-red-500' : ''}
                        />
                        {errors.stopLoss && (
                            <p className="text-red-500 text-xs">
                                {errors.stopLoss.message}
                            </p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <Label>Take Profit</Label>
                        <Input
                            type="number" step="any" placeholder="0.00"
                            {...register('takeProfit')}
                            className={errors.takeProfit ? 'border-red-500' : ''}
                        />
                        {errors.takeProfit && (
                            <p className="text-red-500 text-xs">
                                {errors.takeProfit.message}
                            </p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <Label>Planned Risk ($)</Label>
                        <Input
                            type="number" step="any" placeholder="0.00"
                            {...register('plannedRisk')}
                            className={errors.plannedRisk ? 'border-red-500' : ''}
                        />
                        {errors.plannedRisk && (
                            <p className="text-red-500 text-xs">
                                {errors.plannedRisk.message}
                            </p>
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* Strategy */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-sm text-muted-foreground
            uppercase tracking-wide">
                        Strategy & Notes
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Playbook</Label>
                            <Controller name="playbookId" control={control}
                                        render={({ field }) => (
                                            <Select
                                                value={field.value ?? ''}
                                                onValueChange={field.onChange}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue placeholder="None" />
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
                            {/* ← Fixed corrupted – character */}
                            <Label>Execution Rating (1–5)</Label>
                            <Input
                                type="number" min={1} max={5}
                                placeholder="1–5"
                                {...register('executionRating')}
                                className={
                                    errors.executionRating ? 'border-red-500' : ''
                                }
                            />
                            {errors.executionRating && (
                                <p className="text-red-500 text-xs">
                                    {errors.executionRating.message}
                                </p>
                            )}
                        </div>
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
                <Button
                    type="button"
                    variant="outline"
                    onClick={onCancel}
                >
                    Cancel
                </Button>
                <Button type="submit" disabled={isLoading}>
                    {isLoading && (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    Save Trade
                </Button>
            </div>
        </form>
    );
}