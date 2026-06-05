package com.codewithpcodes.ebenezer.user;

import com.codewithpcodes.ebenezer.handler.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/v1/users")
@RequiredArgsConstructor
@Tag(name = "User Management", description = "User Management endpoints")
public class UserController {

    private final UserService userService;

    @GetMapping("/me")
    public ResponseEntity<ApiResponse<UserDto>> getProfile(
            @AuthenticationPrincipal User currentUser) {
        UserDto user = userService.getProfile(currentUser.getId());
        return ResponseEntity.ok(ApiResponse.success(user));
    }

    @PutMapping("/me")
    public ResponseEntity<ApiResponse<UserDto>> updateProfile(
            @AuthenticationPrincipal User currentUser,
            @Valid @RequestBody UpdateProfileRequest request) {
        UserDto user = userService.updateProfile(currentUser.getId(), request);
        return ResponseEntity.ok(ApiResponse.success(user));
    }

    @PostMapping("/me/avatar")
    public ResponseEntity<ApiResponse<UserDto>> uploadAvatar(
            @AuthenticationPrincipal User currentUser,
            @RequestParam("file") MultipartFile file) {
        UserDto user = userService.uploadAvatar(currentUser.getId(), file);
        return ResponseEntity.ok(ApiResponse.success(user));
    }

    @PutMapping("/me/password")
    public ResponseEntity<ApiResponse<MessageResponse>> changePassword(
            @AuthenticationPrincipal User user,
            @Valid @RequestBody ChangePasswordRequest request) {
        MessageResponse response = userService.changePassword(
                user.getId(), request);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @DeleteMapping("/me")
    public ResponseEntity<ApiResponse<MessageResponse>> deleteAccount(
            @AuthenticationPrincipal User user) {
        MessageResponse response =
                userService.deleteAccount(user.getId());
        return ResponseEntity.ok(ApiResponse.success(response));
    }
}
