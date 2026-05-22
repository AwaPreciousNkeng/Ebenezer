package com.codewithpcodes.ebenezer.trade;

import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.UUID;

public interface TradeTagRepository extends JpaRepository<TradeTag, UUID> {

    List<TradeTag> findAllByTradeId(UUID tradeId);

    void deleteByTradeIdAndTag(UUID tradeId, String tag);

    void deleteAllByTradeId(UUID tradeId);

    // Most used tags by a user
    @Query("""
        SELECT tt.tag AS tag,
               COUNT(tt) AS usageCount
        FROM TradeTag tt
        WHERE tt.trade.user.id = :userId
        GROUP BY tt.tag
        ORDER BY usageCount DESC
    """)
    List<TagUsageProjection> getTopTagsByUser(
            @Param("userId") UUID userId,
            Pageable pageable
    );
}


