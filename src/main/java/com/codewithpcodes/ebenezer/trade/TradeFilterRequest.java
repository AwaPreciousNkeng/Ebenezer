package com.codewithpcodes.ebenezer.trade;

import lombok.Data;

import java.time.OffsetDateTime;
import java.util.UUID;

@Data
public class TradeFilterRequest {
    private UUID accountId;
    private String symbol;
    private TradeDirection direction;
    private TradeStatus status;
    private AssetClass assetClass;
    private UUID playbookId;
    private OffsetDateTime from;
    private OffsetDateTime to;
}
