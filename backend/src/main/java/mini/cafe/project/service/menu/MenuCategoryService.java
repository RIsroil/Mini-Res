package mini.cafe.project.service.menu;

import lombok.RequiredArgsConstructor;
import mini.cafe.project.domain.MenuCategory;
import mini.cafe.project.domain.Restaurant;
import mini.cafe.project.dto.category.CategoryRequest;
import mini.cafe.project.dto.category.CategoryResponse;
import mini.cafe.project.exception.BusinessException;
import mini.cafe.project.exception.ResourceNotFoundException;
import mini.cafe.project.repository.MenuCategoryRepository;
import mini.cafe.project.repository.RestaurantRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class MenuCategoryService {

    private final MenuCategoryRepository categoryRepository;
    private final RestaurantRepository restaurantRepository;

    @Transactional(readOnly = true)
    public List<CategoryResponse> getRestaurantCategories(UUID restaurantId) {
        List<MenuCategory> categories = categoryRepository
                .findByRestaurantIdAndIsActiveTrueOrderByDisplayOrderAsc(restaurantId);

        return categories.stream()
                .map(this::toCategoryResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<CategoryResponse> getAllRestaurantCategoriesForAdmin(UUID restaurantId) {
        // For admin panel - return ALL categories including inactive ones
        // @Where annotation automatically filters soft-deleted records
        List<MenuCategory> categories = categoryRepository
                .findByRestaurantIdOrderByDisplayOrderAsc(restaurantId);

        return categories.stream()
                .map(this::toCategoryResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public CategoryResponse getById(UUID id) {
        MenuCategory category = categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("MenuCategory", "id", id));

        return toCategoryResponse(category);
    }

    @Transactional
    public CategoryResponse createCategory(UUID restaurantId, CategoryRequest request) {
        Restaurant restaurant = restaurantRepository.findById(restaurantId)
                .orElseThrow(() -> new ResourceNotFoundException("Restaurant", "id", restaurantId));

        // Get next display order
        Integer maxOrder = categoryRepository.findMaxDisplayOrder(restaurantId);
        int nextOrder = (maxOrder != null ? maxOrder : 0) + 1;

        MenuCategory category = MenuCategory.builder()
                .name(request.getName())
                .iconUrl(request.getIconUrl())
                .displayOrder(nextOrder)
                .isActive(true)
                .restaurant(restaurant)
                .build();

        category = categoryRepository.save(category);

        return toCategoryResponse(category);
    }

    @Transactional
    public CategoryResponse updateCategory(UUID id, CategoryRequest request, UUID restaurantId) {
        MenuCategory category = categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("MenuCategory", "id", id));

        // Verify ownership
        if (!category.getRestaurant().getId().equals(restaurantId)) {
            throw new BusinessException("Category does not belong to this restaurant");
        }

        category.setName(request.getName());
        category.setIconUrl(request.getIconUrl());

        category = categoryRepository.save(category);

        return toCategoryResponse(category);
    }

    @Transactional
    public void deleteCategory(UUID id, UUID restaurantId) {
        MenuCategory category = categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("MenuCategory", "id", id));

        // Verify ownership
        if (!category.getRestaurant().getId().equals(restaurantId)) {
            throw new BusinessException("Category does not belong to this restaurant");
        }

        // Check if category has active (non-soft-deleted) menu items
        long activeItemCount = category.getMenuItems().stream()
                .filter(item -> item.getDeletedAt() == null)
                .count();

        if (activeItemCount > 0) {
            throw new BusinessException("Cannot delete category with existing menu items");
        }

        category.softDelete();
        categoryRepository.save(category);
    }

    @Transactional
    public void reorderCategories(UUID restaurantId, List<UUID> categoryIds) {
        Restaurant restaurant = restaurantRepository.findById(restaurantId)
                .orElseThrow(() -> new ResourceNotFoundException("Restaurant", "id", restaurantId));

        // @Where annotation automatically filters soft-deleted categories
        List<MenuCategory> categories = categoryRepository.findByRestaurantIdOrderByDisplayOrderAsc(restaurantId);

        if (categories.size() != categoryIds.size()) {
            throw new BusinessException("Invalid category list");
        }

        // Update display order
        for (int i = 0; i < categoryIds.size(); i++) {
            UUID categoryId = categoryIds.get(i);
            MenuCategory category = categories.stream()
                    .filter(c -> c.getId().equals(categoryId))
                    .findFirst()
                    .orElseThrow(() -> new BusinessException("Category not found or doesn't belong to this restaurant"));

            category.setDisplayOrder(i + 1);
        }

        categoryRepository.saveAll(categories);
    }

    @Transactional
    public void toggleActive(UUID id, UUID restaurantId) {
        MenuCategory category = categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("MenuCategory", "id", id));

        // Verify ownership
        if (!category.getRestaurant().getId().equals(restaurantId)) {
            throw new BusinessException("Category does not belong to this restaurant");
        }

        category.setIsActive(!category.getIsActive());
        categoryRepository.save(category);
    }

    private CategoryResponse toCategoryResponse(MenuCategory category) {
        // Count only active (non-soft-deleted) menu items
        long activeMenuItemCount = category.getMenuItems().stream()
                .filter(item -> item.getDeletedAt() == null)
                .count();

        return CategoryResponse.builder()
                .id(category.getId())
                .name(category.getName())
                .displayOrder(category.getDisplayOrder())
                .iconUrl(category.getIconUrl())
                .isActive(category.getIsActive())
                .menuItemCount((int) activeMenuItemCount)
                .createdAt(category.getCreatedAt())
                .updatedAt(category.getUpdatedAt())
                .build();
    }
}
