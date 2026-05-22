package com.codewithpcodes.ebenezer.util;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ImportResultResponse {
    private int totalRows;
    private int imported;
    private int skipped;
}
