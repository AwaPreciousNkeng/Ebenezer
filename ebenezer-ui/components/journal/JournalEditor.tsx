'use client';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

const MOODS = [
    { score: 1, emoji: '😞', label: 'Bad' },
    { score: 2, emoji: '😕', label: 'Poor' },
    { score: 3, emoji: '😐', label: 'Neutral' },
    { score: 4, emoji: '🙂', label: 'Good' },
    { score: 5, emoji: '😄', label: 'Great' },
];

interface JournalEditorProps {
    prePlan: string;
    postReview: string;
    marketNotes: string;
    emotionScore: number | null;
    onPrePlanChange: (v: string) => void;
    onPostReviewChange: (v: string) => void;
    onMarketNotesChange: (v: string) => void;
    onEmotionScoreChange: (v: number | null) => void;
}

export function JournalEditor({
                                  prePlan, postReview, marketNotes, emotionScore,
                                  onPrePlanChange, onPostReviewChange,
                                  onMarketNotesChange, onEmotionScoreChange,
                              }: JournalEditorProps) {
    return (
        <div className="space-y-6">
            {/* Mood */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-sm text-muted-foreground
            uppercase tracking-wide">
                        How are you feeling?
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex gap-3">
                        {MOODS.map(({ score, emoji, label }) => (
                            <button
                                key={score}
                                type="button"
                                onClick={() =>
                                    onEmotionScoreChange(
                                        emotionScore === score ? null : score
                                    )
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

            {/* Pre-Plan */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-sm text-muted-foreground
            uppercase tracking-wide">
                        📋 Pre-Market Plan
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <Textarea
                        placeholder="What setups are you watching?
What are your rules for today?"
                        rows={6}
                        value={prePlan}
                        onChange={(e) => onPrePlanChange(e.target.value)}
                        className="resize-none"
                    />
                </CardContent>
            </Card>

            {/* Post-Review */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-sm text-muted-foreground
            uppercase tracking-wide">
                        📊 Post-Market Review
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <Textarea
                        placeholder="How did the session go?
Did you follow your plan? What did you learn?"
                        rows={6}
                        value={postReview}
                        onChange={(e) => onPostReviewChange(e.target.value)}
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
                        placeholder="Key levels, news, macro events..."
                        rows={4}
                        value={marketNotes}
                        onChange={(e) => onMarketNotesChange(e.target.value)}
                        className="resize-none"
                    />
                </CardContent>
            </Card>
        </div>
    );
}