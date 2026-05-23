'use client';
import { useState, useRef } from 'react';
import { Camera, Save, Plus, Loader2, Trash2 } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Card, CardContent, CardHeader, CardTitle,
} from '@/components/ui/card';
import {
    Select, SelectContent, SelectItem,
    SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
    Dialog, DialogContent, DialogHeader,
    DialogTitle, DialogFooter,
} from '@/components/ui/dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { PageHeader } from '@/components/shared/PageHeader';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import { authApi } from '@/lib/api/auth';
import { accountsApi } from '@/lib/api/accounts';
import { useAuthStore } from '@/store/authStore';
import type { AccountType } from '@/types';

export default function SettingsPage() {
    const qc = useQueryClient();
    const { user, setUser } = useAuthStore();
    const fileRef = useRef<HTMLInputElement>(null);

    // Profile
    const [fullName, setFullName] = useState(user?.fullName ?? '');
    const [timezone, setTimezone] = useState(user?.timezone ?? 'UTC');

    // Password
    const [currentPw, setCurrentPw] = useState('');
    const [newPw, setNewPw] = useState('');

    // Account dialog
    const [accountOpen, setAccountOpen] = useState(false);
    const [accName, setAccName] = useState('');
    const [accBroker, setAccBroker] = useState('');
    const [accType, setAccType] = useState<AccountType>('LIVE');
    const [accCurrency, setAccCurrency] = useState('USD');
    const [deleteAccId, setDeleteAccId] = useState<string | null>(null);

    const { data: accounts } = useQuery({
        queryKey: ['accounts'],
        queryFn: async () => (await accountsApi.list()).data.data,
    });

    const updateProfileMutation = useMutation({
        mutationFn: () => authApi.updateProfile({ fullName, timezone }),
        onSuccess: (res) => {
            setUser(res.data.data);
            toast.success('Profile updated');
        },
        onError: () => toast.error('Failed to update profile'),
    });

    const uploadAvatarMutation = useMutation({
        mutationFn: (file: File) => authApi.uploadAvatar(file),
        onSuccess: (res) => {
            setUser(res.data.data);
            toast.success('Avatar updated');
        },
        onError: () => toast.error('Failed to upload avatar'),
    });

    const changePwMutation = useMutation({
        mutationFn: () =>
            authApi.changePassword({
                currentPassword: currentPw,
                newPassword: newPw,
            }),
        onSuccess: () => {
            toast.success('Password changed');
            setCurrentPw('');
            setNewPw('');
        },
        onError: (err: any) =>
            toast.error(err.response?.data?.message || 'Failed to change password'),
    });

    const createAccountMutation = useMutation({
        mutationFn: () =>
            accountsApi.create({
                accountName: accName,
                brokerName: accBroker,
                accountType: accType,
                currency: accCurrency,
            }),
        onSuccess: () => {
            toast.success('Account created');
            qc.invalidateQueries({ queryKey: ['accounts'] });
            setAccountOpen(false);
            setAccName('');
            setAccBroker('');
        },
        onError: () => toast.error('Failed to create account'),
    });

    const deleteAccountMutation = useMutation({
        mutationFn: (id: string) => accountsApi.delete(id),
        onSuccess: () => {
            toast.success('Account deleted');
            qc.invalidateQueries({ queryKey: ['accounts'] });
            setDeleteAccId(null);
        },
    });

    const initials = user?.fullName
        ?.split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase() ?? 'U';

    return (
        <div className="max-w-2xl space-y-6">
            <PageHeader
                title="Settings"
                description="Manage your account and preferences"
            />

            {/* Profile */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-base">Profile</CardTitle>
                </CardHeader>
                <CardContent className="space-y-5">
                    <div className="flex items-center gap-4">
                        <div className="relative">
                            <Avatar className="h-16 w-16">
                                <AvatarImage src={user?.avatarUrl} />
                                <AvatarFallback className="text-lg bg-primary
                  text-primary-foreground">
                                    {initials}
                                </AvatarFallback>
                            </Avatar>
                            <button
                                onClick={() => fileRef.current?.click()}
                                className="absolute -bottom-1 -right-1 w-6 h-6
                  rounded-full bg-primary text-primary-foreground
                  flex items-center justify-center"
                            >
                                <Camera size={12} />
                            </button>
                            <input
                                ref={fileRef}
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={(e) => {
                                    const f = e.target.files?.[0];
                                    if (f) uploadAvatarMutation.mutate(f);
                                }}
                            />
                        </div>
                        <div>
                            <p className="font-semibold">{user?.fullName}</p>
                            <p className="text-sm text-muted-foreground">
                                {user?.email}
                            </p>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Full Name</Label>
                            <Input
                                value={fullName}
                                onChange={(e) => setFullName(e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Timezone</Label>
                            <Select value={timezone}
                                    onValueChange={setTimezone}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {[
                                        'UTC', 'America/New_York',
                                        'America/Chicago', 'America/Los_Angeles',
                                        'Europe/London', 'Europe/Paris',
                                        'Asia/Tokyo', 'Asia/Shanghai',
                                    ].map((tz) => (
                                        <SelectItem key={tz} value={tz}>{tz}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <Button
                        onClick={() => updateProfileMutation.mutate()}
                        disabled={updateProfileMutation.isPending}
                    >
                        {updateProfileMutation.isPending
                            ? <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            : <Save className="mr-2 h-4 w-4" />}
                        Save Changes
                    </Button>
                </CardContent>
            </Card>

            {/* Password */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-base">Change Password</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label>Current Password</Label>
                        <Input
                            type="password"
                            value={currentPw}
                            onChange={(e) => setCurrentPw(e.target.value)}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label>New Password</Label>
                        <Input
                            type="password"
                            value={newPw}
                            onChange={(e) => setNewPw(e.target.value)}
                        />
                    </div>
                    <Button
                        onClick={() => changePwMutation.mutate()}
                        disabled={
                            !currentPw || !newPw || changePwMutation.isPending
                        }
                    >
                        {changePwMutation.isPending && (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        )}
                        Update Password
                    </Button>
                </CardContent>
            </Card>

            {/* Trading Accounts */}
            <Card>
                <CardHeader className="flex flex-row items-center
          justify-between">
                    <CardTitle className="text-base">Trading Accounts</CardTitle>
                    <Button size="sm" onClick={() => setAccountOpen(true)}>
                        <Plus className="mr-1.5 h-4 w-4" />
                        Add Account
                    </Button>
                </CardHeader>
                <CardContent>
                    <div className="space-y-2">
                        {accounts?.map((acc) => (
                            <div key={acc.id}
                                 className="flex items-center justify-between
                  p-3 rounded-lg border border-border">
                                <div className="flex items-center gap-3">
                  <span className={`w-2.5 h-2.5 rounded-full ${
                      acc.accountType === 'LIVE'
                          ? 'bg-emerald-500'
                          : acc.accountType === 'PROP'
                              ? 'bg-yellow-500'
                              : 'bg-blue-500'
                  }`} />
                                    <div>
                                        <p className="text-sm font-medium">
                                            {acc.accountName}
                                        </p>
                                        <p className="text-xs text-muted-foreground">
                                            {acc.brokerName ?? acc.accountType} •{' '}
                                            {acc.currency}
                                        </p>
                                    </div>
                                </div>
                                <Button
                                    variant="ghost" size="icon"
                                    className="h-7 w-7 text-muted-foreground
                    hover:text-red-500"
                                    onClick={() => setDeleteAccId(acc.id)}
                                >
                                    <Trash2 size={13} />
                                </Button>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {/* New Account Dialog */}
            <Dialog open={accountOpen}
                    onOpenChange={(o) => !o && setAccountOpen(false)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Add Trading Account</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-2">
                        <div className="space-y-2">
                            <Label>Account Name *</Label>
                            <Input
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
                                <Select value={accType}
                                        onValueChange={(v) => setAccType(v as AccountType)}>
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
                                <Select value={accCurrency}
                                        onValueChange={setAccCurrency}>
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
                        <Button variant="outline"
                                onClick={() => setAccountOpen(false)}>
                            Cancel
                        </Button>
                        <Button
                            onClick={() => createAccountMutation.mutate()}
                            disabled={!accName || createAccountMutation.isPending}
                        >
                            {createAccountMutation.isPending
                                ? 'Creating...' : 'Create Account'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <ConfirmDialog
                open={!!deleteAccId}
                onOpenChange={(o) => !o && setDeleteAccId(null)}
                title="Delete Account"
                description="All trades in this account will also be deleted."
                onConfirm={() =>
                    deleteAccId && deleteAccountMutation.mutate(deleteAccId)
                }
                loading={deleteAccountMutation.isPending}
            />
        </div>
    );
}