package com.safejourney.backend.service;

import com.safejourney.backend.model.User;
import com.safejourney.backend.repository.UserRepository;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

/**
 * Loads a user by email OR phone. The principal name is always the user's email,
 * so the session identity is stable regardless of how they logged in.
 */
@Service
public class AppUserDetailsService implements UserDetailsService {

    private final UserRepository users;

    public AppUserDetailsService(UserRepository users) {
        this.users = users;
    }

    @Override
    @Transactional(readOnly = true)
    public UserDetails loadUserByUsername(String identifier) throws UsernameNotFoundException {
        User user = findByIdentifier(identifier)
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));
        return new org.springframework.security.core.userdetails.User(
                user.getEmail(), user.getPasswordHash(), List.of());
    }

    public Optional<User> findByIdentifier(String identifier) {
        if (identifier == null || identifier.isBlank()) return Optional.empty();
        return IdentifierUtils.looksLikeEmail(identifier)
                ? users.findByEmail(IdentifierUtils.normalizeEmail(identifier))
                : users.findByPhone(IdentifierUtils.normalizePhone(identifier));
    }
}
