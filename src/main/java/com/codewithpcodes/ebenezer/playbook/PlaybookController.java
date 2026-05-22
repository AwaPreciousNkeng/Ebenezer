package com.codewithpcodes.ebenezer.playbook;

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
@RequestMapping("/api/v1/playbooks")
@RequiredArgsConstructor
public class PlaybookController {

    private final PlaybookService playbookService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<PlaybookResponse>>> getPlaybooks(
            @AuthenticationPrincipal User principal) {
        List<PlaybookResponse> playbooks =
                playbookService.getUserPlaybooks(principal.getId());
        return ResponseEntity.ok(ApiResponse.success(playbooks));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<PlaybookResponse>> getPlaybook(
            @AuthenticationPrincipal User principal,
            @PathVariable UUID id) {
        PlaybookResponse playbook =
                playbookService.getPlaybook(principal.getId(), id);
        return ResponseEntity.ok(ApiResponse.success(playbook));
    }

    @GetMapping("/stats")
    public ResponseEntity<ApiResponse<List<PlaybookStatsProjection>>> getStats(
            @AuthenticationPrincipal User principal) {
        List<PlaybookStatsProjection> stats =
                playbookService.getPlaybookStats(principal.getId());
        return ResponseEntity.ok(ApiResponse.success(stats));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<PlaybookResponse>> createPlaybook(
            @AuthenticationPrincipal User principal,
            @Valid @RequestBody PlaybookRequest request) {
        PlaybookResponse playbook =
                playbookService.createPlaybook(principal.getId(), request);
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(ApiResponse.success(playbook));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<PlaybookResponse>> updatePlaybook(
            @AuthenticationPrincipal User principal,
            @PathVariable UUID id,
            @Valid @RequestBody PlaybookRequest request) {
        PlaybookResponse playbook =
                playbookService.updatePlaybook(principal.getId(), id, request);
        return ResponseEntity.ok(ApiResponse.success(playbook));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<MessageResponse>> deletePlaybook(
            @AuthenticationPrincipal User principal,
            @PathVariable UUID id) {
        MessageResponse response =
                playbookService.deletePlaybook(principal.getId(), id);
        return ResponseEntity.ok(ApiResponse.success(response));
    }
}
