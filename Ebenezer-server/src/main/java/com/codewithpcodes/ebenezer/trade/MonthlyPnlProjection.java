package com.codewithpcodes.ebenezer.trade;

import java.math.BigDecimal;

public interface MonthlyPnlProjection {
    Integer getYear();
    Integer getMonth();
    Long getTotalTrades();
    BigDecimal getTotalPnl();
}
