package com.fiba.api.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "tournaments", indexes = {
    @Index(name = "idx_tournament_date", columnList = "date"),
    @Index(name = "idx_tournament_status", columnList = "status"),
    @Index(name = "idx_tournament_level", columnList = "level")
})
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Tournament {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String title;

    @Column(nullable = false)
    private LocalDateTime date;

    @Column(nullable = false)
    private String location;

    @Column(nullable = false)
    private String level;

    @Column(name = "prize_pool", nullable = false)
    private Integer prizePool;

    @Column(nullable = false)
    private String status = "registration"; // "registration", "ongoing", "completed"

    // Бизнес-поля для спонсируемых турниров
    @Column(name = "sponsor_name")
    private String sponsorName;
    
    @Column(name = "sponsor_logo")
    private String sponsorLogo;
    
    @Column(name = "business_type")
    private String businessType;
    
    // Поле для хранения URL изображения турнира
    @Column(name = "image_url")
    private String imageUrl;

    @JsonIgnore
    @OneToMany(mappedBy = "tournament", cascade = CascadeType.ALL)
    private List<Registration> registrations = new ArrayList<>();

    @JsonIgnore
    @OneToMany(mappedBy = "tournament", cascade = CascadeType.ALL)
    private List<Ad> ads = new ArrayList<>();
    
    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
} 