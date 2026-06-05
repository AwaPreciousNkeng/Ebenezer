package com.codewithpcodes.ebenezer.trade;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface TradeScreenshotRepository extends JpaRepository<TradeScreenshot, UUID> {


    Optional<TradeScreenshot> findByIdAndTradeId(UUID id, UUID tradeId);

}
