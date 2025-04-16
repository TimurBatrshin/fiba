package com.fiba.api.controller;

import com.fiba.api.model.Profile;
import com.fiba.api.model.User;
import com.fiba.api.service.FileStorageService;
import com.fiba.api.service.ProfileService;
import com.fiba.api.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class ProfileController {

    private final ProfileService profileService;
    private final UserService userService;
    private final FileStorageService fileStorageService;

    @GetMapping("/profile")
    public ResponseEntity<?> getProfile(@AuthenticationPrincipal UserDetails userDetails) {
        User user = userService.getUserByEmail(userDetails.getUsername());
        Profile profile = profileService.getProfileByUserId(user.getId());
        
        // Подготовка данных профиля в формате JSON
        Map<String, Object> profileData = new HashMap<>();
        profileData.put("id", profile.getId());
        profileData.put("user_id", user.getId());
        profileData.put("name", user.getName());
        profileData.put("email", user.getEmail());
        profileData.put("photo_url", profile.getPhotoUrl());
        profileData.put("tournaments_played", profile.getTournamentsPlayed());
        profileData.put("total_points", profile.getTotalPoints());
        profileData.put("rating", profile.getRating());
        
        return ResponseEntity.ok(profileData);
    }

    @PutMapping("/profile")
    public ResponseEntity<?> updateProfile(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestBody Map<String, Object> updateData) {
        
        User user = userService.getUserByEmail(userDetails.getUsername());
        Profile currentProfile = profileService.getProfileByUserId(user.getId());
        
        // Обновляем поля профиля если они есть в запросе
        if (updateData.containsKey("photo_url")) {
            currentProfile.setPhotoUrl((String) updateData.get("photo_url"));
        }
        if (updateData.containsKey("tournaments_played")) {
            currentProfile.setTournamentsPlayed((Integer) updateData.get("tournaments_played"));
        }
        if (updateData.containsKey("total_points")) {
            currentProfile.setTotalPoints((Integer) updateData.get("total_points"));
        }
        if (updateData.containsKey("rating")) {
            currentProfile.setRating((Integer) updateData.get("rating"));
        }
        
        // Сохранение обновленного профиля
        Profile updatedProfile = profileService.saveProfile(currentProfile);
        
        // Подготовка данных обновленного профиля в формате JSON
        Map<String, Object> profileData = new HashMap<>();
        profileData.put("id", updatedProfile.getId());
        profileData.put("user_id", user.getId());
        profileData.put("name", user.getName());
        profileData.put("email", user.getEmail());
        profileData.put("photo_url", updatedProfile.getPhotoUrl());
        profileData.put("tournaments_played", updatedProfile.getTournamentsPlayed());
        profileData.put("total_points", updatedProfile.getTotalPoints());
        profileData.put("rating", updatedProfile.getRating());
        
        return ResponseEntity.ok(profileData);
    }

    @PostMapping("/profile/photo")
    public ResponseEntity<?> uploadProfilePhoto(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestParam("photo") MultipartFile photo,
            @RequestParam(value = "tournaments_played", required = false) Integer tournamentsPlayed,
            @RequestParam(value = "total_points", required = false) Integer totalPoints,
            @RequestParam(value = "rating", required = false) Integer rating) {
        
        User user = userService.getUserByEmail(userDetails.getUsername());
        Profile currentProfile = profileService.getProfileByUserId(user.getId());
        
        // Сохраняем фото и получаем URL
        String photoUrl;
        try {
            photoUrl = fileStorageService.storeFile(photo);
        } catch (IOException e) {
            return ResponseEntity.status(500).body(Map.of("error", "Ошибка при сохранении фотографии: " + e.getMessage()));
        }
        currentProfile.setPhotoUrl(photoUrl);
        
        // Обновляем другие поля профиля если они переданы
        if (tournamentsPlayed != null) {
            currentProfile.setTournamentsPlayed(tournamentsPlayed);
        }
        if (totalPoints != null) {
            currentProfile.setTotalPoints(totalPoints);
        }
        if (rating != null) {
            currentProfile.setRating(rating);
        }
        
        // Сохранение обновленного профиля
        Profile updatedProfile = profileService.saveProfile(currentProfile);
        
        // Подготовка данных обновленного профиля в формате JSON
        Map<String, Object> profileData = new HashMap<>();
        profileData.put("id", updatedProfile.getId());
        profileData.put("user_id", user.getId());
        profileData.put("name", user.getName());
        profileData.put("email", user.getEmail());
        profileData.put("photo_url", updatedProfile.getPhotoUrl());
        profileData.put("tournaments_played", updatedProfile.getTournamentsPlayed());
        profileData.put("total_points", updatedProfile.getTotalPoints());
        profileData.put("rating", updatedProfile.getRating());
        
        return ResponseEntity.ok(profileData);
    }

    @GetMapping("/current")
    public ResponseEntity<?> getCurrentUserProfile(Authentication authentication) {
        UserDetails userDetails = (UserDetails) authentication.getPrincipal();
        User user = userService.findByEmail(userDetails.getUsername());
        
        // Используем правильный метод
        Profile profile = profileService.getProfileByUserId(user.getId());
        
        return ResponseEntity.ok(profile);
    }
} 