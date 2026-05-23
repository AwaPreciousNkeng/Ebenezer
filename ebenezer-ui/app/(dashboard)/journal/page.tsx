'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';
import { Plus, Search, BookOpen } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { PageHeader } from '@/components/shared/PageHeader';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { EmptyState } from '@/components/shared/EmptyState';
import { journalApi } from '@/lib/api/journal';
import { formatDate } from '@/lib/utils';

const MOOD_LABELS: Record<number, { label: string; color: string }> = {
    1: { label: '😞 Bad',      color: 'bg-red-500/10 text-red-500' },
    2: { label: '😕 Poor',     color: 'bg-orange-500/10 text-orange-500' },
    3: { label: '😐 Neutral',  color: 'bg-yellow-500/10 text-yellow-500' },
    4: { label: '🙂 Good',     color: 'bg-blue-500/10 text-blue-500' },
    5: { label: '😄 Great',    color: 'bg-emerald-500/10 text-emerald-500' },
};

export default function JournalPage() {
    const router = useRouter();
    const [keyword, setKeyword] = useState('');

    const { data, isLoading } = useQuery({
        queryKey: ['journal', keyword],
        queryFn: async () => {
            if (keyword.trim()) {
                return (await journalApi.search(keyword)).data.data;
            }
            return (await journalApi.list()).data.data;
        },
    });

    const today = format(new Date(), 'yyyy-MM-dd');

    return (
        <div className="space-y-6">
            <PageHeader
                title="Journal"
                description="Your daily trading diary"
                action={
                    <Button onClick={() =>
                        router.push(`/journal/${today}`)}>
                        <Plus className="mr-2 h-4 w-4" />
                        Today&apos;s Entry
                    </Button>
                }
            />

            <div className="relative max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2
          text-muted-foreground h-4 w-4" />
                <Input
                    placeholder="Search journal..."
                    value={keyword}
                    onChange={(e) => setKeyword(e.target.value)}
                    className="pl-9"
                />
            </div>

            {isLoading ? (
                <LoadingSpinner />
            ) : !data?.content.length ? (
                <EmptyState
                    icon={BookOpen}
                    title="No journal entries yet"
                    description="Start writing your daily trading notes"
                    action={{
                        label: "Write Today's Entry",
                        onClick: () => router.push(`/journal/${today}`),
                    }}
                />
            ) : (
                <div className="grid gap-4">
                    {data.content.map((entry) => {
                        const mood = entry.emotionScore
                            ? MOOD_LABELS[entry.emotionScore]
                            : null;
                        return (
                            <Card
                                key={entry.id}
                                className="cursor-pointer hover:border-primary/50
                  transition-colors"
                                onClick={() =>
                                    router.push(`/journal/${entry.entryDate}`)
                                }
                            >
                                <CardContent className="p-5">
                                    <div className="flex items-start justify-between">
                                        <div className="space-y-1">
                                            <p className="font-semibold">
                                                {formatDate(
                                                    entry.entryDate, 'EEEE, MMMM dd yyyy'
                                                )}
                                            </p>
                                            {entry.prePlan && (
                                                <p className="text-sm text-muted-foreground
                          line-clamp-2"
                                                   dangerouslySetInnerHTML={{
                                                       __html: entry.prePlan,
                                                   }}
                                                />
                                            )}
                                        </div>
                                        <div className="flex items-center gap-2 shrink-0 ml-4">
                                            {entry.postReview && (
                                                <Badge variant="secondary" className="text-xs">
                                                    ✅ Reviewed
                                                </Badge>
                                            )}
                                            {mood && (
                                                <span className={`text-xs px-2 py-1 rounded-full
                          font-medium ${mood.color}`}>
                          {mood.label}
                        </span>
                                            )}
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>
            )}
        </div>
    );
}