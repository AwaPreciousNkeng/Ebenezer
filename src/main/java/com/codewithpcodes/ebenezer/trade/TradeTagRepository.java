package com.codewithpcodes.ebenezer.trade;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface TradeTagRepository extends JpaRepository<TradeTag, UUID> {

    void deleteAllByTradeId(UUID tradeId);

}


