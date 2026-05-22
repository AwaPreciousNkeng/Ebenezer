package com.codewithpcodes.ebenezer.trade;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.OffsetDateTime;
import java.util.UUID;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
@Entity
@Table(name = "trade_screenshots")
public class TradeScreenshot {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "trade_id", nullable = false)
    private Trade trade;

    @Column(nullable = false)
    private String s3Key;

    @Column(nullable = false)
    private String url;

    private String label; // e.g. 'Entry', 'Exit', 'Setup'

    @CreationTimestamp
    @Column(updatable = false)
    private OffsetDateTime uploadedAt;
}
