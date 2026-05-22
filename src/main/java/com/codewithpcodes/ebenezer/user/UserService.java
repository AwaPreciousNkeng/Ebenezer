package com.codewithpcodes.ebenezer.user;

import com.codewithpcodes.ebenezer.exceptions.ResourceNotFoundException;
import com.codewithpcodes.ebenezer.exceptions.UnauthorizedException;
import com.codewithpcodes.ebenezer.storage.S3Service;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final S3Service s3Service;

    @Transactional(readOnly = true)
    public UserDto getProfile(UUID userId) {
        User user = findUserById(userId);
        return UserDto.from(user);
    }

    public UserDto updateProfile(UUID userId, UpdateProfileRequest request) {
        User user = findUserById(userId);

        if (request.getFirstName() != null) {
            user.setFirstName(request.getFirstName());
        }
        if (request.getLastName() != null) {
            user.setLastName(request.getLastName());
        }

        return UserDto.from(userRepository.save(user));
    }

    public UserDto uploadAvatar(UUID userId, MultipartFile file) {
        User user = findUserById(userId);

        // Delete old avatar if exists
        if (user.getAvatarUrl() != null) {
            s3Service.deleteFile(extractS3Key(user.getAvatarUrl()));
        }

        String s3Key = "avatars/" + userId + "/" +
                UUID.randomUUID() + getExtension(file);
        String url = s3Service.uploadFile(s3Key, file);

        user.setAvatarUrl(url);
        return UserDto.from(userRepository.save(user));
    }

    public MessageResponse changePassword(UUID userId, ChangePasswordRequest request) {
        User user = findUserById(userId);

        if (!passwordEncoder.matches(request.getCurrentPassword(), user.getPassword())) {
            throw new UnauthorizedException("Current password is incorrect");
        }

        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);

        return new MessageResponse("Password changed successfully");
    }

    public MessageResponse deleteAccount(UUID userId) {
        User user = findUserById(userId);
        user.setActive(false);
        userRepository.save(user);
        return new MessageResponse("Account deactivated successfully");
    }

    // -------------------------------------------------------
    private User findUserById(UUID userId) {
        return userRepository.findById(userId)
                .orElseThrow(() ->
                        new ResourceNotFoundException("User not found"));
    }

    private String getExtension(MultipartFile file) {
        String original = file.getOriginalFilename();
        return original != null && original.contains(".")
                ? original.substring(original.lastIndexOf("."))
                : ".jpg";
    }

    private String extractS3Key(String url) {
        return url.substring(url.indexOf("amazonaws.com/") + 14);
    }
}
