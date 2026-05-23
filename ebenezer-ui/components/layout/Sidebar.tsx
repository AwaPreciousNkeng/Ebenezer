'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
    LayoutDashboard, TrendingUp, BookOpen,
    BarChart3, Upload, Settings,
    BookMarked, ChevronRight,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';

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
        </aside>
    );
}