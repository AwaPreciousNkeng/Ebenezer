package com.codewithpcodes.ebenezer.storage;

import com.codewithpcodes.ebenezer.exceptions.ResourceNotFoundException;
import com.codewithpcodes.ebenezer.exceptions.UnauthorizedException;
import lombok.NonNull;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class FileService {

    @Value("${application.file.uploads.media-output-path}")
    private String fileUploadPath;

    private static final long MAX_FILE_SIZE = 10 * 1024 * 1024;

    public String saveProfilePicture(
            @NonNull MultipartFile sourceFile,
            @NonNull UUID userId
    ) {
        validateFile(sourceFile);

        final String subPath = "users/" + File.separator + userId;
        return uploadFile(sourceFile, subPath);
    }

    public String saveFile(
            @NonNull MultipartFile sourceFile,
            @NonNull UUID userId
    ) {
        validateFile(sourceFile);

        final String subPath = "imports/" + File.separator + userId;
        return uploadFile(sourceFile, subPath);
    }

    public String uploadFile(
            @NonNull MultipartFile sourceFile,
            @NonNull String fileUploadSubPath
    ) {
        final String finalUploadPath = fileUploadPath + File.separator + fileUploadSubPath;

        // create directory if it doesn't exist
        File targetFolder = new File(finalUploadPath);
        if (!targetFolder.exists()) {
            boolean folderCreated = targetFolder.mkdirs();
            if (!folderCreated) {
                log.warn("Failed to create target folder {}", targetFolder);
                throw new RuntimeException("Failed to create the upload directory");
            }
        }

        // Build a unique filename using timestamp
        String fileExtension = getFileExtension(sourceFile.getOriginalFilename());

        String targetFilePath = finalUploadPath + System.currentTimeMillis() + fileExtension;

        Path targetPath = Paths.get(targetFilePath);

        try {
            Files.write(targetPath, sourceFile.getBytes());
            log.info("Successfully uploaded file {} to {}", sourceFile.getOriginalFilename(), targetPath);
            return targetFilePath;
        } catch (IOException e) {
            log.error("Failed to save file: {}", e.getMessage());
            throw new RuntimeException("Failed to save file", e);
        }
    }

    public boolean deleteFile(
            @NonNull String storedFilePath
    ) {
        Path targetPath = Paths.get(storedFilePath).toAbsolutePath().normalize();

        // it must live in the base upload directory
        Path baseUploadPath = Paths.get(fileUploadPath).toAbsolutePath().normalize();
        if (!targetPath.startsWith(baseUploadPath)) {
            log.warn("Path traversal attempt blocked: {}", storedFilePath);
            throw new IllegalArgumentException("Illegal file path");
        }

        try {
            boolean deleted = Files.deleteIfExists(targetPath);
            if (deleted) {
                log.info("Successfully deleted file {}", targetPath);
            } else {
                log.warn("File not found for deletion {}", targetPath);
            }
            return deleted;
        } catch (IOException e) {
            log.error("Failed to delete file {}: {}", targetPath, e.getMessage());
            throw new RuntimeException("Failed to delete file", e);
        }
    }

    private void validateFile(MultipartFile sourceFile) {
        if (sourceFile.isEmpty()) {
            throw new ResourceNotFoundException("File is empty");
        }

        if (sourceFile.getSize() > MAX_FILE_SIZE) {
            throw new UnauthorizedException("File too large. Maximum file size is " + MAX_FILE_SIZE);
        }
    }

    private String getFileExtension(String fileName) {
        if (fileName == null || fileName.isEmpty()) {
            return "";
        }

        int lastDotIndex = fileName.lastIndexOf('.');
        if (lastDotIndex == -1) {
            return "";
        }
        return "." + fileName.substring(lastDotIndex + 1).toLowerCase();
    }
}
