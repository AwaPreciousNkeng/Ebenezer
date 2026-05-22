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
        return TradeScreenshotResponse.builder()
                .id(s.getId())
                .url(s.getUrl())
                .label(s.getLabel())
                .uploadedAt(s.getUploadedAt())
                .build();
    }
}
