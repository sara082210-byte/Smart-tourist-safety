package com.safejourney.backend.agent;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record AgentChatRequest(
    @NotBlank(message = "Message cannot be empty.")
    @Size(max = 2000, message = "Message cannot exceed 2000 characters.")
    String message,

    String destination,
    String coordinates,
    String language
) {}
