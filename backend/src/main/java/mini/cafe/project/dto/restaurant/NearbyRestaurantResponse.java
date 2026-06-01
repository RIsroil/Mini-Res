package mini.cafe.project.dto.restaurant;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class NearbyRestaurantResponse {

    private UUID id;
    private String slug;
    private String name;
    private String logoUrl;
    private String address;
    private String city;
    private Boolean isPremium;
    private String globalPromotionText;
    private Double distance; // in kilometers
}
