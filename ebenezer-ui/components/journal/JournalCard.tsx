'use client';
import { useRouter } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatDate, cn } from '@/lib/utils';
import type { JournalResponse } from '@/types';

const MOOD_MAP: Record<number, { label: string; color: string }> = {
    1: { label: '😞 Bad',     color: 'bg-red-500/10 text-red-500' },
    2: { label: '😕 Poor',    color: 'bg-orange-500/10 text-orange-500' },
    3: { label: '😐 Neutral', color: 'bg-yellow-500/10 text-yellow-500' },
    4: { label: '🙂 Good',    color: 'bg-blue-500/10 text-blue-500' },
    5: { label: '😄 Great',   color: 'bg-emerald-500/10 text-emerald-500' },
};

export function JournalCard({ entry }: { entry: JournalResponse }) {
    const router = useRouter();
    const mood = entry.emotionScore
        ? MOOD_MAP[entry.emotionScore]
        : null;

    return (
        <Card
            className="cursor-pointer hover:border-primary/50
        transition-colors"
            onClick={() => router.push(`/journal/${entry.entryDate}`)}
        >
            <CardContent className="p-5">
                <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0 flex-1">
                        <p className="font-semibold">
                            {formatDate(entry.entryDate, 'EEEE, MMMM dd yyyy')}
                        </p>
                        {entry.prePlan && (
                            <p
                                className="text-sm text-muted-foreground mt-1
                  line-clamp-2"
                                dangerouslySetInnerHTML={{ __html: entry.prePlan }}
                            />
                        )}
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                        {entry.postReview && (
                            <Badge variant="secondary" className="text-xs">
                                ✅ Reviewed
                            </Badge>
                        )}
                        {mood && (
                            <span className={cn(
                                'text-xs px-2 py-1 rounded-full font-medium',
                                mood.color
                            )}>
                {mood.label}
              </span>
                        )}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}