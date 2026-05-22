package com.codewithpcodes.ebenezer.playbook;

import java.math.BigDecimal;
import java.util.UUID;

public interface PlaybookStatsProjection {
    UUID getPlaybookId();
    String getPlaybookName();
    Long getTotalTrades();
    Long getWinningTrades();
    BigDecimal getTotalPnl();
    BigDecimal getAvgRiskReward();
}
