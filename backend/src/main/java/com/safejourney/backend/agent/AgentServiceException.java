package com.safejourney.backend.agent;

import org.springframework.http.HttpStatus;

public class AgentServiceException extends RuntimeException {
    private final HttpStatus status;

    public AgentServiceException(String message, HttpStatus status) {
        super(message);
        this.status = status;
    }

    public AgentServiceException(String message, Throwable cause, HttpStatus status) {
        super(message, cause);
        this.status = status;
    }

    public HttpStatus getStatus() {
        return status;
    }
}
