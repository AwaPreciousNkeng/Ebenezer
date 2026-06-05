package com.codewithpcodes.ebenezer.playbook;

import java.util.UUID;

import java.math.BigDecimal;

public interface PlaybookStatsProjection {
    UUID getPlaybookId();
    String getPlaybookName();
    Long getTotalTrades();
    Long getWinningTrades();
    BigDecimal getTotalPnl();
    BigDecimal getAvgRiskReward();
    Long getRuleViolations();
}
