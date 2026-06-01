package mini.cafe.project.domain;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.annotations.SQLRestriction;
import org.hibernate.type.SqlTypes;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "menu_items", indexes = {
        @Index(name = "idx_menu_items_restaurant", columnList = "restaurant_id"),
        @Index(name = "idx_menu_items_category", columnList = "category_id"),
        @Index(name = "idx_menu_items_active", columnList = "is_active"),
        @Index(name = "idx_menu_items_available", columnList = "is_available")
})
@SQLRestriction("deleted_at IS NULL")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MenuItem extends BaseEntity {

    @Column(name = "name", nullable = false, length = 255)
    private String name;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @Column(name = "ingredients", columnDefinition = "TEXT")
    private String ingredients;

    @Column(name = "price", nullable = false, precision = 10, scale = 2)
    private BigDecimal price;

    @Column(name = "preparation_time_minutes")
    private Integer preparationTimeMinutes;

    // Promotion
    @Column(name = "promotion_text", columnDefinition = "TEXT")
    private String promotionText;

    @Column(name = "promotion_active")
    @Builder.Default
    private Boolean promotionActive = false;

    // Status
    @Column(name = "is_active")
    @Builder.Default
    private Boolean isActive = true;

    @Column(name = "is_available")
    @Builder.Default
    private Boolean isAvailable = true;

    // Premium
    @Column(name = "has_premium_badge")
    @Builder.Default
    private Boolean hasPremiumBadge = false;

    // Images (JSON array)
    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "images", columnDefinition = "jsonb")
    @Builder.Default
    private List<String> images = new ArrayList<>();

    // Relationships
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "restaurant_id", nullable = false)
    private Restaurant restaurant;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "category_id")
    private MenuCategory category;

    // Business Methods
    public void addImage(String imageUrl) {
        if (this.images == null) {
            this.images = new ArrayList<>();
        }

        // Check if restaurant is premium
        int maxImages = restaurant != null && Boolean.TRUE.equals(restaurant.getIsPremium()) ? 3 : 1;

        if (this.images.size() >= maxImages) {
            throw new IllegalStateException(
                    String.format("Maximum %d image(s) allowed for %s restaurants",
                            maxImages,
                            restaurant != null && Boolean.TRUE.equals(restaurant.getIsPremium()) ? "premium" : "standard")
            );
        }

        this.images.add(imageUrl);
    }

    public void removeImage(int index) {
        if (this.images != null && index >= 0 && index < this.images.size()) {
            this.images.remove(index);
        }
    }

    public String getPrimaryImage() {
        return images != null && !images.isEmpty() ? images.get(0) : null;
    }

    public boolean hasMultipleImages() {
        return images != null && images.size() > 1;
    }
}
