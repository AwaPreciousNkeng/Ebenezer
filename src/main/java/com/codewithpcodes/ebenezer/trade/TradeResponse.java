package com.codewithpcodes.ebenezer.trade;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TradeResponse {

    private UUID id;
    private UUID accountId;
    private String accountName;
    private String symbol;
    private AssetClass assetClass;
    private TradeDirection direction;
    private TradeStatus status;

    private BigDecimal entryPrice;
    private BigDecimal exitPrice;
    private BigDecimal quantity;
    private OffsetDateTime entryDate;
    private OffsetDateTime exitDate;

    private BigDecimal grossPnl;
    private BigDecimal commission;
    private BigDecimal netPnl;
    private BigDecimal pnlPercent;
    private BigDecimal riskReward;

    private BigDecimal stopLoss;
    private BigDecimal takeProfit;
    private BigDecimal plannedRisk;

    private Integer executionRating;
    private UUID playbookId;
    private String playbookName;
    private String notes;
    private boolean isRuleViolated;
    private boolean imported;
    private String importSource;

    private List<TradeTagResponse> tags;
    private List<TradeScreenshotResponse> screenshots;

    private OffsetDateTime createdAt;
    private OffsetDateTime updatedAt;

    public static TradeResponse from(Trade trade) {
        return TradeResponse.builder()
                .id(trade.getId())
                .accountId(trade.getAccount().getId())
                .accountName(trade.getAccount().getAccountName())
                .symbol(trade.getSymbol())
                .assetClass(trade.getAssetClass())
                .direction(trade.getDirection())
                .status(trade.getStatus())
                .entryPrice(trade.getEntryPrice())
                .exitPrice(trade.getExitPrice())
                .quantity(trade.getQuantity())
                .entryDate(trade.getEntryDate())
                .exitDate(trade.getExitDate())
                .grossPnl(trade.getGrossPnl())
                .commission(trade.getCommission())
                .netPnl(trade.getNetPnl())
                .pnlPercent(trade.getPnlPercent())
                .riskReward(trade.getRiskReward())
                .stopLoss(trade.getStopLoss())
                .takeProfit(trade.getTakeProfit())
                .plannedRisk(trade.getPlannedRisk())
                .executionRating(trade.getExecutionRating())
                .playbookId(trade.getPlaybook() != null
                        ? trade.getPlaybook().getId() : null)
                .playbookName(trade.getPlaybook() != null
                        ? trade.getPlaybook().getName() : null)
                .notes(trade.getNotes())
                .isRuleViolated(trade.isRuleViolated())
                .imported(trade.isImported())
                .importSource(trade.getImportSource())
                .tags(trade.getTags() != null
                        ? trade.getTags().stream()
                        .map(TradeTagResponse::from)
                        .collect(Collectors.toList())
                        : List.of())
                .screenshots(trade.getScreenshots() != null
                        ? trade.getScreenshots().stream()
                        .map(TradeScreenshotResponse::from)
                        .collect(Collectors.toList())
                        : List.of())
                .createdAt(trade.getCreatedAt())
                .updatedAt(trade.getUpdatedAt())
                .build();
    }
}
