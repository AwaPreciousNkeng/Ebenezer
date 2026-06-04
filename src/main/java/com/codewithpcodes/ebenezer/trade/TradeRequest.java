package com.codewithpcodes.ebenezer.trade;

import jakarta.validation.constraints.*;
import lombok.Data;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

@Data
public class TradeRequest {

    @NotNull(message = "Account ID is required")
    private UUID accountId;

    @NotBlank(message = "Symbol is required")
    @Size(max = 30, message = "Symbol too long")
    private String symbol;

    @NotNull(message = "Asset class is required")
    private AssetClass assetClass;

    @NotNull(message = "Direction is required")
    private TradeDirection direction;

    private BigDecimal swap;

    private TradeStatus status;

    @NotNull(message = "Entry price is required")
    @DecimalMin(value = "0.0", inclusive = false,
            message = "Entry price must be greater than 0")
    private BigDecimal entryPrice;

    private BigDecimal exitPrice;

    @NotNull(message = "Quantity is required")
    @DecimalMin(value = "0.0", inclusive = false,
            message = "Quantity must be greater than 0")
    private BigDecimal quantity;

    @NotNull(message = "Entry date is required")
    private OffsetDateTime entryDate;

    private OffsetDateTime exitDate;

    @DecimalMin(value = "0.0", message = "Commission must be non-negative")
    private BigDecimal commission;

    private BigDecimal stopLoss;
    private BigDecimal takeProfit;

    @DecimalMin(value = "0.0", message = "Planned risk must be non-negative")
    private BigDecimal plannedRisk;

    @Min(value = 1, message = "Rating must be between 1 and 5")
    @Max(value = 5, message = "Rating must be between 1 and 5")
    private Integer executionRating;

    private UUID playbookId;

    @Size(max = 5000, message = "Notes too long")
    private String notes;

    private List<TagRequest> tags;
}
