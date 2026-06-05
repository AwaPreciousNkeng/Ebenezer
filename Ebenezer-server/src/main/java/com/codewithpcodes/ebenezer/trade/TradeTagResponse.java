package com.codewithpcodes.ebenezer.trade;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TradeTagResponse {

    private UUID id;
    private String tag;
    private TagType tagType;

    public static TradeTagResponse from(TradeTag tag) {
        return TradeTagResponse.builder()
                .id(tag.getId())
                .tag(tag.getTag())
                .tagType(tag.getTagType())
                .build();
    }
}
