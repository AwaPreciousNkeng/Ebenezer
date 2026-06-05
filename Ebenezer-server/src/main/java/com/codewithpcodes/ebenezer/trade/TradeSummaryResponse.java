package com.codewithpcodes.ebenezer.trade;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TradeSummaryResponse {
    private long totalTrades;
    private long winningTrades;
    private long losingTrades;
    private BigDecimal winRate;
    private BigDecimal totalNetPnl;
    private BigDecimal totalGrossPnl;
    private BigDecimal avgWin;
    private BigDecimal avgLoss;
    private BigDecimal avgRiskReward;
    private BigDecimal profitFactor;
}
