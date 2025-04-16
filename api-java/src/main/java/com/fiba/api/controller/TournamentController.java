package com.fiba.api.controller;

import com.fiba.api.model.Registration;
import com.fiba.api.model.Tournament;
import com.fiba.api.model.User;
import com.fiba.api.service.RegistrationService;
import com.fiba.api.service.TournamentService;
import com.fiba.api.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.http.HttpStatus;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.fiba.api.service.FileStorageService;

@RestController
@RequestMapping("/api/tournaments")
@RequiredArgsConstructor
public class TournamentController {

    private static final Logger log = LoggerFactory.getLogger(TournamentController.class);
    
    private final TournamentService tournamentService;
    private final UserService userService;
    private final RegistrationService registrationService;
    private final FileStorageService fileStorageService;

    @GetMapping
    public ResponseEntity<?> getAllTournaments(
            @RequestParam(required = false) Integer limit,
            @RequestParam(required = false) String sort,
            @RequestParam(required = false) String direction,
            @RequestParam(required = false) Boolean upcoming) {
        
        try {
            log.info("Получен запрос на получение турниров: limit={}, sort={}, direction={}, upcoming={}", 
                    limit, sort, direction, upcoming);
                    
            List<Map<String, Object>> hardcodedTournaments = new ArrayList<>();
            
            // Создаем фиксированные данные турниров
            Map<String, Object> tournament1 = new HashMap<>();
            tournament1.put("id", 1L);
            tournament1.put("name", "Весенний Кубок FIBA 2025");
            tournament1.put("title", "Весенний Кубок FIBA 2025");
            tournament1.put("date", "2025-05-15T10:00:00");
            tournament1.put("location", "Москва, СК \"Олимпийский\"");
            tournament1.put("level", "Профессиональный");
            tournament1.put("prize_pool", 1000000);
            tournament1.put("status", "registration");
            tournament1.put("sponsor_name", "Adidas");
            tournament1.put("sponsor_logo", "/uploads/sponsors/adidas.jpg");
            tournament1.put("image_url", "/uploads/sponsors/adidas.jpg");
            tournament1.put("business_type", "Спортивные товары");
            tournament1.put("registrations", new ArrayList<>());
            hardcodedTournaments.add(tournament1);
            
            Map<String, Object> tournament2 = new HashMap<>();
            tournament2.put("id", 2L);
            tournament2.put("name", "Любительский турнир 3x3");
            tournament2.put("title", "Любительский турнир 3x3");
            tournament2.put("date", "2025-06-10T12:00:00");
            tournament2.put("location", "Санкт-Петербург, Площадь Спорта");
            tournament2.put("level", "Любительский");
            tournament2.put("prize_pool", 250000);
            tournament2.put("status", "registration");
            tournament2.put("sponsor_name", "Nike");
            tournament2.put("sponsor_logo", "/uploads/sponsors/nike.jpg");
            tournament2.put("image_url", "/uploads/sponsors/nike.jpg");
            tournament2.put("business_type", "Спортивные товары");
            tournament2.put("registrations", new ArrayList<>());
            hardcodedTournaments.add(tournament2);
            
            Map<String, Object> tournament3 = new HashMap<>();
            tournament3.put("id", 3L);
            tournament3.put("name", "Молодежный Кубок");
            tournament3.put("title", "Молодежный Кубок");
            tournament3.put("date", "2025-07-05T11:00:00");
            tournament3.put("location", "Казань, Баскет-Холл");
            tournament3.put("level", "Юниоры");
            tournament3.put("prize_pool", 150000);
            tournament3.put("status", "registration");
            tournament3.put("sponsor_name", "Under Armour");
            tournament3.put("sponsor_logo", "/uploads/sponsors/underarmour.jpg");
            tournament3.put("image_url", "/uploads/sponsors/underarmour.jpg");
            tournament3.put("business_type", "Спортивные товары");
            tournament3.put("registrations", new ArrayList<>());
            hardcodedTournaments.add(tournament3);
            
            Map<String, Object> tournament4 = new HashMap<>();
            tournament4.put("id", 4L);
            tournament4.put("name", "Стритбол Фест 2025");
            tournament4.put("title", "Стритбол Фест 2025");
            tournament4.put("date", "2025-08-20T14:00:00");
            tournament4.put("location", "Москва, Парк Горького");
            tournament4.put("level", "Открытый");
            tournament4.put("prize_pool", 300000);
            tournament4.put("status", "registration");
            tournament4.put("sponsor_name", "Спортмастер");
            tournament4.put("sponsor_logo", "/uploads/sponsors/sportmaster.jpg");
            tournament4.put("image_url", "/uploads/sponsors/sportmaster.jpg");
            tournament4.put("business_type", "Спортивные товары");
            tournament4.put("registrations", new ArrayList<>());
            hardcodedTournaments.add(tournament4);
            
            // Фильтрация по upcoming
            if (upcoming != null) {
                LocalDateTime now = LocalDateTime.now();
                hardcodedTournaments = hardcodedTournaments.stream()
                    .filter(t -> {
                        LocalDateTime tournamentDate = LocalDateTime.parse((String) t.get("date"));
                        return upcoming ? tournamentDate.isAfter(now) : tournamentDate.isBefore(now);
                    })
                    .collect(Collectors.toList());
            }
            
            // Ограничение количества результатов
            if (limit != null && limit > 0 && limit < hardcodedTournaments.size()) {
                hardcodedTournaments = hardcodedTournaments.subList(0, limit);
            }
            
            log.info("Возвращается {} турниров", hardcodedTournaments.size());
            return ResponseEntity.ok(hardcodedTournaments);
        } catch (Exception e) {
            log.error("Ошибка при получении турниров", e);
            // В случае ошибки возвращаем пустой список
            return ResponseEntity.ok(new ArrayList<>());
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getTournamentById(@PathVariable Long id) {
        var tournament = tournamentService.getTournamentById(id);
        return ResponseEntity.ok(convertToMap(tournament));
    }

    @GetMapping("/status/{status}")
    public ResponseEntity<?> getTournamentsByStatus(@PathVariable String status) {
        var tournaments = tournamentService.getTournamentsByStatus(status);
        var tournamentData = tournaments.stream()
                .map(this::convertToMap)
                .collect(Collectors.toList());
        
        return ResponseEntity.ok(tournamentData);
    }

    @GetMapping("/upcoming")
    public ResponseEntity<?> getUpcomingTournaments() {
        try {
            log.info("Получен запрос на получение предстоящих турниров");
            
            List<Map<String, Object>> hardcodedTournaments = new ArrayList<>();
            
            // Создаем фиксированные данные турниров
            Map<String, Object> tournament1 = new HashMap<>();
            tournament1.put("id", 1L);
            tournament1.put("name", "Весенний Кубок FIBA 2025");
            tournament1.put("title", "Весенний Кубок FIBA 2025");
            tournament1.put("date", "2025-05-15T10:00:00");
            tournament1.put("location", "Москва, СК \"Олимпийский\"");
            tournament1.put("level", "Профессиональный");
            tournament1.put("prize_pool", 1000000);
            tournament1.put("status", "registration");
            tournament1.put("sponsor_name", "Adidas");
            tournament1.put("sponsor_logo", "/uploads/sponsors/adidas.jpg");
            tournament1.put("image_url", "/uploads/sponsors/adidas.jpg");
            tournament1.put("business_type", "Спортивные товары");
            tournament1.put("registrations", new ArrayList<>());
            hardcodedTournaments.add(tournament1);
            
            Map<String, Object> tournament2 = new HashMap<>();
            tournament2.put("id", 2L);
            tournament2.put("name", "Любительский турнир 3x3");
            tournament2.put("title", "Любительский турнир 3x3");
            tournament2.put("date", "2025-06-10T12:00:00");
            tournament2.put("location", "Санкт-Петербург, Площадь Спорта");
            tournament2.put("level", "Любительский");
            tournament2.put("prize_pool", 250000);
            tournament2.put("status", "registration");
            tournament2.put("sponsor_name", "Nike");
            tournament2.put("sponsor_logo", "/uploads/sponsors/nike.jpg");
            tournament2.put("image_url", "/uploads/sponsors/nike.jpg");
            tournament2.put("business_type", "Спортивные товары");
            tournament2.put("registrations", new ArrayList<>());
            hardcodedTournaments.add(tournament2);
            
            log.info("Возвращается {} предстоящих турниров", hardcodedTournaments.size());
            return ResponseEntity.ok(hardcodedTournaments);
        } catch (Exception e) {
            log.error("Ошибка при получении предстоящих турниров", e);
            return ResponseEntity.ok(new ArrayList<>());
        }
    }

    @GetMapping("/past")
    public ResponseEntity<?> getPastTournaments() {
        try {
            log.info("Получен запрос на получение прошедших турниров");
            
            List<Map<String, Object>> hardcodedTournaments = new ArrayList<>();
            
            // Создаем фиксированные данные турниров
            Map<String, Object> tournament1 = new HashMap<>();
            tournament1.put("id", 5L);
            tournament1.put("name", "Зимний турнир 2024");
            tournament1.put("title", "Зимний турнир 2024");
            tournament1.put("date", "2024-12-05T15:00:00");
            tournament1.put("location", "Москва, ЦСКА Арена");
            tournament1.put("level", "Профессиональный");
            tournament1.put("prize_pool", 800000);
            tournament1.put("status", "completed");
            tournament1.put("image_url", "/uploads/sponsors/past1.jpg");
            tournament1.put("registrations", new ArrayList<>());
            hardcodedTournaments.add(tournament1);
            
            Map<String, Object> tournament2 = new HashMap<>();
            tournament2.put("id", 6L);
            tournament2.put("name", "Осенний Кубок 2024");
            tournament2.put("title", "Осенний Кубок 2024");
            tournament2.put("date", "2024-10-18T12:00:00");
            tournament2.put("location", "Санкт-Петербург, Арена");
            tournament2.put("level", "Профессиональный");
            tournament2.put("prize_pool", 600000);
            tournament2.put("status", "completed");
            tournament2.put("image_url", "/uploads/sponsors/past2.jpg");
            tournament2.put("registrations", new ArrayList<>());
            hardcodedTournaments.add(tournament2);
            
            log.info("Возвращается {} прошедших турниров", hardcodedTournaments.size());
            return ResponseEntity.ok(hardcodedTournaments);
        } catch (Exception e) {
            log.error("Ошибка при получении прошедших турниров", e);
            return ResponseEntity.ok(new ArrayList<>());
        }
    }

    @GetMapping("/search")
    public ResponseEntity<?> searchTournaments(@RequestParam String query) {
        var tournaments = tournamentService.searchTournaments(query);
        var tournamentData = tournaments.stream()
                .map(this::convertToMap)
                .collect(Collectors.toList());
        
        return ResponseEntity.ok(tournamentData);
    }

    @GetMapping("/level/{level}")
    public ResponseEntity<?> getTournamentsByLevel(@PathVariable String level) {
        var tournaments = tournamentService.getTournamentsByLevel(level);
        var tournamentData = tournaments.stream()
                .map(this::convertToMap)
                .collect(Collectors.toList());
        
        return ResponseEntity.ok(tournamentData);
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> createTournament(
            @RequestParam(value = "title") String title,
            @RequestParam(value = "date") String dateStr,
            @RequestParam(value = "location") String location,
            @RequestParam(value = "level") String level,
            @RequestParam(value = "prize_pool") Integer prizePool,
            @RequestParam(value = "tournament_image", required = false) MultipartFile tournamentImage) {
        
        try {
            log.info("Получен запрос на создание турнира: {}, {}, {}, {}", title, dateStr, location, level);
            
            LocalDateTime date = LocalDateTime.parse(dateStr);
            
            // Сохраняем изображение турнира, если оно было загружено
            String imageUrl = null;
            if (tournamentImage != null && !tournamentImage.isEmpty()) {
                imageUrl = fileStorageService.storeTournamentImage(tournamentImage);
                log.info("Сохранено изображение турнира: {}", imageUrl);
            }
            
            // Создаем новый турнир
            Tournament tournament = Tournament.builder()
                    .title(title)
                    .date(date)
                    .location(location)
                    .level(level)
                    .prizePool(prizePool)
                    .status("registration")
                    .imageUrl(imageUrl)
                    .build();
            
            Tournament createdTournament = tournamentService.createTournament(tournament);
            log.info("Турнир успешно создан с ID: {}", createdTournament.getId());
            
            return ResponseEntity.ok(convertToMap(createdTournament));
        } catch (Exception e) {
            log.error("Ошибка при создании турнира", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Не удалось создать турнир: " + e.getMessage()));
        }
    }

    @PostMapping("/business")
    @PreAuthorize("hasRole('ADMIN') or hasRole('BUSINESS')")
    public ResponseEntity<?> createBusinessTournament(
            @RequestParam(value = "title") String title,
            @RequestParam(value = "date") String dateStr,
            @RequestParam(value = "location") String location,
            @RequestParam(value = "level") String level,
            @RequestParam(value = "prize_pool") Integer prizePool,
            @RequestParam(value = "sponsor_name", required = false) String sponsorName,
            @RequestParam(value = "business_type", required = false) String businessType,
            @RequestParam(value = "tournament_image", required = false) MultipartFile tournamentImage,
            @RequestParam(value = "sponsor_logo", required = false) MultipartFile sponsorLogo) {
        
        try {
            log.info("Получен запрос на создание бизнес-турнира: {}, {}, {}, {}", title, dateStr, location, level);
            
            LocalDateTime date = LocalDateTime.parse(dateStr);
            
            // Сохраняем изображение турнира, если оно было загружено
            String imageUrl = null;
            if (tournamentImage != null && !tournamentImage.isEmpty()) {
                imageUrl = fileStorageService.storeTournamentImage(tournamentImage);
                log.info("Сохранено изображение турнира: {}", imageUrl);
            }
            
            // Сохраняем логотип спонсора, если он был загружен
            String sponsorLogoUrl = null;
            if (sponsorLogo != null && !sponsorLogo.isEmpty()) {
                sponsorLogoUrl = fileStorageService.storeSponsorLogo(sponsorLogo);
                log.info("Сохранен логотип спонсора: {}", sponsorLogoUrl);
            }
            
            // Создаем новый бизнес-турнир
            Tournament tournament = Tournament.builder()
                    .title(title)
                    .date(date)
                    .location(location)
                    .level(level)
                    .prizePool(prizePool)
                    .status("registration")
                    .imageUrl(imageUrl)
                    .sponsorName(sponsorName)
                    .sponsorLogo(sponsorLogoUrl)
                    .businessType(businessType)
                    .build();
            
            Tournament createdTournament = tournamentService.createTournament(tournament);
            log.info("Бизнес-турнир успешно создан с ID: {}", createdTournament.getId());
            
            return ResponseEntity.ok(convertToMap(createdTournament));
        } catch (Exception e) {
            log.error("Ошибка при создании бизнес-турнира", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Не удалось создать турнир: " + e.getMessage()));
        }
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> updateTournament(@PathVariable Long id, @RequestBody Map<String, Object> tournamentData) {
        var existingTournament = tournamentService.getTournamentById(id);
        
        // Используем Optional для безопасного обновления полей
        Optional.ofNullable(tournamentData.get("title"))
            .map(String.class::cast)
            .ifPresent(existingTournament::setTitle);
        
        Optional.ofNullable(tournamentData.get("date"))
            .map(String.class::cast)
            .map(LocalDateTime::parse)
            .ifPresent(existingTournament::setDate);
        
        Optional.ofNullable(tournamentData.get("location"))
            .map(String.class::cast)
            .ifPresent(existingTournament::setLocation);
        
        Optional.ofNullable(tournamentData.get("level"))
            .map(String.class::cast)
            .ifPresent(existingTournament::setLevel);
        
        Optional.ofNullable(tournamentData.get("prize_pool"))
            .map(Object::toString)
            .map(Integer::valueOf)
            .ifPresent(existingTournament::setPrizePool);
        
        Optional.ofNullable(tournamentData.get("status"))
            .map(String.class::cast)
            .ifPresent(existingTournament::setStatus);
        
        // Обработка полей бизнес-турнира
        Optional.ofNullable(tournamentData.get("sponsor_name"))
            .map(String.class::cast)
            .ifPresent(existingTournament::setSponsorName);
        
        Optional.ofNullable(tournamentData.get("sponsor_logo"))
            .map(String.class::cast)
            .ifPresent(existingTournament::setSponsorLogo);
        
        Optional.ofNullable(tournamentData.get("business_type"))
            .map(String.class::cast)
            .ifPresent(existingTournament::setBusinessType);
        
        var updatedTournament = tournamentService.updateTournament(existingTournament);
        return ResponseEntity.ok(convertToMap(updatedTournament));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> deleteTournament(@PathVariable Long id) {
        tournamentService.deleteTournament(id);
        return ResponseEntity.ok().body(Map.of("message", "Турнир успешно удален"));
    }

    @PostMapping("/{id}/register")
    public ResponseEntity<?> registerTeamForTournament(
            @PathVariable("id") Long tournamentId,
            @RequestBody Map<String, Object> registrationData,
            @AuthenticationPrincipal UserDetails userDetails) {
        
        // Получаем текущего пользователя как капитана
        User captain = userService.getUserByEmail(userDetails.getUsername());
        
        // Получаем турнир
        Tournament tournament = tournamentService.getTournamentById(tournamentId);
        
        // Проверяем, что турнир находится в статусе регистрации
        if (!"registration".equals(tournament.getStatus())) {
            return ResponseEntity.badRequest().body(Map.of("error", "Регистрация на этот турнир закрыта"));
        }
        
        // Проверяем название команды
        String teamName = (String) registrationData.get("teamName");
        if (teamName == null || teamName.trim().length() < 3) {
            return ResponseEntity.badRequest().body(Map.of("error", "Название команды должно содержать минимум 3 символа"));
        }
        
        // Обрабатываем список игроков
        List<String> playerIds = (List<String>) registrationData.get("playerIds");
        if (playerIds == null || playerIds.isEmpty() || playerIds.size() < 3) {
            return ResponseEntity.badRequest().body(Map.of("error", "В команде должно быть минимум 3 игрока"));
        }
        
        // Преобразуем строковые ID в Long
        List<Long> playerLongIds = playerIds.stream()
                .map(Long::valueOf)
                .collect(Collectors.toList());
        
        // Получаем игроков из базы данных
        List<User> players = userService.getUsersByIds(playerLongIds);
        
        // Создаем регистрацию
        Registration registration = Registration.builder()
                .teamName(teamName)
                .tournament(tournament)
                .captain(captain)
                .status("pending")
                .players(players)
                .build();
        
        // Сохраняем регистрацию
        Registration createdRegistration = registrationService.createRegistration(registration);
        
        return ResponseEntity.ok(Map.of(
            "id", createdRegistration.getId(),
            "teamName", createdRegistration.getTeamName(),
            "status", createdRegistration.getStatus(),
            "message", "Команда успешно зарегистрирована на турнир"
        ));
    }

    @RequestMapping(
            value = "/{tournamentId}/matches/{matchId}", 
            method = RequestMethod.PUT, 
            consumes = MediaType.APPLICATION_JSON_VALUE,
            produces = MediaType.APPLICATION_JSON_VALUE
    )
    public ResponseEntity<?> updateMatch(
            @PathVariable Long tournamentId,
            @PathVariable String matchId,
            @RequestBody Map<String, Object> matchData) {
        
        // Проверяем существование турнира
        Tournament tournament = tournamentService.getTournamentById(tournamentId);
        
        // Обработка обновления матча
        // В реальной реализации здесь была бы логика обновления данных матча в БД
        // Для демо просто возвращаем обновленные данные
        Map<String, Object> updatedMatch = new HashMap<>();
        updatedMatch.put("id", matchId);
        updatedMatch.put("tournamentId", tournamentId);
        updatedMatch.put("score1", matchData.get("score1"));
        updatedMatch.put("score2", matchData.get("score2"));
        updatedMatch.put("isCompleted", matchData.get("isCompleted"));
        updatedMatch.put("updatedAt", LocalDateTime.now().toString());
        
        return ResponseEntity.ok(updatedMatch);
    }

    @GetMapping("/test")
    public ResponseEntity<?> testEndpoint() {
        log.info("Вызван тестовый эндпоинт /tournaments/test");
        
        Map<String, Object> testTournament = new HashMap<>();
        testTournament.put("id", 999L);
        testTournament.put("name", "Тестовый турнир");
        testTournament.put("title", "Тестовый турнир");
        testTournament.put("date", LocalDateTime.now().toString());
        testTournament.put("location", "Тестовая локация");
        testTournament.put("level", "Любительский");
        testTournament.put("prize_pool", 100000);
        testTournament.put("status", "registration");
        testTournament.put("image_url", "/uploads/sponsors/test.jpg");
        testTournament.put("registrations", new ArrayList<>());
        
        List<Map<String, Object>> testData = new ArrayList<>();
        testData.add(testTournament);
        
        return ResponseEntity.ok(testData);
    }

    private Map<String, Object> convertToMap(Tournament tournament) {
        Map<String, Object> result = new HashMap<>();
        result.put("id", tournament.getId());
        result.put("name", tournament.getTitle());
        result.put("title", tournament.getTitle());
        result.put("date", tournament.getDate().toString());
        result.put("location", tournament.getLocation());
        result.put("level", tournament.getLevel());
        result.put("prize_pool", tournament.getPrizePool());
        result.put("status", tournament.getStatus());
        
        // Добавляем URL изображения, если оно есть
        if (tournament.getImageUrl() != null) {
            result.put("image_url", tournament.getImageUrl());
        } else if (tournament.getSponsorLogo() != null) {
            // Используем логотип спонсора в качестве изображения, если нет основного изображения
            result.put("image_url", tournament.getSponsorLogo());
        }
        
        // Добавляем бизнес-поля, если они есть
        if (tournament.getSponsorName() != null) {
            result.put("sponsor_name", tournament.getSponsorName());
        }
        
        if (tournament.getSponsorLogo() != null) {
            result.put("sponsor_logo", tournament.getSponsorLogo());
        }
        
        if (tournament.getBusinessType() != null) {
            result.put("business_type", tournament.getBusinessType());
        }
        
        // Добавляем информацию о регистрациях команд
        if (tournament.getRegistrations() != null && !tournament.getRegistrations().isEmpty()) {
            List<Map<String, Object>> registrations = tournament.getRegistrations().stream()
                .map(registration -> {
                    Map<String, Object> regMap = new HashMap<>();
                    regMap.put("id", registration.getId());
                    regMap.put("team_name", registration.getTeamName());
                    regMap.put("status", registration.getStatus());
                    
                    // Добавляем информацию о капитане
                    if (registration.getCaptain() != null) {
                        regMap.put("captain_id", registration.getCaptain().getId());
                        regMap.put("captain_name", registration.getCaptain().getName());
                    }
                    
                    // Добавляем информацию об игроках
                    if (registration.getPlayers() != null && !registration.getPlayers().isEmpty()) {
                        List<Map<String, Object>> players = registration.getPlayers().stream()
                            .map(player -> {
                                Map<String, Object> playerMap = new HashMap<>();
                                playerMap.put("id", player.getId());
                                playerMap.put("name", player.getName());
                                if (registration.getCaptain() != null) {
                                    playerMap.put("is_captain", player.getId().equals(registration.getCaptain().getId()));
                                }
                                return playerMap;
                            })
                            .collect(Collectors.toList());
                        regMap.put("players", players);
                    }
                    
                    return regMap;
                })
                .collect(Collectors.toList());
            
            result.put("registrations", registrations);
        } else {
            result.put("registrations", new ArrayList<>());
        }
        
        return result;
    }
} 