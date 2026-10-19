package com.safejourney.backend.service;

import java.util.Locale;

/** Shared normalisation so register and login match the same stored values. */
public final class IdentifierUtils {

    private IdentifierUtils() {
    }

    public static String normalizeEmail(String email) {
        return email.trim().toLowerCase(Locale.ROOT);
    }

    /** Removes spaces and dashes: "+91 98765-43210" -> "+919876543210". */
    public static String normalizePhone(String phone) {
        return phone.trim().replaceAll("[\\s-]", "");
    }

    public static boolean looksLikeEmail(String identifier) {
        return identifier.contains("@");
    }
}
