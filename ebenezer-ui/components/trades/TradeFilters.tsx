'use client';
import { Search, SlidersHorizontal, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
    Select, SelectContent, SelectItem,
    SelectTrigger, SelectValue,
} from '@/components/ui/select';
import type { TradeFilterParams, TradeDirection,
    TradeStatus, AssetClass } from '@/types';

interface TradeFiltersProps {
    filters: TradeFilterParams;
    onChange: (f: TradeFilterParams) => void;
}

export function TradeFilters({ filters, onChange }: TradeFiltersProps) {
    const hasFilters = filters.symbol || filters.direction ||
        filters.status || filters.assetClass;

    return (
        <div className="flex flex-wrap gap-3 items-center">
            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2
          text-muted-foreground h-4 w-4" />
                <Input
                    placeholder="Search symbol..."
                    value={filters.symbol ?? ''}
                    onChange={(e: any) => onChange({
                        ...filters, symbol: e.target.value, page: 0,
                    })}
                    className="pl-9 w-44"
                />
            </div>

            <Select
                value={filters.direction ?? 'ALL'}
                onValueChange={(v: any) => onChange({
                    ...filters,
                    direction: v === 'ALL' ? undefined : v as TradeDirection,
                    page: 0,
                })}
            >
                <SelectTrigger className="w-32">
                    <SelectValue placeholder="Direction" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="ALL">All Directions</SelectItem>
                    <SelectItem value="LONG">Long</SelectItem>
                    <SelectItem value="SHORT">Short</SelectItem>
                </SelectContent>
            </Select>

            <Select
                value={filters.status ?? 'ALL'}
                onValueChange={(v: any) => onChange({
                    ...filters,
                    status: v === 'ALL' ? undefined : v as TradeStatus,
                    page: 0,
                })}
            >
                <SelectTrigger className="w-32">
                    <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="ALL">All Status</SelectItem>
                    <SelectItem value="CLOSED">Closed</SelectItem>
                    <SelectItem value="OPEN">Open</SelectItem>
                    <SelectItem value="PARTIAL">Partial</SelectItem>
                </SelectContent>
            </Select>

            <Select
                value={filters.assetClass ?? 'ALL'}
                onValueChange={(v: any) => onChange({
                    ...filters,
                    assetClass: v === 'ALL' ? undefined : v as AssetClass,
                    page: 0,
                })}
            >
                <SelectTrigger className="w-36">
                    <SelectValue placeholder="Asset Class" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="ALL">All Assets</SelectItem>
                    <SelectItem value="STOCK">Stock</SelectItem>
                    <SelectItem value="FUTURES">Futures</SelectItem>
                    <SelectItem value="FOREX">Forex</SelectItem>
                    <SelectItem value="CRYPTO">Crypto</SelectItem>
                    <SelectItem value="OPTIONS">Options</SelectItem>
                </SelectContent>
            </Select>

            {hasFilters && (
                <Button
                    variant="ghost" size="sm"
                    onClick={() => onChange({ page: 0 })}
                    className="text-muted-foreground"
                >
                    <X size={14} className="mr-1" />
                    Clear
                </Button>
            )}
        </div>
    );
}