package com.codewithpcodes.ebenezer.trade;

import java.math.BigDecimal;

public interface SymbolPnlProjection {
    String getSymbol();
    Long getTotalTrades();
    BigDecimal getTotalPnl();
    BigDecimal getAvgPnl();
}
