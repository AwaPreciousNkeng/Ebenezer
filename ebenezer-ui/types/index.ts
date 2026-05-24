// ─── Enums ───────────────────────────────────────────────
export type Role = 'USER' | 'ADMIN';
export type TradeDirection = 'LONG' | 'SHORT';
export type TradeStatus = 'OPEN' | 'CLOSED' | 'PARTIAL';
export type AssetClass =
    | 'STOCK' | 'FUTURES' | 'FOREX' | 'CRYPTO' | 'OPTIONS';
export type AccountType = 'LIVE' | 'DEMO' | 'PROP';
export type TagType = 'SETUP' | 'MISTAKE' | 'EMOTION' | 'CUSTOM';
export type SnapshotPeriod = 'DAILY' | 'WEEKLY' | 'MONTHLY';
export type OAuthProvider = 'GOOGLE' | 'NONE';

// ─── API Wrapper ─────────────────────────────────────────
export interface ApiResponse<T> {
    success: boolean;
    message?: string;
    data: T;
    errors?: Record<string, string>;
    timestamp: string;
}

export interface PageResponse<T> {
    content: T[];
    totalElements: number;
    totalPages: number;
    size: number;
    number: number;
    first: boolean;
    last: boolean;
}

// ─── Auth ─────────────────────────────────────────────────
export interface AuthResponse {
    accessToken: string;
    refreshToken: string;
    user: UserDto;
}

export interface UserDto {
    id: string;
    email: string;
    fullName: string;
    avatarUrl?: string;
    timezone: string;
    role: Role;
    isEmailVerified: boolean;
    oauthProvider: OAuthProvider;
    createdAt: string;
}

// ─── Requests ─────────────────────────────────────────────
export interface RegisterRequest {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
}

export interface LoginRequest {
    email: string;
    password: string;
}

export interface UpdateProfileRequest {
    firstName?: string;
    lastName?: string;
}

export interface ChangePasswordRequest {
    currentPassword: string;
    newPassword: string;
}

// ─── Account ──────────────────────────────────────────────
export interface AccountResponse {
    id: string;
    accountName: string;
    brokerName?: string;
    accountType: AccountType;
    currency: string;
    startingBalance: number;
    isActive: boolean;
    createdAt: string;
}

export interface AccountRequest {
    accountName: string;
    brokerName?: string;
    accountType: AccountType;
    currency?: string;
    startingBalance?: number;
}

// ─── Trade ────────────────────────────────────────────────
export interface TradeTagResponse {
    id: string;
    tag: string;
    tagType: TagType;
}

export interface TradeScreenshotResponse {
    id: string;
    url: string;
    label?: string;
    uploadedAt: string;
}

export interface TradeResponse {
    id: string;
    accountId: string;
    accountName: string;
    symbol: string;
    assetClass: AssetClass;
    direction: TradeDirection;
    status: TradeStatus;
    entryPrice: number;
    exitPrice?: number;
    quantity: number;
    entryDate: string;
    exitDate?: string;
    grossPnl?: number;
    commission: number;
    netPnl?: number;
    pnlPercent?: number;
    riskReward?: number;
    stopLoss?: number;
    takeProfit?: number;
    plannedRisk?: number;
    executionRating?: number;
    playbookId?: string;
    playbookName?: string;
    notes?: string;
    isRuleViolated: boolean;
    imported: boolean;
    importSource?: string;
    tags: TradeTagResponse[];
    screenshots: TradeScreenshotResponse[];
    createdAt: string;
    updatedAt: string;
}

export interface TradeRequest {
    accountId: string;
    symbol: string;
    assetClass: AssetClass;
    direction: TradeDirection;
    status?: TradeStatus;
    entryPrice: number;
    exitPrice?: number;
    quantity: number;
    entryDate: string;
    exitDate?: string;
    commission?: number;
    stopLoss?: number;
    takeProfit?: number;
    plannedRisk?: number;
    executionRating?: number;
    playbookId?: string;
    notes?: string;
    tags?: { tag: string; tagType?: TagType }[];
}

export interface TradeFilterParams {
    accountId?: string;
    symbol?: string;
    direction?: TradeDirection;
    status?: TradeStatus;
    assetClass?: AssetClass;
    playbookId?: string;
    from?: string;
    to?: string;
    page?: number;
    size?: number;
    sort?: string;
}

// ─── Playbook ─────────────────────────────────────────────
export interface PlaybookResponse {
    id: string;
    name: string;
    description?: string;
    rules?: string;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface PlaybookRequest {
    name: string;
    description?: string;
    rules?: string;
}

export interface PlaybookStats {
    playbookId: string;
    playbookName: string;
    totalTrades: number;
    winningTrades: number;
    totalPnl: number;
    avgRiskReward: number;
}

// ─── Journal ──────────────────────────────────────────────
export interface JournalResponse {
    id: string;
    entryDate: string;
    prePlan?: string;
    postReview?: string;
    marketNotes?: string;
    emotionScore?: number;
    createdAt: string;
    updatedAt: string;
}

export interface JournalRequest {
    entryDate: string;
    prePlan?: string;
    postReview?: string;
    marketNotes?: string;
    emotionScore?: number;
}

export interface EmotionTrend {
    entryDate: string;
    emotionScore: number;
}

// ─── Analytics ────────────────────────────────────────────
export interface TradeSummary {
    totalTrades: number;
    winningTrades: number;
    losingTrades: number;
    winRate: number;
    totalNetPnl: number;
    totalGrossPnl: number;
    avgWin: number;
    avgLoss: number;
    avgRiskReward: number;
    profitFactor: number;
}

export interface EquityCurvePoint {
    date: string;
    cumulativePnl: number;
}

export interface SymbolPnl {
    symbol: string;
    totalTrades: number;
    totalPnl: number;
    avgPnl: number;
}

export interface DayOfWeekPnl {
    dayOfWeek: number;
    totalTrades: number;
    totalPnl: number;
}

export interface DrawdownResponse {
    maxDrawdown: number;
}

export interface StreakResponse {
    currentStreak: number;
    maxWinStreak: number;
    maxLossStreak: number;
}

export interface AnalyticsFilterParams {
    accountId?: string;
    from?: string;
    to?: string;
}

// ─── Import ───────────────────────────────────────────────
export interface ImportResult {
    totalRows: number;
    imported: number;
    skipped: number;
}