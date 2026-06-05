package com.codewithpcodes.ebenezer.trade;

import com.codewithpcodes.ebenezer.exceptions.ResourceNotFoundException;
import com.codewithpcodes.ebenezer.storage.FileService;
import com.codewithpcodes.ebenezer.user.MessageResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.util.UUID;

// Kept separate to avoid bloating TradeService
@Service
@RequiredArgsConstructor
@Transactional
public class TradeScreenshotService {

    private final TradeRepository tradeRepository;
    private final TradeScreenshotRepository screenshotRepository;
    private final FileService fileService;

    public TradeScreenshotResponse upload(
            UUID userId, UUID tradeId,
            MultipartFile file, String label) {

        Trade trade = tradeRepository.findByIdAndUserId(tradeId, userId)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Trade not found"));

        String url = fileService.saveFile(file, userId);

        TradeScreenshot screenshot = TradeScreenshot.builder()
                .trade(trade)
                .url(url)
                .label(label)
                .build();

        return TradeScreenshotResponse.from(
                screenshotRepository.save(screenshot));
    }

    public MessageResponse delete(
            UUID userId, UUID tradeId, UUID screenshotId) {

        // Verify trade belongs to user
        tradeRepository.findByIdAndUserId(tradeId, userId)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Trade not found"));

        TradeScreenshot screenshot = screenshotRepository
                .findByIdAndTradeId(screenshotId, tradeId)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Screenshot not found"));

        fileService.deleteFile(screenshot.getUrl());
        screenshotRepository.delete(screenshot);

        return new MessageResponse("Screenshot deleted");
    }
}
