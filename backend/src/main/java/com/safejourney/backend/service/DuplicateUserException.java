package com.safejourney.backend.service;

/** Thrown when an email or phone is already registered (-> HTTP 409). */
public class DuplicateUserException extends RuntimeException {
    public DuplicateUserException(String message) {
        super(message);
    }
}
