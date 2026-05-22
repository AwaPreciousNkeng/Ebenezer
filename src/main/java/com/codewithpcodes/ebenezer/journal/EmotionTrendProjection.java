package com.codewithpcodes.ebenezer.journal;

import java.time.LocalDate;

public interface EmotionTrendProjection {
    LocalDate getEntryDate();
    Integer getEmotionScore();
}
