package com.codewithpcodes.ebenezer.util;

import com.codewithpcodes.ebenezer.account.Account;
import com.codewithpcodes.ebenezer.account.AccountRepository;
import com.codewithpcodes.ebenezer.exceptions.ImportException;
import com.codewithpcodes.ebenezer.exceptions.ResourceNotFoundException;
import com.codewithpcodes.ebenezer.trade.*;
import com.opencsv.CSVReader;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.InputStreamReader;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class ImportService {

    private final TradeRepository tradeRepository;
    private final AccountRepository accountRepository;
    private final PnlCalculator pnlCalculator;

    public ImportResultResponse importCsv(
            UUID userId, UUID accountId, MultipartFile file,
            String brokerName) {

        Account account = accountRepository
                .findByIdAndUserId(accountId, userId)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Account not found"));

        List<Trade> trades;

        try {
            trades = switch (brokerName.toUpperCase()) {
                case "MT4", "MT5"   -> parseMtCsv(file, account);
                case "TRADOVATE"    -> parseTradovateCsv(file, account);
                case "IBKR"         -> parseIbkrCsv(file, account);
                case "WEBULL"       -> parseWebullCsv(file, account);
                default             -> parseGenericCsv(file, account);
            };
        } catch (Exception e) {
            throw new ImportException(
                    "Failed to parse CSV: " + e.getMessage());
        }

        // Deduplicate based on symbol + entryDate + direction + quantity
        List<Trade> newTrades = trades.stream()
                .filter(t -> !isDuplicate(t, userId))
                .collect(Collectors.toList());

        trades.forEach(pnlCalculator::calculate);
        tradeRepository.saveAll(newTrades);

        return ImportResultResponse.builder()
                .totalRows(trades.size())
                .imported(newTrades.size())
                .skipped(trades.size() - newTrades.size())
                .build();
    }

    // -------------------------------------------------------

    private List<Trade> parseMtCsv(
            MultipartFile file, Account account) throws Exception {
        List<Trade> trades = new ArrayList<>();
        try (CSVReader reader = new CSVReader(
                new InputStreamReader(file.getInputStream()))) {
            String[] headers = reader.readNext(); // skip header
            String[] row;
            while ((row = reader.readNext()) != null) {
                // MT4/5 columns: Ticket, Open Time, Type, Volume,
                //                Symbol, Open Price, Close Price,
                //                Close Time, Commission, Profit
                trades.add(Trade.builder()
                        .account(account)
                        .user(account.getUser())
                        .symbol(row[4].toUpperCase().trim())
                        .direction(row[2].equalsIgnoreCase("buy")
                                ? TradeDirection.LONG : TradeDirection.SHORT)
                        .quantity(new BigDecimal(row[3].trim()))
                        .entryPrice(new BigDecimal(row[5].trim()))
                        .exitPrice(new BigDecimal(row[6].trim()))
                        .entryDate(parseMtDate(row[1]))
                        .exitDate(parseMtDate(row[7]))
                        .commission(new BigDecimal(row[8].trim()))
                        .status(TradeStatus.CLOSED)
                        .assetClass(AssetClass.FOREX)
                        .imported(true)
                        .importSource("MT4/MT5")
                        .build());
            }
        }
        return trades;
    }

    private List<Trade> parseTradovateCsv(
            MultipartFile file, Account account) throws Exception {
        // Tradovate-specific column mapping
        List<Trade> trades = new ArrayList<>();
        try (CSVReader reader = new CSVReader(
                new InputStreamReader(file.getInputStream()))) {
            reader.readNext(); // skip header
            String[] row;
            while ((row = reader.readNext()) != null) {
                trades.add(Trade.builder()
                        .account(account)
                        .user(account.getUser())
                        .symbol(row[0].toUpperCase().trim())
                        .direction(row[1].equalsIgnoreCase("Buy")
                                ? TradeDirection.LONG : TradeDirection.SHORT)
                        .quantity(new BigDecimal(row[2].trim()))
                        .entryPrice(new BigDecimal(row[3].trim()))
                        .exitPrice(new BigDecimal(row[4].trim()))
                        .entryDate(parseIsoDate(row[5]))
                        .exitDate(parseIsoDate(row[6]))
                        .commission(new BigDecimal(row[7].trim()))
                        .status(TradeStatus.CLOSED)
                        .assetClass(AssetClass.FUTURES)
                        .imported(true)
                        .importSource("Tradovate")
                        .build());
            }
        }
        return trades;
    }

    private List<Trade> parseIbkrCsv(
            MultipartFile file, Account account) throws Exception {
        // IBKR flex query format
        List<Trade> trades = new ArrayList<>();
        try (CSVReader reader = new CSVReader(
                new InputStreamReader(file.getInputStream()))) {
            reader.readNext();
            String[] row;
            while ((row = reader.readNext()) != null) {
                trades.add(Trade.builder()
                        .account(account)
                        .user(account.getUser())
                        .symbol(row[0].trim())
                        .direction(new BigDecimal(row[3].trim())
                                .compareTo(BigDecimal.ZERO) > 0
                                ? TradeDirection.LONG : TradeDirection.SHORT)
                        .quantity(new BigDecimal(row[3].trim()).abs())
                        .entryPrice(new BigDecimal(row[4].trim()))
                        .exitPrice(new BigDecimal(row[5].trim()))
                        .entryDate(parseIsoDate(row[1]))
                        .exitDate(parseIsoDate(row[2]))
                        .commission(new BigDecimal(row[6].trim()).abs())
                        .status(TradeStatus.CLOSED)
                        .assetClass(AssetClass.STOCK)
                        .imported(true)
                        .importSource("IBKR")
                        .build());
            }
        }
        return trades;
    }

    private List<Trade> parseWebullCsv(
            MultipartFile file, Account account) throws Exception {
        List<Trade> trades = new ArrayList<>();
        try (CSVReader reader = new CSVReader(
                new InputStreamReader(file.getInputStream()))) {
            reader.readNext();
            String[] row;
            while ((row = reader.readNext()) != null) {
                trades.add(Trade.builder()
                        .account(account)
                        .user(account.getUser())
                        .symbol(row[0].trim())
                        .direction(row[1].equalsIgnoreCase("BUY")
                                ? TradeDirection.LONG : TradeDirection.SHORT)
                        .quantity(new BigDecimal(row[2].trim()))
                        .entryPrice(new BigDecimal(row[3].trim()))
                        .exitPrice(new BigDecimal(row[4].trim()))
                        .entryDate(parseIsoDate(row[5]))
                        .exitDate(parseIsoDate(row[6]))
                        .commission(BigDecimal.ZERO)
                        .status(TradeStatus.CLOSED)
                        .assetClass(AssetClass.STOCK)
                        .imported(true)
                        .importSource("Webull")
                        .build());
            }
        }
        return trades;
    }

    private List<Trade> parseGenericCsv(
            MultipartFile file, Account account) throws Exception {
        // Generic format:
        // symbol, direction, quantity, entryPrice, exitPrice,
        // entryDate, exitDate, commission, assetClass
        List<Trade> trades = new ArrayList<>();
        try (CSVReader reader = new CSVReader(
                new InputStreamReader(file.getInputStream()))) {
            reader.readNext();
            String[] row;
            while ((row = reader.readNext()) != null) {
                trades.add(Trade.builder()
                        .account(account)
                        .user(account.getUser())
                        .symbol(row[0].toUpperCase().trim())
                        .direction(TradeDirection.valueOf(
                                row[1].toUpperCase().trim()))
                        .quantity(new BigDecimal(row[2].trim()))
                        .entryPrice(new BigDecimal(row[3].trim()))
                        .exitPrice(new BigDecimal(row[4].trim()))
                        .entryDate(parseIsoDate(row[5]))
                        .exitDate(parseIsoDate(row[6]))
                        .commission(new BigDecimal(row[7].trim()))
                        .assetClass(AssetClass.valueOf(
                                row[8].toUpperCase().trim()))
                        .status(TradeStatus.CLOSED)
                        .imported(true)
                        .importSource("Generic CSV")
                        .build());
            }
        }
        return trades;
    }

    private boolean isDuplicate(Trade trade, UUID userId) {
        return tradeRepository.findByFilters(
                userId, trade.getAccount().getId(),
                trade.getSymbol(), trade.getDirection(),
                TradeStatus.CLOSED, null, null,
                trade.getEntryDate().minusMinutes(1),
                trade.getEntryDate().plusMinutes(1),
                Pageable.ofSize(1)
        ).hasContent();
    }

    private OffsetDateTime parseMtDate(String raw) {
        DateTimeFormatter fmt = DateTimeFormatter.ofPattern(
                "yyyy.MM.dd HH:mm:ss");
        return LocalDateTime.parse(raw.trim(), fmt)
                .atOffset(ZoneOffset.UTC);
    }

    private OffsetDateTime parseIsoDate(String raw) {
        return OffsetDateTime.parse(raw.trim(),
                DateTimeFormatter.ISO_OFFSET_DATE_TIME);
    }
}
