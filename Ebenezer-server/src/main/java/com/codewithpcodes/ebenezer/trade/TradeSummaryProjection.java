package com.codewithpcodes.ebenezer.trade;

import java.math.BigDecimal;

public interface TradeSummaryProjection {
    Long getTotalTrades();
    Long getWinningTrades();
    Long getLosingTrades();
    BigDecimal getTotalNetPnl();
    BigDecimal getTotalGrossPnl();
    BigDecimal getAvgWin();
    BigDecimal getAvgLoss();
    BigDecimal getAvgRiskReward();
}
