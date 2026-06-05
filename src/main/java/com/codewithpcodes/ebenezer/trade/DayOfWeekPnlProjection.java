package com.codewithpcodes.ebenezer.trade;

import java.math.BigDecimal;

public interface DayOfWeekPnlProjection {
    Integer getDayOfWeek();
    Long getTotalTrades();
    BigDecimal getTotalPnl();
}
