package com.fiba.api.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class AuthRequest {

    @NotBlank(message = "Email обязателен")
    @Email(message = "Пожалуйста, введите корректный email")
    private String email;

    @NotBlank(message = "Пароль обязателен")
    private String password;
} 