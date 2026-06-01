package mini.cafe.project.repository;

import mini.cafe.project.domain.MenuCategory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface MenuCategoryRepository extends JpaRepository<MenuCategory, UUID> {

    List<MenuCategory> findByRestaurantIdAndIsActiveTrueOrderByDisplayOrderAsc(UUID restaurantId);

    List<MenuCategory> findByRestaurantIdOrderByDisplayOrderAsc(UUID restaurantId);

    @Query("SELECT MAX(c.displayOrder) FROM MenuCategory c WHERE c.restaurant.id = :restaurantId")
    Integer findMaxDisplayOrder(UUID restaurantId);

    Long countByRestaurantId(UUID restaurantId);
}
