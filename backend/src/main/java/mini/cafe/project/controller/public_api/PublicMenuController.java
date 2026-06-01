package mini.cafe.project.controller.public_api;

import lombok.RequiredArgsConstructor;
import mini.cafe.project.dto.category.CategoryResponse;
import mini.cafe.project.dto.common.ApiResponse;
import mini.cafe.project.dto.menu.MenuItemResponse;
import mini.cafe.project.dto.menu.PublicMenuResponse;
import mini.cafe.project.dto.restaurant.RestaurantResponse;
import mini.cafe.project.service.menu.MenuCategoryService;
import mini.cafe.project.service.menu.MenuItemService;
import mini.cafe.project.service.restaurant.RestaurantService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

import java.util.List;

@RestController
@RequestMapping("/api/v1/public/menu")
@RequiredArgsConstructor
public class PublicMenuController {

    private final RestaurantService restaurantService;
    private final MenuCategoryService menuCategoryService;
    private final MenuItemService menuItemService;

    @GetMapping("/{restaurantSlug}")
    public ApiResponse<PublicMenuResponse> getFullMenu(@PathVariable String restaurantSlug) {
        // Get restaurant by slug
        RestaurantResponse restaurant = restaurantService.getBySlug(restaurantSlug);

        // Get categories (only active ones)
        List<CategoryResponse> categories = menuCategoryService.getRestaurantCategories(restaurant.getId());

        // Get menu items (only active ones)
        List<MenuItemResponse> menuItems = menuItemService.getRestaurantMenu(restaurant.getId());

        PublicMenuResponse response = PublicMenuResponse.builder()
                .restaurant(restaurant)
                .categories(categories)
                .menuItems(menuItems)
                .build();

        return ApiResponse.success(response);
    }

    @GetMapping("/popular")
    public ApiResponse<List<MenuItemResponse>> getPopularMenuItems(
            @RequestParam(defaultValue = "20") int limit) {
        List<MenuItemResponse> popularItems = menuItemService.getPopularMenuItems(limit);
        return ApiResponse.success(popularItems);
    }

    @GetMapping("/latest")
    public ApiResponse<List<MenuItemResponse>> getLatestMenuItems(
            @RequestParam(defaultValue = "20") int limit) {
        List<MenuItemResponse> latestItems = menuItemService.getLatestMenuItems(limit);
        return ApiResponse.success(latestItems);
    }
}
