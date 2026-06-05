package com.codewithpcodes.ebenezer.analytics;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class DrawdownResponse {
    private BigDecimal maxDrawdown;
}
