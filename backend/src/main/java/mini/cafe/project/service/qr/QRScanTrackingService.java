package mini.cafe.project.service.qr;

import lombok.RequiredArgsConstructor;
import mini.cafe.project.domain.QRScan;
import mini.cafe.project.domain.Restaurant;
import mini.cafe.project.exception.ResourceNotFoundException;
import mini.cafe.project.repository.QRScanRepository;
import mini.cafe.project.repository.RestaurantRepository;
import mini.cafe.project.util.GeoUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class QRScanTrackingService {

    private static final Logger logger = LoggerFactory.getLogger(QRScanTrackingService.class);

    private final QRScanRepository qrScanRepository;
    private final RestaurantRepository restaurantRepository;

    @Transactional
    public void trackScan(String restaurantSlug, String ipAddress, String userAgent,
                          Double latitude, Double longitude) {

        Restaurant restaurant = restaurantRepository.findBySlug(restaurantSlug)
                .orElseThrow(() -> new ResourceNotFoundException("Restaurant", "slug", restaurantSlug));

        QRScan.DeviceType deviceType = detectDeviceType(userAgent);

        QRScan scan = QRScan.builder()
                .restaurant(restaurant)
                .ipAddress(ipAddress)
                .userAgent(userAgent)
                .deviceType(deviceType)
                .scanLocation(latitude != null && longitude != null
                        ? GeoUtils.createPoint(latitude, longitude)
                        : null)
                .build();

        qrScanRepository.save(scan);

        logger.info("QR scan tracked for restaurant: {} from device: {}", restaurantSlug, deviceType);
    }

    @Transactional
    public void trackScanById(UUID restaurantId, String ipAddress, String userAgent,
                              Double latitude, Double longitude) {

        Restaurant restaurant = restaurantRepository.findById(restaurantId)
                .orElseThrow(() -> new ResourceNotFoundException("Restaurant", "id", restaurantId));

        QRScan.DeviceType deviceType = detectDeviceType(userAgent);

        QRScan scan = QRScan.builder()
                .restaurant(restaurant)
                .ipAddress(ipAddress)
                .userAgent(userAgent)
                .deviceType(deviceType)
                .scanLocation(latitude != null && longitude != null
                        ? GeoUtils.createPoint(latitude, longitude)
                        : null)
                .build();

        qrScanRepository.save(scan);

        logger.info("QR scan tracked for restaurant ID: {}", restaurantId);
    }

    private QRScan.DeviceType detectDeviceType(String userAgent) {
        if (userAgent == null || userAgent.isEmpty()) {
            return QRScan.DeviceType.UNKNOWN;
        }

        String ua = userAgent.toLowerCase();

        if (ua.contains("mobile") || ua.contains("android") || ua.contains("iphone")) {
            return QRScan.DeviceType.MOBILE;
        } else if (ua.contains("tablet") || ua.contains("ipad")) {
            return QRScan.DeviceType.TABLET;
        } else {
            return QRScan.DeviceType.DESKTOP;
        }
    }
}
