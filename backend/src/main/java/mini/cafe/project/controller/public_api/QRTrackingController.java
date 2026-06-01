package mini.cafe.project.controller.public_api;

import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import mini.cafe.project.dto.common.ApiResponse;
import mini.cafe.project.service.qr.QRScanTrackingService;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/qr")
@RequiredArgsConstructor
public class QRTrackingController {

    private final QRScanTrackingService trackingService;

    @PostMapping("/track/{restaurantSlug}")
    public ApiResponse<Void> trackScan(
            @PathVariable String restaurantSlug,
            @RequestParam(required = false) Double lat,
            @RequestParam(required = false) Double lng,
            HttpServletRequest request) {

        String ipAddress = getClientIpAddress(request);
        String userAgent = request.getHeader("User-Agent");

        trackingService.trackScan(restaurantSlug, ipAddress, userAgent, lat, lng);

        return ApiResponse.success("Scan tracked", null);
    }

    private String getClientIpAddress(HttpServletRequest request) {
        String xForwardedFor = request.getHeader("X-Forwarded-For");
        if (xForwardedFor != null && !xForwardedFor.isEmpty()) {
            return xForwardedFor.split(",")[0].trim();
        }

        String xRealIp = request.getHeader("X-Real-IP");
        if (xRealIp != null && !xRealIp.isEmpty()) {
            return xRealIp;
        }

        return request.getRemoteAddr();
    }
}
