'use client';
import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
    Menu, X, LayoutDashboard, TrendingUp,
    BookOpen, BarChart3, Upload,
    Settings, BookMarked,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const nav = [
    { href: '/dashboard',  label: 'Dashboard',  icon: LayoutDashboard },
    { href: '/trades',     label: 'Trades',     icon: TrendingUp },
    { href: '/journal',    label: 'Journal',    icon: BookOpen },
    { href: '/analytics',  label: 'Analytics',  icon: BarChart3 },
    { href: '/playbooks',  label: 'Playbooks',  icon: BookMarked },
    { href: '/import',     label: 'Import',     icon: Upload },
    { href: '/settings',   label: 'Settings',   icon: Settings },
];

export function MobileSidebar() {
    const [open, setOpen] = useState(false);
    const pathname = usePathname();

    return (
        <>
            <Button
                variant="ghost"
                size="icon"
                className="lg:hidden"
                onClick={() => setOpen(true)}
            >
                <Menu size={20} />
            </Button>

            {/* Overlay */}
            {open && (
                <div
                    className="fixed inset-0 z-40 bg-black/60 lg:hidden"
                    onClick={() => setOpen(false)}
                />
            )}

            {/* Drawer */}
            <div className={cn(
                'fixed inset-y-0 left-0 z-50 w-64 bg-card border-r',
                'border-border transform transition-transform duration-200',
                'lg:hidden',
                open ? 'translate-x-0' : '-translate-x-full'
            )}>
                <div className="flex items-center justify-between
          px-6 py-5 border-b border-border">
                    <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-primary
              flex items-center justify-center">
              <span className="text-primary-foreground
                font-bold text-xs">E</span>
                        </div>
                        <span className="font-bold">Ebenezer</span>
                    </div>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        onClick={() => setOpen(false)}
                    >
                        <X size={16} />
                    </Button>
                </div>

                <nav className="py-4">
                    {nav.map(({ href, label, icon: Icon }) => {
                        const active =
                            pathname === href ||
                            (href !== '/dashboard' && pathname.startsWith(href));
                        return (
                            <Link
                                key={href}
                                href={href}
                                onClick={() => setOpen(false)}
                                className={cn(
                                    'flex items-center gap-3 mx-3 px-3 py-2.5',
                                    'rounded-lg text-sm font-medium transition-all',
                                    active
                                        ? 'bg-primary text-primary-foreground'
                                        : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                                )}
                            >
                                <Icon size={18} />
                                {label}
                            </Link>
                        );
                    })}
                </nav>
            </div>
        </>
    );
}