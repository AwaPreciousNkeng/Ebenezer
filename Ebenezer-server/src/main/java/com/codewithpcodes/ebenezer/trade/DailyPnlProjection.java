package com.codewithpcodes.ebenezer.trade;

import java.math.BigDecimal;
import java.time.LocalDate;

public interface DailyPnlProjection {
    LocalDate getTradeDate();
    BigDecimal getDailyPnl();
}
