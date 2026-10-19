package com.safejourney.backend.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

/** Mirrors the client-side rules in pages/Register.tsx. */
public record RegisterRequest(
        @NotBlank(message = "Please enter your full name.")
        @Size(max = 100, message = "Full name must be at most 100 characters.")
        String fullName,

        @NotBlank(message = "Please enter your email address.")
        @Email(message = "Enter a valid email address.")
        @Size(max = 254, message = "Email is too long.")
        String email,

        @NotBlank(message = "Please enter your phone number.")
        @Pattern(regexp = "^\\+?[0-9\\s-]{7,15}$", message = "Enter a valid phone number.")
        String phone,

        @NotBlank(message = "Please create a password.")
        // BCrypt only uses the first 72 bytes, so cap the length.
        @Size(min = 8, max = 72, message = "Password must be 8 to 72 characters.")
        @Pattern(regexp = "^(?=.*[A-Za-z])(?=.*[0-9]).*$", message = "Use at least one letter and one number.")
        String password
) {
    @Override
    public String toString() {
        return "RegisterRequest[email=" + email + "]"; // never log the password
    }
}
