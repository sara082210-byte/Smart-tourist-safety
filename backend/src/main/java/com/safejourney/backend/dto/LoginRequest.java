package com.safejourney.backend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

/** identifier = email address or phone number. */
public record LoginRequest(
        @NotBlank(message = "Please enter your email or phone number.")
        @Size(max = 254, message = "Email or phone is too long.")
        String identifier,

        @NotBlank(message = "Please enter your password.")
        @Size(max = 72, message = "Invalid email/phone or password.")
        String password
) {
    @Override
    public String toString() {
        return "LoginRequest[identifier=" + identifier + "]";
    }
}
