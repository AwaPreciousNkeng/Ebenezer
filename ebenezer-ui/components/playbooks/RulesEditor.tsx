'use client';
import { useState } from 'react';
import { Plus, X, Percent, Scale, Hash } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { TRADING_SESSIONS, type PlaybookRules } from '@/lib/playbook-rules';

interface RulesEditorProps {
    rules: PlaybookRules;
    onChange: (rules: PlaybookRules) => void;
}

export function RulesEditor({ rules, onChange }: RulesEditorProps) {
    const [criterion, setCriterion] = useState('');

    const set = (patch: Partial<PlaybookRules>) => onChange({ ...rules, ...patch });

    const addCriterion = () => {
        const c = criterion.trim();
        if (!c) return;
        set({ entryCriteria: [...(rules.entryCriteria ?? []), c] });
        setCriterion('');
    };

    const removeCriterion = (i: number) =>
        set({ entryCriteria: (rules.entryCriteria ?? []).filter((_, idx) => idx !== i) });

    const toggleSession = (s: string) => {
        const current = rules.sessions ?? [];
        set({
            sessions: current.includes(s)
                ? current.filter((x) => x !== s)
                : [...current, s],
        });
    };

    const numOrUndef = (v: string) =>
        v === '' ? undefined : Number(v);

    return (
        <div className="space-y-5">
            {/* Numeric guardrails */}
            <div className="grid grid-cols-3 gap-3">
                <NumberField
                    icon={Percent}
                    label="Max Risk %"
                    value={rules.maxRiskPercent}
                    onChange={(v) => set({ maxRiskPercent: numOrUndef(v) })}
                    placeholder="1.0"
                    step="0.1"
                />
                <NumberField
                    icon={Scale}
                    label="Min R:R"
                    value={rules.minRiskReward}
                    onChange={(v) => set({ minRiskReward: numOrUndef(v) })}
                    placeholder="2.0"
                    step="0.1"
                />
                <NumberField
                    icon={Hash}
                    label="Max / Day"
                    value={rules.maxDailyTrades}
                    onChange={(v) => set({ maxDailyTrades: numOrUndef(v) })}
                    placeholder="3"
                    step="1"
                />
            </div>

            {/* Sessions */}
            <div className="space-y-2">
                <Label className="text-xs">Trading Sessions</Label>
                <div className="flex flex-wrap gap-2">
                    {TRADING_SESSIONS.map((s) => {
                        const active = (rules.sessions ?? []).includes(s);
                        return (
                            <button
                                key={s}
                                type="button"
                                onClick={() => toggleSession(s)}
                                className={cn(
                                    'rounded-full border px-3 py-1 text-xs font-medium transition-all',
                                    active
                                        ? 'border-primary bg-primary/10 text-primary'
                                        : 'border-border text-muted-foreground hover:border-muted-foreground/50'
                                )}
                            >
                                {s}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Entry criteria */}
            <div className="space-y-2">
                <Label className="text-xs">Entry Criteria</Label>
                <div className="flex gap-2">
                    <Input
                        placeholder="e.g. Price above 200 EMA"
                        value={criterion}
                        onChange={(e) => setCriterion(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') { e.preventDefault(); addCriterion(); }
                        }}
                        className="h-9 text-sm"
                    />
                    <button
                        type="button"
                        onClick={addCriterion}
                        className="flex h-9 w-9 shrink-0 items-center justify-center
              rounded-md border border-border text-muted-foreground
              transition-colors hover:bg-accent hover:text-foreground"
                    >
                        <Plus size={15} />
                    </button>
                </div>
                {(rules.entryCriteria ?? []).length > 0 && (
                    <div className="space-y-1.5 pt-1">
                        {(rules.entryCriteria ?? []).map((c, i) => (
                            <div
                                key={i}
                                className="flex items-center justify-between rounded-lg
                  border border-border bg-muted/30 px-3 py-1.5 text-sm"
                            >
                                <span className="flex items-center gap-2">
                                    <span className="text-xs font-bold text-primary">{i + 1}</span>
                                    {c}
                                </span>
                                <button
                                    type="button"
                                    onClick={() => removeCriterion(i)}
                                    className="text-muted-foreground hover:text-red-500"
                                >
                                    <X size={14} />
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

function NumberField({
    icon: Icon, label, value, onChange, placeholder, step,
}: {
    icon: React.ElementType;
    label: string;
    value?: number;
    onChange: (v: string) => void;
    placeholder: string;
    step: string;
}) {
    return (
        <div className="space-y-1.5">
            <Label className="flex items-center gap-1 text-[11px] text-muted-foreground">
                <Icon size={11} />
                {label}
            </Label>
            <Input
                type="number"
                step={step}
                min="0"
                placeholder={placeholder}
                value={value ?? ''}
                onChange={(e) => onChange(e.target.value)}
                className="h-9 text-sm"
            />
        </div>
    );
}
