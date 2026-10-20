package com.safejourney.backend.controller;

import com.safejourney.backend.dto.ContactRequest;
import com.safejourney.backend.dto.ContactResponse;
import com.safejourney.backend.model.EmergencyContact;
import com.safejourney.backend.model.User;
import com.safejourney.backend.repository.EmergencyContactRepository;
import com.safejourney.backend.service.AppUserDetailsService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@RestController
@RequestMapping("/api/contacts")
public class EmergencyContactController {

    private final EmergencyContactRepository contactRepository;
    private final AppUserDetailsService userDetailsService;

    public EmergencyContactController(EmergencyContactRepository contactRepository,
                                      AppUserDetailsService userDetailsService) {
        this.contactRepository = contactRepository;
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
    public List<ContactResponse> list(Authentication auth) {
        User user = getAuthenticatedUser(auth);
        return contactRepository.findByUserOrderByCreatedAtAsc(user)
                .stream()
                .map(ContactResponse::from)
                .toList();
    }

    @PostMapping
    public ResponseEntity<ContactResponse> create(@Valid @RequestBody ContactRequest request, Authentication auth) {
        User user = getAuthenticatedUser(auth);

        long count = contactRepository.countByUser(user);
        if (count >= 5) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Maximum of 5 personal emergency contacts allowed");
        }

        boolean isPrimary = request.isPrimary() != null ? request.isPrimary() : (count == 0);
        EmergencyContact contact = new EmergencyContact(
                user,
                request.name().trim(),
                request.relationship().trim(),
                request.phone().trim(),
                isPrimary
        );

        EmergencyContact saved = contactRepository.save(contact);
        return ResponseEntity.status(HttpStatus.CREATED).body(ContactResponse.from(saved));
    }

    @PutMapping("/{id}")
    public ContactResponse update(@PathVariable Long id, @Valid @RequestBody ContactRequest request, Authentication auth) {
        User user = getAuthenticatedUser(auth);
        EmergencyContact contact = contactRepository.findByIdAndUser(id, user)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Emergency contact not found"));

        contact.setName(request.name().trim());
        contact.setRelationship(request.relationship().trim());
        contact.setPhone(request.phone().trim());
        if (request.isPrimary() != null) {
            contact.setPrimary(request.isPrimary());
        }

        EmergencyContact saved = contactRepository.save(contact);
        return ContactResponse.from(saved);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id, Authentication auth) {
        User user = getAuthenticatedUser(auth);
        EmergencyContact contact = contactRepository.findByIdAndUser(id, user)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Emergency contact not found"));

        contactRepository.delete(contact);
        return ResponseEntity.noContent().build();
    }
}
