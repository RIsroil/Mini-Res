package mini.cafe.project.service.analytics;

import lombok.RequiredArgsConstructor;
import mini.cafe.project.dto.analytics.AnalyticsOverviewResponse;
import mini.cafe.project.dto.analytics.DeviceStat;
import mini.cafe.project.dto.analytics.TopSearchQuery;
import mini.cafe.project.repository.MenuCategoryRepository;
import mini.cafe.project.repository.MenuItemRepository;
import mini.cafe.project.repository.QRScanRepository;
import mini.cafe.project.repository.SearchHistoryRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class RestaurantAnalyticsService {

    private final QRScanRepository qrScanRepository;
    private final SearchHistoryRepository searchHistoryRepository;
    private final MenuItemRepository menuItemRepository;
    private final MenuCategoryRepository categoryRepository;

    @Transactional(readOnly = true)
    public AnalyticsOverviewResponse getOverview(UUID restaurantId) {
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime todayStart = LocalDateTime.of(LocalDate.now(), LocalTime.MIN);
        LocalDateTime weekStart = now.minusDays(7);
        LocalDateTime monthStart = now.minusDays(30);

        // QR Scans
        Long totalScans = qrScanRepository.countByRestaurantId(restaurantId);
        Long scansToday = qrScanRepository.countByRestaurantIdAndScannedAtBetween(
                restaurantId, todayStart, now);
        Long scansThisWeek = qrScanRepository.countByRestaurantIdAndScannedAtBetween(
                restaurantId, weekStart, now);
        Long scansThisMonth = qrScanRepository.countByRestaurantIdAndScannedAtBetween(
                restaurantId, monthStart, now);

        // Searches
        Long totalSearches = searchHistoryRepository.countByRestaurantId(restaurantId);
        Long searchesToday = searchHistoryRepository.countByRestaurantIdAndSearchedAtBetween(
                restaurantId, todayStart, now);
        Long searchesThisWeek = searchHistoryRepository.countByRestaurantIdAndSearchedAtBetween(
                restaurantId, weekStart, now);

        // Menu stats
        Long totalMenuItems = menuItemRepository.countByRestaurantId(restaurantId);
        Long totalCategories = categoryRepository.countByRestaurantId(restaurantId);

        // Calculate avg scans per day
        Long daysActive = 30L; // TODO: Calculate actual days since restaurant creation
        Double avgScansPerDay = totalScans / (double) Math.max(daysActive, 1);

        return AnalyticsOverviewResponse.builder()
                .totalScans(totalScans)
                .scansToday(scansToday)
                .scansThisWeek(scansThisWeek)
                .scansThisMonth(scansThisMonth)
                .totalSearches(totalSearches)
                .searchesToday(searchesToday)
                .searchesThisWeek(searchesThisWeek)
                .totalMenuItems(totalMenuItems)
                .activeMenuItems(totalMenuItems) // TODO: Filter by isActive
                .totalCategories(totalCategories)
                .avgScansPerDay(Math.round(avgScansPerDay * 100.0) / 100.0)
                .build();
    }

    @Transactional(readOnly = true)
    public List<DeviceStat> getDeviceStats(UUID restaurantId) {
        LocalDateTime weekStart = LocalDateTime.now().minusDays(7);
        LocalDateTime now = LocalDateTime.now();

        List<Object[]> results = qrScanRepository.countByDeviceType(restaurantId, weekStart, now);

        Long total = results.stream()
                .mapToLong(r -> (Long) r[1])
                .sum();

        List<DeviceStat> stats = new ArrayList<>();
        for (Object[] result : results) {
            String deviceType = result[0] != null ? result[0].toString() : "UNKNOWN";
            Long count = (Long) result[1];
            Double percentage = total > 0 ? (count * 100.0) / total : 0.0;

            stats.add(DeviceStat.builder()
                    .deviceType(deviceType)
                    .count(count)
                    .percentage(Math.round(percentage * 100.0) / 100.0)
                    .build());
        }

        return stats;
    }

    @Transactional(readOnly = true)
    public List<TopSearchQuery> getTopSearches(UUID restaurantId) {
        LocalDateTime monthStart = LocalDateTime.now().minusDays(30);
        LocalDateTime now = LocalDateTime.now();

        List<Object[]> results = searchHistoryRepository.findTopSearches(
                restaurantId, monthStart, now);

        List<TopSearchQuery> topSearches = new ArrayList<>();
        for (Object[] result : results) {
            topSearches.add(TopSearchQuery.builder()
                    .query((String) result[0])
                    .count((Long) result[1])
                    .build());
        }

        return topSearches;
    }
}
