package mini.cafe.project.controller.admin;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import mini.cafe.project.dto.common.ApiResponse;
import mini.cafe.project.dto.restaurant.RestaurantRequest;
import mini.cafe.project.dto.restaurant.RestaurantResponse;
import mini.cafe.project.exception.ResourceNotFoundException;
import mini.cafe.project.repository.RestaurantRepository;
import mini.cafe.project.domain.User;
import mini.cafe.project.service.restaurant.RestaurantService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/admin/restaurant")
@RequiredArgsConstructor
public class RestaurantAdminController {

    private final RestaurantService restaurantService;
    private final RestaurantRepository restaurantRepository;

    @GetMapping
    public ApiResponse<RestaurantResponse> getMyRestaurant(
            @AuthenticationPrincipal User currentUser) {

        var restaurant = restaurantRepository.findByAdminUserId(currentUser.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Restaurant", "adminUserId", currentUser.getId()));

        // Use admin method to get restaurant regardless of status (PENDING/BLOCKED/ACTIVE)
        RestaurantResponse response = restaurantService.getByIdForAdmin(restaurant.getId());
        return ApiResponse.success(response);
    }

    @PostMapping
    public ResponseEntity<ApiResponse<RestaurantResponse>> createRestaurant(
            @Valid @RequestBody RestaurantRequest request,
            @AuthenticationPrincipal User currentUser) {

        RestaurantResponse response = restaurantService.createRestaurant(request, currentUser.getId());
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(ApiResponse.success("Restaurant created successfully. Pending approval.", response));
    }

    @PutMapping
    public ApiResponse<RestaurantResponse> updateRestaurant(
            @Valid @RequestBody RestaurantRequest request,
            @AuthenticationPrincipal User currentUser) {

        var restaurant = restaurantRepository.findByAdminUserId(currentUser.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Restaurant", "adminUserId", currentUser.getId()));

        RestaurantResponse response = restaurantService.updateRestaurant(restaurant.getId(), request);
        return ApiResponse.success("Restaurant updated successfully", response);
    }

    @DeleteMapping
    public ApiResponse<Void> deleteRestaurant(@AuthenticationPrincipal User currentUser) {
        var restaurant = restaurantRepository.findByAdminUserId(currentUser.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Restaurant", "adminUserId", currentUser.getId()));

        restaurantService.deleteRestaurant(restaurant.getId());
        return ApiResponse.success("Restaurant deleted successfully", null);
    }

    // Image upload endpoints are available in ImageUploadController:
    // - POST /api/v1/admin/images/restaurant/logo - Upload restaurant logo
    // - POST /api/v1/admin/images/restaurant/cover - Upload restaurant cover image
    //
    // Promotion and working hours can be updated via PUT /api/v1/admin/restaurant (updateRestaurant method)
}
