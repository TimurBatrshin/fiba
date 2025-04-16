package com.fiba.api.repository;

import com.fiba.api.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);
    boolean existsByEmail(String email);
    
    /**
     * Поиск пользователей по имени или email, содержащим искомую строку
     * @param query строка для поиска
     * @return список пользователей, соответствующих критериям поиска
     */
    @Query("SELECT u FROM User u WHERE LOWER(u.name) LIKE LOWER(CONCAT('%', :query, '%')) OR LOWER(u.email) LIKE LOWER(CONCAT('%', :query, '%'))")
    List<User> searchByNameOrEmail(@Param("query") String query);

    /**
     * Найти пользователей по списку ID
     * @param ids список ID пользователей
     * @return список найденных пользователей
     */
    List<User> findByIdIn(List<Long> ids);
} 