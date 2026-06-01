package mini.cafe.project.dto.restaurant;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import mini.cafe.project.dto.common.LocationDto;

import java.util.Map;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RestaurantResponse {

    private UUID id;
    private String slug;
    private String name;
    private String phone;
    private String email;
    private String description;
    private String logoUrl;
    private String coverImageUrl;
    private String address;
    private String city;
    private String country;
    private LocationDto location;
    private String addressUrl;
    private String instagramUrl;
    private String facebookUrl;
    private String websiteUrl;
    private Map<String, WorkingHour> workingHours;
    private String status;
    private Boolean isPremium;
    private String globalPromotionText;
    private Boolean promotionActive;
    private String qrCodeUrl;

}
