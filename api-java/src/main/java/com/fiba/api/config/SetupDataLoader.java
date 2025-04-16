package com.fiba.api.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.io.File;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;

/**
 * Компонент для создания необходимых директорий при запуске приложения
 */
@Component
public class SetupDataLoader implements CommandLineRunner {

    @Value("${file.upload-dir:./uploads}")
    private String uploadDir;

    @Override
    public void run(String... args) throws Exception {
        // Создаем основную директорию для загрузок
        createDirectoryIfNotExists(uploadDir);
        
        // Создаем поддиректории для разных типов файлов
        createDirectoryIfNotExists(uploadDir + "/avatars");
        createDirectoryIfNotExists(uploadDir + "/ads");
        createDirectoryIfNotExists(uploadDir + "/tournaments");

        System.out.println("Директории для загрузки файлов созданы успешно");
    }

    private void createDirectoryIfNotExists(String dir) throws Exception {
        Path path = Paths.get(dir);
        if (!Files.exists(path)) {
            Files.createDirectories(path);
            System.out.println("Создана директория: " + path.toAbsolutePath());
        }
    }
} 