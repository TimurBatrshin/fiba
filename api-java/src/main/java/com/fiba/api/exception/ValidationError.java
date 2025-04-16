package com.fiba.api.exception;

import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.Map;

/**
 * Расширенная модель ошибки для случаев валидации данных
 */
@Getter
@Setter
public class ValidationError extends ApiError {
    
    private Map<String, String> errors;
    
    public ValidationError(int status, String message, String path, LocalDateTime timestamp, Map<String, String> errors) {
        super(status, message, path, timestamp);
        this.errors = errors;
    }
} 