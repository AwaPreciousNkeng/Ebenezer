package com.codewithpcodes.ebenezer.user;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.OffsetDateTime;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserDto {

    private UUID id;
    private String email;
    private String fullName;
    private String avatarUrl;
    private String timezone;
    private Role role;
    private boolean isEmailVerified;
    private OauthProvider oauthProvider;
    private OffsetDateTime createdAt;

    public static UserDto from(User user) {
        return UserDto.builder()
                .id(user.getId())
                .email(user.getEmail())
                .fullName(user.getFullName())
                .avatarUrl(user.getAvatarUrl())
                .timezone("UTC")
                .role(user.getRole())
                .isEmailVerified(user.isEmailVerified())
                .oauthProvider(user.getOauthProvider())
                .createdAt(user.getCreatedAt())
                .build();
    }
}
