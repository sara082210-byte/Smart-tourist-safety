package com.safejourney.backend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record JourneyRequest(
        @NotNull(message = "Destination ID is required")
        Long destinationId,

        @NotBlank(message = "Destination name is required")
        @Size(max = 100)
        String destinationName,

        String startDate,
        String expectedArrival,
        String checkInInterval,
        Boolean remindersEnabled,
        Boolean notifyContacts,
        String lastCheckIn,
        String nextCheckIn,
        String status
) {}
