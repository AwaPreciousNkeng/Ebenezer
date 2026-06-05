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

        // Skip if trade is not closed
        if (trade.getStatus() != TradeStatus.CLOSED) {
            return;
        }

        // -------------------------------------------------------
        // 1. Gross P&L
        // LONG:  (exitPrice - entryPrice) * quantity * contractSize
        // SHORT: (entryPrice - exitPrice) * quantity * contractSize
        // -------------------------------------------------------

        BigDecimal contractSize = resolveContractSize(trade.getSymbol());

        BigDecimal priceDiff = trade.getDirection() == TradeDirection.LONG
                ? trade.getExitPrice().subtract(trade.getEntryPrice())
                : trade.getEntryPrice().subtract(trade.getExitPrice());

        BigDecimal grossPnl = priceDiff
                .multiply(trade.getQuantity())
                .multiply(contractSize)
                .setScale(2, RoundingMode.HALF_UP);

        // -------------------------------------------------------
        // 2. Net P&L (after commission and swap)
        // -------------------------------------------------------
        BigDecimal commission = trade.getCommission() != null
                ? trade.getCommission()
                : BigDecimal.ZERO;

        BigDecimal swap = trade.getSwap() != null
                ? trade.getSwap()
                : BigDecimal.ZERO;

        BigDecimal netPnl = grossPnl
                .subtract(commission)
                .add(swap)
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
                        .multiply(contractSize)
                        .setScale(2, RoundingMode.HALF_UP);

                if (impliedRisk.compareTo(BigDecimal.ZERO) > 0) {
                    riskReward = netPnl.divide(
                            impliedRisk, 4, RoundingMode.HALF_UP);
                }
            }
        }

        // -------------------------------------------------------
        // 5. Rule Violation Check
        // Flag if actual loss exceeds planned risk
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

    private BigDecimal resolveContractSize(String symbol) {
        if (symbol == null) return BigDecimal.ONE;

        String upper = symbol.toUpperCase();

        // Metals
        if (upper.startsWith("XAUUSD")) return new BigDecimal("100");
        if (upper.startsWith("XAGUSD")) return new BigDecimal("5000");

        // Indices and commodities
        if (upper.startsWith("US30") ||
                upper.startsWith("USTEC") ||
                upper.startsWith("US500") ||
                upper.startsWith("UK100") ||
                upper.startsWith("GER40") ||
                upper.startsWith("JP225") ||
                upper.startsWith("USOIL") ||
                upper.startsWith("UKOIL"))
            return BigDecimal.ONE;

        // Crypto
        if (upper.startsWith("BTC") ||
                upper.startsWith("XRP") ||
                upper.startsWith("LTC") ||
                upper.startsWith("SOL") ||
                upper.startsWith("ADA") ||
                upper.startsWith("ETH")) return BigDecimal.ONE;

        // Forex — standard lot
        return new BigDecimal("100000");
    }
}
