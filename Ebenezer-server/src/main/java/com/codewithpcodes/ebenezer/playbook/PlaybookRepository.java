package com.codewithpcodes.ebenezer.playbook;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface PlaybookRepository extends JpaRepository<Playbook, UUID> {

    List<Playbook> findAllByUserIdAndIsActiveTrue(UUID userId);

    Optional<Playbook> findByIdAndUserId(UUID id, UUID userId);

    boolean existsByUserIdAndNameAndIsActiveTrue(UUID userId, String name);

    // Playbook performance stats
    @Query("""
                SELECT
                    p.id AS playbookId,
                    p.name AS playbookName,
                    COUNT(t) AS totalTrades,
                    COALESCE(SUM(CASE WHEN t.netPnl > 0 THEN 1 ELSE 0 END), 0) AS winningTrades,
                    COALESCE(SUM(t.netPnl), 0) AS totalPnl,
                    COALESCE(AVG(t.riskReward), 0) AS avgRiskReward,
                    COALESCE(SUM(CASE WHEN t.isRuleViolated = TRUE THEN 1 ELSE 0 END), 0) AS ruleViolations
                FROM Playbook p
                LEFT JOIN p.trades t ON t.status = 'CLOSED'
                WHERE p.user.id = :userId
                  AND p.isActive = TRUE
                GROUP BY p.id, p.name
            """)
    List<PlaybookStatsProjection> getPlaybookStats(
            @Param("userId") UUID userId
    );
}