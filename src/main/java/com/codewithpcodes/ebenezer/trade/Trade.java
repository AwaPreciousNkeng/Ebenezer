package com.codewithpcodes.ebenezer.trade;

import com.codewithpcodes.ebenezer.account.Account;
import com.codewithpcodes.ebenezer.playbook.Playbook;
import com.codewithpcodes.ebenezer.user.User;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
@Entity
@Table(name = "trades")
public class Trade {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "account_id", nullable = false)
    private Account account;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "playbook_id")
    private Playbook playbook;

    @Column(nullable = false)
    private String symbol;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private AssetClass assetClass;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private TradeDirection direction;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private TradeStatus status = TradeStatus.CLOSED;

    // Entry & Exit
    @Column(nullable = false, precision = 18, scale = 6)
    private BigDecimal entryPrice;

    @Column(precision = 18, scale = 6)
    private BigDecimal exitPrice;

    @Column(nullable = false, precision = 18, scale = 6)
    private BigDecimal quantity;

    @Column(nullable = false)
    private OffsetDateTime entryDate;

    private OffsetDateTime exitDate;

    // Calculated P&L (set by PnlCalculator)
    @Column(precision = 15, scale = 2)
    private BigDecimal grossPnl;

    @Column(precision = 10, scale = 2)
    private BigDecimal commission = BigDecimal.ZERO;

    @Column(precision = 15, scale = 2)
    private BigDecimal netPnl;

    @Column(precision = 8, scale = 4)
    private BigDecimal pnlPercent;

    @Column(precision = 8, scale = 4)
    private BigDecimal riskReward;

    // Risk Management
    @Column(precision = 18, scale = 6)
    private BigDecimal stopLoss;

    @Column(precision = 18, scale = 6)
    private BigDecimal takeProfit;

    @Column(precision = 10, scale = 2)
    private BigDecimal plannedRisk;

    // Meta
    @Column(columnDefinition = "SMALLINT")
    private Integer executionRating; // 1–5

    @Column(columnDefinition = "TEXT")
    private String notes;

    private boolean isRuleViolated = false;
    private boolean imported = false;
    private String importSource;

    @OneToMany(mappedBy = "trade",
            cascade = CascadeType.ALL,
            orphanRemoval = true)
    private List<TradeTag> tags = new ArrayList<>();

    @OneToMany(mappedBy = "trade",
            cascade = CascadeType.ALL,
            orphanRemoval = true)
    private List<TradeScreenshot> screenshots = new ArrayList<>();

    @CreationTimestamp
    @Column(updatable = false)
    private OffsetDateTime createdAt;

    @UpdateTimestamp
    private OffsetDateTime updatedAt;


}
