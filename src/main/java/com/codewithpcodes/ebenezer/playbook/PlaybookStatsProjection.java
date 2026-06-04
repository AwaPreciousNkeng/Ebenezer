package com.codewithpcodes.ebenezer.playbook;

import java.util.UUID;

public interface PlaybookStatsProjection {
    UUID getPlaybookId();

    Long getTotalTrades();

    Long getWinningTrades();

}
