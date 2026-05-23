'use client';
import { useState } from 'react';
import { Plus, BookMarked, Pencil, Trash2,
    TrendingUp, Target, BarChart3 } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import {
    Card, CardContent, CardHeader,
    CardTitle, CardDescription,
} from '@/components/ui/card';
import {
    Dialog, DialogContent, DialogHeader,
    DialogTitle, DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { PageHeader } from '@/components/shared/PageHeader';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { EmptyState } from '@/components/shared/EmptyState';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import { playbooksApi } from '@/lib/api/playbooks';
import { formatCurrency } from '@/lib/utils';
import type { PlaybookResponse, PlaybookStats } from '@/types';

export default function PlaybooksPage() {
    const qc = useQueryClient();
    const [formOpen, setFormOpen] = useState(false);
    const [editing, setEditing] = useState<PlaybookResponse | null>(null);
    const [deleteId, setDeleteId] = useState<string | null>(null);
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');

    const { data: playbooks, isLoading } = useQuery({
        queryKey: ['playbooks'],
        queryFn: async () => (await playbooksApi.list()).data.data,
    });

    const { data: stats } = useQuery({
        queryKey: ['playbook-stats'],
        queryFn: async () => (await playbooksApi.stats()).data.data,
    });

    const statMap = (stats ?? []).reduce<Record<string, PlaybookStats>>(
        (acc, s) => ({ ...acc, [s.playbookId]: s }), {}
    );

    const saveMutation = useMutation({
        mutationFn: () =>
            editing
                ? playbooksApi.update(editing.id, { name, description })
                : playbooksApi.create({ name, description }),
        onSuccess: () => {
            toast.success(editing
                ? 'Playbook updated' : 'Playbook created');
            qc.invalidateQueries({ queryKey: ['playbooks'] });
            handleClose();
        },
        onError: () => toast.error('Failed to save playbook'),
    });

    const deleteMutation = useMutation({
        mutationFn: (id: string) => playbooksApi.delete(id),
        onSuccess: () => {
            toast.success('Playbook deleted');
            qc.invalidateQueries({ queryKey: ['playbooks'] });
            setDeleteId(null);
        },
    });

    const handleClose = () => {
        setFormOpen(false);
        setEditing(null);
        setName('');
        setDescription('');
    };

    const handleEdit = (p: PlaybookResponse) => {
        setEditing(p);
        setName(p.name);
        setDescription(p.description ?? '');
        setFormOpen(true);
    };

    if (isLoading) return <LoadingSpinner />;

    return (
        <div className="space-y-6">
            <PageHeader
                title="Playbooks"
                description="Define and track your trading strategies"
                action={
                    <Button onClick={() => setFormOpen(true)}>
                        <Plus className="mr-2 h-4 w-4" />
                        New Playbook
                    </Button>
                }
            />

            {!playbooks?.length ? (
                <EmptyState
                    icon={BookMarked}
                    title="No playbooks yet"
                    description="Create a playbook to track your trading strategies"
                    action={{ label: 'Create Playbook',
                        onClick: () => setFormOpen(true) }}
                />
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2
          xl:grid-cols-3 gap-4">
                    {playbooks.map((p) => {
                        const s = statMap[p.id];
                        const winRate = s && s.totalTrades > 0
                            ? ((s.winningTrades / s.totalTrades) * 100).toFixed(1)
                            : null;

                        return (
                            <Card key={p.id} className="relative group">
                                <CardHeader className="pb-3">
                                    <div className="flex items-start justify-between">
                                        <div>
                                            <CardTitle className="text-base">
                                                {p.name}
                                            </CardTitle>
                                            {p.description && (
                                                <CardDescription className="mt-1 line-clamp-2">
                                                    {p.description}
                                                </CardDescription>
                                            )}
                                        </div>
                                        <div className="flex gap-1 opacity-0
                      group-hover:opacity-100 transition-opacity">
                                            <Button variant="ghost" size="icon"
                                                    className="h-7 w-7"
                                                    onClick={() => handleEdit(p)}>
                                                <Pencil size={13} />
                                            </Button>
                                            <Button variant="ghost" size="icon"
                                                    className="h-7 w-7 text-muted-foreground
                          hover:text-red-500"
                                                    onClick={() => setDeleteId(p.id)}>
                                                <Trash2 size={13} />
                                            </Button>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    <div className="grid grid-cols-3 gap-2">
                                        <div className="text-center p-2 rounded-lg bg-muted">
                                            <p className="text-xs text-muted-foreground">
                                                Trades
                                            </p>
                                            <p className="font-semibold text-sm">
                                                {s?.totalTrades ?? 0}
                                            </p>
                                        </div>
                                        <div className="text-center p-2 rounded-lg bg-muted">
                                            <p className="text-xs text-muted-foreground">
                                                Win Rate
                                            </p>
                                            <p className="font-semibold text-sm">
                                                {winRate ? `${winRate}%` : '—'}
                                            </p>
                                        </div>
                                        <div className="text-center p-2 rounded-lg bg-muted">
                                            <p className="text-xs text-muted-foreground">
                                                P&L
                                            </p>
                                            <p className={`font-semibold text-sm ${
                                                s?.totalPnl && s.totalPnl >= 0
                                                    ? 'text-emerald-500' : 'text-red-500'
                                            }`}>
                                                {s?.totalPnl
                                                    ? formatCurrency(s.totalPnl) : '—'}
                                            </p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>
            )}

            {/* Form Dialog */}
            <Dialog open={formOpen} onOpenChange={(o) => !o && handleClose()}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>
                            {editing ? 'Edit Playbook' : 'New Playbook'}
                        </DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-2">
                        <div className="space-y-2">
                            <Label>Name *</Label>
                            <Input
                                placeholder="e.g. Opening Drive, Breakout Fade"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Description</Label>
                            <Textarea
                                placeholder="Describe your strategy, entry criteria,
and rules..."
                                rows={4}
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={handleClose}>
                            Cancel
                        </Button>
                        <Button
                            onClick={() => saveMutation.mutate()}
                            disabled={!name.trim() || saveMutation.isPending}
                        >
                            {saveMutation.isPending ? 'Saving...' : 'Save'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <ConfirmDialog
                open={!!deleteId}
                onOpenChange={(o) => !o && setDeleteId(null)}
                title="Delete Playbook"
                description="Trades linked to this playbook will be unlinked."
                onConfirm={() => deleteId && deleteMutation.mutate(deleteId)}
                loading={deleteMutation.isPending}
            />
        </div>
    );
}