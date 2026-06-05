package com.codewithpcodes.ebenezer.journal;

import com.codewithpcodes.ebenezer.user.User;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

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
        name = "journal_entries",
        uniqueConstraints = @UniqueConstraint(
                columnNames = {"user_id", "entry_date"}
        )
)
public class JournalEntry {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false)
    private LocalDate entryDate;

    // Rich text (HTML from TipTap/Quill)
    @Column(columnDefinition = "TEXT")
    private String prePlan;         // Pre-market plan

    @Column(columnDefinition = "TEXT")
    private String postReview;      // End-of-day review

    @Column(columnDefinition = "TEXT")
    private String marketNotes;     // General market observations

    @Column(columnDefinition = "SMALLINT")
    private Integer emotionScore;   // 1–5 mood rating

    @CreationTimestamp
    @Column(updatable = false)
    private OffsetDateTime createdAt;

    @UpdateTimestamp
    private OffsetDateTime updatedAt;
}
