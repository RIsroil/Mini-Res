package mini.cafe.project.dto.menu;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import mini.cafe.project.dto.category.CategoryResponse;
import mini.cafe.project.dto.restaurant.RestaurantResponse;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PublicMenuResponse {
    private RestaurantResponse restaurant;
    private List<CategoryResponse> categories;
    private List<MenuItemResponse> menuItems;
}
