package mini.cafe.project.service.analytics;

import lombok.RequiredArgsConstructor;
import mini.cafe.project.domain.Restaurant;
import mini.cafe.project.dto.analytics.TopSearchQuery;
import mini.cafe.project.repository.MenuItemRepository;
import mini.cafe.project.repository.QRScanRepository;
import mini.cafe.project.repository.RestaurantRepository;
import mini.cafe.project.repository.SearchHistoryRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class PlatformAnalyticsService {

    private final RestaurantRepository restaurantRepository;
    private final MenuItemRepository menuItemRepository;
    private final QRScanRepository qrScanRepository;
    private final SearchHistoryRepository searchHistoryRepository;

    @Transactional(readOnly = true)
    public Map<String, Object> getPlatformOverview() {
        LocalDateTime weekStart = LocalDateTime.now().minusDays(7);
        LocalDateTime monthStart = LocalDateTime.now().minusDays(30);

        // Restaurant metrics
        Long totalRestaurants = restaurantRepository.count();
        Long activeRestaurants = restaurantRepository.countByStatus(Restaurant.RestaurantStatus.ACTIVE);
        Long pendingRestaurants = restaurantRepository.countByStatus(Restaurant.RestaurantStatus.PENDING);

        // Menu metrics
        Long totalMenuItems = menuItemRepository.countAllActive();

        // Activity metrics
        Long totalScansAllTime = qrScanRepository.count();
        Long scansThisWeek = qrScanRepository.countSince(weekStart);
        Long scansThisMonth = qrScanRepository.countSince(monthStart);

        Long totalSearches = searchHistoryRepository.count();
        Long searchesThisWeek = searchHistoryRepository.countSince(weekStart);

        Map<String, Object> overview = new HashMap<>();
        overview.put("totalRestaurants", totalRestaurants);
        overview.put("activeRestaurants", activeRestaurants);
        overview.put("pendingRestaurants", pendingRestaurants);
        overview.put("totalMenuItems", totalMenuItems);
        overview.put("totalScans", totalScansAllTime);
        overview.put("scansThisWeek", scansThisWeek);
        overview.put("scansThisMonth", scansThisMonth);
        overview.put("totalSearches", totalSearches);
        overview.put("searchesThisWeek", searchesThisWeek);

        return overview;
    }

    @Transactional(readOnly = true)
    public List<TopSearchQuery> getGlobalTopSearches() {
        LocalDateTime monthStart = LocalDateTime.now().minusDays(30);
        LocalDateTime now = LocalDateTime.now();

        List<Object[]> results = searchHistoryRepository.findTopGlobalSearches(monthStart, now);

        List<TopSearchQuery> topSearches = new ArrayList<>();
        for (Object[] result : results) {
            topSearches.add(TopSearchQuery.builder()
                    .query((String) result[0])
                    .count((Long) result[1])
                    .build());
        }

        return topSearches;
    }

    @Transactional(readOnly = true)
    public List<Map<String, Object>> getTopRestaurants() {
        // Get restaurants with most scans
        List<Map<String, Object>> topRestaurants = new ArrayList<>();

        // TODO: Implement proper query for top restaurants by scans
        // For now, return empty list

        return topRestaurants;
    }
}
