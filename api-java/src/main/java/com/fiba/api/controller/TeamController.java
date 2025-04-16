package com.fiba.api.controller;

import com.fiba.api.model.Registration;
import com.fiba.api.model.User;
import com.fiba.api.service.RegistrationService;
import com.fiba.api.service.UserService;
import com.fiba.api.security.UserSecurity;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/teams")
public class TeamController {

    @Autowired
    private RegistrationService registrationService;
    
    @Autowired
    private UserService userService;
    
    @Autowired
    private UserSecurity userSecurity;

    /**
     * Получить данные о команде по ID регистрации
     * @param registrationId ID регистрации команды
     * @return данные о команде включая игроков
     */
    @GetMapping("/{registrationId}")
    public ResponseEntity<?> getTeamDetails(@PathVariable Long registrationId) {
        // Проверяем права доступа - капитан или администратор
        if (!userSecurity.isTeamCaptainOrAdmin(registrationId)) {
            return ResponseEntity.status(403).body(Map.of("error", "У вас нет прав для просмотра этой команды"));
        }
        
        Registration registration = registrationService.getRegistrationWithPlayersById(registrationId);
        return ResponseEntity.ok(convertToMap(registration));
    }
    
    /**
     * Преобразует объект регистрации в Map для ответа API
     */
    private Map<String, Object> convertToMap(Registration registration) {
        Map<String, Object> result = new HashMap<>();
        result.put("id", registration.getId());
        result.put("teamName", registration.getTeamName());
        result.put("status", registration.getStatus());
        
        // Информация о турнире
        Map<String, Object> tournament = new HashMap<>();
        tournament.put("id", registration.getTournament().getId());
        tournament.put("name", registration.getTournament().getTitle());
        result.put("tournament", tournament);
        
        // Информация о капитане
        User captain = registration.getCaptain();
        Map<String, Object> captainMap = new HashMap<>();
        captainMap.put("id", captain.getId());
        captainMap.put("name", captain.getName());
        captainMap.put("email", captain.getEmail());
        result.put("captain", captainMap);
        
        // Информация об игроках
        List<Map<String, Object>> players = registration.getPlayers().stream()
                .map(player -> {
                    Map<String, Object> playerMap = new HashMap<>();
                    playerMap.put("id", player.getId());
                    playerMap.put("name", player.getName());
                    playerMap.put("email", player.getEmail());
                    return playerMap;
                })
                .collect(Collectors.toList());
        result.put("players", players);
        
        return result;
    }
} 