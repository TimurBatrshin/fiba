package com.fiba.api.repository;

import com.fiba.api.model.Ad;
import com.fiba.api.model.Tournament;
import com.fiba.api.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AdRepository extends JpaRepository<Ad, Long> {
    List<Ad> findByTournament(Tournament tournament);
    
    List<Ad> findByAdvertiser(User advertiser);
    
    List<Ad> findByBusiness(User business);
    
    @Query("SELECT a FROM Ad a WHERE a.tournament.id = :tournamentId")
    List<Ad> findByTournamentId(Long tournamentId);
    
    @Query("SELECT a FROM Ad a LEFT JOIN FETCH a.adResults WHERE a.id = :adId")
    Ad findWithResultsById(Long adId);
    
    /**
     * Получить случайные активные рекламные объявления
     * @param limit количество объявлений для получения
     * @return список случайных активных объявлений
     */
    @Query(value = "SELECT * FROM ads ORDER BY RANDOM() LIMIT :limit", nativeQuery = true)
    List<Ad> findRandomActiveAds(@Param("limit") int limit);
} 