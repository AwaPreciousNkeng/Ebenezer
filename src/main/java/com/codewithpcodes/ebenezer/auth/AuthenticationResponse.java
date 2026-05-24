package com.codewithpcodes.ebenezer.auth;

import com.codewithpcodes.ebenezer.user.UserDto;
import com.fasterxml.jackson.annotation.JsonProperty;

public record AuthenticationResponse(
        @JsonProperty("access_token")
        String accessToken,

        @JsonProperty("refresh_token")
        String refreshToken,

        UserDto user
) {
    public static AuthenticationResponse fromAuth(
            String accessToken,
            String refreshToken,
            UserDto user
    ) {
        return new AuthenticationResponse(
                accessToken,
                refreshToken,
                user
        );
    }
}