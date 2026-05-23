'use client';
import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
    Bell, Sun, Moon, LogOut,
    User, ChevronDown,
} from 'lucide-react';
import { useTheme } from 'next-themes';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu, DropdownMenuContent,
    DropdownMenuItem, DropdownMenuLabel,
    DropdownMenuSeparator, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
    Select, SelectContent, SelectItem,
    SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { useAuthStore } from '@/store/authStore';
import { useAccountStore } from '@/store/accountStore';
import { useQuery } from '@tanstack/react-query';
import { accountsApi } from '@/lib/api/accounts';
import { authApi } from '@/lib/api/auth';

export function Header() {
    const router = useRouter();
    const { theme, setTheme } = useTheme();
    const { user, clearAuth } = useAuthStore();
    const { accounts, selectedAccount, setAccounts, setSelectedAccount } =
        useAccountStore();

    const { error: accountsError } = useQuery({
        queryKey: ['accounts'],
        queryFn: async () => {
            const res = await accountsApi.list();
            const data = res.data.data;
            setAccounts(data);
            if (!selectedAccount && data.length > 0) {
                setSelectedAccount(data[0]);
            }
            return data;
        },
        retry: 2,
        staleTime: 1000 * 60 * 10, // 10 minutes
        gcTime: 1000 * 60 * 15, // 15 minutes
    });

    // Show error toast if accounts fetch fails
    useEffect(() => {
        if (accountsError) {
            const message = (accountsError as any).response?.data?.message || 'Failed to load accounts';
            toast.error(message);
        }
    }, [accountsError]);

    const handleLogout = async () => {
        try {
            await authApi.logout();
        } finally {
            clearAuth();
            router.push('/login');
            toast.success('Logged out successfully');
        }
    };

    const initials = user?.fullName
        ?.split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase() ?? 'U';

    return (
        <header className="h-16 border-b border-border bg-card
      flex items-center justify-between px-6 shrink-0">
            {/* Account Selector */}
            <div className="flex items-center gap-3">
                {accounts.length > 0 && (
                    <Select
                        value={selectedAccount?.id ?? ''}
                        onValueChange={(id) => {
                            const acc = accounts.find((a) => a.id === id);
                            if (acc) setSelectedAccount(acc);
                        }}
                    >
                        <SelectTrigger className="w-48">
                            <SelectValue placeholder="Select account" />
                        </SelectTrigger>
                        <SelectContent>
                            {accounts.map((acc) => (
                                <SelectItem key={acc.id} value={acc.id}>
                                    <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${
                        acc.accountType === 'LIVE'
                            ? 'bg-emerald-500'
                            : acc.accountType === 'PROP'
                                ? 'bg-yellow-500'
                                : 'bg-blue-500'
                    }`} />
                                        {acc.accountName}
                                    </div>
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                )}
            </div>

            {/* Right Side */}
            <div className="flex items-center gap-2">
                <Button
                    variant="ghost"
                    size="icon"
                    aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
                    onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                >
                    {theme === 'dark'
                        ? <Sun size={18} />
                        : <Moon size={18} />}
                </Button>

                <Button
                    variant="ghost"
                    size="icon"
                    aria-label="Notifications"
                >
                    <Bell size={18} />
                </Button>

                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button
                            variant="ghost"
                            className="flex items-center gap-2 px-2"
                            aria-label="Account menu"
                        >
                            <Avatar className="h-8 w-8">
                                <AvatarImage src={user?.avatarUrl} />
                                <AvatarFallback className="bg-primary text-primary-foreground text-xs">
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
                            <ChevronDown size={14} className="text-muted-foreground" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48">
                        <DropdownMenuLabel>My Account</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                            onClick={() => router.push('/settings')}>
                            <User className="mr-2 h-4 w-4" />
                            Settings
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                            onClick={handleLogout}
                            className="text-red-500 focus:text-red-500">
                            <LogOut className="mr-2 h-4 w-4" />
                            Logout
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </header>
    );
}