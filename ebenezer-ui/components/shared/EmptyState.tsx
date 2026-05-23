import { LucideIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface EmptyStateProps {
    icon: LucideIcon;
    title: string;
    description: string;
    action?: { label: string; onClick: () => void };
}

export function EmptyState({
                               icon: Icon, title, description, action,
                           }: EmptyStateProps) {
    return (
        <div className="flex flex-col items-center justify-center
      py-20 text-center space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-muted
        flex items-center justify-center">
                <Icon className="w-8 h-8 text-muted-foreground" />
            </div>
            <div>
                <h3 className="text-lg font-semibold">{title}</h3>
                <p className="text-muted-foreground text-sm mt-1 max-w-sm">
                    {description}
                </p>
            </div>
            {action && (
                <Button onClick={action.onClick}>{action.label}</Button>
            )}
        </div>
    );
}