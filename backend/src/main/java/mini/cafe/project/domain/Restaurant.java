package mini.cafe.project.domain;

import jakarta.persistence.*;
import lombok.*;
import mini.cafe.project.dto.restaurant.WorkingHour;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;
import org.locationtech.jts.geom.Point;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Entity
@Table(name = "restaurants", indexes = {
        @Index(name = "idx_restaurants_slug", columnList = "slug"),
        @Index(name = "idx_restaurants_status", columnList = "status"),
        @Index(name = "idx_restaurants_admin_user", columnList = "admin_user_id")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Restaurant extends BaseEntity {

    @Column(name = "slug", nullable = false, unique = true, length = 255)
    private String slug;

    @Column(name = "name", nullable = false, length = 255)
    private String name;

    @Column(name = "phone", length = 20)
    private String phone;

    @Column(name = "email", length = 255)
    private String email;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @Column(name = "logo_url", length = 500)
    private String logoUrl;

    @Column(name = "cover_image_url", length = 500)
    private String coverImageUrl;

    // Address
    @Column(name = "address", columnDefinition = "TEXT")
    private String address;

    @Column(name = "city", length = 100)
    private String city;

    @Column(name = "country", length = 100)
    private String country;

    // PostGIS Location
    @Column(name = "location", columnDefinition = "geography(Point, 4326)")
    private Point location;

    private String addressUrl;

    // Social Media
    @Column(name = "instagram_url", length = 255)
    private String instagramUrl;

    @Column(name = "facebook_url", length = 255)
    private String facebookUrl;

    @Column(name = "website_url", length = 255)
    private String websiteUrl;

    // Working Hours (JSON)
    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "working_hours", columnDefinition = "jsonb")
    private Map<String, WorkingHour> workingHours;

    // Status
    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 20)
    @Builder.Default
    private RestaurantStatus status = RestaurantStatus.PENDING;

    @Column(name = "is_premium")
    @Builder.Default
    private Boolean isPremium = false;

    // Global Promotion
    @Column(name = "global_promotion_text", columnDefinition = "TEXT")
    private String globalPromotionText;

    @Column(name = "promotion_active")
    @Builder.Default
    private Boolean promotionActive = false;

    // QR Code
    @Column(name = "qr_code_url", length = 500)
    private String qrCodeUrl;

    // Relationships
    @OneToOne
    @JoinColumn(name = "admin_user_id", unique = true)
    private User adminUser;

    @OneToMany(mappedBy = "restaurant", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<MenuCategory> categories = new ArrayList<>();

    @OneToMany(mappedBy = "restaurant", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<MenuItem> menuItems = new ArrayList<>();

    @OneToMany(mappedBy = "restaurant", cascade = CascadeType.ALL)
    @Builder.Default
    private List<QRScan> qrScans = new ArrayList<>();

    // Business Methods
    public void approve() {
        this.status = RestaurantStatus.ACTIVE;
    }

    public void block() {
        this.status = RestaurantStatus.BLOCKED;
    }

    public void deactivate() {
        this.status = RestaurantStatus.INACTIVE;
    }

    public boolean isActive() {
        return this.status == RestaurantStatus.ACTIVE;
    }

    // Enums
    public enum RestaurantStatus {
        PENDING,
        ACTIVE,
        BLOCKED,
        INACTIVE
    }

}
