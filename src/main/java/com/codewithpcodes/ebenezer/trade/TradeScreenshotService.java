package com.codewithpcodes.ebenezer.trade;

import com.codewithpcodes.ebenezer.exceptions.BadRequestException;
import com.codewithpcodes.ebenezer.exceptions.ResourceNotFoundException;
import com.codewithpcodes.ebenezer.storage.S3Service;
import com.codewithpcodes.ebenezer.user.MessageResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.UUID;

// Kept separate to avoid bloating TradeService
@Service
@RequiredArgsConstructor
@Transactional
public class TradeScreenshotService {

    private final TradeRepository tradeRepository;
    private final TradeScreenshotRepository screenshotRepository;
    private final S3Service s3Service;

    public TradeScreenshotResponse upload(
            UUID userId, UUID tradeId,
            MultipartFile file, String label) {

        Trade trade = tradeRepository.findByIdAndUserId(tradeId, userId)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Trade not found"));

        validateImage(file);

        String s3Key = "screenshots/" + userId + "/"
                + tradeId + "/" + UUID.randomUUID()
                + getExtension(file);

        String url = s3Service.uploadFile(s3Key, file);

        TradeScreenshot screenshot = TradeScreenshot.builder()
                .trade(trade)
                .s3Key(s3Key)
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

        s3Service.deleteFile(screenshot.getS3Key());
        screenshotRepository.delete(screenshot);

        return new MessageResponse("Screenshot deleted");
    }

    // -------------------------------------------------------
    private void validateImage(MultipartFile file) {
        List<String> allowed =
                List.of("image/jpeg", "image/png", "image/webp");
        if (!allowed.contains(file.getContentType())) {
            throw new BadRequestException(
                    "Only JPEG, PNG and WEBP images are allowed");
        }
        if (file.getSize() > 5 * 1024 * 1024) { // 5MB
            throw new BadRequestException(
                    "Image size must not exceed 5MB");
        }
    }

    private String getExtension(MultipartFile file) {
        String name = file.getOriginalFilename();
        return name != null && name.contains(".")
                ? name.substring(name.lastIndexOf("."))
                : ".jpg";
    }
}
