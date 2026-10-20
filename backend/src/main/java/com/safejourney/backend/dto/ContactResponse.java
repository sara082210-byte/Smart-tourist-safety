package com.safejourney.backend.dto;

import com.safejourney.backend.model.EmergencyContact;

public record ContactResponse(
        Long id,
        String name,
        String relationship,
        String phone,
        boolean isPrimary
) {
    public static ContactResponse from(EmergencyContact contact) {
        return new ContactResponse(
                contact.getId(),
                contact.getName(),
                contact.getRelationship(),
                contact.getPhone(),
                contact.isPrimary()
        );
    }
}
