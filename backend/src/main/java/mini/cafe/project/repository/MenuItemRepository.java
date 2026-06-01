package mini.cafe.project.repository;

import mini.cafe.project.domain.MenuItem;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface MenuItemRepository extends JpaRepository<MenuItem, UUID> {

    List<MenuItem> findByRestaurantIdAndIsActiveTrue(UUID restaurantId);

    List<MenuItem> findByRestaurantIdAndCategoryIdAndIsActiveTrue(UUID restaurantId, UUID categoryId);

    List<MenuItem> findByCategoryIdOrderByCreatedAtDesc(UUID categoryId);

    Page<MenuItem> findByRestaurantIdAndIsActiveTrue(UUID restaurantId, Pageable pageable);

    // Global search with PostGIS distance sorting
    @Query(value = """
            SELECT
                mi.*,
                ST_Distance(
                    r.location::geography,
                    ST_SetSRID(ST_MakePoint(:lng, :lat), 4326)::geography
                ) / 1000 AS distance_km
            FROM menu_items mi
            INNER JOIN restaurants r ON mi.restaurant_id = r.id
            WHERE
                r.status = 'ACTIVE'
                AND r.deleted_at IS NULL
                AND mi.is_active = TRUE
                AND mi.deleted_at IS NULL
                AND (
                    mi.search_vector @@ plainto_tsquery('english', :query)
                    OR LOWER(mi.name) LIKE LOWER(CONCAT('%', :query, '%'))
                )
                AND ST_DWithin(
                    r.location::geography,
                    ST_SetSRID(ST_MakePoint(:lng, :lat), 4326)::geography,
                    :radiusMeters
                )
            ORDER BY distance_km ASC
            LIMIT :limit
            """, nativeQuery = true)
    List<MenuItem> searchGlobalNearby(@Param("query") String query,
                                      @Param("lat") Double lat,
                                      @Param("lng") Double lng,
                                      @Param("radiusMeters") Double radiusMeters,
                                      @Param("limit") Integer limit);

    // Search within specific restaurant
    @Query("""
            SELECT mi FROM MenuItem mi
            WHERE mi.restaurant.id = :restaurantId
            AND mi.isActive = TRUE
            AND mi.deletedAt IS NULL
            AND (
                LOWER(mi.name) LIKE LOWER(CONCAT('%', :query, '%'))
                OR LOWER(mi.description) LIKE LOWER(CONCAT('%', :query, '%'))
            )
            ORDER BY mi.createdAt DESC
            """)
    List<MenuItem> searchInRestaurant(@Param("restaurantId") UUID restaurantId,
                                      @Param("query") String query);

    // Find similar items nearby (exclude current restaurant)
    @Query(value = """
            SELECT
                mi.*,
                ST_Distance(
                    r.location::geography,
                    ST_SetSRID(ST_MakePoint(:lng, :lat), 4326)::geography
                ) / 1000 AS distance_km
            FROM menu_items mi
            INNER JOIN restaurants r ON mi.restaurant_id = r.id
            WHERE
                r.status = 'ACTIVE'
                AND r.deleted_at IS NULL
                AND mi.is_active = TRUE
                AND mi.deleted_at IS NULL
                AND mi.restaurant_id != :excludeRestaurantId
                AND mi.search_vector @@ plainto_tsquery('english', :query)
                AND ST_DWithin(
                    r.location::geography,
                    ST_SetSRID(ST_MakePoint(:lng, :lat), 4326)::geography,
                    5000
                )
            ORDER BY
                ts_rank(mi.search_vector, plainto_tsquery('english', :query)) DESC,
                distance_km ASC
            LIMIT 10
            """, nativeQuery = true)
    List<MenuItem> findSimilarNearby(@Param("query") String query,
                                     @Param("lat") Double lat,
                                     @Param("lng") Double lng,
                                     @Param("excludeRestaurantId") UUID excludeRestaurantId);

    Long countByRestaurantId(UUID restaurantId);

    @Query("SELECT COUNT(mi) FROM MenuItem mi WHERE mi.isActive = TRUE AND mi.deletedAt IS NULL")
    Long countAllActive();

    // Get popular menu items (with promotion or premium badge, active and available)
    @Query("""
            SELECT mi FROM MenuItem mi
            WHERE mi.isActive = TRUE
            AND mi.isAvailable = TRUE
            AND mi.deletedAt IS NULL
            AND mi.restaurant.status = 'ACTIVE'
            AND mi.restaurant.deletedAt IS NULL
            AND (mi.promotionActive = TRUE OR mi.hasPremiumBadge = TRUE)
            ORDER BY mi.createdAt DESC
            """)
    List<MenuItem> findPopularMenuItems(Pageable pageable);

    // Get latest menu items
    @Query("""
            SELECT mi FROM MenuItem mi
            WHERE mi.isActive = TRUE
            AND mi.isAvailable = TRUE
            AND mi.deletedAt IS NULL
            AND mi.restaurant.status = 'ACTIVE'
            AND mi.restaurant.deletedAt IS NULL
            ORDER BY mi.createdAt DESC
            """)
    List<MenuItem> findLatestMenuItems(Pageable pageable);
}
