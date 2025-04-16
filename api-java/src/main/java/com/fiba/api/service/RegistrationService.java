package com.fiba.api.service;

import com.fiba.api.model.Registration;
import com.fiba.api.model.Tournament;
import com.fiba.api.model.User;
import com.fiba.api.repository.RegistrationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class RegistrationService {

    private final RegistrationRepository registrationRepository;
    private final TournamentService tournamentService;
    private final UserService userService;

    @Transactional(readOnly = true)
    public List<Registration> getAllRegistrations() {
        return registrationRepository.findAll();
    }

    @Transactional(readOnly = true)
    public Registration getRegistrationById(Long id) {
        return registrationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Регистрация с ID " + id + " не найдена"));
    }

    @Transactional(readOnly = true)
    public List<Registration> getRegistrationsByTournament(Long tournamentId) {
        return registrationRepository.findByTournamentId(tournamentId);
    }

    @Transactional(readOnly = true)
    public List<Registration> getRegistrationsByCaptain(Long captainId) {
        User captain = userService.getUserById(captainId);
        return registrationRepository.findByCaptain(captain);
    }

    @Transactional(readOnly = true)
    public List<Registration> getTeamsByPlayer(Long playerId) {
        return registrationRepository.findByPlayerId(playerId);
    }

    @Transactional(readOnly = true)
    public List<Registration> getRegistrationsByTournamentAndStatus(Long tournamentId, String status) {
        Tournament tournament = tournamentService.getTournamentById(tournamentId);
        return registrationRepository.findByTournamentAndStatus(tournament, status);
    }

    @Transactional
    public Registration createRegistration(Registration registration) {
        // Проверка на уникальность имени команды в рамках турнира
        Tournament tournament = tournamentService.getTournamentById(registration.getTournament().getId());
        String teamName = registration.getTeamName();
        
        registrationRepository.findByTournamentAndTeamName(tournament, teamName)
                .ifPresent(existingReg -> {
                    throw new RuntimeException("Команда с названием '" + teamName + "' уже зарегистрирована в этом турнире");
                });
        
        // Установка статуса "pending" для новой регистрации
        registration.setStatus("pending");
        
        // Добавляем капитана в список игроков, если его там еще нет
        if (!registration.getPlayers().contains(registration.getCaptain())) {
            registration.getPlayers().add(registration.getCaptain());
        }
        
        return registrationRepository.save(registration);
    }

    @Transactional
    public Registration updateRegistration(Registration registration) {
        Registration existingRegistration = registrationRepository.findById(registration.getId())
                .orElseThrow(() -> new RuntimeException("Регистрация с ID " + registration.getId() + " не найдена"));
        
        if (registration.getTeamName() != null) {
            existingRegistration.setTeamName(registration.getTeamName());
        }
        
        if (registration.getStatus() != null) {
            existingRegistration.setStatus(registration.getStatus());
        }
        
        if (!registration.getPlayers().isEmpty()) {
            existingRegistration.setPlayers(registration.getPlayers());
        }
        
        return registrationRepository.save(existingRegistration);
    }

    @Transactional
    public Registration updateRegistrationStatus(Long registrationId, String status) {
        Registration existingRegistration = registrationRepository.findById(registrationId)
                .orElseThrow(() -> new RuntimeException("Регистрация с ID " + registrationId + " не найдена"));
        
        existingRegistration.setStatus(status);
        return registrationRepository.save(existingRegistration);
    }

    @Transactional
    public Registration addPlayerToTeam(Long registrationId, Long playerId) {
        Registration registration = registrationRepository.findById(registrationId)
                .orElseThrow(() -> new RuntimeException("Регистрация с ID " + registrationId + " не найдена"));
        
        User player = userService.getUserById(playerId);
        
        if (!registration.getPlayers().contains(player)) {
            registration.getPlayers().add(player);
        }
        
        return registrationRepository.save(registration);
    }

    @Transactional
    public Registration removePlayerFromTeam(Long registrationId, Long playerId) {
        Registration registration = registrationRepository.findById(registrationId)
                .orElseThrow(() -> new RuntimeException("Регистрация с ID " + registrationId + " не найдена"));
        
        User player = userService.getUserById(playerId);
        
        // Нельзя удалить капитана из команды
        if (player.equals(registration.getCaptain())) {
            throw new RuntimeException("Нельзя удалить капитана из команды");
        }
        
        registration.getPlayers().remove(player);
        return registrationRepository.save(registration);
    }

    @Transactional
    public void deleteRegistration(Long id) {
        Registration registration = registrationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Регистрация с ID " + id + " не найдена"));
        
        registrationRepository.delete(registration);
    }

    /**
     * Получает регистрацию с игроками по ID
     * @param id ID регистрации
     * @return Регистрация с загруженными игроками
     */
    @Transactional(readOnly = true)
    public Registration getRegistrationWithPlayersById(Long id) {
        return registrationRepository.loadRegistrationWithPlayers(id)
                .orElseThrow(() -> new RuntimeException("Регистрация с ID " + id + " не найдена"));
    }
} 