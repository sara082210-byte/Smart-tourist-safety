package com.safejourney.backend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record IncidentRequest(
        @NotBlank(message = "Incident type is required")
        @Size(max = 50, message = "Incident type must not exceed 50 characters")
        String incidentType,

        @NotBlank(message = "Location is required")
        @Size(max = 200, message = "Location must not exceed 200 characters")
        String location,

        @Size(max = 100, message = "Destination name must not exceed 100 characters")
        String destinationName,

        @NotBlank(message = "Details are required")
        String details,

        Double latitude,
        Double longitude
) {}
