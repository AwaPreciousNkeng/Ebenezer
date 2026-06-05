package com.codewithpcodes.ebenezer.trade;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.OffsetDateTime;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TradeScreenshotResponse {

    private UUID id;
    private String url;
    private String label;
    private OffsetDateTime uploadedAt;

    public static TradeScreenshotResponse from(TradeScreenshot s) {
        // Expose an authenticated API URL, never the raw filesystem path
        String apiUrl = "/api/v1/trades/" + s.getTrade().getId()
                + "/screenshots/" + s.getId() + "/file";
        return TradeScreenshotResponse.builder()
                .id(s.getId())
                .url(apiUrl)
                .label(s.getLabel())
                .uploadedAt(s.getUploadedAt())
                .build();
    }
}
