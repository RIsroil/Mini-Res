package mini.cafe.project.service.search;

import lombok.RequiredArgsConstructor;
import mini.cafe.project.domain.MenuItem;
import mini.cafe.project.domain.Restaurant;
import mini.cafe.project.domain.SearchHistory;
import mini.cafe.project.dto.menu.MenuSearchResponse;
import mini.cafe.project.dto.restaurant.NearbyRestaurantResponse;
import mini.cafe.project.exception.ResourceNotFoundException;
import mini.cafe.project.repository.MenuItemRepository;
import mini.cafe.project.repository.RestaurantRepository;
import mini.cafe.project.repository.SearchHistoryRepository;
import mini.cafe.project.util.GeoUtils;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class SearchService {

    private final MenuItemRepository menuItemRepository;
    private final RestaurantRepository restaurantRepository;
    private final SearchHistoryRepository searchHistoryRepository;

    @Value("${app.search.default-radius-km:10}")
    private Double defaultRadiusKm;

    @Value("${app.search.max-radius-km:50}")
    private Double maxRadiusKm;

    @Transactional(readOnly = true)
    public List<MenuSearchResponse> searchGlobal(String query, Double lat, Double lng, Double radiusKm) {
        // Validate and normalize radius
        double radius = Math.min(radiusKm != null ? radiusKm : defaultRadiusKm, maxRadiusKm);
        double radiusMeters = GeoUtils.kmToMeters(radius);

        // Track search
        trackSearch(query, lat, lng, SearchHistory.SearchType.GLOBAL, null);

        // Execute search
        List<MenuItem> results = menuItemRepository.searchGlobalNearby(
                query, lat, lng, radiusMeters, 30
        );

        // Map to DTOs
        return results.stream()
                .map(this::toMenuSearchResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<NearbyRestaurantResponse> searchNearby(Double lat, Double lng, Double radiusKm) {
        double radius = Math.min(radiusKm != null ? radiusKm : defaultRadiusKm, maxRadiusKm);
        double radiusMeters = GeoUtils.kmToMeters(radius);

        List<Restaurant> restaurants = restaurantRepository.findNearby(lat, lng, radiusMeters, 50);

        return restaurants.stream()
                .map(this::toNearbyRestaurantResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<MenuSearchResponse> searchInRestaurant(String slug, String query) {
        Restaurant restaurant = restaurantRepository.findBySlug(slug)
                .orElseThrow(() -> new ResourceNotFoundException("Restaurant", "slug", slug));

        // Track search
        trackSearch(query, null, null, SearchHistory.SearchType.RESTAURANT_SPECIFIC, restaurant.getId());

        List<MenuItem> results = menuItemRepository.searchInRestaurant(restaurant.getId(), query);

        return results.stream()
                .map(this::toMenuSearchResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<MenuSearchResponse> searchSimilarNearby(UUID menuItemId, Double lat, Double lng) {
        MenuItem menuItem = menuItemRepository.findById(menuItemId)
                .orElseThrow(() -> new ResourceNotFoundException("MenuItem", "id", menuItemId));

        // Use menu name as search query
        String query = menuItem.getName();

        List<MenuItem> similar = menuItemRepository.findSimilarNearby(
                query, lat, lng, menuItem.getRestaurant().getId()
        );

        return similar.stream()
                .map(this::toMenuSearchResponse)
                .collect(Collectors.toList());
    }

    private void trackSearch(String query, Double lat, Double lng,
                             SearchHistory.SearchType type, UUID restaurantId) {
        SearchHistory history = SearchHistory.builder()
                .searchQuery(query)
                .searchType(type)
                .userLocation(lat != null && lng != null ? GeoUtils.createPoint(lat, lng) : null)
                .build();

        if (restaurantId != null) {
            Restaurant restaurant = restaurantRepository.findById(restaurantId).orElse(null);
            history.setRestaurant(restaurant);
        }

        searchHistoryRepository.save(history);
    }

    private MenuSearchResponse toMenuSearchResponse(MenuItem item) {
        return MenuSearchResponse.builder()
                .id(item.getId())
                .name(item.getName())
                .description(item.getDescription())
                .price(item.getPrice())
                .preparationTimeMinutes(item.getPreparationTimeMinutes())
                .primaryImage(item.getPrimaryImage())
                .promotionText(item.getPromotionActive() ? item.getPromotionText() : null)
                .isPremium(item.getRestaurant().getIsPremium())
                .restaurantId(item.getRestaurant().getId())
                .restaurantName(item.getRestaurant().getName())
                .restaurantSlug(item.getRestaurant().getSlug())
                .restaurantLogo(item.getRestaurant().getLogoUrl())
                // Distance would be calculated in native query
                .build();
    }

    private NearbyRestaurantResponse toNearbyRestaurantResponse(Restaurant restaurant) {
        return NearbyRestaurantResponse.builder()
                .id(restaurant.getId())
                .slug(restaurant.getSlug())
                .name(restaurant.getName())
                .logoUrl(restaurant.getLogoUrl())
                .address(restaurant.getAddress())
                .city(restaurant.getCity())
                .isPremium(restaurant.getIsPremium())
                .globalPromotionText(restaurant.getPromotionActive() ? restaurant.getGlobalPromotionText() : null)
                // Distance would be calculated in native query
                .build();
    }
}
