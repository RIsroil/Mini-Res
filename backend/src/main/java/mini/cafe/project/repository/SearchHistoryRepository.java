package mini.cafe.project.repository;

import mini.cafe.project.domain.SearchHistory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Repository
public interface SearchHistoryRepository extends JpaRepository<SearchHistory, UUID> {

    Long countByRestaurantId(UUID restaurantId);

    Long countByRestaurantIdAndSearchedAtBetween(UUID restaurantId, LocalDateTime start, LocalDateTime end);

    @Query("SELECT COUNT(s) FROM SearchHistory s WHERE s.searchedAt >= :date")
    Long countSince(@Param("date") LocalDateTime date);

    @Query("""
            SELECT s.searchQuery, COUNT(s) as count
            FROM SearchHistory s
            WHERE s.restaurant.id = :restaurantId
            AND s.searchedAt BETWEEN :start AND :end
            GROUP BY s.searchQuery
            ORDER BY count DESC
            LIMIT 10
            """)
    List<Object[]> findTopSearches(@Param("restaurantId") UUID restaurantId,
                                   @Param("start") LocalDateTime start,
                                   @Param("end") LocalDateTime end);

    @Query("""
            SELECT s.searchQuery, COUNT(s) as count
            FROM SearchHistory s
            WHERE s.searchedAt BETWEEN :start AND :end
            AND s.searchType = 'GLOBAL'
            GROUP BY s.searchQuery
            ORDER BY count DESC
            LIMIT 20
            """)
    List<Object[]> findTopGlobalSearches(@Param("start") LocalDateTime start,
                                         @Param("end") LocalDateTime end);
}
