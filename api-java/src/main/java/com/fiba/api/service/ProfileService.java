package com.fiba.api.service;

import com.fiba.api.exception.ResourceNotFoundException;
import com.fiba.api.model.Profile;
import com.fiba.api.repository.ProfileRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ProfileService {

    private final ProfileRepository profileRepository;

    /**
     * Сохранение профиля пользователя
     */
    @Transactional
    public Profile saveProfile(Profile profile) {
        return profileRepository.save(profile);
    }

    /**
     * Получение профиля по ID пользователя
     * @throws ResourceNotFoundException если профиль не найден
     */
    @Transactional(readOnly = true)
    public Profile getProfileByUserId(Long userId) {
        return profileRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Профиль", "user_id", userId));
    }
    
    /**
     * Получение всех профилей пользователей
     * @return список всех профилей
     */
    @Transactional(readOnly = true)
    public List<Profile> getAllProfiles() {
        return profileRepository.findAll();
    }
} 