'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
    LayoutDashboard, TrendingUp, BookOpen,
    BarChart3, Upload, Settings,
    BookMarked, ChevronRight, LogOut,
} from 'lucide-react';
import { toast } from 'sonner';
import { cn, getInitials } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/store/authStore';
import { authApi } from '@/lib/api/auth';

const nav = [
    {
        label: 'Main',
        items: [
            { href: '/dashboard',  label: 'Dashboard',  icon: LayoutDashboard },
            { href: '/trades',     label: 'Trades',     icon: TrendingUp },
            { href: '/journal',    label: 'Journal',    icon: BookOpen },
            { href: '/analytics',  label: 'Analytics',  icon: BarChart3 },
            { href: '/playbooks',  label: 'Playbooks',  icon: BookMarked },
        ],
    },
    {
        label: 'Tools',
        items: [
            { href: '/import',   label: 'Import',   icon: Upload },
            { href: '/settings', label: 'Settings', icon: Settings },
        ],
    },
];

export function Sidebar() {
    const pathname = usePathname();
    const router = useRouter();
    const { user, clearAuth } = useAuthStore();

    const handleLogout = async () => {
        try {
            await authApi.logout();
        } finally {
            clearAuth();
            router.push('/login');
            toast.success('Logged out');
        }
    };

    return (
        <aside className="hidden lg:flex w-64 flex-col
      bg-card border-r border-border h-screen">
            {/* Logo */}
            <div className="flex items-center gap-3 px-6 py-5 border-b border-border">
                <div className="w-8 h-8 rounded-lg bg-primary
          flex items-center justify-center shrink-0">
                    <span className="text-primary-foreground font-bold text-sm">E</span>
                </div>
                <span className="font-bold text-lg">Ebenezer</span>
            </div>

            <ScrollArea className="flex-1 py-4">
                {nav.map((section) => (
                    <div key={section.label} className="mb-6">
                        <p className="px-6 mb-2 text-xs font-semibold
              text-muted-foreground uppercase tracking-wider">
                            {section.label}
                        </p>
                        {section.items.map(({ href, label, icon: Icon }) => {
                            const active =
                                pathname === href ||
                                (href !== '/dashboard' && pathname.startsWith(href));
                            return (
                                <Link
                                    key={href}
                                    href={href}
                                    className={cn(
                                        'flex items-center gap-3 mx-3 px-3 py-2.5',
                                        'rounded-lg text-sm font-medium transition-all',
                                        'group relative',
                                        active
                                            ? 'bg-primary text-primary-foreground'
                                            : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                                    )}
                                >
                                    <Icon size={18} />
                                    <span className="flex-1">{label}</span>
                                    {active && <ChevronRight size={14} />}
                                </Link>
                            );
                        })}
                    </div>
                ))}
            </ScrollArea>

            {/* User footer */}
            <div className="border-t border-border p-3">
                <div className="flex items-center gap-2 px-2 py-2 rounded-lg
          hover:bg-accent group">
                    <Avatar key={user?.avatarUrl} className="h-8 w-8 shrink-0">
                        <AvatarImage src={user?.avatarUrl} />
                        <AvatarFallback className="bg-primary text-primary-foreground
              text-xs">
                            {user?.fullName ? getInitials(user.fullName) : 'U'}
                        </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">
                            {user?.fullName ?? 'User'}
                        </p>
                        <p className="text-xs text-muted-foreground truncate">
                            {user?.email}
                        </p>
                    </div>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-muted-foreground
              hover:text-red-500 shrink-0"
                        onClick={handleLogout}
                        title="Log out"
                    >
                        <LogOut size={14} />
                    </Button>
                </div>
            </div>
        </aside>
    );
}