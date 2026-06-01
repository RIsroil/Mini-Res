package mini.cafe.project.service.restaurant;

import lombok.RequiredArgsConstructor;
import mini.cafe.project.domain.Restaurant;
import mini.cafe.project.domain.User;
import mini.cafe.project.dto.common.LocationDto;
import mini.cafe.project.dto.restaurant.RestaurantRequest;
import mini.cafe.project.dto.restaurant.RestaurantResponse;
import mini.cafe.project.dto.restaurant.WorkingHour;
import mini.cafe.project.exception.BusinessException;
import mini.cafe.project.exception.ResourceNotFoundException;
import mini.cafe.project.repository.RestaurantRepository;
import mini.cafe.project.repository.UserRepository;
import mini.cafe.project.service.qr.QRCodeService;
import mini.cafe.project.util.GeoUtils;
import mini.cafe.project.util.SlugUtils;
import mini.cafe.project.utils.LocationUtils;
import org.locationtech.jts.geom.Coordinate;
import org.locationtech.jts.geom.GeometryFactory;
import org.locationtech.jts.geom.PrecisionModel;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class RestaurantService {

    private final RestaurantRepository restaurantRepository;
    private final UserRepository userRepository;
    private final QRCodeService qrCodeService;
    private static final GeometryFactory GEO_FACTORY =
            new GeometryFactory(new PrecisionModel(), 4326);

    @Transactional(readOnly = true)
    public RestaurantResponse getBySlug(String slug) {
        Restaurant restaurant = restaurantRepository.findBySlug(slug)
                .orElseThrow(() -> new ResourceNotFoundException("Restaurant", "slug", slug));

        if (!restaurant.isActive()) {
            throw new BusinessException("Restaurant is not available");
        }

        return toRestaurantResponse(restaurant);
    }

    @Transactional(readOnly = true)
    public RestaurantResponse getByIdForAdmin(UUID restaurantId) {
        // For admin access - no status check, admins can view even PENDING/BLOCKED restaurants
        Restaurant restaurant = restaurantRepository.findById(restaurantId)
                .orElseThrow(() -> new ResourceNotFoundException("Restaurant", "id", restaurantId));

        return toRestaurantResponse(restaurant);
    }

    @Transactional
    public RestaurantResponse createRestaurant(RestaurantRequest request, UUID userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));

        // Check if user already has a restaurant
        if (restaurantRepository.findByAdminUserId(userId).isPresent()) {
            throw new BusinessException("User already has a restaurant");
        }

        // Generate unique slug
        String slug = generateUniqueSlug(request.getName());

        // Convert working hours DTO to entity format
        Map<String, WorkingHour> workingHours = convertWorkingHours(request.getWorkingHours());
        LocationUtils.Coordinates coords = LocationUtils.extractCoordinatesFromLink(request.getAddressUrl());

        Restaurant restaurant = Restaurant.builder()
                .slug(slug)
                .name(request.getName())
                .phone(request.getPhone())
                .email(request.getEmail())
                .description(request.getDescription())
                .address(request.getAddress())
                .city(request.getCity())
                .country(request.getCountry())
//                .location(GEO_FACTORY.createPoint(new Coordinate(coords.getLongitude(), coords.getLatitude())))
                .addressUrl(request.getAddressUrl())
                .instagramUrl(request.getInstagramUrl())
                .facebookUrl(request.getFacebookUrl())
                .websiteUrl(request.getWebsiteUrl())
                .workingHours(workingHours)
                .status(Restaurant.RestaurantStatus.PENDING)
                .isPremium(false)
                .adminUser(user)
                .build();

        applyCoordinates(restaurant, coords);
        restaurant = restaurantRepository.save(restaurant);

        // Generate QR code
        String qrCodeUrl = qrCodeService.generateQRCode(restaurant.getSlug());
        restaurant.setQrCodeUrl(qrCodeUrl);
        restaurant = restaurantRepository.save(restaurant);

        return toRestaurantResponse(restaurant);
    }

    @Transactional
    public RestaurantResponse updateRestaurant(UUID restaurantId, RestaurantRequest request) {
        Restaurant restaurant = restaurantRepository.findById(restaurantId)
                .orElseThrow(() -> new ResourceNotFoundException("Restaurant", "id", restaurantId));
        if (hasText(request.getAddressUrl())) {
            applyCoordinates(restaurant, LocationUtils.extractCoordinatesFromLink(request.getAddressUrl()));
        }
        restaurant.setName(request.getName());
        restaurant.setPhone(request.getPhone());
        restaurant.setEmail(request.getEmail());
        restaurant.setDescription(request.getDescription());
        restaurant.setAddress(request.getAddress());
        restaurant.setCity(request.getCity());
        restaurant.setCountry(request.getCountry());
        restaurant.setInstagramUrl(request.getInstagramUrl());
        restaurant.setFacebookUrl(request.getFacebookUrl());
        restaurant.setWebsiteUrl(request.getWebsiteUrl());
        restaurant.setWorkingHours(convertWorkingHours(request.getWorkingHours()));

        restaurant = restaurantRepository.save(restaurant);

        return toRestaurantResponse(restaurant);
    }

    @Transactional
    public void deleteRestaurant(UUID restaurantId) {
        Restaurant restaurant = restaurantRepository.findById(restaurantId)
                .orElseThrow(() -> new ResourceNotFoundException("Restaurant", "id", restaurantId));

        // Soft delete
        restaurant.softDelete();
        restaurantRepository.save(restaurant);
    }
    private void applyCoordinates(Restaurant restaurant, LocationUtils.Coordinates coords) {
        restaurant.setLocation(GEO_FACTORY.createPoint(
                new Coordinate(coords.getLongitude(), coords.getLatitude())
        ));
    }
    private boolean hasText(String s) {
        return s != null && !s.isBlank();
    }
    private String generateUniqueSlug(String name) {
        String baseSlug = SlugUtils.toSlug(name);
        String slug = baseSlug;
        int suffix = 0;

        while (restaurantRepository.existsBySlug(slug)) {
            suffix++;
            slug = SlugUtils.toUniqueSlug(baseSlug, suffix);
        }

        return slug;
    }

    private Map<String, WorkingHour> convertWorkingHours(
            Map<String, WorkingHour> dtoHours) {
        if (dtoHours == null) {
            return new HashMap<>();
        }

        Map<String, WorkingHour> entityHours = new HashMap<>();
        dtoHours.forEach((day, dto) -> {
            WorkingHour hour = new WorkingHour();
            hour.setOpen(dto.getOpen());
            hour.setClose(dto.getClose());
            hour.setClosed(dto.getClosed());
            entityHours.put(day, hour);
        });

        return entityHours;
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
}
