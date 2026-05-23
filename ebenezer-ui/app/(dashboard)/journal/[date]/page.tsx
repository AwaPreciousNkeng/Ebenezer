'use client';
import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Save, Trash2, Loader2 } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PageHeader } from '@/components/shared/PageHeader';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import { journalApi } from '@/lib/api/journal';
import { formatDate } from '@/lib/utils';
import { cn } from '@/lib/utils';

const MOODS = [
    { score: 1, emoji: '😞', label: 'Bad' },
    { score: 2, emoji: '😕', label: 'Poor' },
    { score: 3, emoji: '😐', label: 'Neutral' },
    { score: 4, emoji: '🙂', label: 'Good' },
    { score: 5, emoji: '😄', label: 'Great' },
];

export default function JournalEntryPage() {
    const { date } = useParams<{ date: string }>();
    const router = useRouter();
    const qc = useQueryClient();

    const [prePlan, setPrePlan] = useState('');
    const [postReview, setPostReview] = useState('');
    const [marketNotes, setMarketNotes] = useState('');
    const [emotionScore, setEmotionScore] = useState<number | null>(null);
    const [deleteOpen, setDeleteOpen] = useState(false);

    const { data, isLoading } = useQuery({
        queryKey: ['journal-entry', date],
        queryFn: async () => {
            try {
                return (await journalApi.getByDate(date)).data.data;
            } catch {
                return null;
            }
        },
    });

    useEffect(() => {
        if (data) {
            setPrePlan(data.prePlan ?? '');
            setPostReview(data.postReview ?? '');
            setMarketNotes(data.marketNotes ?? '');
            setEmotionScore(data.emotionScore ?? null);
        }
    }, [data]);

    const saveMutation = useMutation({
        mutationFn: () =>
            journalApi.save({
                entryDate: date,
                prePlan: prePlan || undefined,
                postReview: postReview || undefined,
                marketNotes: marketNotes || undefined,
                emotionScore: emotionScore ?? undefined,
            }),
        onSuccess: () => {
            toast.success('Journal entry saved');
            qc.invalidateQueries({ queryKey: ['journal'] });
        },
        onError: () => toast.error('Failed to save entry'),
    });

    const deleteMutation = useMutation({
        mutationFn: () => journalApi.delete(date),
        onSuccess: () => {
            toast.success('Entry deleted');
            router.push('/journal');
        },
        onError: () => toast.error('Failed to delete'),
    });

    if (isLoading) return <LoadingSpinner />;

    const displayDate = formatDate(date, 'EEEE, MMMM dd yyyy');

    return (
        <div className="max-w-3xl space-y-6">
            <PageHeader
                title={displayDate}
                description="Daily trading journal"
                action={
                    <div className="flex gap-2">
                        {data && (
                            <Button
                                variant="outline"
                                size="sm"
                                className="text-red-500 hover:text-red-600"
                                onClick={() => setDeleteOpen(true)}
                            >
                                <Trash2 className="mr-1.5 h-4 w-4" />
                                Delete
                            </Button>
                        )}
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => router.back()}
                        >
                            <ArrowLeft className="mr-1.5 h-4 w-4" />
                            Back
                        </Button>
                    </div>
                }
            />

            {/* Mood */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-sm text-muted-foreground
            uppercase tracking-wide">
                        How are you feeling today?
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex gap-3">
                        {MOODS.map(({ score, emoji, label }) => (
                            <button
                                key={score}
                                onClick={() =>
                                    setEmotionScore(emotionScore === score ? null : score)
                                }
                                className={cn(
                                    'flex flex-col items-center gap-1 p-3 rounded-xl',
                                    'border-2 transition-all flex-1',
                                    emotionScore === score
                                        ? 'border-primary bg-primary/10'
                                        : 'border-border hover:border-muted-foreground'
                                )}
                            >
                                <span className="text-2xl">{emoji}</span>
                                <span className="text-xs text-muted-foreground">
                  {label}
                </span>
                            </button>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {/* Pre-Market Plan */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-sm text-muted-foreground
            uppercase tracking-wide">
                        📋 Pre-Market Plan
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <Textarea
                        placeholder="What's your game plan for today?
What setups are you watching? What are your rules?"
                        rows={6}
                        value={prePlan}
                        onChange={(e) => setPrePlan(e.target.value)}
                        className="resize-none"
                    />
                </CardContent>
            </Card>

            {/* Post-Market Review */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-sm text-muted-foreground
            uppercase tracking-wide">
                        📊 Post-Market Review
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <Textarea
                        placeholder="How did the day go?
Did you follow your plan? What did you learn?"
                        rows={6}
                        value={postReview}
                        onChange={(e) => setPostReview(e.target.value)}
                        className="resize-none"
                    />
                </CardContent>
            </Card>

            {/* Market Notes */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-sm text-muted-foreground
            uppercase tracking-wide">
                        🌍 Market Notes
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <Textarea
                        placeholder="Key levels, news, macro observations..."
                        rows={4}
                        value={marketNotes}
                        onChange={(e) => setMarketNotes(e.target.value)}
                        className="resize-none"
                    />
                </CardContent>
            </Card>

            <div className="flex justify-end">
                <Button
                    onClick={() => saveMutation.mutate()}
                    disabled={saveMutation.isPending}
                    size="lg"
                >
                    {saveMutation.isPending
                        ? <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        : <Save className="mr-2 h-4 w-4" />}
                    Save Entry
                </Button>
            </div>

            <ConfirmDialog
                open={deleteOpen}
                onOpenChange={setDeleteOpen}
                title="Delete Journal Entry"
                description="This entry will be permanently deleted."
                onConfirm={() => deleteMutation.mutate()}
                loading={deleteMutation.isPending}
            />
        </div>
    );
}