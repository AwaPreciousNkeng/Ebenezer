package com.codewithpcodes.ebenezer.importBatch;

import java.math.BigDecimal;
import java.time.OffsetDateTime;

public record ExnessTradeRow(
        String positionId,
        String direction,
        OffsetDateTime openTime,
        String symbol,
        BigDecimal openPrice,
        BigDecimal volume,
        OffsetDateTime closeTime,
        BigDecimal closePrice,
        BigDecimal stopLoss,
        BigDecimal takeProfit,
        BigDecimal commission,
        BigDecimal swap,
        BigDecimal grossPnl
) {
}
