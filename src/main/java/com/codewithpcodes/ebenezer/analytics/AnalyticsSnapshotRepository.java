package com.codewithpcodes.ebenezer.analytics;

import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface AnalyticsSnapshotRepository extends JpaRepository<AnalyticsSnapshot, UUID> {

    Optional<AnalyticsSnapshot> findByUserIdAndAccountIdAndSnapshotDateAndPeriod(
            UUID userId, UUID accountId,
            LocalDate snapshotDate, SnapshotPeriod period
    );

    List<AnalyticsSnapshot> findAllByUserIdAndPeriodOrderBySnapshotDateAsc(
            UUID userId, SnapshotPeriod period);

    List<AnalyticsSnapshot> findAllByUserIdAndAccountIdAndPeriodOrderBySnapshotDateAsc(
            UUID userId, UUID accountId, SnapshotPeriod period);

    // Latest snapshot per period
    @Query("""
        SELECT a FROM AnalyticsSnapshot a
        WHERE a.user.id = :userId
          AND a.period = :period
          AND (:accountId IS NULL OR a.account.id = :accountId)
        ORDER BY a.snapshotDate DESC
    """)
    List<AnalyticsSnapshot> findLatestSnapshots(
            @Param("userId")    UUID userId,
            @Param("accountId") UUID accountId,
            @Param("period")    SnapshotPeriod period,
            Pageable pageable
    );

    void deleteAllByUserIdAndPeriodAndSnapshotDateBefore(
            UUID userId, SnapshotPeriod period, LocalDate date);
}
