package com.codewithpcodes.ebenezer.analytics;

import com.codewithpcodes.ebenezer.handler.ApiResponse;
import com.codewithpcodes.ebenezer.trade.DayOfWeekPnlProjection;
import com.codewithpcodes.ebenezer.trade.SymbolPnlProjection;
import com.codewithpcodes.ebenezer.trade.TradeSummaryResponse;
import com.codewithpcodes.ebenezer.user.User;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/analytics")
@RequiredArgsConstructor
public class AnalyticsController {

    private final AnalyticsService analyticsService;

    @GetMapping("/summary")
    public ResponseEntity<ApiResponse<TradeSummaryResponse>> getSummary(
            @AuthenticationPrincipal User principal,
            @ModelAttribute AnalyticsFilterRequest filter) {
        TradeSummaryResponse summary = analyticsService.getSummary(
                principal.getId(),
                filter.getAccountId(),
                filter.getFrom(),
                filter.getTo()
        );
        return ResponseEntity.ok(ApiResponse.success(summary));
    }

    @GetMapping("/equity-curve")
    public ResponseEntity<ApiResponse<List<EquityCurvePoint>>>
    getEquityCurve(
            @AuthenticationPrincipal User principal,
            @ModelAttribute AnalyticsFilterRequest filter) {
        List<EquityCurvePoint> curve = analyticsService.getEquityCurve(
                principal.getId(),
                filter.getAccountId(),
                filter.getFrom(),
                filter.getTo()
        );
        return ResponseEntity.ok(ApiResponse.success(curve));
    }

    @GetMapping("/pnl-by-symbol")
    public ResponseEntity<ApiResponse<List<SymbolPnlProjection>>>
    getPnlBySymbol(
            @AuthenticationPrincipal User principal,
            @RequestParam(required = false) UUID accountId) {
        List<SymbolPnlProjection> data =
                analyticsService.getPnlBySymbol(principal.getId(), accountId);
        return ResponseEntity.ok(ApiResponse.success(data));
    }

    @GetMapping("/pnl-by-day")
    public ResponseEntity<ApiResponse<List<DayOfWeekPnlProjection>>>
    getPnlByDayOfWeek(
            @AuthenticationPrincipal User principal,
            @RequestParam(required = false) UUID accountId) {
        List<DayOfWeekPnlProjection> data =
                analyticsService.getPnlByDayOfWeek(
                        principal.getId(), accountId);
        return ResponseEntity.ok(ApiResponse.success(data));
    }

    @GetMapping("/drawdown")
    public ResponseEntity<ApiResponse<DrawdownResponse>> getDrawdown(
            @AuthenticationPrincipal User principal,
            @RequestParam(required = false) UUID accountId) {
        DrawdownResponse drawdown =
                analyticsService.getMaxDrawdown(principal.getId(), accountId);
        return ResponseEntity.ok(ApiResponse.success(drawdown));
    }

    @GetMapping("/streak")
    public ResponseEntity<ApiResponse<StreakResponse>> getStreak(
            @AuthenticationPrincipal User principal,
            @RequestParam(required = false) UUID accountId) {
        StreakResponse streak =
                analyticsService.getStreak(principal.getId(), accountId);
        return ResponseEntity.ok(ApiResponse.success(streak));
    }
}
