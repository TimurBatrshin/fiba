package com.fiba.api.controller;

import com.fiba.api.model.User;
import com.fiba.api.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * Контроллер для обработки поисковых запросов
 */
@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class SearchController {

    private final UserService userService;
    
    /**
     * Поиск пользователей по имени или email
     * @param query строка для поиска
     * @return список найденных пользователей
     */
    @GetMapping("/users/search")
    public ResponseEntity<?> searchUsers(@RequestParam String query) {
        List<User> users = userService.searchUsers(query);
        List<Map<String, Object>> userData = users.stream()
                .map(this::convertToMap)
                .collect(Collectors.toList());
        
        return ResponseEntity.ok(userData);
    }
    
    /**
     * Метод преобразует сущность User в Map для безопасной передачи клиенту
     * (без конфиденциальных данных, таких как пароль)
     */
    private Map<String, Object> convertToMap(User user) {
        Map<String, Object> userMap = new HashMap<>();
        userMap.put("id", user.getId());
        userMap.put("name", user.getName());
        userMap.put("email", user.getEmail());
        
        if (user.getProfile() != null && user.getProfile().getPhotoUrl() != null) {
            userMap.put("photoUrl", user.getProfile().getPhotoUrl());
        }
        
        return userMap;
    }
} 