'use client';
import {useEffect, useState} from 'react';
import {useRouter} from 'next/navigation';
import {
    Sun, Moon, LogOut,
    User, ChevronDown, Plus,
} from 'lucide-react';
import {useTheme} from 'next-themes';
import {toast} from 'sonner';
import {useQuery, useQueryClient} from '@tanstack/react-query';
import {Button} from '@/components/ui/button';
import {
    DropdownMenu, DropdownMenuContent,
    DropdownMenuItem, DropdownMenuLabel,
    DropdownMenuSeparator, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    Select, SelectContent, SelectItem,
    SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {Avatar, AvatarFallback, AvatarImage} from '@/components/ui/avatar';
import {MobileSidebar} from '@/components/layout/MobileSidebar';
import {AccountFormDialog} from '@/components/shared/AccountFormDialog';
import {useAuthStore} from '@/store/authStore';
import {useAccountStore} from '@/store/accountStore';
import {accountsApi} from '@/lib/api/accounts';
import {authApi} from '@/lib/api/auth';
import {cn} from '@/lib/utils';

export function Header() {
    const router = useRouter();
    const {theme, setTheme} = useTheme();
    const {user, clearAuth} = useAuthStore();
    const {
        accounts,
        selectedAccount,
        setAccounts,
        setSelectedAccount,
    } = useAccountStore();
    const [accountDialogOpen, setAccountDialogOpen] = useState(false);

    const qc = useQueryClient();

    // ─── Fetch accounts and sync to store ─────────────────
    const {data: fetchedAccounts, isLoading} = useQuery({
        queryKey: ['accounts'],
        queryFn: async () => {
            const res = await accountsApi.list();
            return res.data.data;
        },
        // Refetch every time window gets focus
        // so Settings changes are reflected immediately
        refetchOnWindowFocus: true,
        staleTime: 0,
    });

    // ─── Sync fetched accounts into Zustand store ──────────
    useEffect(() => {
        if (!fetchedAccounts) return;

        setAccounts(fetchedAccounts);

        // Auto-select first account if none selected
        // or if the selected account no longer exists
        const stillExists = fetchedAccounts.find(
            (a) => a.id === selectedAccount?.id
        );

        if (!stillExists && fetchedAccounts.length > 0) {
            setSelectedAccount(fetchedAccounts[0]);
        }

        // If no accounts exist, clear selection
        if (fetchedAccounts.length === 0) {
            setSelectedAccount(null);
        }
    }, [fetchedAccounts, selectedAccount, setAccounts, setSelectedAccount]);

    const handleLogout = async () => {
        try {
            await authApi.logout();
        } finally {
            clearAuth();
            router.push('/login');
            toast.success('Logged out successfully');
        }
    };

    const handleAccountChange = (accountId: string) => {
        const account = accounts.find((a) => a.id === accountId);
        if (account) {
            setSelectedAccount(account);
            // Invalidate all data that depends on account
            qc.invalidateQueries({queryKey: ['trades']});
            qc.invalidateQueries({queryKey: ['analytics-summary']});
            qc.invalidateQueries({queryKey: ['equity-curve']});
            qc.invalidateQueries({queryKey: ['pnl-symbol']});
            qc.invalidateQueries({queryKey: ['pnl-day']});
            qc.invalidateQueries({queryKey: ['drawdown']});
            qc.invalidateQueries({queryKey: ['streak']});
        }
    };

    const initials = user?.fullName
        ?.split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2) ?? 'U';

    const accountTypeColor = (type: string) => {
        switch (type) {
            case 'LIVE':
                return 'bg-emerald-500';
            case 'PROP':
                return 'bg-yellow-500';
            case 'DEMO':
                return 'bg-blue-500';
            default:
                return 'bg-muted';
        }
    };

    return (
        <header className="h-16 border-b border-border bg-card
      flex items-center justify-between px-6 shrink-0">

            {/* ── Account Selector ───────────────────────────── */}
            <div className="flex items-center gap-2">
                <MobileSidebar />
                {isLoading ? (
                    <div className="h-9 w-48 rounded-lg bg-muted
            animate-pulse"/>
                ) : accounts.length === 0 ? (
                    // No accounts yet — prompt to create one
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setAccountDialogOpen(true)}
                        className="text-muted-foreground"
                    >
                        <Plus className="mr-1.5 h-4 w-4"/>
                        Add Account
                    </Button>
                ) : (
                    <>
                    <Select
                        value={selectedAccount?.id ?? ''}
                        onValueChange={handleAccountChange}
                    >
                        <SelectTrigger className="w-52">
                            <SelectValue placeholder="Select account">
                                {selectedAccount && (
                                    <div className="flex items-center gap-2">
                    <span className={cn(
                        'w-2 h-2 rounded-full shrink-0',
                        accountTypeColor(selectedAccount.accountType)
                    )}/>
                                        <span className="truncate">
                      {selectedAccount.accountName}
                    </span>
                                        <span className="text-xs text-muted-foreground
                      shrink-0">
                      {selectedAccount.currency}
                    </span>
                                    </div>
                                )}
                            </SelectValue>
                        </SelectTrigger>
                        <SelectContent>
                            {accounts.map((acc) => (
                                <SelectItem key={acc.id} value={acc.id}>
                                    <div className="flex items-center gap-2">
                    <span className={cn(
                        'w-2 h-2 rounded-full shrink-0',
                        accountTypeColor(acc.accountType)
                    )}/>
                                        <span>{acc.accountName}</span>
                                        <span className="text-xs text-muted-foreground ml-1">
                      {acc.accountType} · {acc.currency}
                    </span>
                                    </div>
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setAccountDialogOpen(true)}
                        title="Add account"
                    >
                        <Plus size={16}/>
                    </Button>
                    </>
                )}
            </div>

            {/* ── Right Side ────────────────────────────────── */}
            <div className="flex items-center gap-2">
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={() =>
                        setTheme(theme === 'dark' ? 'light' : 'dark')
                    }
                >
                    {theme === 'dark'
                        ? <Sun size={18}/>
                        : <Moon size={18}/>}
                </Button>

                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button
                            variant="ghost"
                            className="flex items-center gap-2 px-2"
                        >
                            <Avatar className="h-8 w-8">
                                <AvatarImage src={user?.avatarUrl}/>
                                <AvatarFallback className="bg-primary
                  text-primary-foreground text-xs">
                                    {initials}
                                </AvatarFallback>
                            </Avatar>
                            <div className="hidden md:block text-left">
                                <p className="text-sm font-medium leading-none">
                                    {user?.fullName}
                                </p>
                                <p className="text-xs text-muted-foreground mt-0.5">
                                    {user?.email}
                                </p>
                            </div>
                            <ChevronDown size={14}
                                         className="text-muted-foreground"/>
                        </Button>
                    </DropdownMenuTrigger>

                    <DropdownMenuContent align="end" className="w-48">
                        <DropdownMenuLabel>My Account</DropdownMenuLabel>
                        <DropdownMenuSeparator/>
                        <DropdownMenuItem
                            onClick={() => router.push('/settings')}
                        >
                            <User className="mr-2 h-4 w-4"/>
                            Settings
                        </DropdownMenuItem>
                        <DropdownMenuSeparator/>
                        <DropdownMenuItem
                            onClick={handleLogout}
                            className="text-red-500 focus:text-red-500"
                        >
                            <LogOut className="mr-2 h-4 w-4"/>
                            Logout
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>

            <AccountFormDialog
                open={accountDialogOpen}
                onOpenChange={setAccountDialogOpen}
            />
        </header>
    );
}