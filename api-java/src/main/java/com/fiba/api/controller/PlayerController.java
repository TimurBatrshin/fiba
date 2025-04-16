package com.fiba.api.controller;

import com.fiba.api.model.Profile;
import com.fiba.api.model.User;
import com.fiba.api.service.ProfileService;
import com.fiba.api.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/players")
@RequiredArgsConstructor
public class PlayerController {

    private final ProfileService profileService;
    private final UserService userService;

    /**
     * Получение данных игрока по ID
     */
    @GetMapping("/{id}")
    public ResponseEntity<?> getPlayerById(@PathVariable Long id) {
        try {
            User user = userService.getUserById(id);
            Profile profile = profileService.getProfileByUserId(id);
            
            Map<String, Object> playerData = new HashMap<>();
            playerData.put("id", user.getId());
            playerData.put("name", user.getName());
            playerData.put("email", user.getEmail());
            playerData.put("points", profile.getTotalPoints());
            playerData.put("rating", profile.getRating());
            playerData.put("tournaments_played", profile.getTournamentsPlayed());
            playerData.put("photo_url", profile.getPhotoUrl());
            
            return ResponseEntity.ok(playerData);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", "Игрок не найден"));
        }
    }
    
    /**
     * Получение базовой статистики игрока
     */
    @GetMapping("/{id}/stats/basic")
    public ResponseEntity<?> getPlayerBasicStats(@PathVariable Long id) {
        try {
            Profile profile = profileService.getProfileByUserId(id);
            User user = userService.getUserById(id);
            
            Map<String, Object> stats = new HashMap<>();
            stats.put("id", user.getId());
            stats.put("name", user.getName());
            stats.put("points", profile.getTotalPoints());
            stats.put("rating", profile.getRating());
            stats.put("tournaments_played", profile.getTournamentsPlayed());
            
            return ResponseEntity.ok(stats);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", "Статистика игрока не найдена"));
        }
    }
    
    /**
     * Получение детальной статистики игрока
     */
    @GetMapping("/{id}/stats/detailed")
    public ResponseEntity<?> getPlayerDetailedStats(@PathVariable Long id) {
        try {
            Profile profile = profileService.getProfileByUserId(id);
            User user = userService.getUserById(id);
            
            // В реальном приложении здесь была бы более детальная статистика из БД
            Map<String, Object> stats = new HashMap<>();
            stats.put("id", user.getId());
            stats.put("name", user.getName());
            stats.put("points", profile.getTotalPoints());
            stats.put("rating", profile.getRating());
            stats.put("tournaments_played", profile.getTournamentsPlayed());
            stats.put("wins", 0); // Заглушки для демонстрации
            stats.put("losses", 0);
            stats.put("games_played", 0);
            stats.put("average_points", 0.0);
            
            return ResponseEntity.ok(stats);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", "Детальная статистика игрока не найдена"));
        }
    }

    /**
     * Получение рейтинга игроков по определенной категории
     * @param category категория рейтинга (points, rating, tournaments_played)
     * @param limit максимальное количество записей в результате
     * @return список игроков с их статистикой
     */
    @GetMapping("/rankings")
    public ResponseEntity<?> getPlayerRankings(
            @RequestParam String category,
            @RequestParam(defaultValue = "10") int limit) {
        
        List<Profile> profiles;
        
        // Фильтруем профили, чтобы исключить null значения
        List<Profile> validProfiles = profileService.getAllProfiles()
            .stream()
            .filter(profile -> profile.getTotalPoints() != null && profile.getRating() != null && profile.getTournamentsPlayed() != null)
            .collect(Collectors.toList());
        
        // Получаем список профилей и сортируем в зависимости от категории
        switch (category) {
            case "points":
                profiles = validProfiles.stream()
                    .sorted(Comparator.comparing(Profile::getTotalPoints, Comparator.nullsLast(Comparator.naturalOrder())).reversed())
                    .limit(limit)
                    .collect(Collectors.toList());
                break;
            case "rating":
                profiles = validProfiles.stream()
                    .sorted(Comparator.comparing(Profile::getRating, Comparator.nullsLast(Comparator.naturalOrder())).reversed())
                    .limit(limit)
                    .collect(Collectors.toList());
                break;
            case "tournaments":
                profiles = validProfiles.stream()
                    .sorted(Comparator.comparing(Profile::getTournamentsPlayed, Comparator.nullsLast(Comparator.naturalOrder())).reversed())
                    .limit(limit)
                    .collect(Collectors.toList());
                break;
            default:
                return ResponseEntity.badRequest().body(Map.of("error", "Неизвестная категория рейтинга"));
        }
        
        // Преобразуем в формат данных для клиента
        List<Map<String, Object>> result = new ArrayList<>();
        for (Profile profile : profiles) {
            User user = userService.getUserById(profile.getUser().getId());
            
            Map<String, Object> playerData = new HashMap<>();
            playerData.put("id", user.getId());
            playerData.put("name", user.getName());
            playerData.put("points", profile.getTotalPoints() != null ? profile.getTotalPoints() : 0);
            playerData.put("rating", profile.getRating() != null ? profile.getRating() : 0);
            playerData.put("tournaments_played", profile.getTournamentsPlayed() != null ? profile.getTournamentsPlayed() : 0);
            playerData.put("photo_url", profile.getPhotoUrl());
            
            result.add(playerData);
        }
        
        return ResponseEntity.ok(result);
    }
} 