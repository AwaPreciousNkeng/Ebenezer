package com.codewithpcodes.ebenezer.email;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface EmailVerificationRepository extends JpaRepository<EmailVerification, UUID> {

    Optional<EmailVerification> findByTokenAndUsedFalse(String token);

    void deleteAllByUserId(UUID userId);

    boolean existsByUserIdAndUsedFalse(UUID userId);
}
