package com.safejourney.backend.dto;

import com.safejourney.backend.model.User;

/** Safe public view of a user (no password hash). */
public record UserResponse(Long id, String fullName, String email, String phone) {
    public static UserResponse from(User u) {
        return new UserResponse(u.getId(), u.getFullName(), u.getEmail(), u.getPhone());
    }
}
