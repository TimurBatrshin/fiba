package com.fiba.api.controller;

import com.fiba.api.model.Ad;
import com.fiba.api.model.AdResults;
import com.fiba.api.model.Tournament;
import com.fiba.api.model.User;
import com.fiba.api.service.AdService;
import com.fiba.api.service.FileStorageService;
import com.fiba.api.service.TournamentService;
import com.fiba.api.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/ads")
@RequiredArgsConstructor
public class AdController {

    private final AdService adService;
    private final TournamentService tournamentService;
    private final UserService userService;
    private final FileStorageService fileStorageService;

    @GetMapping
    public ResponseEntity<?> getAllAds() {
        List<Ad> ads = adService.getAllAds();
        List<Map<String, Object>> adData = ads.stream()
                .map(this::convertToMap)
                .collect(Collectors.toList());
        
        return ResponseEntity.ok(adData);
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getAdById(@PathVariable Long id) {
        Ad ad = adService.getAdById(id);
        return ResponseEntity.ok(convertToMap(ad));
    }

    @GetMapping("/tournament/{tournamentId}")
    public ResponseEntity<?> getAdsByTournament(@PathVariable Long tournamentId) {
        List<Ad> ads = adService.getAdsByTournament(tournamentId);
        List<Map<String, Object>> adData = ads.stream()
                .map(this::convertToMap)
                .collect(Collectors.toList());
        
        return ResponseEntity.ok(adData);
    }

    @GetMapping("/advertiser")
    public ResponseEntity<?> getAdsByAdvertiser(@AuthenticationPrincipal UserDetails userDetails) {
        User user = userService.getUserByEmail(userDetails.getUsername());
        List<Ad> ads = adService.getAdsByAdvertiser(user.getId());
        List<Map<String, Object>> adData = ads.stream()
                .map(this::convertToMap)
                .collect(Collectors.toList());
        
        return ResponseEntity.ok(adData);
    }

    @GetMapping("/business")
    public ResponseEntity<?> getAdsByBusiness(@AuthenticationPrincipal UserDetails userDetails) {
        User user = userService.getUserByEmail(userDetails.getUsername());
        List<Ad> ads = adService.getAdsByBusiness(user.getId());
        List<Map<String, Object>> adData = ads.stream()
                .map(this::convertToMap)
                .collect(Collectors.toList());
        
        return ResponseEntity.ok(adData);
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'ADVERTISER')")
    public ResponseEntity<?> createAd(
            @RequestParam("title") String title,
            @RequestParam("tournament_id") Long tournamentId,
            @RequestParam("image") MultipartFile image,
            @AuthenticationPrincipal UserDetails userDetails) {
        
        User advertiser = userService.getUserByEmail(userDetails.getUsername());
        Tournament tournament = tournamentService.getTournamentById(tournamentId);
        
        // Сохраняем изображение
        String imageUrl;
        try {
            imageUrl = fileStorageService.storeFile(image);
        } catch (IOException e) {
            return ResponseEntity.status(500).body(Map.of("error", "Ошибка при сохранении изображения: " + e.getMessage()));
        }
        
        // Создаем рекламу
        Ad ad = Ad.builder()
                .title(title)
                .imageUrl(imageUrl)
                .tournament(tournament)
                .advertiser(advertiser)
                .build();
        
        Ad createdAd = adService.createAd(ad);
        return ResponseEntity.ok(convertToMap(createdAd));
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateAd(
            @PathVariable Long id,
            @RequestBody Map<String, Object> adData,
            @AuthenticationPrincipal UserDetails userDetails) {
        
        Ad existingAd = adService.getAdById(id);
        User user = userService.getUserByEmail(userDetails.getUsername());
        
        // Проверяем, что пользователь является владельцем рекламы или администратором
        if (!existingAd.getAdvertiser().getId().equals(user.getId()) && !"admin".equals(user.getRole())) {
            return ResponseEntity.status(403).body(Map.of("error", "У вас нет прав на редактирование этой рекламы"));
        }
        
        if (adData.containsKey("title")) {
            existingAd.setTitle((String) adData.get("title"));
        }
        
        if (adData.containsKey("tournament_id")) {
            Long tournamentId = Long.valueOf(adData.get("tournament_id").toString());
            Tournament tournament = tournamentService.getTournamentById(tournamentId);
            existingAd.setTournament(tournament);
        }
        
        Ad updatedAd = adService.updateAd(existingAd);
        return ResponseEntity.ok(convertToMap(updatedAd));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteAd(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails userDetails) {
        
        Ad ad = adService.getAdById(id);
        User user = userService.getUserByEmail(userDetails.getUsername());
        
        // Проверяем, что пользователь является владельцем рекламы или администратором
        if (!ad.getAdvertiser().getId().equals(user.getId()) && !"admin".equals(user.getRole())) {
            return ResponseEntity.status(403).body(Map.of("error", "У вас нет прав на удаление этой рекламы"));
        }
        
        adService.deleteAd(id);
        return ResponseEntity.ok().body(Map.of("message", "Реклама успешно удалена"));
    }

    @PostMapping("/{id}/results")
    public ResponseEntity<?> updateAdResults(
            @PathVariable Long id,
            @RequestBody Map<String, Integer> resultsData) {
        
        Integer clicks = resultsData.get("clicks");
        Integer views = resultsData.get("views");
        
        AdResults adResults = adService.updateAdResults(id, clicks, views);
        
        Map<String, Object> resultsMap = new HashMap<>();
        resultsMap.put("ad_id", adResults.getAd().getId());
        resultsMap.put("clicks", adResults.getClicks());
        resultsMap.put("views", adResults.getViews());
        
        return ResponseEntity.ok(resultsMap);
    }

    @GetMapping("/{id}/results")
    public ResponseEntity<?> getAdResults(@PathVariable Long id) {
        AdResults adResults = adService.getAdResults(id);
        
        Map<String, Object> resultsMap = new HashMap<>();
        resultsMap.put("ad_id", adResults.getAd().getId());
        resultsMap.put("clicks", adResults.getClicks());
        resultsMap.put("views", adResults.getViews());
        
        return ResponseEntity.ok(resultsMap);
    }

    @GetMapping(value = "/public/advertisement", produces = "application/json")
    public ResponseEntity<?> getRandomActiveAd() {
        // Получаем случайную активную рекламу
        Ad randomAd = adService.getRandomActiveAd();
        
        if (randomAd == null) {
            return ResponseEntity.noContent().build();
        }
        
        // Увеличиваем счетчик просмотров
        adService.incrementViewCount(randomAd.getId());
        
        return ResponseEntity.ok(convertToMap(randomAd));
    }

    private Map<String, Object> convertToMap(Ad ad) {
        Map<String, Object> adMap = new HashMap<>();
        adMap.put("id", ad.getId());
        adMap.put("title", ad.getTitle());
        adMap.put("image_url", ad.getImageUrl());
        adMap.put("tournament_id", ad.getTournament() != null ? ad.getTournament().getId() : null);
        adMap.put("tournament_title", ad.getTournament() != null ? ad.getTournament().getTitle() : null);
        adMap.put("advertiser_id", ad.getAdvertiser() != null ? ad.getAdvertiser().getId() : null);
        adMap.put("advertiser_name", ad.getAdvertiser() != null ? ad.getAdvertiser().getName() : null);
        adMap.put("business_id", ad.getBusiness() != null ? ad.getBusiness().getId() : null);
        adMap.put("business_name", ad.getBusiness() != null ? ad.getBusiness().getName() : null);
        
        // Добавляем информацию о результатах рекламы, если она доступна
        if (ad.getAdResults() != null) {
            adMap.put("clicks", ad.getAdResults().getClicks());
            adMap.put("views", ad.getAdResults().getViews());
        }
        
        return adMap;
    }
} 