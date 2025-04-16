package com.fiba.api.controller;

import com.fiba.api.model.Registration;
import com.fiba.api.model.Tournament;
import com.fiba.api.model.User;
import com.fiba.api.service.RegistrationService;
import com.fiba.api.service.TournamentService;
import com.fiba.api.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/registrations")
@RequiredArgsConstructor
public class RegistrationController {

    private final RegistrationService registrationService;
    private final TournamentService tournamentService;
    private final UserService userService;

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> getAllRegistrations() {
        List<Registration> registrations = registrationService.getAllRegistrations();
        List<Map<String, Object>> registrationData = registrations.stream()
                .map(this::convertToMap)
                .collect(Collectors.toList());
        
        return ResponseEntity.ok(registrationData);
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getRegistrationById(@PathVariable Long id) {
        Registration registration = registrationService.getRegistrationById(id);
        return ResponseEntity.ok(convertToMap(registration));
    }

    @GetMapping("/tournament/{tournamentId}")
    public ResponseEntity<?> getRegistrationsByTournament(@PathVariable Long tournamentId) {
        List<Registration> registrations = registrationService.getRegistrationsByTournament(tournamentId);
        List<Map<String, Object>> registrationData = registrations.stream()
                .map(this::convertToMap)
                .collect(Collectors.toList());
        
        return ResponseEntity.ok(registrationData);
    }

    @GetMapping("/captain")
    public ResponseEntity<?> getRegistrationsByCaptain(@AuthenticationPrincipal UserDetails userDetails) {
        User user = userService.getUserByEmail(userDetails.getUsername());
        List<Registration> registrations = registrationService.getRegistrationsByCaptain(user.getId());
        List<Map<String, Object>> registrationData = registrations.stream()
                .map(this::convertToMap)
                .collect(Collectors.toList());
        
        return ResponseEntity.ok(registrationData);
    }

    @GetMapping("/player")
    public ResponseEntity<?> getTeamsByPlayer(@AuthenticationPrincipal UserDetails userDetails) {
        User user = userService.getUserByEmail(userDetails.getUsername());
        List<Registration> registrations = registrationService.getTeamsByPlayer(user.getId());
        List<Map<String, Object>> registrationData = registrations.stream()
                .map(this::convertToMap)
                .collect(Collectors.toList());
        
        return ResponseEntity.ok(registrationData);
    }

    @GetMapping("/tournament/{tournamentId}/status/{status}")
    public ResponseEntity<?> getRegistrationsByTournamentAndStatus(
            @PathVariable Long tournamentId,
            @PathVariable String status) {
        List<Registration> registrations = registrationService.getRegistrationsByTournamentAndStatus(tournamentId, status);
        List<Map<String, Object>> registrationData = registrations.stream()
                .map(this::convertToMap)
                .collect(Collectors.toList());
        
        return ResponseEntity.ok(registrationData);
    }

    @PostMapping
    public ResponseEntity<?> createRegistration(
            @RequestBody Map<String, Object> registrationData,
            @AuthenticationPrincipal UserDetails userDetails) {
        // Получаем текущего пользователя как капитана
        User captain = userService.getUserByEmail(userDetails.getUsername());
        
        // Получаем турнир
        Long tournamentId = Long.valueOf(registrationData.get("tournament_id").toString());
        Tournament tournament = tournamentService.getTournamentById(tournamentId);
        
        // Подготавливаем объект игроков команды (начально только капитан)
        List<User> players = new ArrayList<>();
        players.add(captain);
        
        // Создаем объект регистрации
        Registration registration = Registration.builder()
                .teamName((String) registrationData.get("team_name"))
                .tournament(tournament)
                .captain(captain)
                .status("pending")
                .players(players)
                .build();
        
        Registration createdRegistration = registrationService.createRegistration(registration);
        return ResponseEntity.ok(convertToMap(createdRegistration));
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateRegistration(
            @PathVariable Long id,
            @RequestBody Map<String, Object> registrationData,
            @AuthenticationPrincipal UserDetails userDetails) {
        // Проверяем, что пользователь является капитаном команды
        User user = userService.getUserByEmail(userDetails.getUsername());
        Registration existingRegistration = registrationService.getRegistrationById(id);
        
        // Только капитан команды или администратор может редактировать регистрацию
        if (!existingRegistration.getCaptain().getId().equals(user.getId()) && !"admin".equals(user.getRole())) {
            return ResponseEntity.status(403).body(Map.of("error", "Только капитан команды или администратор может редактировать регистрацию"));
        }
        
        if (registrationData.containsKey("team_name")) {
            existingRegistration.setTeamName((String) registrationData.get("team_name"));
        }
        
        Registration updatedRegistration = registrationService.updateRegistration(existingRegistration);
        return ResponseEntity.ok(convertToMap(updatedRegistration));
    }

    @PutMapping("/{id}/status")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> updateRegistrationStatus(
            @PathVariable Long id,
            @RequestBody Map<String, String> statusData) {
        
        String status = statusData.get("status");
        if (status == null || !Arrays.asList("pending", "approved", "rejected").contains(status)) {
            return ResponseEntity.badRequest().body(Map.of("error", "Недопустимый статус"));
        }
        
        Registration updatedRegistration = registrationService.updateRegistrationStatus(id, status);
        return ResponseEntity.ok(convertToMap(updatedRegistration));
    }

    @PostMapping("/{id}/players")
    public ResponseEntity<?> addPlayerToTeam(
            @PathVariable Long id,
            @RequestBody Map<String, Object> playerData,
            @AuthenticationPrincipal UserDetails userDetails) {
        
        // Только капитан команды может добавлять игроков
        User user = userService.getUserByEmail(userDetails.getUsername());
        Registration registration = registrationService.getRegistrationById(id);
        
        if (!registration.getCaptain().getId().equals(user.getId())) {
            return ResponseEntity.status(403).body(Map.of("error", "Только капитан команды может добавлять игроков"));
        }
        
        Long playerId = Long.valueOf(playerData.get("player_id").toString());
        Registration updatedRegistration = registrationService.addPlayerToTeam(id, playerId);
        
        return ResponseEntity.ok(convertToMap(updatedRegistration));
    }

    @DeleteMapping("/{id}/players/{playerId}")
    public ResponseEntity<?> removePlayerFromTeam(
            @PathVariable Long id,
            @PathVariable Long playerId,
            @AuthenticationPrincipal UserDetails userDetails) {
        
        // Только капитан команды может удалять игроков
        User user = userService.getUserByEmail(userDetails.getUsername());
        Registration registration = registrationService.getRegistrationById(id);
        
        if (!registration.getCaptain().getId().equals(user.getId())) {
            return ResponseEntity.status(403).body(Map.of("error", "Только капитан команды может удалять игроков"));
        }
        
        Registration updatedRegistration = registrationService.removePlayerFromTeam(id, playerId);
        
        return ResponseEntity.ok(convertToMap(updatedRegistration));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteRegistration(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails userDetails) {
        
        // Проверяем, что пользователь является капитаном команды или администратором
        User user = userService.getUserByEmail(userDetails.getUsername());
        Registration registration = registrationService.getRegistrationById(id);
        
        if (!registration.getCaptain().getId().equals(user.getId()) && !"admin".equals(user.getRole())) {
            return ResponseEntity.status(403).body(Map.of("error", "Только капитан команды или администратор может удалить регистрацию"));
        }
        
        registrationService.deleteRegistration(id);
        
        return ResponseEntity.ok().body(Map.of("message", "Регистрация успешно удалена"));
    }

    private Map<String, Object> convertToMap(Registration registration) {
        Map<String, Object> registrationMap = new HashMap<>();
        registrationMap.put("id", registration.getId());
        registrationMap.put("team_name", registration.getTeamName());
        registrationMap.put("tournament_id", registration.getTournament().getId());
        registrationMap.put("tournament_title", registration.getTournament().getTitle());
        registrationMap.put("captain_id", registration.getCaptain().getId());
        registrationMap.put("captain_name", registration.getCaptain().getName());
        registrationMap.put("status", registration.getStatus());
        
        // Преобразуем список игроков
        List<Map<String, Object>> playersList = registration.getPlayers().stream()
                .map(player -> {
                    Map<String, Object> playerMap = new HashMap<>();
                    playerMap.put("id", player.getId());
                    playerMap.put("name", player.getName());
                    playerMap.put("is_captain", player.getId().equals(registration.getCaptain().getId()));
                    return playerMap;
                })
                .collect(Collectors.toList());
        
        registrationMap.put("players", playersList);
        
        return registrationMap;
    }
} 