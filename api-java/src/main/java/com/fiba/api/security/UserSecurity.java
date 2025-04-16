package com.fiba.api.security;

import com.fiba.api.model.Ad;
import com.fiba.api.model.Registration;
import com.fiba.api.model.User;
import com.fiba.api.repository.AdRepository;
import com.fiba.api.repository.RegistrationRepository;
import com.fiba.api.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Component;

import java.util.Optional;

/**
 * Компонент безопасности для проверок, связанных с пользователями.
 * Используется в аннотациях @PreAuthorize для проверки прав доступа.
 */
@Component("userSecurity")
@RequiredArgsConstructor
public class UserSecurity {

    private final UserService userService;
    private final RegistrationRepository registrationRepository;
    private final AdRepository adRepository;

    /**
     * Проверяет, является ли пользователь владельцем аккаунта
     *
     * @param userId ID пользователя
     * @return boolean результат проверки
     */
    public boolean isOwner(Long userId) {
        User currentUser = getCurrentUser();
        return currentUser != null && currentUser.getId().equals(userId);
    }

    /**
     * Проверяет, является ли пользователь владельцем аккаунта или администратором
     *
     * @param userId ID пользователя
     * @return boolean результат проверки
     */
    public boolean isOwnerOrAdmin(Long userId) {
        User currentUser = getCurrentUser();
        return currentUser != null && 
               (currentUser.getId().equals(userId) || "admin".equals(currentUser.getRole()));
    }

    /**
     * Проверяет, является ли пользователь администратором
     *
     * @return boolean результат проверки
     */
    public boolean isAdmin() {
        User currentUser = getCurrentUser();
        return currentUser != null && "admin".equals(currentUser.getRole());
    }

    /**
     * Проверяет, является ли пользователь рекламодателем
     *
     * @return boolean результат проверки
     */
    public boolean isAdvertiser() {
        User currentUser = getCurrentUser();
        return currentUser != null && "advertiser".equals(currentUser.getRole());
    }

    /**
     * Проверяет, является ли пользователь капитаном команды
     *
     * @param registrationId ID регистрации
     * @return boolean результат проверки
     */
    public boolean isTeamCaptain(Long registrationId) {
        User currentUser = getCurrentUser();
        if (currentUser == null) {
            return false;
        }

        Registration registration = registrationRepository.findById(registrationId)
                .orElse(null);

        return registration != null && 
               registration.getCaptain() != null && 
               registration.getCaptain().getId().equals(currentUser.getId());
    }

    /**
     * Проверяет, является ли пользователь администратором или капитаном команды
     *
     * @param registrationId ID регистрации
     * @return boolean результат проверки
     */
    public boolean isTeamCaptainOrAdmin(Long registrationId) {
        return isAdmin() || isTeamCaptain(registrationId);
    }

    /**
     * Проверяет, владелец ли пользователь рекламного объявления
     * 
     * @param advertisementId ID рекламного объявления
     * @return boolean результат проверки
     */
    public boolean isAdvertisementOwner(Long advertisementId) {
        User currentUser = getCurrentUser();
        if (currentUser == null) {
            return false;
        }

        Ad ad = adRepository.findById(advertisementId).orElse(null);
        return ad != null && 
               ad.getAdvertiser() != null && 
               ad.getAdvertiser().getId().equals(currentUser.getId());
    }

    /**
     * Проверяет, владелец ли пользователь рекламного объявления
     * 
     * @param adId ID рекламного объявления
     * @return boolean результат проверки
     */
    public boolean isAdOwner(Long adId) {
        return isAdvertisementOwner(adId);
    }

    /**
     * Получает текущего аутентифицированного пользователя
     *
     * @return User пользователь или null, если пользователь не аутентифицирован
     */
    public User getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated() || 
            "anonymousUser".equals(authentication.getPrincipal())) {
            return null;
        }

        UserDetails userDetails = (UserDetails) authentication.getPrincipal();
        return userService.getUserByEmail(userDetails.getUsername());
    }
} 