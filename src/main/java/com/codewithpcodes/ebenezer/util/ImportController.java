package com.codewithpcodes.ebenezer.util;

import com.codewithpcodes.ebenezer.exceptions.BadRequestException;
import com.codewithpcodes.ebenezer.handler.ApiResponse;
import com.codewithpcodes.ebenezer.user.User;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/import")
@RequiredArgsConstructor
public class ImportController {

    private final ImportService importService;

    @PostMapping("/csv")
    public ResponseEntity<ApiResponse<ImportResultResponse>> importCsv(
            @AuthenticationPrincipal User principal,
            @RequestParam("file") MultipartFile file,
            @RequestParam UUID accountId,
            @RequestParam String brokerName
    ) {

        if (file.isEmpty()) {
            throw new BadRequestException("File is empty");
        }

        String filename = file.getOriginalFilename();
        if (filename == null || !filename.endsWith(".csv")) {
            throw new BadRequestException("Only CSV files are supported");
        }

        ImportResultResponse result = importService.importCsv(
                principal.getId(), accountId, file, brokerName);

        return ResponseEntity.ok(ApiResponse.success(
                "Import completed", result));
    }
}
