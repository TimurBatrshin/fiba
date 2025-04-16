package com.fiba.api.service;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.UUID;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

@Service
public class FileStorageService {

    private static final Logger log = LoggerFactory.getLogger(FileStorageService.class);
    
    @Value("${file.upload-dir:uploads}")
    private String uploadDir;
    
    /**
     * Инициализирует сервис хранения файлов, создавая необходимые директории
     * Вызывается при запуске приложения
     */
    public void init() throws IOException {
        log.info("Инициализация FileStorageService...");
        // Создаем основную директорию загрузки, если она не существует
        Path uploadPath = Paths.get(uploadDir);
        if (!Files.exists(uploadPath)) {
            Files.createDirectories(uploadPath);
            log.info("Создана базовая директория для загрузки файлов: {}", uploadPath);
        }
        
        // Создаем поддиректории для разных типов файлов
        String[] subdirs = {"tournaments", "sponsors", "ads", "profiles", "avatars"};
        for (String subdir : subdirs) {
            Path subdirPath = Paths.get(uploadDir, subdir);
            if (!Files.exists(subdirPath)) {
                Files.createDirectories(subdirPath);
                log.info("Создана поддиректория: {}", subdirPath);
            }
        }
        log.info("FileStorageService инициализирован успешно");
    }
    
    /**
     * Сохраняет загруженный файл в директории для изображений турниров
     *
     * @param file Загруженный файл
     * @return Путь к сохраненному файлу относительно корня приложения
     * @throws IOException Если произошла ошибка при сохранении файла
     */
    public String storeTournamentImage(MultipartFile file) throws IOException {
        return storeFile(file, "tournaments");
    }
    
    /**
     * Сохраняет загруженный файл в директории для логотипов спонсоров
     *
     * @param file Загруженный файл
     * @return Путь к сохраненному файлу относительно корня приложения
     * @throws IOException Если произошла ошибка при сохранении файла
     */
    public String storeSponsorLogo(MultipartFile file) throws IOException {
        return storeFile(file, "sponsors");
    }
    
    /**
     * Сохраняет загруженный файл в директории для изображений рекламы
     *
     * @param file Загруженный файл
     * @return Путь к сохраненному файлу относительно корня приложения
     * @throws IOException Если произошла ошибка при сохранении файла
     */
    public String storeFile(MultipartFile file) throws IOException {
        return storeFile(file, "ads");
    }
    
    /**
     * Сохраняет загруженный файл в указанной поддиректории
     *
     * @param file Загруженный файл
     * @param subdirectory Поддиректория для сохранения (например, "sponsors", "tournaments")
     * @return Путь к сохраненному файлу относительно корня приложения
     * @throws IOException Если произошла ошибка при сохранении файла
     */
    private String storeFile(MultipartFile file, String subdirectory) throws IOException {
        if (file == null || file.isEmpty()) {
            return null;
        }
        
        // Получаем имя файла
        String originalFilename = StringUtils.cleanPath(file.getOriginalFilename());
        
        // Проверяем имя файла на недопустимые символы
        if (originalFilename.contains("..")) {
            throw new IOException("Имя файла содержит недопустимые символы: " + originalFilename);
        }
        
        // Генерируем уникальное имя файла, сохраняя расширение
        String fileExtension = "";
        if (originalFilename.contains(".")) {
            fileExtension = originalFilename.substring(originalFilename.lastIndexOf("."));
        }
        String newFilename = UUID.randomUUID().toString() + fileExtension;
        
        // Создаем директорию для сохранения файла
        Path uploadPath = Paths.get(uploadDir, subdirectory);
        if (!Files.exists(uploadPath)) {
            Files.createDirectories(uploadPath);
            log.info("Создана директория: {}", uploadPath);
        }
        
        // Сохраняем файл
        Path targetLocation = uploadPath.resolve(newFilename);
        Files.copy(file.getInputStream(), targetLocation, StandardCopyOption.REPLACE_EXISTING);
        log.info("Файл сохранен: {}", targetLocation);
        
        // Возвращаем относительный путь к файлу для хранения в БД
        return "/" + uploadDir + "/" + subdirectory + "/" + newFilename;
    }
}