package com.codewithpcodes.ebenezer.playbook;

import com.codewithpcodes.ebenezer.trade.Trade;
import com.codewithpcodes.ebenezer.user.User;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

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
@Table(
        name = "playbooks",
        uniqueConstraints = @UniqueConstraint(
                columnNames = {"user_id", "name"}
        )
)
public class Playbook {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false)
    private String name;

    @Column(columnDefinition = "TEXT")
    private String description;

    // Flexible rule storage
    // e.g. {"max_risk_percent": 1.0,
    //        "entry_criteria": ["Above 200MA"],
    //        "allowed_sessions": ["AM"],
    //        "max_daily_trades": 3}
    @Column(columnDefinition = "JSONB")
    private String rules;

    @Column(nullable = false)
    private boolean isActive = true;

    @OneToMany(mappedBy = "playbook",
            fetch = FetchType.LAZY)
    private List<Trade> trades = new ArrayList<>();

    @CreationTimestamp
    @Column(updatable = false)
    private OffsetDateTime createdAt;

    @UpdateTimestamp
    private OffsetDateTime updatedAt;
}
