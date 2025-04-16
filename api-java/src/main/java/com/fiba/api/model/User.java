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
@Table(name = "users", indexes = {
    @Index(name = "idx_user_email", columnList = "email", unique = true),
    @Index(name = "idx_user_role", columnList = "role")
})
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(unique = true, nullable = false)
    private String email;

    @JsonIgnore
    @Column(nullable = false)
    private String password;

    @Column(name = "email_verified")
    private boolean emailVerified = false;

    @Column(nullable = false)
    private String role = "user";

    @OneToOne(mappedBy = "user", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private Profile profile;

    @JsonIgnore
    @OneToMany(mappedBy = "captain", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<Registration> captainedTeams = new ArrayList<>();

    @JsonIgnore
    @ManyToMany(mappedBy = "players")
    private List<Registration> teams = new ArrayList<>();

    @JsonIgnore
    @OneToMany(mappedBy = "advertiser")
    private List<Ad> adsAsAdvertiser = new ArrayList<>();

    @JsonIgnore
    @OneToMany(mappedBy = "business")
    private List<Ad> adsAsBusiness = new ArrayList<>();

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
} 