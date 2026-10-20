package com.safejourney.backend.model;

import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(name = "incident_reports")
public class IncidentReport {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "destination_name", length = 100)
    private String destinationName;

    @Column(name = "incident_type", nullable = false, length = 50)
    private String incidentType;

    @Column(nullable = false, length = 200)
    private String location;

    @Column(columnDefinition = "TEXT", nullable = false)
    private String details;

    private Double latitude;

    private Double longitude;

    @Column(length = 30)
    private String status = "Submitted";

    @Column(name = "reference_number", length = 30)
    private String referenceNumber;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt = Instant.now();

    public IncidentReport() {
    }

    public IncidentReport(User user, String destinationName, String incidentType, String location,
                          String details, Double latitude, Double longitude, String referenceNumber) {
        this.user = user;
        this.destinationName = destinationName;
        this.incidentType = incidentType;
        this.location = location;
        this.details = details;
        this.latitude = latitude;
        this.longitude = longitude;
        this.status = "Submitted";
        this.referenceNumber = referenceNumber;
        this.createdAt = Instant.now();
    }

    public Long getId() {
        return id;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public String getDestinationName() {
        return destinationName;
    }

    public void setDestinationName(String destinationName) {
        this.destinationName = destinationName;
    }

    public String getIncidentType() {
        return incidentType;
    }

    public void setIncidentType(String incidentType) {
        this.incidentType = incidentType;
    }

    public String getLocation() {
        return location;
    }

    public void setLocation(String location) {
        this.location = location;
    }

    public String getDetails() {
        return details;
    }

    public void setDetails(String details) {
        this.details = details;
    }

    public Double getLatitude() {
        return latitude;
    }

    public void setLatitude(Double latitude) {
        this.latitude = latitude;
    }

    public Double getLongitude() {
        return longitude;
    }

    public void setLongitude(Double longitude) {
        this.longitude = longitude;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getReferenceNumber() {
        return referenceNumber;
    }

    public void setReferenceNumber(String referenceNumber) {
        this.referenceNumber = referenceNumber;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }
}
