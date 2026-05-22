package com.codewithpcodes.ebenezer.util;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.util.UUID;

@Data
public class ImportRequest {

    @NotNull(message = "Account ID is required")
    private UUID accountId;

    @NotBlank(message = "Broker name is required")
    private String brokerName;
}
