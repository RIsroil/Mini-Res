package mini.cafe.project.dto.restaurant;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RestaurantUpdateRequest {

    private String name;

    private String phone;

    private String email;

    private String description;

    private String address;

    private String city;

    private String country;

    private String addressUrl;

    private String instagramUrl;
    private String facebookUrl;
    private String websiteUrl;

    private Map<String, WorkingHour> workingHours;

}
