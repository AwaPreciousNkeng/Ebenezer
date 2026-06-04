package com.codewithpcodes.ebenezer.importBatch;

import java.util.List;

public record ExnessImportResult(
        List<ExnessTradeRow> trades,
        List<String> rejectedRows
) {
}
