package com.codewithpcodes.ebenezer.journal;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface JournalEntryRepository extends JpaRepository<JournalEntry, UUID> {

    Optional<JournalEntry> findByUserIdAndEntryDate(
            UUID userId, LocalDate entryDate);

    Optional<JournalEntry> findByIdAndUserId(UUID id, UUID userId);

    // Paginated journal list for a user
    Page<JournalEntry> findAllByUserIdOrderByEntryDateDesc(
            UUID userId, Pageable pageable);

    // Search journal by keyword in pre-plan or post-review
    @Query("""
        SELECT j FROM JournalEntry j
        WHERE j.user.id = :userId
          AND (
            LOWER(j.prePlan) LIKE LOWER(CONCAT('%', :keyword, '%'))
            OR LOWER(j.postReview) LIKE LOWER(CONCAT('%', :keyword, '%'))
            OR LOWER(j.marketNotes) LIKE LOWER(CONCAT('%', :keyword, '%'))
          )
        ORDER BY j.entryDate DESC
    """)
    Page<JournalEntry> searchByKeyword(
            @Param("userId")  UUID userId,
            @Param("keyword") String keyword,
            Pageable pageable
    );

    // Emotion score trend
    @Query("""
        SELECT j.entryDate AS entryDate,
               j.emotionScore AS emotionScore
        FROM JournalEntry j
        WHERE j.user.id = :userId
          AND j.emotionScore IS NOT NULL
          AND j.entryDate >= :from
        ORDER BY j.entryDate ASC
    """)
    List<EmotionTrendProjection> getEmotionTrend(
            @Param("userId") UUID userId,
            @Param("from")   LocalDate from
    );
}

