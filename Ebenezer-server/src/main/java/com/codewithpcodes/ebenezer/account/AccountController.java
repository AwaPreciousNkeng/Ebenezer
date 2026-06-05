package com.codewithpcodes.ebenezer.account;

import com.codewithpcodes.ebenezer.handler.ApiResponse;
import com.codewithpcodes.ebenezer.user.MessageResponse;
import com.codewithpcodes.ebenezer.user.User;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/accounts")
@RequiredArgsConstructor
public class AccountController {

    private final AccountService accountService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<AccountResponse>>> getAccounts(
            @AuthenticationPrincipal User principal
    ) {
        List<AccountResponse> accounts = accountService.getUserAccounts(principal.getId());
        return ResponseEntity.ok(ApiResponse.success(accounts));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<AccountResponse>> createAccount(
            @AuthenticationPrincipal User principal,
            @Valid @RequestBody AccountRequest request
    ) {
        AccountResponse account = accountService.createAccount(principal.getId(), request);
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(ApiResponse.success(account));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<AccountResponse>> updateAccount(
            @AuthenticationPrincipal User principal,
            @PathVariable UUID id,
            @Valid @RequestBody AccountRequest request
    ) {
        AccountResponse account = accountService.updateAccount(principal.getId(), id, request);
        return ResponseEntity.ok(ApiResponse.success(account));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<MessageResponse>> deleteAccount(
            @AuthenticationPrincipal User principal,
            @PathVariable UUID id
    ) {
        MessageResponse response = accountService.deleteAccount(principal.getId(), id);
        return ResponseEntity.ok(ApiResponse.success(response));
    }
}