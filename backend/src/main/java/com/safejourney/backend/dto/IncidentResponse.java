package com.safejourney.backend.dto;

import com.safejourney.backend.model.IncidentReport;

import java.time.Instant;

public record IncidentResponse(
        Long id,
        String referenceNumber,
        String incidentType,
        String location,
        String destinationName,
        String details,
        Double latitude,
        Double longitude,
        String status,
        Instant createdAt
) {
    public static IncidentResponse from(IncidentReport report) {
        return new IncidentResponse(
                report.getId(),
                report.getReferenceNumber(),
                report.getIncidentType(),
                report.getLocation(),
                report.getDestinationName(),
                report.getDetails(),
                report.getLatitude(),
                report.getLongitude(),
                report.getStatus(),
                report.getCreatedAt()
        );
    }
}
