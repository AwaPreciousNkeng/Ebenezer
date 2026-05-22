package com.codewithpcodes.ebenezer.account;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AccountResponse {

    private UUID id;
    private String accountName;
    private String brokerName;
    private AccountType accountType;
    private String currency;
    private BigDecimal startingBalance;
    private boolean isActive;
    private OffsetDateTime createdAt;

    public static AccountResponse from(Account account) {
        return AccountResponse.builder()
                .id(account.getId())
                .accountName(account.getAccountName())
                .brokerName(account.getBrokerName())
                .accountType(account.getAccountType())
                .currency(account.getCurrency())
                .startingBalance(account.getStartingBalance())
                .isActive(account.isActive())
                .createdAt(account.getCreatedAt())
                .build();
    }
}
