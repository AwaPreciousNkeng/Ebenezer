package com.codewithpcodes.ebenezer.journal;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDate;

@Data
public class JournalRequest {

    @NotNull(message = "Entry date is required")
    private LocalDate entryDate;

    private String prePlan;      // rich text HTML
    private String postReview;   // rich text HTML
    private String marketNotes;

    @Min(value = 1, message = "Emotion score must be between 1 and 5")
    @Max(value = 5, message = "Emotion score must be between 1 and 5")
    private Integer emotionScore;
}
