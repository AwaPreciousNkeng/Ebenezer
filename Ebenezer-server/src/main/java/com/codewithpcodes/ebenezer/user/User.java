package com.codewithpcodes.ebenezer.user;

import com.codewithpcodes.ebenezer.account.Account;
import com.codewithpcodes.ebenezer.journal.JournalEntry;
import com.codewithpcodes.ebenezer.playbook.Playbook;
import com.codewithpcodes.ebenezer.token.Token;
import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.annotation.Nonnull;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.time.LocalDateTime;
import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.Collection;
import java.util.List;
import java.util.UUID;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
@Entity
@Table(name = "users")
public class User implements UserDetails {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    private String firstName;

    private String lastName;

    @Column(unique = true, nullable = false)
    private String email;

    @JsonIgnore
    private String password;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Role role;

    @Builder.Default
    @Column(nullable = false)
    private boolean accountLocked = false;

    @Builder.Default
    @Column(nullable = false)
    private int failedLoginAttempts = 0;

    private LocalDateTime lockedUntil;

    private String resetPasswordCode;
    private LocalDateTime resetPasswordCodeExpiry;

    @Column(name = "avatar_url", nullable = false)
    private String avatarUrl;

    @JsonIgnore
    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL)
    private List<Token> tokens;

    @Builder.Default
    private boolean isActive = true;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private OauthProvider oauthProvider = OauthProvider.NONE;
    private String providerId;

    @CreationTimestamp
    @Builder.Default
    private OffsetDateTime createdAt = OffsetDateTime.now();

    @UpdateTimestamp
    private OffsetDateTime updatedAt;

    @JsonIgnore
    @OneToMany(mappedBy = "user",
            cascade = CascadeType.ALL,
            orphanRemoval = true)
    private List<Account> accounts = new ArrayList<>();

    @JsonIgnore
    @OneToMany(mappedBy = "user",
            cascade = CascadeType.ALL,
            orphanRemoval = true)
    private List<Playbook> playbooks = new ArrayList<>();

    @JsonIgnore
    @OneToMany(mappedBy = "user",
            cascade = CascadeType.ALL,
            orphanRemoval = true)
    private List<JournalEntry> journalEntries = new ArrayList<>();

    @Override
    public @Nonnull Collection<? extends GrantedAuthority> getAuthorities() {
        return List.of(new SimpleGrantedAuthority("ROLE_" + role.name()));
    }

    @Override
    public @NonNull String getUsername() {
        return email;
    }

    public String getFullName() {
        return firstName + " " + lastName;
    }
}
