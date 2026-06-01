package mini.cafe.project.dto.restaurant;

import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RestaurantRequest {

    @NotBlank(message = "Name is required")
    @Size(max = 255, message = "Name must not exceed 255 characters")
    private String name;

    @Pattern(regexp = "^\\+?[1-9]\\d{1,14}$", message = "Invalid phone number")
    private String phone;

    @Email(message = "Invalid email format")
    private String email;

    @Size(max = 2000, message = "Description must not exceed 2000 characters")
    private String description;

    @NotBlank(message = "Address is required")
    private String address;

    @NotBlank(message = "City is required")
    private String city;

    @NotBlank(message = "Country is required")
    private String country;

//    @NotNull(message = "Latitude is required")
//    @DecimalMin(value = "-90.0", message = "Latitude must be >= -90")
//    @DecimalMax(value = "90.0", message = "Latitude must be <= 90")
//    private Double latitude;
//
//    @NotNull(message = "Longitude is required")
//    @DecimalMin(value = "-180.0", message = "Longitude must be >= -180")
//    @DecimalMax(value = "180.0", message = "Longitude must be <= 180")
//    private Double longitude;

    private String addressUrl;

    private String instagramUrl;
    private String facebookUrl;
    private String websiteUrl;

    @Valid
    private Map<String, WorkingHour> workingHours;

}
