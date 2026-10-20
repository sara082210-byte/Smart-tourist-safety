package com.safejourney.backend.controller;

import com.safejourney.backend.dto.IncidentRequest;
import com.safejourney.backend.dto.IncidentResponse;
import com.safejourney.backend.model.IncidentReport;
import com.safejourney.backend.model.User;
import com.safejourney.backend.repository.IncidentReportRepository;
import com.safejourney.backend.service.AppUserDetailsService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.security.SecureRandom;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.List;

@RestController
@RequestMapping("/api/incidents")
public class IncidentReportController {

    private final IncidentReportRepository incidentRepository;
    private final AppUserDetailsService userDetailsService;
    private static final SecureRandom RANDOM = new SecureRandom();

    public IncidentReportController(IncidentReportRepository incidentRepository,
                                    AppUserDetailsService userDetailsService) {
        this.incidentRepository = incidentRepository;
        this.userDetailsService = userDetailsService;
    }

    private User getAuthenticatedUser(Authentication auth) {
        if (auth == null || !auth.isAuthenticated()) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Authentication required");
        }
        return userDetailsService.findByIdentifier(auth.getName())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User not found"));
    }

    @GetMapping
    public List<IncidentResponse> list(Authentication auth) {
        User user = getAuthenticatedUser(auth);
        return incidentRepository.findByUserOrderByCreatedAtDesc(user)
                .stream()
                .map(IncidentResponse::from)
                .toList();
    }

    @PostMapping
    public ResponseEntity<IncidentResponse> create(@Valid @RequestBody IncidentRequest request, Authentication auth) {
        User user = getAuthenticatedUser(auth);

        String dateStr = LocalDate.now().format(DateTimeFormatter.BASIC_ISO_DATE);
        int randNum = 1000 + RANDOM.nextInt(9000);
        String refNum = "INC-" + dateStr + "-" + randNum;

        IncidentReport report = new IncidentReport(
                user,
                request.destinationName(),
                request.incidentType().trim(),
                request.location().trim(),
                request.details().trim(),
                request.latitude(),
                request.longitude(),
                refNum
        );

        IncidentReport saved = incidentRepository.save(report);
        return ResponseEntity.status(HttpStatus.CREATED).body(IncidentResponse.from(saved));
    }
}
