package com.fiba.api.repository;

import com.fiba.api.model.Registration;
import com.fiba.api.model.Tournament;
import com.fiba.api.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface RegistrationRepository extends JpaRepository<Registration, Long> {
    List<Registration> findByTournament(Tournament tournament);
    
    List<Registration> findByCaptain(User captain);
    
    List<Registration> findByTournamentAndStatus(Tournament tournament, String status);
    
    @Query("SELECT r FROM Registration r WHERE r.tournament.id = :tournamentId")
    List<Registration> findByTournamentId(Long tournamentId);
    
    @Query("SELECT r FROM Registration r JOIN r.players p WHERE p.id = :playerId")
    List<Registration> findByPlayerId(Long playerId);
    
    Optional<Registration> findByTournamentAndTeamName(Tournament tournament, String teamName);

    /**
     * Найти регистрацию с игроками по ID
     * @param registrationId ID регистрации
     * @return регистрация с игроками
     */
    @Query("SELECT DISTINCT r FROM Registration r LEFT JOIN FETCH r.players WHERE r.id = :registrationId")
    Optional<Registration> loadRegistrationWithPlayers(Long registrationId);
} 