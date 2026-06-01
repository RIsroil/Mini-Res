package mini.cafe.project.controller.public_api;

import lombok.RequiredArgsConstructor;
import mini.cafe.project.dto.common.ApiResponse;
import mini.cafe.project.dto.menu.MenuSearchResponse;
import mini.cafe.project.dto.restaurant.NearbyRestaurantResponse;
import mini.cafe.project.service.search.SearchService;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1")
@RequiredArgsConstructor
public class SearchController {

    private final SearchService searchService;

    @GetMapping("/search")
    public ApiResponse<List<MenuSearchResponse>> searchGlobal(
            @RequestParam String q,
            @RequestParam Double lat,
            @RequestParam Double lng,
            @RequestParam(required = false, defaultValue = "10") Double radius) {

        List<MenuSearchResponse> results = searchService.searchGlobal(q, lat, lng, radius);
        return ApiResponse.success(results);
    }

    @GetMapping("/search/nearby")
    public ApiResponse<List<NearbyRestaurantResponse>> searchNearby(
            @RequestParam Double lat,
            @RequestParam Double lng,
            @RequestParam(required = false, defaultValue = "10") Double radius) {

        List<NearbyRestaurantResponse> results = searchService.searchNearby(lat, lng, radius);
        return ApiResponse.success(results);
    }

    @GetMapping("/restaurants/{slug}/search")
    public ApiResponse<List<MenuSearchResponse>> searchInRestaurant(
            @PathVariable String slug,
            @RequestParam String q) {

        List<MenuSearchResponse> results = searchService.searchInRestaurant(slug, q);
        return ApiResponse.success(results);
    }

    @GetMapping("/menu/{id}/similar")
    public ApiResponse<List<MenuSearchResponse>> getSimilarNearby(
            @PathVariable UUID id,
            @RequestParam Double lat,
            @RequestParam Double lng) {

        List<MenuSearchResponse> results = searchService.searchSimilarNearby(id, lat, lng);
        return ApiResponse.success(results);
    }
}
