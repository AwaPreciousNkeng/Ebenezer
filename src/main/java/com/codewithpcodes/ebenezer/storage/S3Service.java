package com.codewithpcodes.ebenezer.storage;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;
import software.amazon.awssdk.services.s3.presigner.S3Presigner;
import software.amazon.awssdk.services.s3.presigner.model.PutObjectPresignRequest;

import java.time.Duration;

@Service
@RequiredArgsConstructor
public class S3Service {

    private final S3Client s3Client;

    @Value("${aws.s3.bucket}")
    private String bucket;

    public String uploadFile(String key, MultipartFile file) {
        try {
            PutObjectRequest request = PutObjectRequest.builder()
                    .bucket(bucket)
                    .key(key)
                    .contentType(file.getContentType())
                    .build();

            s3Client.putObject(request,
                    RequestBody.fromBytes(file.getBytes()));

            return "https://" + bucket +
                    ".s3.amazonaws.com/" + key;

        } catch (Exception e) {
            throw new RuntimeException(
                    "Failed to upload file to S3: " + e.getMessage());
        }
    }

    public String generatePresignedUploadUrl(String key, int expiryMinutes) {
        S3Presigner presigner = S3Presigner.create();
        PutObjectPresignRequest presignRequest =
                PutObjectPresignRequest.builder()
                        .signatureDuration(Duration.ofMinutes(expiryMinutes))
                        .putObjectRequest(r -> r.bucket(bucket).key(key))
                        .build();

        return presigner.presignPutObject(presignRequest)
                .url().toString();
    }

    public void deleteFile(String key) {
        s3Client.deleteObject(b -> b.bucket(bucket).key(key));
    }
}
