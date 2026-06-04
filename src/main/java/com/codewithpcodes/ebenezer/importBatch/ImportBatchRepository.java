package com.codewithpcodes.ebenezer.importBatch;

import com.codewithpcodes.ebenezer.account.Account;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface ImportBatchRepository extends JpaRepository<ImportBatch, UUID> {

    boolean existsByAccountAndFilename(Account account, String filename);
}
