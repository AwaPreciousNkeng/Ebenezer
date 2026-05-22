package com.codewithpcodes.ebenezer.journal;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class JournalResponse {

    private UUID id;
    private LocalDate entryDate;
    private String prePlan;
    private String postReview;
    private String marketNotes;
    private Integer emotionScore;
    private OffsetDateTime createdAt;
    private OffsetDateTime updatedAt;

    public static JournalResponse from(JournalEntry j) {
        return JournalResponse.builder()
                .id(j.getId())
                .entryDate(j.getEntryDate())
                .prePlan(j.getPrePlan())
                .postReview(j.getPostReview())
                .marketNotes(j.getMarketNotes())
                .emotionScore(j.getEmotionScore())
                .createdAt(j.getCreatedAt())
                .updatedAt(j.getUpdatedAt())
                .build();
    }
}
