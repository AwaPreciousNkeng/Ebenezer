package com.codewithpcodes.ebenezer.analytics;

import com.codewithpcodes.ebenezer.trade.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class AnalyticsService {

    private final TradeRepository tradeRepository;
    private final AnalyticsSnapshotRepository snapshotRepository;

    public TradeSummaryResponse getSummary(
            UUID userId, UUID accountId,
            OffsetDateTime from, OffsetDateTime to) {

        TradeSummaryProjection raw =
                tradeRepository.getSummaryStats(userId, accountId, from, to);

        long total    = raw.getTotalTrades() != null
                ? raw.getTotalTrades() : 0L;
        long wins     = raw.getWinningTrades() != null
                ? raw.getWinningTrades() : 0L;
        long losses   = raw.getLosingTrades() != null
                ? raw.getLosingTrades() : 0L;

        BigDecimal winRate = total > 0
                ? BigDecimal.valueOf(wins)
                .divide(BigDecimal.valueOf(total), 4, RoundingMode.HALF_UP)
                .multiply(BigDecimal.valueOf(100))
                : BigDecimal.ZERO;

        BigDecimal profitFactor = calculateProfitFactor(
                raw.getAvgWin(), wins, raw.getAvgLoss(), losses);

        return TradeSummaryResponse.builder()
                .totalTrades(total)
                .winningTrades(wins)
                .losingTrades(losses)
                .winRate(winRate)
                .totalNetPnl(raw.getTotalNetPnl())
                .totalGrossPnl(raw.getTotalGrossPnl())
                .avgWin(raw.getAvgWin())
                .avgLoss(raw.getAvgLoss())
                .avgRiskReward(raw.getAvgRiskReward())
                .profitFactor(profitFactor)
                .build();
    }

    public List<EquityCurvePoint> getEquityCurve(
            UUID userId, UUID accountId,
            OffsetDateTime from, OffsetDateTime to) {

        List<DailyPnlProjection> daily =
                tradeRepository.getEquityCurve(userId, accountId, from, to);

        // Build cumulative equity curve
        BigDecimal cumulative = BigDecimal.ZERO;
        List<EquityCurvePoint> curve = new ArrayList<>();

        for (DailyPnlProjection point : daily) {
            cumulative = cumulative.add(
                    point.getDailyPnl() != null
                            ? point.getDailyPnl() : BigDecimal.ZERO);
            curve.add(new EquityCurvePoint(
                    point.getTradeDate(), cumulative));
        }

        return curve;
    }

    public List<SymbolPnlProjection> getPnlBySymbol(
            UUID userId, UUID accountId) {
        return tradeRepository.getPnlBySymbol(userId, accountId);
    }

    public List<DayOfWeekPnlProjection> getPnlByDayOfWeek(
            UUID userId, UUID accountId) {
        return tradeRepository.getPnlByDayOfWeek(userId, accountId);
    }

    public DrawdownResponse getMaxDrawdown(
            UUID userId, UUID accountId) {
        List<BigDecimal> pnlList =
                tradeRepository.getOrderedPnlList(userId, accountId);

        BigDecimal peak = BigDecimal.ZERO;
        BigDecimal maxDrawdown = BigDecimal.ZERO;
        BigDecimal cumulative = BigDecimal.ZERO;

        for (BigDecimal pnl : pnlList) {
            cumulative = cumulative.add(pnl);
            if (cumulative.compareTo(peak) > 0) {
                peak = cumulative;
            }
            BigDecimal drawdown = peak.subtract(cumulative);
            if (drawdown.compareTo(maxDrawdown) > 0) {
                maxDrawdown = drawdown;
            }
        }

        return new DrawdownResponse(maxDrawdown);
    }

    public StreakResponse getStreak(UUID userId, UUID accountId) {
        List<BigDecimal> pnlList =
                tradeRepository.getOrderedPnlList(userId, accountId);

        int currentStreak = 0;
        int maxWinStreak  = 0;
        int maxLossStreak = 0;
        int winStreak     = 0;
        int lossStreak    = 0;

        for (BigDecimal pnl : pnlList) {
            if (pnl.compareTo(BigDecimal.ZERO) > 0) {
                winStreak++;
                lossStreak = 0;
                maxWinStreak = Math.max(maxWinStreak, winStreak);
            } else {
                lossStreak++;
                winStreak = 0;
                maxLossStreak = Math.max(maxLossStreak, lossStreak);
            }
        }

        // Current streak = last direction
        if (!pnlList.isEmpty()) {
            BigDecimal last = pnlList.getLast();
            currentStreak = last.compareTo(BigDecimal.ZERO) > 0
                    ? winStreak : -lossStreak;
        }

        return new StreakResponse(currentStreak, maxWinStreak, maxLossStreak);
    }

    // -------------------------------------------------------
    private BigDecimal calculateProfitFactor(
            BigDecimal avgWin, long wins,
            BigDecimal avgLoss, long losses) {
        if (avgWin == null || avgLoss == null
                || losses == 0 || avgLoss.compareTo(BigDecimal.ZERO) == 0) {
            return BigDecimal.ZERO;
        }
        BigDecimal grossWin =
                avgWin.multiply(BigDecimal.valueOf(wins));
        BigDecimal grossLoss =
                avgLoss.abs().multiply(BigDecimal.valueOf(losses));
        return grossLoss.compareTo(BigDecimal.ZERO) == 0
                ? BigDecimal.ZERO
                : grossWin.divide(grossLoss, 4, RoundingMode.HALF_UP);
    }
}
