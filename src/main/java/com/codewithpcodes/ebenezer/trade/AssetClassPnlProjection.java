package com.codewithpcodes.ebenezer.trade;

import java.math.BigDecimal;

public interface AssetClassPnlProjection {
    String getAssetClass();
    Long getTotalTrades();
    BigDecimal getTotalPnl();
}
