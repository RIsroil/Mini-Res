package mini.cafe.project.utils;

import lombok.extern.log4j.Log4j2;


import java.io.IOException;
import java.net.HttpURLConnection;
import java.net.URL;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Log4j2
public class LocationUtils {

    /**
     * Extract coordinates from Google Maps or Yandex Maps link
     * Supported formats:
     * - https://maps.google.com/?q=41.311081,69.240562
     * - https://www.google.com/maps?q=41.311081,69.240562
     * - https://www.google.com/maps/place/41.311081,69.240562
     * - https://www.google.com/maps/@41.311081,69.240562,15z
     * - https://maps.app.goo.gl/xxxxx (shortened URL - will be expanded automatically)
     * - https://www.google.com/maps/place/HJ59+X6Q/@41.5600378,60.6169576,475m
     * - https://yandex.com/maps/?ll=69.240562,41.311081
     * - https://yandex.uz/maps/?ll=69.240562,41.311081
     */
    public static Coordinates extractCoordinatesFromLink(String addressLink) {
        if (addressLink == null || addressLink.trim().isEmpty()) {
            throw ApiException.badRequest("address.link.cannot.be.empty");
        }

        addressLink = addressLink.trim();

        // Validate that it's a proper map link
        if (!isValidMapLink(addressLink)) {
            throw ApiException.badRequest("invalid.map.link.format");
        }

        // If it's a shortened URL, expand it first
        if (addressLink.contains("goo.gl") || addressLink.contains("maps.app.goo.gl")) {
            log.info("Detected shortened URL, expanding: {}", addressLink);
            addressLink = expandShortenedUrl(addressLink);
            log.info("Expanded URL: {}", addressLink);
        }

        try {
            // Pattern 1: /search/lat,+lng or /search/lat,lng (Google Maps search format)
            Pattern searchPattern = Pattern.compile("/search/(-?\\d+\\.\\d+),\\s*\\+?(-?\\d+\\.\\d+)");
            Matcher matcher = searchPattern.matcher(addressLink);
            if (matcher.find()) {
                double latitude = Double.parseDouble(matcher.group(1));
                double longitude = Double.parseDouble(matcher.group(2));
                validateCoordinates(latitude, longitude);
                log.info("Extracted coordinates using search pattern: {}, {}", latitude, longitude);
                return new Coordinates(latitude, longitude);
            }

            // Pattern 2: ?q=lat,lng or &q=lat,lng
            Pattern googlePattern1 = Pattern.compile("[?&]q=(-?\\d+\\.\\d+),\\s*\\+?(-?\\d+\\.\\d+)");
            matcher = googlePattern1.matcher(addressLink);
            if (matcher.find()) {
                double latitude = Double.parseDouble(matcher.group(1));
                double longitude = Double.parseDouble(matcher.group(2));
                validateCoordinates(latitude, longitude);
                log.info("Extracted coordinates using pattern 1 (q=lat,lng): {}, {}", latitude, longitude);
                return new Coordinates(latitude, longitude);
            }

            // Pattern 3: @lat,lng (most common in detailed Google Maps URLs)
            // This pattern matches @lat,lng followed by optional zoom/data
            Pattern googlePattern2 = Pattern.compile("@(-?\\d+\\.\\d+),\\s*\\+?(-?\\d+\\.\\d+)");
            matcher = googlePattern2.matcher(addressLink);
            if (matcher.find()) {
                double latitude = Double.parseDouble(matcher.group(1));
                double longitude = Double.parseDouble(matcher.group(2));
                validateCoordinates(latitude, longitude);
                log.info("Extracted coordinates using pattern 2 (@lat,lng): {}, {}", latitude, longitude);
                return new Coordinates(latitude, longitude);
            }

            // Pattern 4: /place/lat,lng or /lat,lng
            Pattern googlePattern3 = Pattern.compile("/(?:place/)?(-?\\d+\\.\\d+),\\s*\\+?(-?\\d+\\.\\d+)");
            matcher = googlePattern3.matcher(addressLink);
            if (matcher.find()) {
                double latitude = Double.parseDouble(matcher.group(1));
                double longitude = Double.parseDouble(matcher.group(2));
                validateCoordinates(latitude, longitude);
                log.info("Extracted coordinates using pattern 3 (/place/lat,lng): {}, {}", latitude, longitude);
                return new Coordinates(latitude, longitude);
            }

            // Pattern 5: Yandex Maps - ll=lng,lat (note: Yandex uses longitude first!)
            Pattern yandexPattern = Pattern.compile("[?&]ll=(-?\\d+\\.\\d+),\\s*\\+?(-?\\d+\\.\\d+)");
            matcher = yandexPattern.matcher(addressLink);
            if (matcher.find()) {
                double longitude = Double.parseDouble(matcher.group(1));
                double latitude = Double.parseDouble(matcher.group(2));
                validateCoordinates(latitude, longitude);
                log.info("Extracted coordinates using Yandex pattern (ll=lng,lat): {}, {}", latitude, longitude);
                return new Coordinates(latitude, longitude);
            }

            throw ApiException.badRequest("could.not.extract.coordinates.from.link");

        } catch (NumberFormatException e) {
            log.error("Invalid coordinate format in link: {}", addressLink, e);
            throw ApiException.badRequest("invalid.coordinate.format.in.link");
        }
    }

    /**
     * Expand shortened goo.gl URL to full URL by following HTTP redirects
     */
    private static String expandShortenedUrl(String shortenedUrl) {
        try {
            URL url = new URL(shortenedUrl);
            HttpURLConnection connection = (HttpURLConnection) url.openConnection();
            connection.setInstanceFollowRedirects(false);
            connection.setRequestMethod("GET");
            connection.setConnectTimeout(5000);
            connection.setReadTimeout(5000);
            connection.setRequestProperty("User-Agent", "Mozilla/5.0");

            connection.connect();

            int responseCode = connection.getResponseCode();

            // Follow redirects manually to get the final URL
            if (responseCode == HttpURLConnection.HTTP_MOVED_PERM ||
                    responseCode == HttpURLConnection.HTTP_MOVED_TEMP ||
                    responseCode == HttpURLConnection.HTTP_SEE_OTHER ||
                    responseCode == 307 || responseCode == 308) {

                String redirectUrl = connection.getHeaderField("Location");
                connection.disconnect();

                if (redirectUrl != null && !redirectUrl.isEmpty()) {
                    log.info("Redirect found: {}", redirectUrl);
                    // Follow one more redirect if needed
                    if (redirectUrl.contains("goo.gl")) {
                        return expandShortenedUrl(redirectUrl);
                    }
                    return redirectUrl;
                }
            }

            connection.disconnect();
            throw ApiException.badRequest("failed.to.expand.shortened.url");

        } catch (IOException e) {
            log.error("Error expanding shortened URL: {}", shortenedUrl, e);
            throw ApiException.badRequest("failed.to.expand.shortened.url");
        }
    }

    /**
     * Validate that the link is from a supported map service
     */
    private static boolean isValidMapLink(String link) {
        String lowerLink = link.toLowerCase();
        return lowerLink.contains("maps.google.com") ||
                lowerLink.contains("google.com/maps") ||
                lowerLink.contains("maps.app.goo.gl") ||
                lowerLink.contains("goo.gl/maps") ||
                lowerLink.contains("yandex.com/maps") ||
                lowerLink.contains("yandex.uz/maps");
    }

    /**
     * Validate that coordinates are within valid ranges
     */
    private static void validateCoordinates(double latitude, double longitude) {
        if (latitude < -90 || latitude > 90) {
            throw ApiException.badRequest("invalid.latitude.value");
        }
        if (longitude < -180 || longitude > 180) {
            throw ApiException.badRequest("invalid.longitude.value");
        }

        // Optional: Add specific validation for Uzbekistan region
        // Uzbekistan approximate bounds: lat 37-46, lng 56-73
        if (latitude < 36 || latitude > 47 || longitude < 55 || longitude > 74) {
            log.warn("Coordinates outside Uzbekistan region: lat={}, lng={}", latitude, longitude);
            // Not throwing error, just logging warning
        }
    }

    public static class Coordinates {
        private final double latitude;
        private final double longitude;

        public Coordinates(double latitude, double longitude) {
            this.latitude = latitude;
            this.longitude = longitude;
        }

        public double getLatitude() {
            return latitude;
        }

        public double getLongitude() {
            return longitude;
        }
    }
}
