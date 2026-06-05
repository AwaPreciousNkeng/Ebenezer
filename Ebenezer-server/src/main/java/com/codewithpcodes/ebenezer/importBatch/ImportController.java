package com.codewithpcodes.ebenezer.importBatch;

import com.codewithpcodes.ebenezer.exceptions.BadRequestException;
import com.codewithpcodes.ebenezer.user.User;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/import")
@RequiredArgsConstructor
public class ImportController {

    private final ImportService importService;

    @PostMapping("/statement")
    public ResponseEntity<ImportBatch> importCsv(
            @AuthenticationPrincipal User principal,
            @RequestParam("file") MultipartFile file,
            @RequestParam UUID accountId
    ) throws IOException {
        if (file.isEmpty()) {
            throw new BadRequestException("File is empty");
        }

        String filename = file.getOriginalFilename();
        if (filename == null || !filename.endsWith(".pdf")) {
            throw new BadRequestException("Only PDF files are supported");
        }

        return ResponseEntity.ok(importService.importFromPdf(file, accountId, principal.getId()));
    }
}
