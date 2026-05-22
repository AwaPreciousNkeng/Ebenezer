package com.codewithpcodes.ebenezer.trade;

import com.codewithpcodes.ebenezer.account.Account;
import com.codewithpcodes.ebenezer.account.AccountRepository;
import com.codewithpcodes.ebenezer.exceptions.ResourceNotFoundException;
import com.codewithpcodes.ebenezer.playbook.Playbook;
import com.codewithpcodes.ebenezer.playbook.PlaybookRepository;
import com.codewithpcodes.ebenezer.user.MessageResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class TradeService {

    private final TradeRepository tradeRepository;
    private final AccountRepository accountRepository;
    private final PlaybookRepository playbookRepository;
    private final TradeTagRepository tradeTagRepository;
    private final PnlCalculator pnlCalculator;

    @Transactional(readOnly = true)
    public Page<TradeResponse> getTrades(
            UUID userId, TradeFilterRequest filter, Pageable pageable) {
        return tradeRepository.findByFilters(
                userId,
                filter.getAccountId(),
                filter.getSymbol(),
                filter.getDirection(),
                filter.getStatus(),
                filter.getAssetClass(),
                filter.getPlaybookId(),
                filter.getFrom(),
                filter.getTo(),
                pageable
        ).map(TradeResponse::from);
    }

    @Transactional(readOnly = true)
    public TradeResponse getTradeById(UUID userId, UUID tradeId) {
        return tradeRepository.findByIdAndUserId(tradeId, userId)
                .map(TradeResponse::from)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Trade not found"));
    }

    public TradeResponse createTrade(UUID userId, TradeRequest request) {
        Account account = accountRepository
                .findByIdAndUserId(request.getAccountId(), userId)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Account not found"));

        Trade trade = Trade.builder()
                .user(account.getUser())
                .account(account)
                .symbol(request.getSymbol().toUpperCase().trim())
                .assetClass(request.getAssetClass())
                .direction(request.getDirection())
                .status(request.getStatus() != null
                        ? request.getStatus() : TradeStatus.CLOSED)
                .entryPrice(request.getEntryPrice())
                .exitPrice(request.getExitPrice())
                .quantity(request.getQuantity())
                .entryDate(request.getEntryDate())
                .exitDate(request.getExitDate())
                .commission(request.getCommission() != null
                        ? request.getCommission() : BigDecimal.ZERO)
                .stopLoss(request.getStopLoss())
                .takeProfit(request.getTakeProfit())
                .plannedRisk(request.getPlannedRisk())
                .notes(request.getNotes())
                .executionRating(request.getExecutionRating())
                .build();

        // Link playbook if provided
        if (request.getPlaybookId() != null) {
            Playbook playbook = playbookRepository
                    .findByIdAndUserId(request.getPlaybookId(), userId)
                    .orElseThrow(() ->
                            new ResourceNotFoundException("Playbook not found"));
            trade.setPlaybook(playbook);
        }

        pnlCalculator.calculate(trade);
        Trade saved = tradeRepository.save(trade);

        // Save tags
        if (request.getTags() != null && !request.getTags().isEmpty()) {
            saveTags(saved, request.getTags());
        }

        return TradeResponse.from(tradeRepository.findById(saved.getId())
                .orElseThrow());
    }

    public TradeResponse updateTrade(
            UUID userId, UUID tradeId, TradeRequest request) {
        Trade trade = tradeRepository.findByIdAndUserId(tradeId, userId)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Trade not found"));

        if (request.getSymbol() != null) {
            trade.setSymbol(request.getSymbol().toUpperCase().trim());
        }
        if (request.getDirection() != null) {
            trade.setDirection(request.getDirection());
        }
        if (request.getEntryPrice() != null) {
            trade.setEntryPrice(request.getEntryPrice());
        }
        if (request.getExitPrice() != null) {
            trade.setExitPrice(request.getExitPrice());
        }
        if (request.getQuantity() != null) {
            trade.setQuantity(request.getQuantity());
        }
        if (request.getEntryDate() != null) {
            trade.setEntryDate(request.getEntryDate());
        }
        if (request.getExitDate() != null) {
            trade.setExitDate(request.getExitDate());
        }
        if (request.getCommission() != null) {
            trade.setCommission(request.getCommission());
        }
        if (request.getStopLoss() != null) {
            trade.setStopLoss(request.getStopLoss());
        }
        if (request.getNotes() != null) {
            trade.setNotes(request.getNotes());
        }
        if (request.getExecutionRating() != null) {
            trade.setExecutionRating(request.getExecutionRating());
        }
        if (request.getPlaybookId() != null) {
            Playbook playbook = playbookRepository
                    .findByIdAndUserId(request.getPlaybookId(), userId)
                    .orElseThrow(() ->
                            new ResourceNotFoundException("Playbook not found"));
            trade.setPlaybook(playbook);
        }

        pnlCalculator.calculate(trade);

        // Replace tags
        if (request.getTags() != null) {
            tradeTagRepository.deleteAllByTradeId(tradeId);
            saveTags(trade, request.getTags());
        }

        return TradeResponse.from(tradeRepository.save(trade));
    }

    public MessageResponse deleteTrade(UUID userId, UUID tradeId) {
        Trade trade = tradeRepository.findByIdAndUserId(tradeId, userId)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Trade not found"));
        tradeRepository.delete(trade);
        return new MessageResponse("Trade deleted successfully");
    }

    // -------------------------------------------------------
    private void saveTags(Trade trade, List<TagRequest> tagRequests) {
        List<TradeTag> tags = tagRequests.stream()
                .map(t -> TradeTag.builder()
                        .trade(trade)
                        .tag(t.getTag().trim())
                        .tagType(t.getTagType() != null
                                ? t.getTagType() : TagType.CUSTOM)
                        .build())
                .collect(Collectors.toList());
        tradeTagRepository.saveAll(tags);
    }
}
