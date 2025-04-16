package com.fiba.api.service;

import com.fiba.api.exception.ResourceNotFoundException;
import com.fiba.api.model.Ad;
import com.fiba.api.model.AdResults;
import com.fiba.api.model.Tournament;
import com.fiba.api.model.User;
import com.fiba.api.repository.AdRepository;
import com.fiba.api.repository.AdResultsRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class AdService {

    private final AdRepository adRepository;
    private final AdResultsRepository adResultsRepository;
    private final TournamentService tournamentService;
    private final UserService userService;
    private final FileStorageService fileStorageService;

    /**
     * Получить все рекламные объявления
     */
    @Transactional(readOnly = true)
    public List<Ad> getAllAds() {
        return adRepository.findAll();
    }

    /**
     * Получить рекламное объявление по ID
     * @throws ResourceNotFoundException если объявление не найдено
     */
    @Transactional(readOnly = true)
    public Ad getAdById(Long id) {
        return adRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Реклама", "id", id));
    }

    /**
     * Получить рекламное объявление с результатами
     * @throws ResourceNotFoundException если объявление не найдено
     */
    @Transactional(readOnly = true)
    public Ad getAdWithResults(Long id) {
        Ad ad = adRepository.findWithResultsById(id);
        if (ad == null) {
            throw new ResourceNotFoundException("Реклама", "id", id);
        }
        return ad;
    }

    /**
     * Получить рекламные объявления для турнира
     */
    @Transactional(readOnly = true)
    public List<Ad> getAdsByTournament(Long tournamentId) {
        return adRepository.findByTournamentId(tournamentId);
    }

    /**
     * Получить рекламные объявления по рекламодателю
     */
    @Transactional(readOnly = true)
    public List<Ad> getAdsByAdvertiser(Long advertiserId) {
        User advertiser = userService.getUserById(advertiserId);
        return adRepository.findByAdvertiser(advertiser);
    }

    /**
     * Получить рекламные объявления по бизнесу
     */
    @Transactional(readOnly = true)
    public List<Ad> getAdsByBusiness(Long businessId) {
        User business = userService.getUserById(businessId);
        return adRepository.findByBusiness(business);
    }

    /**
     * Создать новое рекламное объявление с начальными результатами
     */
    @Transactional
    public Ad createAd(Ad ad) {
        // Сохраняем рекламу и создаем начальную статистику
        Ad savedAd = adRepository.save(ad);
        
        // Создаем начальные результаты для рекламы
        AdResults adResults = AdResults.builder()
                .ad(savedAd)
                .clicks(0)
                .views(0)
                .build();
        
        adResultsRepository.save(adResults);
        
        return savedAd;
    }

    /**
     * Обновить существующее рекламное объявление
     * @throws ResourceNotFoundException если объявление не найдено
     */
    @Transactional
    public Ad updateAd(Ad ad) {
        return adRepository.findById(ad.getId())
            .map(existingAd -> {
                // Обновляем заголовок
                Optional.ofNullable(ad.getTitle())
                    .ifPresent(existingAd::setTitle);
                
                // Обновляем URL изображения
                Optional.ofNullable(ad.getImageUrl())
                    .ifPresent(existingAd::setImageUrl);
                
                // Обновляем турнир
                Optional.ofNullable(ad.getTournament())
                    .map(tournament -> tournamentService.getTournamentById(tournament.getId()))
                    .ifPresent(existingAd::setTournament);
                
                return adRepository.save(existingAd);
            })
            .orElseThrow(() -> new ResourceNotFoundException("Реклама", "id", ad.getId()));
    }

    /**
     * Удалить рекламное объявление
     * @throws ResourceNotFoundException если объявление не найдено
     */
    @Transactional
    public void deleteAd(Long id) {
        adRepository.findById(id)
            .ifPresentOrElse(
                adRepository::delete,
                () -> { throw new ResourceNotFoundException("Реклама", "id", id); }
            );
    }

    /**
     * Обновить результаты рекламы (клики и просмотры)
     * @throws ResourceNotFoundException если объявление не найдено
     */
    @Transactional
    public AdResults updateAdResults(Long adId, Integer clicks, Integer views) {
        // Находим рекламу
        Ad ad = adRepository.findById(adId)
            .orElseThrow(() -> new ResourceNotFoundException("Реклама", "id", adId));
        
        // Получаем или создаем результаты
        AdResults adResults = adResultsRepository.findByAd(ad)
            .orElseGet(() -> AdResults.builder()
                .ad(ad)
                .clicks(0)
                .views(0)
                .build());
        
        // Обновляем показатели если они не null
        Optional.ofNullable(clicks)
            .ifPresent(c -> adResults.setClicks(adResults.getClicks() + c));
        
        Optional.ofNullable(views)
            .ifPresent(v -> adResults.setViews(adResults.getViews() + v));
        
        // Сохраняем и возвращаем результаты
        return adResultsRepository.save(adResults);
    }

    /**
     * Получить результаты рекламы
     * @throws ResourceNotFoundException если результаты не найдены
     */
    @Transactional(readOnly = true)
    public AdResults getAdResults(Long adId) {
        return adResultsRepository.findByAdId(adId)
                .orElseThrow(() -> new ResourceNotFoundException("Результаты рекламы", "ad_id", adId));
    }

    /**
     * Получить случайную активную рекламу для показа
     */
    @Transactional(readOnly = true)
    public Ad getRandomActiveAd() {
        List<Ad> activeAds = adRepository.findRandomActiveAds(1);
        return activeAds.isEmpty() ? null : activeAds.get(0);
    }

    /**
     * Увеличить счетчик просмотров рекламы
     */
    @Transactional
    public void incrementViewCount(Long adId) {
        updateAdResults(adId, null, 1);
    }
} 