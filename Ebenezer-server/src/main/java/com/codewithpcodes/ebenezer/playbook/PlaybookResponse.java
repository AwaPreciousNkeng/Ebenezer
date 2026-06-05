package com.codewithpcodes.ebenezer.playbook;

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
public class PlaybookResponse {

    private UUID id;
    private String name;
    private String description;
    private String rules;
    private boolean isActive;
    private OffsetDateTime createdAt;
    private OffsetDateTime updatedAt;

    public static PlaybookResponse from(Playbook p) {
        return PlaybookResponse.builder()
                .id(p.getId())
                .name(p.getName())
                .description(p.getDescription())
                .rules(p.getRules())
                .isActive(p.isActive())
                .createdAt(p.getCreatedAt())
                .updatedAt(p.getUpdatedAt())
                .build();
    }
}
