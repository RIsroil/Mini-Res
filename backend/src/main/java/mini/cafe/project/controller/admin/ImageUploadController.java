package mini.cafe.project.controller.admin;

import lombok.RequiredArgsConstructor;
import mini.cafe.project.domain.MenuItem;
import mini.cafe.project.dto.common.ApiResponse;
import mini.cafe.project.dto.common.ImageUploadResponse;
import mini.cafe.project.exception.BusinessException;
import mini.cafe.project.exception.ResourceNotFoundException;
import mini.cafe.project.repository.MenuItemRepository;
import mini.cafe.project.repository.RestaurantRepository;
import mini.cafe.project.domain.User;
import mini.cafe.project.service.storage.StorageService;
import org.springframework.http.MediaType;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/admin/images")
@RequiredArgsConstructor
public class ImageUploadController {

    private final StorageService storageService;
    private final RestaurantRepository restaurantRepository;
    private final MenuItemRepository menuItemRepository;

    @PostMapping(value = "/restaurant/logo", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ApiResponse<ImageUploadResponse> uploadRestaurantLogo(
            @RequestParam("file") MultipartFile file,
            @AuthenticationPrincipal User currentUser) throws IOException {

        var restaurant = restaurantRepository.findByAdminUserId(currentUser.getId())
                .orElseThrow(() -> new RuntimeException("Restaurant not found for this user"));

        // Delete old logo if exists
        if (restaurant.getLogoUrl() != null) {
            try {
                storageService.deleteImage(restaurant.getLogoUrl());
            } catch (Exception e) {
                // Log error but continue
            }
        }

        // Upload new logo
        String url = storageService.uploadImage(file, "logos");
        restaurant.setLogoUrl(url);
        restaurantRepository.save(restaurant);

        ImageUploadResponse response = ImageUploadResponse.builder()
                .url(url)
                .fileName(file.getOriginalFilename())
                .fileSize(file.getSize())
                .contentType(file.getContentType())
                .build();

        return ApiResponse.success("Logo uploaded successfully", response);
    }

    @PostMapping(value = "/restaurant/cover", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ApiResponse<ImageUploadResponse> uploadRestaurantCover(
            @RequestParam("file") MultipartFile file,
            @AuthenticationPrincipal User currentUser) throws IOException {

        var restaurant = restaurantRepository.findByAdminUserId(currentUser.getId())
                .orElseThrow(() -> new RuntimeException("Restaurant not found for this user"));

        // Delete old cover if exists
        if (restaurant.getCoverImageUrl() != null) {
            try {
                storageService.deleteImage(restaurant.getCoverImageUrl());
            } catch (Exception e) {
                // Log error but continue
            }
        }

        // Upload new cover
        String url = storageService.uploadImage(file, "covers");
        restaurant.setCoverImageUrl(url);
        restaurantRepository.save(restaurant);

        ImageUploadResponse response = ImageUploadResponse.builder()
                .url(url)
                .fileName(file.getOriginalFilename())
                .fileSize(file.getSize())
                .contentType(file.getContentType())
                .build();

        return ApiResponse.success("Cover image uploaded successfully", response);
    }

    @PostMapping(value = "/menu/{menuItemId}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ApiResponse<ImageUploadResponse> uploadMenuItemImage(
            @PathVariable UUID menuItemId,
            @RequestParam("file") MultipartFile file,
            @AuthenticationPrincipal User currentUser) throws IOException {

        MenuItem menuItem = menuItemRepository.findById(menuItemId)
                .orElseThrow(() -> new ResourceNotFoundException("MenuItem", "id", menuItemId));

        var restaurant = restaurantRepository.findByAdminUserId(currentUser.getId())
                .orElseThrow(() -> new RuntimeException("Restaurant not found for this user"));

        // Verify menu item belongs to user's restaurant
        if (!menuItem.getRestaurant().getId().equals(restaurant.getId())) {
            throw new BusinessException("Menu item does not belong to your restaurant");
        }

        // Upload image
        String url = storageService.uploadImage(file, "menu-items");

        // Add image to menu item (respects premium limits)
        menuItem.addImage(url);
        menuItemRepository.save(menuItem);

        ImageUploadResponse response = ImageUploadResponse.builder()
                .url(url)
                .fileName(file.getOriginalFilename())
                .fileSize(file.getSize())
                .contentType(file.getContentType())
                .build();

        return ApiResponse.success("Menu item image uploaded successfully", response);
    }

    @DeleteMapping("/menu/{menuItemId}/images/{index}")
    public ApiResponse<Void> deleteMenuItemImage(
            @PathVariable UUID menuItemId,
            @PathVariable int index,
            @AuthenticationPrincipal User currentUser) {

        MenuItem menuItem = menuItemRepository.findById(menuItemId)
                .orElseThrow(() -> new ResourceNotFoundException("MenuItem", "id", menuItemId));

        var restaurant = restaurantRepository.findByAdminUserId(currentUser.getId())
                .orElseThrow(() -> new RuntimeException("Restaurant not found for this user"));

        // Verify menu item belongs to user's restaurant
        if (!menuItem.getRestaurant().getId().equals(restaurant.getId())) {
            throw new BusinessException("Menu item does not belong to your restaurant");
        }

        // Get image URL before deletion
        if (menuItem.getImages() != null && index >= 0 && index < menuItem.getImages().size()) {
            String imageUrl = menuItem.getImages().get(index);

            // Delete from S3
            try {
                storageService.deleteImage(imageUrl);
            } catch (Exception e) {
                // Log error but continue with DB removal
            }

            // Remove from menu item
            menuItem.removeImage(index);
            menuItemRepository.save(menuItem);

            return ApiResponse.success("Image deleted successfully", null);
        }

        throw new BusinessException("Invalid image index");
    }
}
