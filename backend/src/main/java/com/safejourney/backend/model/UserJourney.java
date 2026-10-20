package com.safejourney.backend.model;

import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(name = "user_journeys")
public class UserJourney {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private User user;

    @Column(name = "destination_id", nullable = false)
    private Long destinationId;

    @Column(name = "destination_name", nullable = false, length = 100)
    private String destinationName;

    @Column(name = "start_date", length = 30)
    private String startDate;

    @Column(name = "expected_arrival", length = 30)
    private String expectedArrival;

    @Column(name = "check_in_interval", length = 30)
    private String checkInInterval = "Every 2 hours";

    @Column(name = "reminders_enabled", nullable = false)
    private boolean remindersEnabled = true;

    @Column(name = "notify_contacts", nullable = false)
    private boolean notifyContacts = true;

    @Column(name = "last_check_in", length = 50)
    private String lastCheckIn;

    @Column(name = "next_check_in", length = 50)
    private String nextCheckIn;

    @Column(length = 20)
    private String status = "On Track";

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt = Instant.now();

    public UserJourney() {
    }

    public UserJourney(User user, Long destinationId, String destinationName, String startDate,
                       String expectedArrival, String checkInInterval, boolean remindersEnabled,
                       boolean notifyContacts, String lastCheckIn, String nextCheckIn, String status) {
        this.user = user;
        this.destinationId = destinationId;
        this.destinationName = destinationName;
        this.startDate = startDate;
        this.expectedArrival = expectedArrival;
        this.checkInInterval = checkInInterval;
        this.remindersEnabled = remindersEnabled;
        this.notifyContacts = notifyContacts;
        this.lastCheckIn = lastCheckIn;
        this.nextCheckIn = nextCheckIn;
        this.status = status;
        this.updatedAt = Instant.now();
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

    public Long getDestinationId() {
        return destinationId;
    }

    public void setDestinationId(Long destinationId) {
        this.destinationId = destinationId;
    }

    public String getDestinationName() {
        return destinationName;
    }

    public void setDestinationName(String destinationName) {
        this.destinationName = destinationName;
    }

    public String getStartDate() {
        return startDate;
    }

    public void setStartDate(String startDate) {
        this.startDate = startDate;
    }

    public String getExpectedArrival() {
        return expectedArrival;
    }

    public void setExpectedArrival(String expectedArrival) {
        this.expectedArrival = expectedArrival;
    }

    public String getCheckInInterval() {
        return checkInInterval;
    }

    public void setCheckInInterval(String checkInInterval) {
        this.checkInInterval = checkInInterval;
    }

    public boolean isRemindersEnabled() {
        return remindersEnabled;
    }

    public void setRemindersEnabled(boolean remindersEnabled) {
        this.remindersEnabled = remindersEnabled;
    }

    public boolean isNotifyContacts() {
        return notifyContacts;
    }

    public void setNotifyContacts(boolean notifyContacts) {
        this.notifyContacts = notifyContacts;
    }

    public String getLastCheckIn() {
        return lastCheckIn;
    }

    public void setLastCheckIn(String lastCheckIn) {
        this.lastCheckIn = lastCheckIn;
    }

    public String getNextCheckIn() {
        return nextCheckIn;
    }

    public void setNextCheckIn(String nextCheckIn) {
        this.nextCheckIn = nextCheckIn;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public Instant getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(Instant updatedAt) {
        this.updatedAt = updatedAt;
    }
}
