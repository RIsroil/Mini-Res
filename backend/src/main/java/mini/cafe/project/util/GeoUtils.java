package mini.cafe.project.util;

import org.locationtech.jts.geom.Coordinate;
import org.locationtech.jts.geom.GeometryFactory;
import org.locationtech.jts.geom.Point;
import org.locationtech.jts.geom.PrecisionModel;

public class GeoUtils {

    private static final GeometryFactory geometryFactory =
            new GeometryFactory(new PrecisionModel(), 4326);

    public static Point createPoint(Double latitude, Double longitude) {
        if (latitude == null || longitude == null) {
            return null;
        }
        return geometryFactory.createPoint(new Coordinate(longitude, latitude));
    }

    public static double kmToMeters(double kilometers) {
        return kilometers * 1000;
    }

    public static double metersToKm(double meters) {
        return meters / 1000;
    }

    public static Double getLatitudeFromPoint(Point point) {
        return point != null ? point.getY() : null;
    }

    public static Double getLongitudeFromPoint(Point point) {
        return point != null ? point.getX() : null;
    }
}
