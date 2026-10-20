package com.safejourney.backend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record ContactRequest(
        @NotBlank(message = "Contact name is required")
        @Size(max = 100, message = "Name must not exceed 100 characters")
        String name,

        @NotBlank(message = "Relationship is required")
        @Size(max = 50, message = "Relationship must not exceed 50 characters")
        String relationship,

        @NotBlank(message = "Phone number is required")
        @Pattern(regexp = "^[+0-9\\s\\-()]{7,20}$", message = "Please enter a valid phone number")
        String phone,

        Boolean isPrimary
) {}
