package com.codewithpcodes.ebenezer.analytics;

import com.codewithpcodes.ebenezer.account.Account;
import com.codewithpcodes.ebenezer.user.User;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.UUID;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
@Entity
@Table(
        name = "analytics_snapshots",
        uniqueConstraints = @UniqueConstraint(
                columnNames = {"user_id", "account_id", "snapshot_date", "period"}
        )
)
public class AnalyticsSnapshot {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "account_id")
    private Account account;

    @Column(nullable = false)
    private LocalDate snapshotDate;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private SnapshotPeriod period;

    // Aggregated Metrics
    private Integer totalTrades = 0;
    private Integer winningTrades = 0;
    private Integer losingTrades = 0;

    @Column(precision = 5, scale = 2)
    private BigDecimal winRate;

    @Column(precision = 15, scale = 2)
    private BigDecimal grossPnl;

    @Column(precision = 15, scale = 2)
    private BigDecimal netPnl;

    @Column(precision = 8, scale = 4)
    private BigDecimal profitFactor;

    @Column(precision = 12, scale = 2)
    private BigDecimal avgWin;

    @Column(precision = 12, scale = 2)
    private BigDecimal avgLoss;

    @Column(precision = 12, scale = 2)
    private BigDecimal maxDrawdown;

    @Column(precision = 8, scale = 4)
    private BigDecimal avgRiskReward;

    @Column(nullable = false)
    private OffsetDateTime calculatedAt = OffsetDateTime.now();
}
