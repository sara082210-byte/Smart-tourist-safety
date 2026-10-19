package com.safejourney.backend.dto;

import java.util.Map;

/** Uniform error body: { message, fieldErrors? } */
public record ApiError(String message, Map<String, String> fieldErrors) {
    public static ApiError of(String message) {
        return new ApiError(message, null);
    }
}
