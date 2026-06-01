package mini.cafe.project.controller.public_api;

import lombok.RequiredArgsConstructor;
import mini.cafe.project.dto.common.ApiResponse;
import mini.cafe.project.dto.menu.MenuItemResponse;
import mini.cafe.project.dto.restaurant.RestaurantResponse;
import mini.cafe.project.service.menu.MenuItemService;
import mini.cafe.project.service.restaurant.RestaurantService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/restaurants")
@RequiredArgsConstructor
public class RestaurantPublicController {

    private final RestaurantService restaurantService;
    private final MenuItemService menuItemService;

    @GetMapping("/{slug}")
    public ApiResponse<RestaurantResponse> getRestaurant(@PathVariable String slug) {
        RestaurantResponse restaurant = restaurantService.getBySlug(slug);
        return ApiResponse.success(restaurant);
    }

    @GetMapping("/{slug}/menu")
    public ApiResponse<List<MenuItemResponse>> getRestaurantMenu(@PathVariable String slug) {
        RestaurantResponse restaurant = restaurantService.getBySlug(slug);
        List<MenuItemResponse> menu = menuItemService.getRestaurantMenu(restaurant.getId());
        return ApiResponse.success(menu);
    }
}
