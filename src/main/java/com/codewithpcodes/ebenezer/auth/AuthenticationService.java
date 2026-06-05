package com.codewithpcodes.ebenezer.auth;

import com.codewithpcodes.ebenezer.config.JwtService;
import com.codewithpcodes.ebenezer.exceptions.DuplicateResourceException;
import com.codewithpcodes.ebenezer.exceptions.ResourceNotFoundException;
import com.codewithpcodes.ebenezer.exceptions.UnauthorizedException;
import com.codewithpcodes.ebenezer.token.Token;
import com.codewithpcodes.ebenezer.token.TokenRepository;
import com.codewithpcodes.ebenezer.token.TokenType;
import com.codewithpcodes.ebenezer.user.Role;
import com.codewithpcodes.ebenezer.user.User;
import com.codewithpcodes.ebenezer.user.UserDto;
import com.codewithpcodes.ebenezer.user.UserRepository;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpHeaders;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.time.OffsetDateTime;
import java.time.format.DateTimeFormatter;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuthenticationService {

    private final UserRepository userRepository;
    private final JwtService jwtService;
    private final TokenRepository tokenRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;

    private static final int MAX_ATTEMPTS = 5;
    private static final int LOCK_DURATION = 15;

    public void register(RegisterRequest request) {
        String defaultProfilePicture = "https://ui-avatars.com/api?name=" +
                URLEncoder.encode(request.firstName() + " " + request.lastName(), StandardCharsets.UTF_8) +
                "&background=random&color=fff&size=256";

        if (userRepository.existsByEmail(request.email())) {
            log.error("Email already exists with email::{}", request.email());
            throw new DuplicateResourceException("User already exists");
        }


        User user = User.builder()
                .firstName(request.firstName())
                .lastName(request.lastName())
                .email(request.email())
                .password(passwordEncoder.encode(request.password()))
                .role(Role.USER)
                .avatarUrl(defaultProfilePicture)
                .createdAt(OffsetDateTime.now())
                .updatedAt(OffsetDateTime.now())
                .build();
        userRepository.save(user);
        log.info("User registered with email::{}", request.email());
    }

    @Transactional
    public AuthenticationResponse authenticate(AuthenticationRequest request) {
        log.info("Authenticating user with email::{}", request.email());
        User user = userRepository.findByEmail(request.email())
                .orElseThrow(() -> new ResourceNotFoundException("Invalid credentials"));
        checkLockOut(user);
        log.info("User with email::{} has been found", request.email());
        try {
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(
                            request.email(),
                            request.password()
                    )
            );
            log.info("Authenticated user::{}", request.email());
        } catch (Exception e) {
            handleFailedAttempts(user);
            int remainingAttempts = MAX_ATTEMPTS - user.getFailedLoginAttempts();

            if (remainingAttempts <= 0) {
                throw new IllegalArgumentException("Account locked due to too many failed attempts. " +
                        "Try again in " + LOCK_DURATION + " minutes."
                );
            }
            log.error("Authentication failed: {}", e.getMessage());
            throw new IllegalArgumentException(
                    "Invalid email or password. " +
                            remainingAttempts + " attempt(s) remaining."
            );
        }
        resetFailedAttempts(user);
        log.info("Reset failed attempts");

        var accessToken = jwtService.generateToken(user);
        var refreshToken = jwtService.generateRefreshToken(user);
        log.info("Generated tokens for user with email::{}", request.email());

        revokeAllUserTokens(user);
        log.info("Refreshed token::{}", accessToken);

        saveUserToken(user, accessToken);
        log.info("User {} logged in successfully", user.getEmail());
        return AuthenticationResponse.fromAuth(
                accessToken,
                refreshToken,
                UserDto.builder()
                        .id(user.getId())
                        .email(user.getEmail())
                        .fullName(user.getFullName())
                        .avatarUrl(user.getAvatarUrl())
                        .timezone("UTC")
                        .role(user.getRole())
                        .oauthProvider(user.getOauthProvider())
                        .createdAt(user.getCreatedAt())
                        .build()
        );
    }

    public AuthenticationResponse refreshToken(HttpServletRequest request) {
        final String authHeader = request.getHeader(HttpHeaders.AUTHORIZATION);

        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            throw new UnauthorizedException("Missing refresh token");
        }

        String refreshToken = authHeader.substring(7);
        String userEmail = jwtService.extractUsername(refreshToken);
        if (userEmail == null) {
            throw new UnauthorizedException("Invalid refresh token");
        }

        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        if (!jwtService.isTokenValid(refreshToken, user)) {
            throw new UnauthorizedException("Invalid or expired refresh token");
        }

        var accessToken = jwtService.generateToken(user);
        revokeAllUserTokens(user);
        saveUserToken(user, accessToken);

        return AuthenticationResponse.fromAuth(
                accessToken,
                refreshToken,
                UserDto.builder()
                        .id(user.getId())
                        .email(user.getEmail())
                        .fullName(user.getFullName())
                        .avatarUrl(user.getAvatarUrl())
                        .timezone("UTC")
                        .role(user.getRole())
                        .oauthProvider(user.getOauthProvider())
                        .createdAt(user.getCreatedAt())
                        .build()
        );
    }

    public AuthenticationResponse createAdmin(CreateAdminRequest request) {
        String defaultProfilePicture = "https://ui-avatars.com/api?name=" +
                URLEncoder.encode(request.firstName() + " " + request.lastName(), StandardCharsets.UTF_8) +
                "&background=random&color=fff&size=256";

        if (userRepository.existsByEmail(request.email())) {
            throw new IllegalArgumentException("User already exists with email: " + request.email());
        }

        User admin = User.builder()
                .firstName(request.firstName())
                .lastName(request.lastName())
                .email(request.email())
                .password(passwordEncoder.encode(request.password()))
                .avatarUrl(defaultProfilePicture)
                .role(Role.ADMIN)
                .createdAt(OffsetDateTime.now())
                .updatedAt(OffsetDateTime.now())
                .build();

        User savedAdmin = userRepository.save(admin);

        String accessToken = jwtService.generateToken(savedAdmin);
        String refreshToken = jwtService.generateRefreshToken(savedAdmin);

        saveUserToken(savedAdmin, accessToken);
        return AuthenticationResponse.fromAuth(
                accessToken,
                refreshToken,
                UserDto.builder()
                        .id(savedAdmin.getId())
                        .email(savedAdmin.getEmail())
                        .fullName(savedAdmin.getFullName())
                        .avatarUrl(savedAdmin.getAvatarUrl())
                        .timezone("UTC")
                        .role(savedAdmin.getRole())
                        .oauthProvider(savedAdmin.getOauthProvider())
                        .createdAt(savedAdmin.getCreatedAt())
                        .build()
        );
    }

    private void revokeAllUserTokens(User user) {
        var validUserTokens = tokenRepository.findAllValidTokenByUser(user.getId());
        if (validUserTokens.isEmpty()) return;
        validUserTokens.forEach(token -> {
            token.setRevoked(true);
            token.setExpired(true);
        });
        tokenRepository.saveAll(validUserTokens);
    }

    private void saveUserToken(User user, String accessToken) {
        Token token = Token.builder()
                .user(user)
                .token(accessToken)
                .type(TokenType.BEARER)
                .expired(false)
                .revoked(false)
                .build();
        tokenRepository.save(token);
    }

    private void checkLockOut(User user) {
        if (!user.isAccountLocked()) return;

        if (user.getLockedUntil() != null && LocalDateTime.now().isAfter(user.getLockedUntil())) {
            resetFailedAttempts(user);
            return;
        }

        DateTimeFormatter fmt = DateTimeFormatter.ofPattern("HH:mm:ss");
        String unlockTime = user.getLockedUntil() != null ? user.getLockedUntil().format(fmt) : "Soon";
        throw new IllegalArgumentException("Account Locked due to too many failed attempts. " +
                "Try again after " + unlockTime);
    }

    private void handleFailedAttempts(User user) {
        int attempts = user.getFailedLoginAttempts() + 1;
        user.setFailedLoginAttempts(attempts);
        if (attempts >= MAX_ATTEMPTS) {
            user.setAccountLocked(true);
            user.setLockedUntil(LocalDateTime.now().plusMinutes(LOCK_DURATION));
        }
        userRepository.save(user);
    }

    private void resetFailedAttempts(User user) {
        user.setFailedLoginAttempts(0);
        user.setAccountLocked(false);
        user.setLockedUntil(null);
        userRepository.save(user);
    }

    // TODO - Forget password and other things
}
