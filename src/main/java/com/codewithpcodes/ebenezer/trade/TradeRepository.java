package com.codewithpcodes.ebenezer.trade;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface TradeRepository extends JpaRepository<Trade, UUID> {

    Optional<Trade> findByIdAndUserId(UUID id, UUID userId);

    // Paginated trades with filters
    @Query("""
        SELECT t FROM Trade t
        WHERE t.user.id = :userId
          AND (:accountId IS NULL OR t.account.id = :accountId)
          AND (:symbol IS NULL OR UPPER(t.symbol) = UPPER(:symbol))
          AND (:direction IS NULL OR t.direction = :direction)
          AND (:status IS NULL OR t.status = :status)
          AND (:assetClass IS NULL OR t.assetClass = :assetClass)
          AND (:playbookId IS NULL OR t.playbook.id = :playbookId)
          AND (:from IS NULL OR t.entryDate >= :from)
          AND (:to IS NULL OR t.entryDate <= :to)
        ORDER BY t.entryDate DESC
    """)
    Page<Trade> findByFilters(
            @Param("userId")     UUID userId,
            @Param("accountId")  UUID accountId,
            @Param("symbol")     String symbol,
            @Param("direction")  TradeDirection direction,
            @Param("status")     TradeStatus status,
            @Param("assetClass") AssetClass assetClass,
            @Param("playbookId") UUID playbookId,
            @Param("from")       OffsetDateTime from,
            @Param("to")         OffsetDateTime to,
            Pageable pageable
    );

    // Equity curve — cumulative net P&L by day
    @Query("""
        SELECT CAST(t.entryDate AS LocalDate) AS tradeDate,
                       SUM(t.netPnl) AS dailyPnl
                FROM Trade t
                WHERE t.user.id = :userId
                  AND (:accountId IS NULL OR t.account.id = :accountId)
                  AND t.status = 'CLOSED'
                  AND t.entryDate >= :from
                  AND t.entryDate <= :to
                GROUP BY CAST(t.entryDate AS LocalDate)
                ORDER BY CAST(t.entryDate AS LocalDate) ASC
    """)
    List<DailyPnlProjection> getEquityCurve(
            @Param("userId")    UUID userId,
            @Param("accountId") UUID accountId,
            @Param("from")      OffsetDateTime from,
            @Param("to")        OffsetDateTime to
    );

    // P&L grouped by symbol
    @Query("""
        SELECT t.symbol AS symbol,
               COUNT(t) AS totalTrades,
               SUM(t.netPnl) AS totalPnl,
               AVG(t.netPnl) AS avgPnl
        FROM Trade t
        WHERE t.user.id = :userId
          AND t.status = 'CLOSED'
          AND (:accountId IS NULL OR t.account.id = :accountId)
        GROUP BY t.symbol
        ORDER BY totalPnl DESC
    """)
    List<SymbolPnlProjection> getPnlBySymbol(
            @Param("userId")    UUID userId,
            @Param("accountId") UUID accountId
    );

    // P&L grouped by day of week
    @Query("""
        SELECT FUNCTION('DAYOFWEEK', t.entryDate) AS dayOfWeek,
                       COUNT(t) AS totalTrades,
                       SUM(t.netPnl) AS totalPnl
                FROM Trade t
                WHERE t.user.id = :userId
                  AND t.status = 'CLOSED'
                  AND (:accountId IS NULL OR t.account.id = :accountId)
                GROUP BY FUNCTION('DAYOFWEEK', t.entryDate)
                ORDER BY FUNCTION('DAYOFWEEK', t.entryDate) ASC
    """)
    List<DayOfWeekPnlProjection> getPnlByDayOfWeek(
            @Param("userId")    UUID userId,
            @Param("accountId") UUID accountId
    );

    // Win/Loss counts for summary stats
    @Query("""
        SELECT
            COUNT(t) AS totalTrades,
            SUM(CASE WHEN t.netPnl > 0 THEN 1 ELSE 0 END) AS winningTrades,
            SUM(CASE WHEN t.netPnl <= 0 THEN 1 ELSE 0 END) AS losingTrades,
            SUM(t.netPnl) AS totalNetPnl,
            SUM(t.grossPnl) AS totalGrossPnl,
            AVG(CASE WHEN t.netPnl > 0 THEN t.netPnl END) AS avgWin,
            AVG(CASE WHEN t.netPnl <= 0 THEN t.netPnl END) AS avgLoss,
            AVG(t.riskReward) AS avgRiskReward
        FROM Trade t
        WHERE t.user.id = :userId
          AND t.status = 'CLOSED'
          AND (:accountId IS NULL OR t.account.id = :accountId)
          AND (:from IS NULL OR t.entryDate >= :from)
          AND (:to IS NULL OR t.entryDate <= :to)
    """)
    TradeSummaryProjection getSummaryStats(
            @Param("userId")    UUID userId,
            @Param("accountId") UUID accountId,
            @Param("from")      OffsetDateTime from,
            @Param("to")        OffsetDateTime to
    );

    // Rule violations count
    @Query("""
        SELECT COUNT(t) FROM Trade t
        WHERE t.user.id = :userId
          AND t.isRuleViolated = TRUE
          AND t.entryDate >= :from
    """)
    long countRuleViolations(
            @Param("userId") UUID userId,
            @Param("from") OffsetDateTime from
    );

    // Streak — consecutive wins or losses (raw, processed in service)
    @Query("""
        SELECT t.netPnl FROM Trade t
        WHERE t.user.id = :userId
          AND t.status = 'CLOSED'
          AND (:accountId IS NULL OR t.account.id = :accountId)
        ORDER BY t.entryDate ASC
    """)
    List<BigDecimal> getOrderedPnlList(
            @Param("userId")    UUID userId,
            @Param("accountId") UUID accountId
    );
}
