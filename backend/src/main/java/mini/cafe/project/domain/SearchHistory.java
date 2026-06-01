package mini.cafe.project.domain;

import jakarta.persistence.*;
import lombok.*;
import org.locationtech.jts.geom.Point;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "search_history", indexes = {
        @Index(name = "idx_search_history_query", columnList = "search_query"),
        @Index(name = "idx_search_history_date", columnList = "searched_at"),
        @Index(name = "idx_search_history_restaurant", columnList = "restaurant_id")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SearchHistory {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "search_query", nullable = false, length = 255)
    private String searchQuery;

    @Enumerated(EnumType.STRING)
    @Column(name = "search_type", length = 20)
    private SearchType searchType;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "restaurant_id")
    private Restaurant restaurant;

    @Column(name = "results_count")
    @Builder.Default
    private Integer resultsCount = 0;

    // Anonymous user info
    @Column(name = "ip_address", length = 45)
    private String ipAddress;

    @Column(name = "user_location", columnDefinition = "geography(Point, 4326)")
    private Point userLocation;

    @Column(name = "searched_at", nullable = false)
    @Builder.Default
    private LocalDateTime searchedAt = LocalDateTime.now();

    public enum SearchType {
        GLOBAL,
        RESTAURANT_SPECIFIC,
        NEARBY
    }
}
