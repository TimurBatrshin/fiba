package com.fiba.api.repository;

import com.fiba.api.model.Tournament;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface TournamentRepository extends JpaRepository<Tournament, Long> {
    List<Tournament> findByStatus(String status);
    
    List<Tournament> findByDateAfter(LocalDateTime date);
    
    List<Tournament> findByDateBefore(LocalDateTime date);
    
    @Query("SELECT t FROM Tournament t WHERE t.level = :level")
    List<Tournament> findByLevel(String level);
    
    @Query("SELECT t FROM Tournament t WHERE LOWER(t.title) LIKE LOWER(CONCAT('%', :searchTerm, '%'))")
    List<Tournament> searchByTitle(String searchTerm);
    
    @Query("SELECT t FROM Tournament t WHERE LOWER(t.location) LIKE LOWER(CONCAT('%', :location, '%'))")
    List<Tournament> findByLocationContaining(String location);
    
    /**
     * Получить турнир по ID с загрузкой всех регистраций команд
     * @param id ID турнира
     * @return турнир с загруженными регистрациями
     */
    @Query("SELECT DISTINCT t FROM Tournament t LEFT JOIN FETCH t.registrations r LEFT JOIN FETCH r.captain WHERE t.id = :id")
    Optional<Tournament> findByIdWithRegistrations(@Param("id") Long id);
} 