package com.fiba.api.controller;

import com.fiba.api.model.User;
import com.fiba.api.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;
    private final PasswordEncoder passwordEncoder;

    @GetMapping("/api/user/role")
    public ResponseEntity<?> getUserRole(@AuthenticationPrincipal UserDetails userDetails) {
        try {
            User user = userService.getUserByEmail(userDetails.getUsername());
            return ResponseEntity.ok(Map.of("role", user.getRole()));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", "Ошибка при получении роли пользователя"));
        }
    }

    @GetMapping("/api/users")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> getAllUsers() {
        List<User> users = userService.getAllUsers();
        List<Map<String, Object>> userData = users.stream()
                .map(this::convertToMap)
                .collect(Collectors.toList());
        
        return ResponseEntity.ok(userData);
    }

    @GetMapping("/api/users/{id}")
    @PreAuthorize("hasRole('ADMIN') or @userSecurity.isCurrentUser(#id, principal)")
    public ResponseEntity<?> getUserById(@PathVariable Long id) {
        User user = userService.getUserById(id);
        return ResponseEntity.ok(convertToMap(user));
    }

    @PutMapping("/api/users/{id}")
    @PreAuthorize("hasRole('ADMIN') or @userSecurity.isCurrentUser(#id, principal)")
    public ResponseEntity<?> updateUser(
            @PathVariable Long id,
            @RequestBody Map<String, Object> userData,
            @AuthenticationPrincipal UserDetails userDetails) {
        
        User currentUser = userService.getUserByEmail(userDetails.getUsername());
        User existingUser = userService.getUserById(id);
        
        // Только администраторы могут менять роли пользователей
        if (userData.containsKey("role") && !"admin".equals(currentUser.getRole())) {
            return ResponseEntity.status(403).body(Map.of("error", "Только администраторы могут менять роли пользователей"));
        }
        
        if (userData.containsKey("name")) {
            existingUser.setName((String) userData.get("name"));
        }
        
        if (userData.containsKey("email")) {
            existingUser.setEmail((String) userData.get("email"));
        }
        
        if (userData.containsKey("password")) {
            existingUser.setPassword(passwordEncoder.encode((String) userData.get("password")));
        }
        
        if (userData.containsKey("role") && "admin".equals(currentUser.getRole())) {
            existingUser.setRole((String) userData.get("role"));
        }
        
        User updatedUser = userService.updateUser(existingUser);
        
        return ResponseEntity.ok(convertToMap(updatedUser));
    }

    @DeleteMapping("/api/users/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> deleteUser(@PathVariable Long id) {
        userService.deleteUser(id);
        return ResponseEntity.ok().body(Map.of("message", "Пользователь успешно удален"));
    }

    @PutMapping("/api/users/{id}/role")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> updateUserRole(
            @PathVariable Long id,
            @RequestBody Map<String, String> roleData) {
        
        String role = roleData.get("role");
        if (role == null || !List.of("user", "admin", "advertiser").contains(role)) {
            return ResponseEntity.badRequest().body(Map.of("error", "Недопустимая роль"));
        }
        
        User user = userService.getUserById(id);
        user.setRole(role);
        User updatedUser = userService.updateUser(user);
        
        return ResponseEntity.ok(convertToMap(updatedUser));
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
        userMap.put("role", user.getRole());
        userMap.put("email_verified", user.isEmailVerified());
        
        if (user.getProfile() != null) {
            Map<String, Object> profileMap = new HashMap<>();
            profileMap.put("id", user.getProfile().getId());
            profileMap.put("photo_url", user.getProfile().getPhotoUrl());
            profileMap.put("tournaments_played", user.getProfile().getTournamentsPlayed());
            profileMap.put("total_points", user.getProfile().getTotalPoints());
            profileMap.put("rating", user.getProfile().getRating());
            
            userMap.put("profile", profileMap);
        }
        
        return userMap;
    }
} 