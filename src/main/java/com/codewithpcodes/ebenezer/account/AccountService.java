package com.codewithpcodes.ebenezer.account;

import com.codewithpcodes.ebenezer.exceptions.DuplicateResourceException;
import com.codewithpcodes.ebenezer.exceptions.ResourceNotFoundException;
import com.codewithpcodes.ebenezer.user.MessageResponse;
import com.codewithpcodes.ebenezer.user.User;
import com.codewithpcodes.ebenezer.user.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
@Slf4j
public class AccountService {

    private final AccountRepository accountRepository;
    private final UserRepository userRepository;

    @Transactional(readOnly = true)
    public List<AccountResponse> getUserAccounts(UUID userId) {
        return accountRepository
                .findAllByUserIdAndIsActiveTrue(userId)
                .stream()
                .map(AccountResponse::from)
                .collect(Collectors.toList());
    }

    public AccountResponse createAccount(
            UUID userId, AccountRequest request) {
        if (accountRepository.existsByUserIdAndAccountName(
                userId, request.getAccountName())) {
            throw new DuplicateResourceException(
                    "Account name already exists");
        }

        User user = userRepository.findById(userId)
                .orElseThrow(() ->
                        new ResourceNotFoundException("User not found"));

        Account account = Account.builder()
                .user(user)
                .accountName(request.getAccountName())
                .brokerName(request.getBrokerName())
                .accountType(request.getAccountType())
                .currency(request.getCurrency() != null
                        ? request.getCurrency() : "USD")
                .startingBalance(request.getStartingBalance() != null
                        ? request.getStartingBalance() : BigDecimal.ZERO)
                .build();

        return AccountResponse.from(accountRepository.save(account));
    }

    public AccountResponse updateAccount(
            UUID userId, UUID accountId, AccountRequest request) {
        Account account = accountRepository
                .findByIdAndUserId(accountId, userId)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Account not found"));

        if (request.getAccountName() != null) {
            account.setAccountName(request.getAccountName());
        }
        if (request.getBrokerName() != null) {
            account.setBrokerName(request.getBrokerName());
        }
        if (request.getAccountType() != null) {
            account.setAccountType(request.getAccountType());
        }

        return AccountResponse.from(accountRepository.save(account));
    }

    public MessageResponse deleteAccount(UUID userId, UUID accountId) {
        Account account = accountRepository
                .findByIdAndUserId(accountId, userId)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Account not found"));

        account.setActive(false);
        accountRepository.save(account);

        return new MessageResponse("Account deleted successfully");
    }
}
