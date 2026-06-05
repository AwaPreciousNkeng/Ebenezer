package com.codewithpcodes.ebenezer.account;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class AccountRequest {

    @NotBlank(message = "Account name is required")
    @Size(max = 150, message = "Account name too long")
    private String accountName;

    @Size(max = 100, message = "Broker name too long")
    private String brokerName;

    private AccountType accountType;

    @Size(max = 10)
    private String currency;

    @DecimalMin(value = "0.0", message = "Balance must be non-negative")
    private BigDecimal startingBalance;
}
