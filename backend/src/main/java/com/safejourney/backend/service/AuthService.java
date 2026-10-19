package com.safejourney.backend.service;

import com.safejourney.backend.dto.RegisterRequest;
import com.safejourney.backend.model.User;
import com.safejourney.backend.repository.UserRepository;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuthService {

    private final UserRepository users;
    private final PasswordEncoder passwordEncoder;

    public AuthService(UserRepository users, PasswordEncoder passwordEncoder) {
        this.users = users;
        this.passwordEncoder = passwordEncoder;
    }

    @Transactional
    public User register(RegisterRequest req) {
        String email = IdentifierUtils.normalizeEmail(req.email());
        String phone = IdentifierUtils.normalizePhone(req.phone());

        if (users.existsByEmail(email)) {
            throw new DuplicateUserException("An account with this email already exists.");
        }
        if (users.existsByPhone(phone)) {
            throw new DuplicateUserException("An account with this phone number already exists.");
        }

        User user = new User(req.fullName().trim(), email, phone, passwordEncoder.encode(req.password()));
        try {
            return users.saveAndFlush(user);
        } catch (DataIntegrityViolationException e) {
            // Race: another request registered the same email/phone concurrently.
            throw new DuplicateUserException("An account with these details already exists.");
        }
    }
}
