package com.fiba.api.service;

import com.fiba.api.exception.ResourceNotFoundException;
import com.fiba.api.model.Tournament;
import com.fiba.api.repository.TournamentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class TournamentService {

    private final TournamentRepository tournamentRepository;

    /**
     * Получить все турниры
     */
    @Transactional(readOnly = true)
    public List<Tournament> getAllTournaments() {
        return tournamentRepository.findAll();
    }

    /**
     * Получить турнир по ID с загрузкой регистраций команд
     * @throws ResourceNotFoundException если турнир не найден
     */
    @Transactional(readOnly = true)
    public Tournament getTournamentById(Long id) {
        return tournamentRepository.findByIdWithRegistrations(id)
                .orElseThrow(() -> new ResourceNotFoundException("Турнир", "id", id));
    }

    /**
     * Получить турниры по статусу
     */
    @Transactional(readOnly = true)
    public List<Tournament> getTournamentsByStatus(String status) {
        return tournamentRepository.findByStatus(status);
    }

    /**
     * Получить предстоящие турниры (дата в будущем)
     */
    @Transactional(readOnly = true)
    public List<Tournament> getUpcomingTournaments() {
        return tournamentRepository.findByDateAfter(LocalDateTime.now());
    }

    /**
     * Получить прошедшие турниры (дата в прошлом)
     */
    @Transactional(readOnly = true)
    public List<Tournament> getPastTournaments() {
        return tournamentRepository.findByDateBefore(LocalDateTime.now());
    }

    /**
     * Поиск турниров по названию
     */
    @Transactional(readOnly = true)
    public List<Tournament> searchTournaments(String searchTerm) {
        return tournamentRepository.searchByTitle(searchTerm);
    }

    /**
     * Получить турниры по местоположению
     */
    @Transactional(readOnly = true)
    public List<Tournament> getTournamentsByLocation(String location) {
        return tournamentRepository.findByLocationContaining(location);
    }

    /**
     * Получить турниры по уровню
     */
    @Transactional(readOnly = true)
    public List<Tournament> getTournamentsByLevel(String level) {
        return tournamentRepository.findByLevel(level);
    }

    /**
     * Создать новый турнир
     */
    @Transactional
    public Tournament createTournament(Tournament tournament) {
        return tournamentRepository.save(tournament);
    }

    /**
     * Обновить существующий турнир
     * @throws ResourceNotFoundException если турнир не найден
     */
    @Transactional
    public Tournament updateTournament(Tournament tournament) {
        return tournamentRepository.findById(tournament.getId())
                .map(existingTournament -> {
                    // Обновляем поля, если они не null
                    if (tournament.getTitle() != null) {
                        existingTournament.setTitle(tournament.getTitle());
                    }
                    
                    if (tournament.getDate() != null) {
                        existingTournament.setDate(tournament.getDate());
                    }
                    
                    if (tournament.getLocation() != null) {
                        existingTournament.setLocation(tournament.getLocation());
                    }
                    
                    if (tournament.getLevel() != null) {
                        existingTournament.setLevel(tournament.getLevel());
                    }
                    
                    if (tournament.getPrizePool() != null) {
                        existingTournament.setPrizePool(tournament.getPrizePool());
                    }
                    
                    if (tournament.getStatus() != null) {
                        existingTournament.setStatus(tournament.getStatus());
                    }
                    
                    return tournamentRepository.save(existingTournament);
                })
                .orElseThrow(() -> new ResourceNotFoundException("Турнир", "id", tournament.getId()));
    }

    /**
     * Удалить турнир
     * @throws ResourceNotFoundException если турнир не найден
     */
    @Transactional
    public void deleteTournament(Long id) {
        Tournament tournament = getTournamentById(id);
        tournamentRepository.delete(tournament);
    }
} 