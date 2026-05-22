package com.codewithpcodes.ebenezer.playbook;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface PlaybookRepository extends JpaRepository<Playbook, UUID> {

    List<Playbook> findAllByUserIdAndIsActiveTrue(UUID userId);

    Optional<Playbook> findByIdAndUserId(UUID id, UUID userId);

    boolean existsByUserIdAndName(UUID userId, String name);

    // Playbook performance stats
    @Query("""
        SELECT
            p.id AS playbookId,
            p.name AS playbookName,
            COUNT(t) AS totalTrades,
            SUM(CASE WHEN t.netPnl > 0 THEN 1 ELSE 0 END) AS winningTrades,
            SUM(t.netPnl) AS totalPnl,
            AVG(t.riskReward) AS avgRiskReward
        FROM Playbook p
        LEFT JOIN p.trades t
        WHERE p.user.id = :userId
          AND p.isActive = TRUE
          AND (t.status = 'CLOSED' OR t IS NULL)
        GROUP BY p.id, p.name
    """)
    List<PlaybookStatsProjection> getPlaybookStats(
            @Param("userId") UUID userId
    );
}

