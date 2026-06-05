'use client';
import { useEffect, useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import {
    Dialog, DialogContent, DialogHeader,
    DialogTitle, DialogFooter, DialogDescription,
} from '@/components/ui/dialog';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { RulesEditor } from './RulesEditor';
import { playbooksApi } from '@/lib/api/playbooks';
import { parseRules, serializeRules, type PlaybookRules } from '@/lib/playbook-rules';
import type { PlaybookResponse } from '@/types';

interface PlaybookFormDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    editing: PlaybookResponse | null;
}

export function PlaybookFormDialog({ open, onOpenChange, editing }: PlaybookFormDialogProps) {
    const qc = useQueryClient();
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [rules, setRules] = useState<PlaybookRules>({});

    // Hydrate when opening / switching target
    useEffect(() => {
        if (open) {
            setName(editing?.name ?? '');
            setDescription(editing?.description ?? '');
            setRules(parseRules(editing?.rules));
        }
    }, [open, editing]);

    const mutation = useMutation({
        mutationFn: () => {
            const payload = {
                name: name.trim(),
                description: description.trim() || undefined,
                rules: serializeRules(rules),
            };
            return editing
                ? playbooksApi.update(editing.id, payload)
                : playbooksApi.create(payload);
        },
        onSuccess: () => {
            toast.success(editing ? 'Playbook updated' : 'Playbook created');
            qc.invalidateQueries({ queryKey: ['playbooks'] });
            qc.invalidateQueries({ queryKey: ['playbook-stats'] });
            if (editing) qc.invalidateQueries({ queryKey: ['playbook', editing.id] });
            onOpenChange(false);
        },
        onError: (err: any) =>
            toast.error(err?.message || 'Failed to save playbook'),
    });

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle>{editing ? 'Edit Playbook' : 'New Playbook'}</DialogTitle>
                    <DialogDescription>
                        Document a strategy and the rules that define a valid trade.
                    </DialogDescription>
                </DialogHeader>

                <Tabs defaultValue="details" className="mt-1">
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="details">Details</TabsTrigger>
                        <TabsTrigger value="rules">Rules</TabsTrigger>
                    </TabsList>

                    <TabsContent value="details" className="space-y-4 pt-4">
                        <div className="space-y-2">
                            <Label>Name *</Label>
                            <Input
                                placeholder="e.g. Opening Drive Breakout"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                autoFocus
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Description</Label>
                            <Textarea
                                placeholder="When does this setup trigger? What's the thesis?"
                                rows={4}
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                            />
                        </div>
                    </TabsContent>

                    <TabsContent value="rules" className="pt-4">
                        <RulesEditor rules={rules} onChange={setRules} />
                    </TabsContent>
                </Tabs>

                <DialogFooter className="mt-2">
                    <Button variant="outline" onClick={() => onOpenChange(false)}>
                        Cancel
                    </Button>
                    <Button
                        onClick={() => mutation.mutate()}
                        disabled={!name.trim() || mutation.isPending}
                    >
                        {mutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        {editing ? 'Save Changes' : 'Create Playbook'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
