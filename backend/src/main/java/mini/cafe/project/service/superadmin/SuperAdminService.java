package mini.cafe.project.service.superadmin;

import lombok.RequiredArgsConstructor;
import mini.cafe.project.domain.Restaurant;
import mini.cafe.project.domain.User;
import mini.cafe.project.dto.common.LocationDto;
import mini.cafe.project.dto.restaurant.RestaurantResponse;
import mini.cafe.project.dto.restaurant.WorkingHour;
import mini.cafe.project.exception.BusinessException;
import mini.cafe.project.exception.ResourceNotFoundException;
import mini.cafe.project.repository.RestaurantRepository;
import mini.cafe.project.repository.UserRepository;
import mini.cafe.project.util.GeoUtils;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class SuperAdminService {

    private final RestaurantRepository restaurantRepository;
    private final UserRepository userRepository;

    @Transactional(readOnly = true)
    public Page<Restaurant> getAllRestaurants(Restaurant.RestaurantStatus status, Pageable pageable) {
        if (status != null) {
            return restaurantRepository.findByStatus(status, pageable);
        }
        return restaurantRepository.findAllActive(pageable);
    }

    @Transactional(readOnly = true)
    public List<RestaurantResponse> getAllRestaurantsList(Restaurant.RestaurantStatus status) {
        List<Restaurant> restaurants;
        if (status != null) {
            restaurants = restaurantRepository.findByStatus(status);
        } else {
            restaurants = restaurantRepository.findAll();
        }
        return restaurants.stream()
                .map(this::toRestaurantResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<RestaurantResponse> getPendingRestaurants() {
        return restaurantRepository.findByStatus(Restaurant.RestaurantStatus.PENDING).stream()
                .map(this::toRestaurantResponse)
                .toList();

    }

    @Transactional(readOnly = true)
    public Map<String, Long> getRestaurantStatistics() {
        long total = restaurantRepository.count();
        long active = restaurantRepository.countByStatus(Restaurant.RestaurantStatus.ACTIVE);
        long pending = restaurantRepository.countByStatus(Restaurant.RestaurantStatus.PENDING);
        long blocked = restaurantRepository.countByStatus(Restaurant.RestaurantStatus.BLOCKED);

        Map<String, Long> stats = new HashMap<>();
        stats.put("total", total);
        stats.put("active", active);
        stats.put("pending", pending);
        stats.put("blocked", blocked);

        return stats;
    }
    private RestaurantResponse toRestaurantResponse(Restaurant restaurant) {
        Map<String, WorkingHour> workingHourDtos = new HashMap<>();
        if (restaurant.getWorkingHours() != null) {
            restaurant.getWorkingHours().forEach((day, hour) -> {
                WorkingHour dto = WorkingHour.builder()
                        .open(hour.getOpen())
                        .close(hour.getClose())
                        .closed(hour.getClosed())
                        .build();
                workingHourDtos.put(day, dto);
            });
        }

        LocationDto location = null;
        if (restaurant.getLocation() != null) {
            location = LocationDto.builder()
                    .latitude(GeoUtils.getLatitudeFromPoint(restaurant.getLocation()))
                    .longitude(GeoUtils.getLongitudeFromPoint(restaurant.getLocation()))
                    .build();
        }

        return RestaurantResponse.builder()
                .id(restaurant.getId())
                .slug(restaurant.getSlug())
                .name(restaurant.getName())
                .phone(restaurant.getPhone())
                .email(restaurant.getEmail())
                .description(restaurant.getDescription())
                .logoUrl(restaurant.getLogoUrl())
                .coverImageUrl(restaurant.getCoverImageUrl())
                .address(restaurant.getAddress())
                .city(restaurant.getCity())
                .country(restaurant.getCountry())
                .location(location)
                .addressUrl((restaurant.getAddressUrl()))
                .instagramUrl(restaurant.getInstagramUrl())
                .facebookUrl(restaurant.getFacebookUrl())
                .websiteUrl(restaurant.getWebsiteUrl())
                .workingHours(workingHourDtos)
                .status(restaurant.getStatus().name())
                .isPremium(restaurant.getIsPremium())
                .globalPromotionText(restaurant.getGlobalPromotionText())
                .promotionActive(restaurant.getPromotionActive())
                .qrCodeUrl(restaurant.getQrCodeUrl())
                .build();
    }
    @Transactional
    public void approveRestaurant(UUID restaurantId) {
        Restaurant restaurant = restaurantRepository.findById(restaurantId)
                .orElseThrow(() -> new ResourceNotFoundException("Restaurant", "id", restaurantId));

        if (restaurant.getStatus() != Restaurant.RestaurantStatus.PENDING) {
            throw new BusinessException("Only pending restaurants can be approved");
        }

        restaurant.approve();
        restaurantRepository.save(restaurant);
    }

    @Transactional
    public void blockRestaurant(UUID restaurantId, String reason) {
        Restaurant restaurant = restaurantRepository.findById(restaurantId)
                .orElseThrow(() -> new ResourceNotFoundException("Restaurant", "id", restaurantId));

        restaurant.block();
        restaurantRepository.save(restaurant);

        // TODO: Send notification to restaurant admin about blocking
    }

    @Transactional
    public void unblockRestaurant(UUID restaurantId) {
        Restaurant restaurant = restaurantRepository.findById(restaurantId)
                .orElseThrow(() -> new ResourceNotFoundException("Restaurant", "id", restaurantId));

        if (restaurant.getStatus() != Restaurant.RestaurantStatus.BLOCKED) {
            throw new BusinessException("Only blocked restaurants can be unblocked");
        }

        restaurant.setStatus(Restaurant.RestaurantStatus.ACTIVE);
        restaurantRepository.save(restaurant);
    }

    @Transactional
    public void togglePremiumStatus(UUID restaurantId) {
        Restaurant restaurant = restaurantRepository.findById(restaurantId)
                .orElseThrow(() -> new ResourceNotFoundException("Restaurant", "id", restaurantId));

        restaurant.setIsPremium(!restaurant.getIsPremium());
        restaurantRepository.save(restaurant);
    }

    @Transactional
    public void setPremiumStatus(UUID restaurantId, boolean isPremium) {
        Restaurant restaurant = restaurantRepository.findById(restaurantId)
                .orElseThrow(() -> new ResourceNotFoundException("Restaurant", "id", restaurantId));

        restaurant.setIsPremium(isPremium);
        restaurantRepository.save(restaurant);
    }

    @Transactional
    public void deleteRestaurant(UUID restaurantId) {
        Restaurant restaurant = restaurantRepository.findById(restaurantId)
                .orElseThrow(() -> new ResourceNotFoundException("Restaurant", "id", restaurantId));

        // Soft delete
        restaurant.softDelete();
        restaurantRepository.save(restaurant);
    }

    // ==================== USER MANAGEMENT ====================

    @Transactional(readOnly = true)
    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    @Transactional(readOnly = true)
    public Map<String, Long> getUserStatistics() {
        long total = userRepository.count();
        long admins = userRepository.countByRole(User.UserRole.RESTAURANT_ADMIN);
        long superAdmins = userRepository.countByRole(User.UserRole.SUPER_ADMIN);
        long active = userRepository.countByIsActive(true);

        Map<String, Long> stats = new HashMap<>();
        stats.put("total", total);
        stats.put("admins", admins);
        stats.put("superAdmins", superAdmins);
        stats.put("active", active);

        return stats;
    }

    @Transactional
    public void toggleUserActiveStatus(UUID userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));

        if (user.getRole() == User.UserRole.SUPER_ADMIN) {
            throw new BusinessException("Cannot modify super admin status");
        }

        user.setIsActive(!user.getIsActive());
        userRepository.save(user);
    }
}
