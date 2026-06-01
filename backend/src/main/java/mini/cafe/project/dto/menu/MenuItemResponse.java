package mini.cafe.project.dto.menu;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MenuItemResponse {

    private UUID id;
    private String name;
    private String description;
    private String ingredients;
    private BigDecimal price;
    private Integer preparationTimeMinutes;
    private String promotionText;
    private Boolean promotionActive;
    private Boolean isActive;
    private Boolean isAvailable;
    private Boolean hasPremiumBadge;
    private List<String> images;
    private String primaryImage;
    private UUID categoryId;
    private String categoryName;
    private UUID restaurantId;
    private String restaurantName;
    private String restaurantSlug;
}
