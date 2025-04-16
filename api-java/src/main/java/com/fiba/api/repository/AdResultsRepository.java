package com.fiba.api.repository;

import com.fiba.api.model.Ad;
import com.fiba.api.model.AdResults;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface AdResultsRepository extends JpaRepository<AdResults, Long> {
    Optional<AdResults> findByAd(Ad ad);
    
    Optional<AdResults> findByAdId(Long adId);
} 