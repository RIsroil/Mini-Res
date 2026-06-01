package mini.cafe.project.dto.menu;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MenuSearchResponse {

    private UUID id;
    private String name;
    private String description;
    private BigDecimal price;
    private Integer preparationTimeMinutes;
    private String primaryImage;
    private String promotionText;
    private Boolean isPremium;

    // Restaurant info
    private UUID restaurantId;
    private String restaurantName;
    private String restaurantSlug;
    private String restaurantLogo;

    // Distance (in kilometers)
    private Double distance;
}
