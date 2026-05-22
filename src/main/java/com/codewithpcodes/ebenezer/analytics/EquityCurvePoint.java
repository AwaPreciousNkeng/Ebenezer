package com.codewithpcodes.ebenezer.analytics;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class EquityCurvePoint {
    private LocalDate date;
    private BigDecimal cumulativePnl;
}
