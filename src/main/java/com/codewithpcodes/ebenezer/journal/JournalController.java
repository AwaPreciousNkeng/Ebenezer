package com.codewithpcodes.ebenezer.journal;

import com.codewithpcodes.ebenezer.handler.ApiResponse;
import com.codewithpcodes.ebenezer.user.MessageResponse;
import com.codewithpcodes.ebenezer.user.User;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/v1/journal")
@RequiredArgsConstructor
public class JournalController {

    private final JournalService journalService;

    @GetMapping
    public ResponseEntity<ApiResponse<Page<JournalResponse>>> getEntries(
            @AuthenticationPrincipal User principal,
            @PageableDefault(size = 10, sort = "entryDate",
                    direction = Sort.Direction.DESC) Pageable pageable
    ) {
        Page<JournalResponse> entries = journalService.getJournalEntries(principal.getId(), pageable);
        return ResponseEntity.ok(ApiResponse.success(entries));
    }

    @GetMapping("/{date}")
    public ResponseEntity<ApiResponse<JournalResponse>> getByDate(
            @AuthenticationPrincipal User principal,
            @PathVariable @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
            LocalDate date) {
        JournalResponse entry =
                journalService.getByDate(principal.getId(), date);
        return ResponseEntity.ok(ApiResponse.success(entry));
    }

    @GetMapping("/search")
    public ResponseEntity<ApiResponse<Page<JournalResponse>>> search(
            @AuthenticationPrincipal User principal,
            @RequestParam String keyword,
            @PageableDefault(size = 10) Pageable pageable) {
        Page<JournalResponse> entries =
                journalService.search(principal.getId(), keyword, pageable);
        return ResponseEntity.ok(ApiResponse.success(entries));
    }

    @GetMapping("/emotion-trend")
    public ResponseEntity<ApiResponse<List<EmotionTrendProjection>>>
    getEmotionTrend(
            @AuthenticationPrincipal User principal,
            @RequestParam(defaultValue = "30") int days) {
        List<EmotionTrendProjection> trend =
                journalService.getEmotionTrend(principal.getId(), days);
        return ResponseEntity.ok(ApiResponse.success(trend));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<JournalResponse>> createOrUpdate(
            @AuthenticationPrincipal User principal,
            @Valid @RequestBody JournalRequest request) {
        JournalResponse entry =
                journalService.createOrUpdate(principal.getId(), request);
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(ApiResponse.success(entry));
    }

    @DeleteMapping("/{date}")
    public ResponseEntity<ApiResponse<MessageResponse>> deleteEntry(
            @AuthenticationPrincipal User principal,
            @PathVariable @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
            LocalDate date) {
        MessageResponse response =
                journalService.deleteEntry(principal.getId(), date);
        return ResponseEntity.ok(ApiResponse.success(response));
    }
}
