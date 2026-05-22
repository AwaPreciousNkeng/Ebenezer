package com.codewithpcodes.ebenezer.analytics;

import lombok.Data;

import java.time.OffsetDateTime;
import java.util.UUID;

@Data
public class AnalyticsFilterRequest {
    private UUID accountId;
    private OffsetDateTime from;
    private OffsetDateTime to;
}
