package com.safejourney.backend.dto;

import com.safejourney.backend.model.UserJourney;

import java.time.Instant;

public record JourneyResponse(
        Long id,
        Long destinationId,
        String destinationName,
        String startDate,
        String expectedArrival,
        String checkInInterval,
        boolean remindersEnabled,
        boolean notifyContacts,
        String lastCheckIn,
        String nextCheckIn,
        String status,
        Instant updatedAt
) {
    public static JourneyResponse from(UserJourney journey) {
        return new JourneyResponse(
                journey.getId(),
                journey.getDestinationId(),
                journey.getDestinationName(),
                journey.getStartDate(),
                journey.getExpectedArrival(),
                journey.getCheckInInterval(),
                journey.isRemindersEnabled(),
                journey.isNotifyContacts(),
                journey.getLastCheckIn(),
                journey.getNextCheckIn(),
                journey.getStatus(),
                journey.getUpdatedAt()
        );
    }
}
