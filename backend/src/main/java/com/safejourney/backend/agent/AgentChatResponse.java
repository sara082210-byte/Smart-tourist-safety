package com.safejourney.backend.agent;

import java.time.Instant;

public record AgentChatResponse(
    String reply,
    String status,
    String disclaimer,
    Instant timestamp
) {
    public static final String DEFAULT_DISCLAIMER =
        "AI risk assessments and safety guidance are informational and not guaranteed predictions. In immediate emergencies in India, dial 112.";

    public static AgentChatResponse of(String reply) {
        return new AgentChatResponse(reply, "success", DEFAULT_DISCLAIMER, Instant.now());
    }
}
