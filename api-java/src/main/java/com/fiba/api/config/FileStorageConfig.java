package com.fiba.api.config;

import com.fiba.api.service.FileStorageService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.io.IOException;

@Configuration
@RequiredArgsConstructor
@Slf4j
public class FileStorageConfig {

    private final FileStorageService fileStorageService;

    @Bean
    public CommandLineRunner initFileStorage() {
        return args -> {
            try {
                fileStorageService.init();
            } catch (IOException e) {
                log.error("Не удалось инициализировать хранилище файлов: {}", e.getMessage(), e);
                throw new RuntimeException("Ошибка инициализации хранилища файлов", e);
            }
        };
    }
} 