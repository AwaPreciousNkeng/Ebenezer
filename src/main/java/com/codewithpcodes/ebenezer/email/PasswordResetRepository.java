package com.codewithpcodes.ebenezer.email;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface PasswordResetRepository extends JpaRepository<PasswordReset, UUID> {

    Optional<PasswordReset> findByTokenHashAndUsedFalse(String tokenHash);

    void deleteAllByUserId(UUID userId);
}
