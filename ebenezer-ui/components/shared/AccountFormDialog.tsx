'use client';
import { useState, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Dialog, DialogContent, DialogHeader,
    DialogTitle, DialogFooter,
} from '@/components/ui/dialog';
import {
    Select, SelectContent, SelectItem,
    SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { accountsApi } from '@/lib/api/accounts';
import { useAccountStore } from '@/store/accountStore';
import type { AccountType, AccountResponse } from '@/types';

interface Props {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onCreated?: (account: AccountResponse) => void;
}

export function AccountFormDialog({ open, onOpenChange, onCreated }: Props) {
    const qc = useQueryClient();
    const { setSelectedAccount } = useAccountStore();

    const [accName, setAccName] = useState('');
    const [accBroker, setAccBroker] = useState('');
    const [accType, setAccType] = useState<AccountType>('LIVE');
    const [accCurrency, setAccCurrency] = useState('USD');

    useEffect(() => {
        if (!open) {
            setAccName('');
            setAccBroker('');
            setAccType('LIVE');
            setAccCurrency('USD');
        }
    }, [open]);

    const createMutation = useMutation({
        mutationFn: () =>
            accountsApi.create({
                accountName: accName.trim(),
                brokerName: accBroker.trim() || undefined,
                accountType: accType,
                currency: accCurrency,
            }),
        onSuccess: (res) => {
            const created = res.data.data;
            toast.success(`Account "${created.accountName}" created`);
            qc.invalidateQueries({ queryKey: ['accounts'] });
            setSelectedAccount(created);
            onCreated?.(created);
            onOpenChange(false);
        },
        onError: (err: any) => {
            toast.error(
                err.response?.data?.message ?? 'Failed to create account'
            );
        },
    });

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Add Trading Account</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-2">
                    <div className="space-y-2">
                        <Label>Account Name *</Label>
                        <Input
                            autoFocus
                            placeholder="My Live Account"
                            value={accName}
                            onChange={(e) => setAccName(e.target.value)}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label>Broker</Label>
                        <Input
                            placeholder="e.g. Interactive Brokers"
                            value={accBroker}
                            onChange={(e) => setAccBroker(e.target.value)}
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-2">
                            <Label>Type</Label>
                            <Select
                                value={accType}
                                onValueChange={(v) => setAccType(v as AccountType)}
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="LIVE">Live</SelectItem>
                                    <SelectItem value="DEMO">Demo</SelectItem>
                                    <SelectItem value="PROP">Prop Firm</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label>Currency</Label>
                            <Select value={accCurrency} onValueChange={setAccCurrency}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {['USD', 'EUR', 'GBP', 'JPY', 'CAD'].map((c) => (
                                        <SelectItem key={c} value={c}>{c}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>
                        Cancel
                    </Button>
                    <Button
                        onClick={() => createMutation.mutate()}
                        disabled={!accName.trim() || createMutation.isPending}
                    >
                        {createMutation.isPending ? 'Creating…' : 'Create Account'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
