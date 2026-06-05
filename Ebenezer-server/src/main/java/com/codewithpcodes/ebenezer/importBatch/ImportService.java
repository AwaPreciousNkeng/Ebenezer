package com.codewithpcodes.ebenezer.importBatch;

import com.codewithpcodes.ebenezer.account.Account;
import com.codewithpcodes.ebenezer.account.AccountRepository;
import com.codewithpcodes.ebenezer.exceptions.DuplicateResourceException;
import com.codewithpcodes.ebenezer.exceptions.ResourceNotFoundException;
import com.codewithpcodes.ebenezer.trade.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.pdfbox.Loader;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.text.PDFTextStripper;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Service
@RequiredArgsConstructor
@Transactional
@Slf4j
public class ImportService {

    private static final DateTimeFormatter DATE_TIME_FORMATTER = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");
    private static final ZoneOffset EXNESS_OFFSET = ZoneOffset.ofHours(2);

    private final TradeRepository tradeRepository;
    private final ImportBatchRepository importBatchRepository;
    private final AccountRepository accountRepository;


    @Transactional
    public ImportBatch importFromPdf(MultipartFile pdfFile, UUID accountId, UUID userId) throws IOException {

        Account account = accountRepository.findByIdAndUserId(accountId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Account not found"));

        String filename = pdfFile.getOriginalFilename() != null
                ? pdfFile.getOriginalFilename()
                : "unknown.pdf";

        if (importBatchRepository.existsByAccountAndFilename(account, filename)) {
            throw new DuplicateResourceException(
                    "This statement file has already been imported for this account."
            );
        }

        ExnessImportResult result = parse(pdfFile);

        ImportBatch batch = ImportBatch.builder()
                .account(account)
                .filename(filename)
                .status(ImportBatchStatus.PROCESSING)
                .rowCount(result.trades().size())
                .rejectedCount(result.rejectedRows().size())
                .build();
        importBatchRepository.save(batch);

        int imported = 0;
        int duplicates = 0;

        for (ExnessTradeRow row : result.trades()) {
            if (tradeRepository.existsByBrokerTradeIdAndAccount(row.positionId(), account)) {
                duplicates++;
                continue;
            }
            tradeRepository.save(mapToTrade(row, account, batch));
            imported++;
        }

        batch.setStatus(ImportBatchStatus.COMPLETED);
        batch.setRejectedCount(result.rejectedRows().size() + duplicates);
        importBatchRepository.save(batch);

        log.info("Import complete: {} imported, {} duplicates skipped, {} parse failures",
                imported, duplicates, result.rejectedRows().size());
        return batch;
    }

    private TradeDirection mapDirection(String exnessDirection) {
        return switch (exnessDirection) {
            case "BUY" -> TradeDirection.LONG;
            case "SELL" -> TradeDirection.SHORT;
            default -> throw new IllegalArgumentException(
                    "Unknown direction: " + exnessDirection);
        };
    }

    private Trade mapToTrade(ExnessTradeRow row, Account account, ImportBatch batch) {
        BigDecimal netPnl = row.grossPnl().add(row.swap());

        return Trade.builder()
                .account(account)
                .user(account.getUser())
                .symbol(row.symbol())
                .assetClass(detectAssetClass(row.symbol()))
                .direction(mapDirection(row.direction()))
                .status(TradeStatus.CLOSED)
                .importBatch(batch)
                .entryPrice(row.openPrice())
                .exitPrice(row.closePrice())
                .quantity(row.volume())
                .entryDate(row.openTime())
                .exitDate(row.closeTime())
                .stopLoss(row.stopLoss())
                .takeProfit(row.takeProfit())
                .commission(row.commission())
                .swap(row.swap())
                .grossPnl(row.grossPnl())
                .netPnl(netPnl)
                .imported(true)
                .importSource("Exness_PDF")
                .brokerTradeId(row.positionId())
                .build();
    }

    /**
     * Matches only buy/sell trade rows. Naturally excludes:
     * - balance rows    ("balance" doesn't match buy|sell)
     * - canceled orders ("buy limit"/"sell limit" don't match)
     * - header rows     (don't start with a digit)
     * - summary totals  (don't match the full column count)
     */
    private static final Pattern TRADE_PATTERN = Pattern.compile(
            "^(\\d+)\\s+(buy|sell)\\s+" +
                    "(\\d{4}-\\d{2}-\\d{2}\\s+\\d{2}:\\d{2}:\\d{2})\\s+" +  // open datetime
                    "([A-Za-z0-9]+)\\s+" +                                     // symbol
                    "([\\d.]+)\\s+([\\d.]+)\\s+" +                            // open price, volume
                    "(\\d{4}-\\d{2}-\\d{2}\\s+\\d{2}:\\d{2}:\\d{2})\\s+" +  // close datetime
                    "([\\d.]+)\\s+([\\d.]+)\\s+" +                            // close price, close vol
                    "(-?[\\d.]+)\\s+(-?[\\d.]+)\\s+" +                       // S/L, T/P
                    "(-?[\\d.]+)\\s+(-?[\\d.]+)\\s+" +                       // commission, taxes
                    "(-?[\\d.]+)\\s+(-?[\\d.]+)$"                            // swap, profit
    );

    private ExnessImportResult parse(MultipartFile pdfFile) throws IOException {
        List<ExnessTradeRow> trades = new ArrayList<>();
        List<String> rejectedRows = new ArrayList<>();

        try (PDDocument document = Loader.loadPDF(pdfFile.getBytes())) {
            PDFTextStripper stripper = new PDFTextStripper();
            String fullText = stripper.getText(document);

            for (String line : fullText.split("\\r?\\n")) {
                String trimmed = line.trim();
                if (trimmed.isEmpty()) continue;

                Matcher matcher = TRADE_PATTERN.matcher(trimmed);
                if (!matcher.matches()) continue;

                try {
                    trades.add(parseMatch(matcher));
                } catch (Exception e) {
                    String rejectedEntry = trimmed + " | " + e.getMessage();
                    rejectedRows.add(rejectedEntry);
                    log.warn("Rejected row during parse: {}", rejectedEntry);
                }
            }
        }

        log.info("ExnessPdfParser: {} trades parsed, {} rejected from {}",
                trades.size(), rejectedRows.size(), pdfFile.getOriginalFilename());

        return new ExnessImportResult(trades, rejectedRows);
    }

    private ExnessTradeRow parseMatch(Matcher m) {
        return new ExnessTradeRow(
                m.group(1),                              // positionId
                m.group(2).toUpperCase(),               // direction
                parseDateTime(m.group(3)),              // openTime
                stripSuffix(m.group(4)),                // symbol
                new BigDecimal(m.group(5)),             // openPrice
                new BigDecimal(m.group(6)),             // volume
                parseDateTime(m.group(7)),              // closeTime
                new BigDecimal(m.group(8)),             // closePrice
                nullIfZero(m.group(10)),                // stopLoss  (group 9 = close vol, skip)
                nullIfZero(m.group(11)),                // takeProfit
                new BigDecimal(m.group(12)),            // commission
                new BigDecimal(m.group(14)),            // swap       (group 13 = taxes, skip)
                new BigDecimal(m.group(15))             // grossPnl
        );
    }

    private OffsetDateTime parseDateTime(String raw) {
        String normalised = raw.replaceAll("\\s+", " ").trim();
        return LocalDateTime.parse(normalised, DATE_TIME_FORMATTER).atOffset(EXNESS_OFFSET);
    }

    // Strip Exness mini-contract "m" suffix: "XAUUSDm" → "XAUUSD"
    private String stripSuffix(String symbol) {
        return symbol.endsWith("m") ? symbol.substring(0, symbol.length() - 1) : symbol;
    }

    /**
     * Return null when S/L or T/P is 0 — means not set
     */
    private BigDecimal nullIfZero(String value) {
        BigDecimal bd = new BigDecimal(value);
        return bd.compareTo(BigDecimal.ZERO) == 0 ? null : bd;
    }

    private AssetClass detectAssetClass(String symbol) {
        if (symbol.startsWith("BTC") || symbol.startsWith("ETH") ||
                symbol.startsWith("XRP") || symbol.startsWith("LTC") ||
                symbol.startsWith("ADA") || symbol.startsWith("SOL")) return AssetClass.CRYPTO;

        if (symbol.startsWith("XAU") || symbol.startsWith("XAG")) return AssetClass.METALS;

        if (symbol.equals("US30") || symbol.equals("USTEC") || symbol.equals("US500") ||
                symbol.equals("GER40") || symbol.equals("UK100") ||
                symbol.equals("JP225")) return AssetClass.INDICES;

        if (symbol.contains("OIL") || symbol.contains("GAS")) return AssetClass.ENERGY;

        return AssetClass.FOREX;
    }

}
