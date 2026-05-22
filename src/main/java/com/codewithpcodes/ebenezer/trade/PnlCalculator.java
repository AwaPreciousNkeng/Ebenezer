package com.codewithpcodes.ebenezer.trade;

import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.math.RoundingMode;

@Component
public class PnlCalculator {

    public void calculate(Trade trade) {

        // Only calculate if we have the required fields
        if (trade.getEntryPrice() == null
                || trade.getExitPrice() == null
                || trade.getQuantity() == null) {
            return;
        }

        // Skip if trade is still open
        if (trade.getStatus() == TradeStatus.OPEN) {
            return;
        }

        // -------------------------------------------------------
        // 1. Gross P&L
        // LONG:  (exitPrice - entryPrice) * quantity
        // SHORT: (entryPrice - exitPrice) * quantity
        // -------------------------------------------------------
        BigDecimal priceDiff = trade.getDirection() == TradeDirection.LONG
                ? trade.getExitPrice().subtract(trade.getEntryPrice())
                : trade.getEntryPrice().subtract(trade.getExitPrice());

        BigDecimal grossPnl = priceDiff
                .multiply(trade.getQuantity())
                .setScale(2, RoundingMode.HALF_UP);

        // -------------------------------------------------------
        // 2. Net P&L (after commission)
        // -------------------------------------------------------
        BigDecimal commission = trade.getCommission() != null
                ? trade.getCommission()
                : BigDecimal.ZERO;

        BigDecimal netPnl = grossPnl
                .subtract(commission)
                .setScale(2, RoundingMode.HALF_UP);

        // -------------------------------------------------------
        // 3. P&L Percentage
        // (priceDiff / entryPrice) * 100
        // -------------------------------------------------------
        BigDecimal pnlPercent = BigDecimal.ZERO;
        if (trade.getEntryPrice().compareTo(BigDecimal.ZERO) != 0) {
            pnlPercent = priceDiff
                    .divide(trade.getEntryPrice(), 8, RoundingMode.HALF_UP)
                    .multiply(BigDecimal.valueOf(100))
                    .setScale(4, RoundingMode.HALF_UP);
        }

        // -------------------------------------------------------
        // 4. Risk : Reward
        // R:R = netPnl / plannedRisk
        // e.g. risked $100, made $200 → R:R = 2.0
        // -------------------------------------------------------
        BigDecimal riskReward = null;
        if (trade.getPlannedRisk() != null
                && trade.getPlannedRisk().compareTo(BigDecimal.ZERO) > 0) {
            riskReward = netPnl
                    .divide(trade.getPlannedRisk().abs(), 4, RoundingMode.HALF_UP);
        } else if (trade.getStopLoss() != null) {
            // Fallback: derive risk from stop loss distance
            BigDecimal stopDistance = trade.getEntryPrice()
                    .subtract(trade.getStopLoss()).abs();

            if (stopDistance.compareTo(BigDecimal.ZERO) > 0) {
                BigDecimal impliedRisk = stopDistance
                        .multiply(trade.getQuantity())
                        .setScale(2, RoundingMode.HALF_UP);

                if (impliedRisk.compareTo(BigDecimal.ZERO) > 0) {
                    riskReward = netPnl.divide(
                            impliedRisk, 4, RoundingMode.HALF_UP);
                }
            }
        }

        // -------------------------------------------------------
        // 5. Rule Violation Check
        // Flag if planned risk was exceeded
        // -------------------------------------------------------
        if (trade.getPlannedRisk() != null
                && trade.getPlannedRisk().compareTo(BigDecimal.ZERO) > 0) {
            BigDecimal actualLoss = netPnl.negate();
            if (actualLoss.compareTo(trade.getPlannedRisk()) > 0) {
                trade.setRuleViolated(true);
            }
        }

        // -------------------------------------------------------
        // 6. Assign all computed fields back to trade
        // -------------------------------------------------------
        trade.setGrossPnl(grossPnl);
        trade.setNetPnl(netPnl);
        trade.setPnlPercent(pnlPercent);
        trade.setRiskReward(riskReward);
    }
}
