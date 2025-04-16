package com.fiba.api.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.nio.file.Path;
import java.nio.file.Paths;

/**
 * Конфигурация для доступа к загруженным файлам через URL
 */
@Configuration
public class StaticResourceConfig implements WebMvcConfigurer {

    @Value("${file.upload-dir:./uploads}")
    private String uploadDir;

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        // Определяем абсолютный путь к директории загрузок
        Path uploadPath = Paths.get(uploadDir);
        String resourceLocation = "file:" + uploadPath.toFile().getAbsolutePath() + "/";
        
        // Регистрируем обработчик ресурсов
        registry.addResourceHandler("/uploads/**")
                .addResourceLocations(resourceLocation)
                .setCachePeriod(3600) // Кэширование на 1 час
                .resourceChain(true);
        
        System.out.println("Настроен доступ к статическим ресурсам по пути: " + resourceLocation);
    }
} 