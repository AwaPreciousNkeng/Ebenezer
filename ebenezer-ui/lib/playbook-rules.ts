// Structured representation of a playbook's rule set.
// Persisted as a JSON string in Playbook.rules on the backend.

export interface PlaybookRules {
    maxRiskPercent?: number;
    minRiskReward?: number;
    maxDailyTrades?: number;
    entryCriteria?: string[];
    sessions?: string[];
}

export function parseRules(raw?: string | null): PlaybookRules {
    if (!raw) return {};
    try {
        const parsed = JSON.parse(raw);
        return typeof parsed === 'object' && parsed !== null ? parsed : {};
    } catch {
        return {};
    }
}

export function serializeRules(rules: PlaybookRules): string | undefined {
    const cleaned: PlaybookRules = {};
    if (rules.maxRiskPercent != null && !Number.isNaN(rules.maxRiskPercent))
        cleaned.maxRiskPercent = rules.maxRiskPercent;
    if (rules.minRiskReward != null && !Number.isNaN(rules.minRiskReward))
        cleaned.minRiskReward = rules.minRiskReward;
    if (rules.maxDailyTrades != null && !Number.isNaN(rules.maxDailyTrades))
        cleaned.maxDailyTrades = rules.maxDailyTrades;
    const criteria = (rules.entryCriteria ?? []).filter((c) => c.trim());
    if (criteria.length) cleaned.entryCriteria = criteria;
    const sessions = (rules.sessions ?? []).filter((s) => s.trim());
    if (sessions.length) cleaned.sessions = sessions;

    return Object.keys(cleaned).length ? JSON.stringify(cleaned) : undefined;
}

export function rulesCount(rules: PlaybookRules): number {
    let n = 0;
    if (rules.maxRiskPercent != null) n++;
    if (rules.minRiskReward != null) n++;
    if (rules.maxDailyTrades != null) n++;
    n += (rules.entryCriteria ?? []).length;
    n += (rules.sessions ?? []).length;
    return n;
}

export const TRADING_SESSIONS = ['Asian', 'London', 'New York', 'Overlap'];
