package com.codewithpcodes.ebenezer.trade;

import com.codewithpcodes.ebenezer.exceptions.ResourceNotFoundException;
import com.codewithpcodes.ebenezer.handler.ApiResponse;
import com.codewithpcodes.ebenezer.storage.FileService;
import com.codewithpcodes.ebenezer.user.MessageResponse;
import com.codewithpcodes.ebenezer.user.User;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/trades")
@RequiredArgsConstructor
public class TradeController {

    private final TradeService tradeService;
    private final TradeScreenshotService screenshotService;
    private final TradeScreenshotRepository screenshotRepository;
    private final FileService fileService;

    @GetMapping
    public ResponseEntity<ApiResponse<Page<TradeResponse>>> getTrades(
            @AuthenticationPrincipal User principal,
            @ModelAttribute TradeFilterRequest filter,
            @PageableDefault(size = 20, sort = "entryDate",
                    direction = Sort.Direction.DESC) Pageable pageable) {
        Page<TradeResponse> trades =
                tradeService.getTrades(principal.getId(), filter, pageable);
        return ResponseEntity.ok(ApiResponse.success(trades));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<TradeResponse>> getTrade(
            @AuthenticationPrincipal User principal,
            @PathVariable UUID id) {
        TradeResponse trade =
                tradeService.getTradeById(principal.getId(), id);
        return ResponseEntity.ok(ApiResponse.success(trade));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<TradeResponse>> createTrade(
            @AuthenticationPrincipal User principal,
            @Valid @RequestBody TradeRequest request) {
        TradeResponse trade =
                tradeService.createTrade(principal.getId(), request);
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(ApiResponse.success(trade));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<TradeResponse>> updateTrade(
            @AuthenticationPrincipal User principal,
            @PathVariable UUID id,
            @Valid @RequestBody TradeRequest request) {
        TradeResponse trade =
                tradeService.updateTrade(principal.getId(), id, request);
        return ResponseEntity.ok(ApiResponse.success(trade));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<MessageResponse>> deleteTrade(
            @AuthenticationPrincipal User principal,
            @PathVariable UUID id) {
        MessageResponse response =
                tradeService.deleteTrade(principal.getId(), id);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    // -------------------------------------------------------
    // Screenshots
    // -------------------------------------------------------

    @PostMapping("/{id}/screenshots")
    public ResponseEntity<ApiResponse<TradeScreenshotResponse>> uploadScreenshot(
            @AuthenticationPrincipal User principal,
            @PathVariable UUID id,
            @RequestParam("file") MultipartFile file,
            @RequestParam(required = false) String label) {
        TradeScreenshotResponse screenshot =
                screenshotService.upload(principal.getId(), id, file, label);
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(ApiResponse.success(screenshot));
    }

    @DeleteMapping("/{id}/screenshots/{screenshotId}")
    public ResponseEntity<ApiResponse<MessageResponse>> deleteScreenshot(
            @AuthenticationPrincipal User principal,
            @PathVariable UUID id,
            @PathVariable UUID screenshotId) {
        MessageResponse response =
                screenshotService.delete(principal.getId(), id, screenshotId);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    /** Streams a screenshot image — requires ownership (trade must belong to principal). */
    @GetMapping("/{id}/screenshots/{screenshotId}/file")
    public ResponseEntity<byte[]> getScreenshotFile(
            @AuthenticationPrincipal User principal,
            @PathVariable UUID id,
            @PathVariable UUID screenshotId) throws IOException {

        // Verify the trade belongs to this user
        tradeService.getTradeById(principal.getId(), id);

        TradeScreenshot screenshot = screenshotRepository
                .findByIdAndTradeId(screenshotId, id)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Screenshot not found"));

        byte[] bytes = fileService.readFile(screenshot.getUrl());
        if (bytes == null) return ResponseEntity.notFound().build();

        // Detect content type from the stored path
        String path = screenshot.getUrl().toLowerCase();
        MediaType type = path.endsWith(".png")  ? MediaType.IMAGE_PNG
                       : path.endsWith(".webp") ? MediaType.parseMediaType("image/webp")
                       : MediaType.IMAGE_JPEG;

        return ResponseEntity.ok().contentType(type).body(bytes);
    }
}
