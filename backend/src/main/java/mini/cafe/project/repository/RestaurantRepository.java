package mini.cafe.project.repository;

import mini.cafe.project.domain.Restaurant;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface RestaurantRepository extends JpaRepository<Restaurant, UUID> {

    Optional<Restaurant> findBySlug(String slug);

    Optional<Restaurant> findByAdminUserId(UUID adminUserId);

    boolean existsBySlug(String slug);

    List<Restaurant> findByStatus(Restaurant.RestaurantStatus status);

    Page<Restaurant> findByStatus(Restaurant.RestaurantStatus status, Pageable pageable);

    // PostGIS: Find restaurants within radius (in meters)
    @Query(value = """
            SELECT r.* FROM restaurants r
            WHERE r.status = 'ACTIVE'
            AND r.deleted_at IS NULL
            AND ST_DWithin(
                r.location::geography,
                ST_SetSRID(ST_MakePoint(:lng, :lat), 4326)::geography,
                :radiusMeters
            )
            ORDER BY ST_Distance(
                r.location::geography,
                ST_SetSRID(ST_MakePoint(:lng, :lat), 4326)::geography
            ) ASC
            LIMIT :limit
            """, nativeQuery = true)
    List<Restaurant> findNearby(@Param("lat") Double lat,
                                @Param("lng") Double lng,
                                @Param("radiusMeters") Double radiusMeters,
                                @Param("limit") Integer limit);

    @Query("SELECT COUNT(r) FROM Restaurant r WHERE r.status = :status AND r.deletedAt IS NULL")
    Long countByStatus(@Param("status") Restaurant.RestaurantStatus status);

    @Query("SELECT r FROM Restaurant r WHERE r.deletedAt IS NULL ORDER BY r.createdAt DESC")
    Page<Restaurant> findAllActive(Pageable pageable);
}
