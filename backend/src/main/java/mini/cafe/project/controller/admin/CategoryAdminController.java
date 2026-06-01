package mini.cafe.project.controller.admin;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import mini.cafe.project.dto.category.CategoryRequest;
import mini.cafe.project.dto.category.CategoryResponse;
import mini.cafe.project.dto.common.ApiResponse;
import mini.cafe.project.exception.ResourceNotFoundException;
import mini.cafe.project.repository.RestaurantRepository;
import mini.cafe.project.domain.User;
import mini.cafe.project.service.menu.MenuCategoryService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/admin/categories")
@RequiredArgsConstructor
public class CategoryAdminController {

    private final MenuCategoryService categoryService;
    private final RestaurantRepository restaurantRepository;

    @GetMapping
    public ApiResponse<List<CategoryResponse>> getMyCategories(
            @AuthenticationPrincipal User currentUser) {

        var restaurant = restaurantRepository.findByAdminUserId(currentUser.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Restaurant", "adminUserId", currentUser.getId()));

        // Use admin method to get ALL categories (including inactive)
        List<CategoryResponse> categories = categoryService.getAllRestaurantCategoriesForAdmin(restaurant.getId());
        return ApiResponse.success(categories);
    }

    @PostMapping
    public ResponseEntity<ApiResponse<CategoryResponse>> createCategory(
            @Valid @RequestBody CategoryRequest request,
            @AuthenticationPrincipal User currentUser) {

        var restaurant = restaurantRepository.findByAdminUserId(currentUser.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Restaurant", "adminUserId", currentUser.getId()));

        CategoryResponse response = categoryService.createCategory(restaurant.getId(), request);
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(ApiResponse.success("Category created successfully", response));
    }

    @PutMapping("/{id}")
    public ApiResponse<CategoryResponse> updateCategory(
            @PathVariable UUID id,
            @Valid @RequestBody CategoryRequest request,
            @AuthenticationPrincipal User currentUser) {

        var restaurant = restaurantRepository.findByAdminUserId(currentUser.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Restaurant", "adminUserId", currentUser.getId()));

        CategoryResponse response = categoryService.updateCategory(id, request, restaurant.getId());
        return ApiResponse.success("Category updated successfully", response);
    }

    @DeleteMapping("/{id}")
    public ApiResponse<Void> deleteCategory(
            @PathVariable UUID id,
            @AuthenticationPrincipal User currentUser) {

        var restaurant = restaurantRepository.findByAdminUserId(currentUser.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Restaurant", "adminUserId", currentUser.getId()));

        categoryService.deleteCategory(id, restaurant.getId());
        return ApiResponse.success("Category deleted successfully", null);
    }

    @PatchMapping("/reorder")
    public ApiResponse<Void> reorderCategories(
            @RequestBody List<UUID> categoryIds,
            @AuthenticationPrincipal User currentUser) {

        var restaurant = restaurantRepository.findByAdminUserId(currentUser.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Restaurant", "adminUserId", currentUser.getId()));

        categoryService.reorderCategories(restaurant.getId(), categoryIds);
        return ApiResponse.success("Categories reordered successfully", null);
    }

    @PatchMapping("/{id}/toggle-active")
    public ApiResponse<Void> toggleActive(
            @PathVariable UUID id,
            @AuthenticationPrincipal User currentUser) {

        var restaurant = restaurantRepository.findByAdminUserId(currentUser.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Restaurant", "adminUserId", currentUser.getId()));

        categoryService.toggleActive(id, restaurant.getId());
        return ApiResponse.success("Category status toggled", null);
    }
}
