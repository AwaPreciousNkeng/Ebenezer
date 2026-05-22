package com.codewithpcodes.ebenezer.analytics;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class StreakResponse {
    private int currentStreak;   // positive = win streak, negative = loss
    private int maxWinStreak;
    private int maxLossStreak;
}
