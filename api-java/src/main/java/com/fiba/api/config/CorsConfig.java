package com.fiba.api.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.web.filter.CorsFilter;

import java.util.Arrays;
import java.util.List;

/**
 * Конфигурация CORS для API.
 * Позволяет определить, какие домены могут обращаться к API
 */
@Configuration
public class CorsConfig {

    @Value("${app.cors.allowed-origins}")
    private String allowedOrigins;

    @Value("${app.cors.allowed-methods:GET,POST,PUT,DELETE,OPTIONS}")
    private String allowedMethods;

    @Value("${app.cors.allowed-headers:Origin,Content-Type,Accept,Authorization}")
    private String allowedHeaders;

    @Value("${app.cors.max-age:3600}")
    private long maxAge;

    @Bean
    public CorsFilter corsFilter() {
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        CorsConfiguration config = new CorsConfiguration();
        
        // Разбиваем строку с разрешенными источниками на список
        List<String> origins = Arrays.asList(allowedOrigins.split(","));
        config.setAllowedOrigins(origins);
        
        // Разбиваем строку с разрешенными методами на список
        List<String> methods = Arrays.asList(allowedMethods.split(","));
        config.setAllowedMethods(methods);
        
        // Разбиваем строку с разрешенными заголовками на список
        List<String> headers = Arrays.asList(allowedHeaders.split(","));
        config.setAllowedHeaders(headers);
        
        // Разрешаем передачу учетных данных
        config.setAllowCredentials(true);
        
        // Устанавливаем время кеширования результатов предварительной проверки
        config.setMaxAge(maxAge);
        
        // Применяем настройки CORS ко всем маршрутам
        source.registerCorsConfiguration("/**", config);
        
        return new CorsFilter(source);
    }
} 