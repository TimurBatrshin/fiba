package com.fiba.api.service;

import com.fiba.api.dto.RegisterRequest;
import com.fiba.api.exception.BadRequestException;
import com.fiba.api.exception.ResourceNotFoundException;
import com.fiba.api.model.Profile;
import com.fiba.api.model.User;
import com.fiba.api.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final ProfileService profileService;

    /**
     * Регистрация нового пользователя
     * @throws BadRequestException если email уже зарегистрирован
     */
    @Transactional
    public User registerUser(RegisterRequest registerRequest) {
        // Проверка, существует ли пользователь с таким email
        if (userRepository.existsByEmail(registerRequest.getEmail())) {
            throw new BadRequestException("Email уже зарегистрирован");
        }

        // Создание нового пользователя
        User user = User.builder()
                .name(registerRequest.getName())
                .email(registerRequest.getEmail())
                .password(passwordEncoder.encode(registerRequest.getPassword()))
                .emailVerified(true) // Для демо считаем все email подтвержденными
                .role(registerRequest.getRole())
                .build();

        User savedUser = userRepository.save(user);

        // Создание профиля пользователя
        Profile profile = Profile.builder()
                .user(savedUser)
                .build();
        profileService.saveProfile(profile);

        return savedUser;
    }

    /**
     * Поиск пользователя по email
     * @throws ResourceNotFoundException если пользователь не найден
     */
    @Transactional(readOnly = true)
    public User findByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Пользователь", "email", email));
    }
    
    /**
     * Получить пользователя по email для внутреннего использования
     * @throws ResourceNotFoundException если пользователь не найден
     */
    @Transactional(readOnly = true)
    public User getUserByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Пользователь", "email", email));
    }

    /**
     * Получить пользователя по ID
     * @throws ResourceNotFoundException если пользователь не найден
     */
    @Transactional(readOnly = true)
    public User getUserById(Long id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Пользователь", "id", id));
    }

    @Transactional(readOnly = true)
    public User updateUser(User user) {
        return userRepository.findById(user.getId())
                .map(existingUser -> {
                    // Обновляем имя пользователя
                    existingUser.setName(user.getName());
                    
                    // Обновляем email с проверкой уникальности
                    if (!user.getEmail().equals(existingUser.getEmail())) {
                        if (userRepository.existsByEmail(user.getEmail())) {
                            throw new RuntimeException("Email уже используется");
                        }
                        existingUser.setEmail(user.getEmail());
                        existingUser.setEmailVerified(false);
                    }
                    
                    // Обновляем роль
                    existingUser.setRole(user.getRole());
                    
                    // Обновляем пароль
                    existingUser.setPassword(user.getPassword());
                    
                    return userRepository.save(existingUser);
                })
                .orElseThrow(() -> new RuntimeException("Пользователь не найден"));
    }
    
    @Transactional(readOnly = true)
    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    @Transactional
    public void deleteUser(Long id) {
        userRepository.findById(id)
            .ifPresentOrElse(
                userRepository::delete,
                () -> { throw new RuntimeException("Пользователь с ID " + id + " не найден"); }
            );
    }

    /**
     * Поиск пользователей по имени или email
     * @param query строка поиска
     * @return список найденных пользователей
     */
    @Transactional(readOnly = true)
    public List<User> searchUsers(String query) {
        if (query == null || query.trim().isEmpty()) {
            return List.of(); // Возвращаем пустой список, если запрос пустой
        }
        return userRepository.searchByNameOrEmail(query.trim());
    }

    /**
     * Получить пользователей по списку ID
     * @param ids список ID пользователей
     * @return список найденных пользователей
     */
    @Transactional(readOnly = true)
    public List<User> getUsersByIds(List<Long> ids) {
        if (ids == null || ids.isEmpty()) {
            return List.of();
        }
        return userRepository.findByIdIn(ids);
    }
} 