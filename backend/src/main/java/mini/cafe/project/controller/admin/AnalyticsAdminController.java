package mini.cafe.project.controller.admin;

import lombok.RequiredArgsConstructor;
import mini.cafe.project.dto.analytics.AnalyticsOverviewResponse;
import mini.cafe.project.dto.analytics.DeviceStat;
import mini.cafe.project.dto.analytics.TopSearchQuery;
import mini.cafe.project.dto.common.ApiResponse;
import mini.cafe.project.repository.RestaurantRepository;
import mini.cafe.project.domain.User;
import mini.cafe.project.service.analytics.RestaurantAnalyticsService;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/admin/analytics")
@RequiredArgsConstructor
public class AnalyticsAdminController {

    private final RestaurantAnalyticsService analyticsService;
    private final RestaurantRepository restaurantRepository;

    @GetMapping("/overview")
    public ApiResponse<AnalyticsOverviewResponse> getOverview(
            @AuthenticationPrincipal User currentUser) {

        var restaurant = restaurantRepository.findByAdminUserId(currentUser.getId())
                .orElseThrow(() -> new RuntimeException("Restaurant not found for this user"));

        AnalyticsOverviewResponse overview = analyticsService.getOverview(restaurant.getId());
        return ApiResponse.success(overview);
    }

    @GetMapping("/devices")
    public ApiResponse<List<DeviceStat>> getDeviceStats(
            @AuthenticationPrincipal User currentUser) {

        var restaurant = restaurantRepository.findByAdminUserId(currentUser.getId())
                .orElseThrow(() -> new RuntimeException("Restaurant not found for this user"));

        List<DeviceStat> stats = analyticsService.getDeviceStats(restaurant.getId());
        return ApiResponse.success(stats);
    }

    @GetMapping("/top-searches")
    public ApiResponse<List<TopSearchQuery>> getTopSearches(
            @AuthenticationPrincipal User currentUser) {

        var restaurant = restaurantRepository.findByAdminUserId(currentUser.getId())
                .orElseThrow(() -> new RuntimeException("Restaurant not found for this user"));

        List<TopSearchQuery> topSearches = analyticsService.getTopSearches(restaurant.getId());
        return ApiResponse.success(topSearches);
    }
}
