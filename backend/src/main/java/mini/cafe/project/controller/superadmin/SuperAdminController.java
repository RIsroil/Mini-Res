package mini.cafe.project.controller.superadmin;

import lombok.RequiredArgsConstructor;
import mini.cafe.project.domain.Restaurant;
import mini.cafe.project.domain.User;
import mini.cafe.project.dto.analytics.TopSearchQuery;
import mini.cafe.project.dto.common.ApiResponse;
import mini.cafe.project.dto.restaurant.RestaurantResponse;
import mini.cafe.project.service.analytics.PlatformAnalyticsService;
import mini.cafe.project.service.superadmin.SuperAdminService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/superadmin")
@RequiredArgsConstructor
public class SuperAdminController {

    private final SuperAdminService superAdminService;
    private final PlatformAnalyticsService platformAnalyticsService;

    @GetMapping("/restaurants")
    public ApiResponse<Page<Restaurant>> getAllRestaurants(
            @RequestParam(required = false) Restaurant.RestaurantStatus status,
            Pageable pageable) {

        Page<Restaurant> restaurants = superAdminService.getAllRestaurants(status, pageable);
        return ApiResponse.success(restaurants);
    }

    @GetMapping("/restaurants/list")
    public ApiResponse<List<RestaurantResponse>> getAllRestaurantsList(
            @RequestParam(required = false) Restaurant.RestaurantStatus status) {
        List<RestaurantResponse> restaurants = superAdminService.getAllRestaurantsList(status);
        return ApiResponse.success(restaurants);
    }

    @GetMapping("/restaurants/stats")
    public ApiResponse<Map<String, Long>> getRestaurantStatistics() {
        Map<String, Long> stats = superAdminService.getRestaurantStatistics();
        return ApiResponse.success(stats);
    }

    @GetMapping("/restaurants/pending")
    public ApiResponse<List<RestaurantResponse>> getPendingRestaurants() {
        List<RestaurantResponse> pending = superAdminService.getPendingRestaurants();
        return ApiResponse.success(pending);
    }

    @PatchMapping("/restaurants/{id}/approve")
    public ApiResponse<Void> approveRestaurant(@PathVariable UUID id) {
        superAdminService.approveRestaurant(id);
        return ApiResponse.success("Restaurant approved successfully", null);
    }

    @PatchMapping("/restaurants/{id}/block")
    public ApiResponse<Void> blockRestaurant(
            @PathVariable UUID id,
            @RequestParam(required = false) String reason) {

        superAdminService.blockRestaurant(id, reason);
        return ApiResponse.success("Restaurant blocked successfully", null);
    }

    @PatchMapping("/restaurants/{id}/unblock")
    public ApiResponse<Void> unblockRestaurant(@PathVariable UUID id) {
        superAdminService.unblockRestaurant(id);
        return ApiResponse.success("Restaurant unblocked successfully", null);
    }

    @PatchMapping("/restaurants/{id}/premium")
    public ApiResponse<Void> togglePremium(@PathVariable UUID id) {
        superAdminService.togglePremiumStatus(id);
        return ApiResponse.success("Premium status toggled", null);
    }

    @PatchMapping("/restaurants/{id}/premium/set")
    public ApiResponse<Void> setPremium(
            @PathVariable UUID id,
            @RequestParam boolean isPremium) {

        superAdminService.setPremiumStatus(id, isPremium);
        return ApiResponse.success("Premium status updated", null);
    }

    @DeleteMapping("/restaurants/{id}")
    public ApiResponse<Void> deleteRestaurant(@PathVariable UUID id) {
        superAdminService.deleteRestaurant(id);
        return ApiResponse.success("Restaurant deleted successfully", null);
    }

    @GetMapping("/analytics/platform")
    public ApiResponse<Map<String, Object>> getPlatformAnalytics() {
        Map<String, Object> analytics = platformAnalyticsService.getPlatformOverview();
        return ApiResponse.success(analytics);
    }

    @GetMapping("/analytics/top-searches")
    public ApiResponse<List<TopSearchQuery>> getGlobalTopSearches() {
        List<TopSearchQuery> topSearches = platformAnalyticsService.getGlobalTopSearches();
        return ApiResponse.success(topSearches);
    }

    @GetMapping("/analytics/top-restaurants")
    public ApiResponse<List<Map<String, Object>>> getTopRestaurants() {
        List<Map<String, Object>> topRestaurants = platformAnalyticsService.getTopRestaurants();
        return ApiResponse.success(topRestaurants);
    }

    // ==================== USER MANAGEMENT ====================

    @GetMapping("/users")
    public ApiResponse<List<User>> getAllUsers() {
        List<User> users = superAdminService.getAllUsers();
        return ApiResponse.success(users);
    }

    @GetMapping("/users/stats")
    public ApiResponse<Map<String, Long>> getUserStatistics() {
        Map<String, Long> stats = superAdminService.getUserStatistics();
        return ApiResponse.success(stats);
    }

    @PatchMapping("/users/{id}/toggle-active")
    public ApiResponse<Void> toggleUserActiveStatus(@PathVariable UUID id) {
        superAdminService.toggleUserActiveStatus(id);
        return ApiResponse.success("User status updated successfully", null);
    }
}
