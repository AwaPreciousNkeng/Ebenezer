package com.codewithpcodes.ebenezer.importBatch;

import com.codewithpcodes.ebenezer.account.Account;
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
@Table(name = "import_batches")
public class ImportBatch {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "account_id", nullable = false)
    private Account account;

    @Column(nullable = false)
    private String filename;

    @Enumerated(EnumType.STRING)
    private ImportBatchStatus status;

    private int rowCount;
    private int rejectedCount;

    @CreationTimestamp
    @Column(updatable = false)
    private OffsetDateTime importedAt;
}