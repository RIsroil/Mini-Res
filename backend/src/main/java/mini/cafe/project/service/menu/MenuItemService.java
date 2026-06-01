package mini.cafe.project.service.menu;

import lombok.RequiredArgsConstructor;
import mini.cafe.project.domain.MenuCategory;
import mini.cafe.project.domain.MenuItem;
import mini.cafe.project.domain.Restaurant;
import mini.cafe.project.dto.menu.MenuItemRequest;
import mini.cafe.project.dto.menu.MenuItemResponse;
import mini.cafe.project.exception.BusinessException;
import mini.cafe.project.exception.ResourceNotFoundException;
import mini.cafe.project.repository.MenuCategoryRepository;
import mini.cafe.project.repository.MenuItemRepository;
import mini.cafe.project.repository.RestaurantRepository;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class MenuItemService {

    private final MenuItemRepository menuItemRepository;
    private final RestaurantRepository restaurantRepository;
    private final MenuCategoryRepository menuCategoryRepository;

    @Transactional(readOnly = true)
    public List<MenuItemResponse> getRestaurantMenu(UUID restaurantId) {
        List<MenuItem> menuItems = menuItemRepository.findByRestaurantIdAndIsActiveTrue(restaurantId);
        return menuItems.stream()
                .map(this::toMenuItemResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public MenuItemResponse getById(UUID id) {
        MenuItem menuItem = menuItemRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("MenuItem", "id", id));

        if (!menuItem.getIsActive()) {
            throw new BusinessException("Menu item is not available");
        }

        return toMenuItemResponse(menuItem);
    }

    @Transactional
    public MenuItemResponse createMenuItem(UUID restaurantId, MenuItemRequest request) {
        Restaurant restaurant = restaurantRepository.findById(restaurantId)
                .orElseThrow(() -> new ResourceNotFoundException("Restaurant", "id", restaurantId));

        MenuCategory category = null;
        if (request.getCategoryId() != null) {
            category = menuCategoryRepository.findById(request.getCategoryId())
                    .orElseThrow(() -> new ResourceNotFoundException("MenuCategory", "id", request.getCategoryId()));

            if (!category.getRestaurant().getId().equals(restaurantId)) {
                throw new BusinessException("Category does not belong to this restaurant");
            }
        }

        MenuItem menuItem = MenuItem.builder()
                .name(request.getName())
                .description(request.getDescription())
                .ingredients(request.getIngredients())
                .price(request.getPrice())
                .preparationTimeMinutes(request.getPreparationTimeMinutes())
                .promotionText(request.getPromotionText())
                .promotionActive(request.getPromotionActive())
                .hasPremiumBadge(request.getHasPremiumBadge())
                .isActive(true)
                .isAvailable(true)
                .restaurant(restaurant)
                .category(category)
                .build();

        menuItem = menuItemRepository.save(menuItem);

        return toMenuItemResponse(menuItem);
    }

    @Transactional
    public MenuItemResponse updateMenuItem(UUID id, MenuItemRequest request, UUID restaurantId) {
        MenuItem menuItem = menuItemRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("MenuItem", "id", id));

        // Verify ownership
        if (!menuItem.getRestaurant().getId().equals(restaurantId)) {
            throw new BusinessException("Menu item does not belong to this restaurant");
        }

        // Only update category if categoryId is provided
        if (request.getCategoryId() != null) {
            MenuCategory category = menuCategoryRepository.findById(request.getCategoryId())
                    .orElseThrow(() -> new ResourceNotFoundException("MenuCategory", "id", request.getCategoryId()));

            if (!category.getRestaurant().getId().equals(restaurantId)) {
                throw new BusinessException("Category does not belong to this restaurant");
            }
            menuItem.setCategory(category);
        }

        menuItem.setName(request.getName());
        menuItem.setDescription(request.getDescription());
        menuItem.setIngredients(request.getIngredients());
        menuItem.setPrice(request.getPrice());
        menuItem.setPreparationTimeMinutes(request.getPreparationTimeMinutes());
        menuItem.setPromotionText(request.getPromotionText());
        menuItem.setPromotionActive(request.getPromotionActive());
        menuItem.setHasPremiumBadge(request.getHasPremiumBadge());

        menuItem = menuItemRepository.save(menuItem);

        return toMenuItemResponse(menuItem);
    }

    @Transactional
    public void deleteMenuItem(UUID id, UUID restaurantId) {
        MenuItem menuItem = menuItemRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("MenuItem", "id", id));

        // Verify ownership
        if (!menuItem.getRestaurant().getId().equals(restaurantId)) {
            throw new BusinessException("Menu item does not belong to this restaurant");
        }

        menuItem.softDelete();
        menuItemRepository.save(menuItem);
    }

    @Transactional
    public void toggleAvailability(UUID id, UUID restaurantId) {
        MenuItem menuItem = menuItemRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("MenuItem", "id", id));

        // Verify ownership
        if (!menuItem.getRestaurant().getId().equals(restaurantId)) {
            throw new BusinessException("Menu item does not belong to this restaurant");
        }

        menuItem.setIsAvailable(!menuItem.getIsAvailable());
        menuItemRepository.save(menuItem);
    }

    @Transactional(readOnly = true)
    public List<MenuItemResponse> getPopularMenuItems(int limit) {
        Pageable pageable = PageRequest.of(0, limit);
        List<MenuItem> menuItems = menuItemRepository.findPopularMenuItems(pageable);
        return menuItems.stream()
                .map(this::toMenuItemResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<MenuItemResponse> getLatestMenuItems(int limit) {
        Pageable pageable = PageRequest.of(0, limit);
        List<MenuItem> menuItems = menuItemRepository.findLatestMenuItems(pageable);
        return menuItems.stream()
                .map(this::toMenuItemResponse)
                .collect(Collectors.toList());
    }

    private MenuItemResponse toMenuItemResponse(MenuItem item) {
        return MenuItemResponse.builder()
                .id(item.getId())
                .name(item.getName())
                .description(item.getDescription())
                .ingredients(item.getIngredients())
                .price(item.getPrice())
                .preparationTimeMinutes(item.getPreparationTimeMinutes())
                .promotionText(item.getPromotionText())
                .promotionActive(item.getPromotionActive())
                .isActive(item.getIsActive())
                .isAvailable(item.getIsAvailable())
                .hasPremiumBadge(item.getHasPremiumBadge())
                .images(item.getImages())
                .primaryImage(item.getPrimaryImage())
                .categoryId(item.getCategory() != null ? item.getCategory().getId() : null)
                .categoryName(item.getCategory() != null ? item.getCategory().getName() : null)
                .restaurantId(item.getRestaurant().getId())
                .restaurantName(item.getRestaurant().getName())
                .restaurantSlug(item.getRestaurant().getSlug())
                .build();
    }
}
