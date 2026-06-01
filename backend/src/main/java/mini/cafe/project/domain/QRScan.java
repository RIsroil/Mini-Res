package mini.cafe.project.domain;

import jakarta.persistence.*;
import lombok.*;
import org.locationtech.jts.geom.Point;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "qr_scans", indexes = {
        @Index(name = "idx_qr_scans_restaurant", columnList = "restaurant_id"),
        @Index(name = "idx_qr_scans_date", columnList = "scanned_at")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class QRScan {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "restaurant_id", nullable = false)
    private Restaurant restaurant;

    // Anonymous user info
    @Column(name = "ip_address", length = 45)
    private String ipAddress;

    @Column(name = "user_agent", columnDefinition = "TEXT")
    private String userAgent;

    @Enumerated(EnumType.STRING)
    @Column(name = "device_type", length = 50)
    private DeviceType deviceType;

    // Location
    @Column(name = "scan_location", columnDefinition = "geography(Point, 4326)")
    private Point scanLocation;

    @Column(name = "scanned_at", nullable = false)
    @Builder.Default
    private LocalDateTime scannedAt = LocalDateTime.now();

    public enum DeviceType {
        MOBILE,
        TABLET,
        DESKTOP,
        UNKNOWN
    }
}
