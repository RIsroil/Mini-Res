package mini.cafe.project.controller.admin;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import mini.cafe.project.dto.common.ApiResponse;
import mini.cafe.project.dto.menu.MenuItemRequest;
import mini.cafe.project.dto.menu.MenuItemResponse;
import mini.cafe.project.exception.ResourceNotFoundException;
import mini.cafe.project.repository.RestaurantRepository;
import mini.cafe.project.domain.User;
import mini.cafe.project.service.menu.MenuItemService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/admin/menu")
@RequiredArgsConstructor
public class MenuAdminController {

    private final MenuItemService menuItemService;
    private final RestaurantRepository restaurantRepository;

    @GetMapping
    public ApiResponse<List<MenuItemResponse>> getMyMenu(
            @AuthenticationPrincipal User currentUser) {

        var restaurant = restaurantRepository.findByAdminUserId(currentUser.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Restaurant", "adminUserId", currentUser.getId()));

        List<MenuItemResponse> menu = menuItemService.getRestaurantMenu(restaurant.getId());
        return ApiResponse.success(menu);
    }

    @PostMapping
    public ResponseEntity<ApiResponse<MenuItemResponse>> createMenuItem(
            @Valid @RequestBody MenuItemRequest request,
            @AuthenticationPrincipal User currentUser) {

        var restaurant = restaurantRepository.findByAdminUserId(currentUser.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Restaurant", "adminUserId", currentUser.getId()));

        MenuItemResponse response = menuItemService.createMenuItem(restaurant.getId(), request);
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(ApiResponse.success("Menu item created successfully", response));
    }

    @PutMapping("/{id}")
    public ApiResponse<MenuItemResponse> updateMenuItem(
            @PathVariable UUID id,
            @Valid @RequestBody MenuItemRequest request,
            @AuthenticationPrincipal User currentUser) {

        var restaurant = restaurantRepository.findByAdminUserId(currentUser.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Restaurant", "adminUserId", currentUser.getId()));

        MenuItemResponse response = menuItemService.updateMenuItem(id, request, restaurant.getId());
        return ApiResponse.success("Menu item updated successfully", response);
    }

    @DeleteMapping("/{id}")
    public ApiResponse<Void> deleteMenuItem(
            @PathVariable UUID id,
            @AuthenticationPrincipal User currentUser) {

        var restaurant = restaurantRepository.findByAdminUserId(currentUser.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Restaurant", "adminUserId", currentUser.getId()));

        menuItemService.deleteMenuItem(id, restaurant.getId());
        return ApiResponse.success("Menu item deleted successfully", null);
    }

    @PatchMapping("/{id}/toggle-availability")
    public ApiResponse<Void> toggleAvailability(
            @PathVariable UUID id,
            @AuthenticationPrincipal User currentUser) {

        var restaurant = restaurantRepository.findByAdminUserId(currentUser.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Restaurant", "adminUserId", currentUser.getId()));

        menuItemService.toggleAvailability(id, restaurant.getId());
        return ApiResponse.success("Menu item availability toggled", null);
    }

    // Image upload endpoints are available in ImageUploadController:
    // - POST /api/v1/admin/images/menu/{menuItemId} - Upload menu item image
    // - DELETE /api/v1/admin/images/menu/{menuItemId}/{imageIndex} - Delete menu item image
}
