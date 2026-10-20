package com.safejourney.backend.controller;

import com.safejourney.backend.dto.JourneyRequest;
import com.safejourney.backend.dto.JourneyResponse;
import com.safejourney.backend.model.User;
import com.safejourney.backend.model.UserJourney;
import com.safejourney.backend.repository.UserJourneyRepository;
import com.safejourney.backend.service.AppUserDetailsService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.time.Instant;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/journey")
public class UserJourneyController {

    private final UserJourneyRepository journeyRepository;
    private final AppUserDetailsService userDetailsService;

    public UserJourneyController(UserJourneyRepository journeyRepository,
                                 AppUserDetailsService userDetailsService) {
        this.journeyRepository = journeyRepository;
        this.userDetailsService = userDetailsService;
    }

    private User getAuthenticatedUser(Authentication auth) {
        if (auth == null || !auth.isAuthenticated()) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Authentication required");
        }
        return userDetailsService.findByIdentifier(auth.getName())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User not found"));
    }

    @GetMapping("/active")
    public ResponseEntity<JourneyResponse> getActiveJourney(Authentication auth) {
        User user = getAuthenticatedUser(auth);
        Optional<UserJourney> journey = journeyRepository.findByUserId(user.getId());
        return journey.map(j -> ResponseEntity.ok(JourneyResponse.from(j)))
                .orElseGet(() -> ResponseEntity.noContent().build());
    }

    @PostMapping("/active")
    public ResponseEntity<JourneyResponse> setActiveJourney(@Valid @RequestBody JourneyRequest request,
                                                           Authentication auth) {
        User user = getAuthenticatedUser(auth);
        UserJourney journey = journeyRepository.findByUserId(user.getId())
                .orElse(new UserJourney());

        journey.setUser(user);
        journey.setDestinationId(request.destinationId());
        journey.setDestinationName(request.destinationName().trim());

        if (request.startDate() != null) journey.setStartDate(request.startDate());
        if (request.expectedArrival() != null) journey.setExpectedArrival(request.expectedArrival());
        if (request.checkInInterval() != null) journey.setCheckInInterval(request.checkInInterval());
        if (request.remindersEnabled() != null) journey.setRemindersEnabled(request.remindersEnabled());
        if (request.notifyContacts() != null) journey.setNotifyContacts(request.notifyContacts());
        if (request.lastCheckIn() != null) journey.setLastCheckIn(request.lastCheckIn());
        if (request.nextCheckIn() != null) journey.setNextCheckIn(request.nextCheckIn());
        if (request.status() != null) journey.setStatus(request.status());
        journey.setUpdatedAt(Instant.now());

        UserJourney saved = journeyRepository.save(journey);
        return ResponseEntity.ok(JourneyResponse.from(saved));
    }

    @PostMapping("/checkin")
    public ResponseEntity<JourneyResponse> performCheckIn(@RequestBody(required = false) Map<String, String> payload,
                                                          Authentication auth) {
        User user = getAuthenticatedUser(auth);
        UserJourney journey = journeyRepository.findByUserId(user.getId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "No active journey found to check in"));

        String lastCheckIn = payload != null && payload.containsKey("lastCheckIn")
                ? payload.get("lastCheckIn")
                : "Just now";
        String nextCheckIn = payload != null && payload.containsKey("nextCheckIn")
                ? payload.get("nextCheckIn")
                : "In 2 hours";

        journey.setLastCheckIn(lastCheckIn);
        journey.setNextCheckIn(nextCheckIn);
        journey.setStatus("On Track");
        journey.setUpdatedAt(Instant.now());

        UserJourney saved = journeyRepository.save(journey);
        return ResponseEntity.ok(JourneyResponse.from(saved));
    }
}
