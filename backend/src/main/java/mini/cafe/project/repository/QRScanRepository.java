package mini.cafe.project.repository;

import mini.cafe.project.domain.QRScan;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Repository
public interface QRScanRepository extends JpaRepository<QRScan, UUID> {

    Long countByRestaurantId(UUID restaurantId);

    Long countByRestaurantIdAndScannedAtBetween(UUID restaurantId, LocalDateTime start, LocalDateTime end);

    @Query("SELECT COUNT(q) FROM QRScan q WHERE q.scannedAt >= :date")
    Long countSince(@Param("date") LocalDateTime date);

    @Query("""
            SELECT q.deviceType, COUNT(q) as count
            FROM QRScan q
            WHERE q.restaurant.id = :restaurantId
            AND q.scannedAt BETWEEN :start AND :end
            GROUP BY q.deviceType
            """)
    List<Object[]> countByDeviceType(@Param("restaurantId") UUID restaurantId,
                                     @Param("start") LocalDateTime start,
                                     @Param("end") LocalDateTime end);

    @Query("""
            SELECT FUNCTION('DATE', q.scannedAt) as scanDate, COUNT(q) as count
            FROM QRScan q
            WHERE q.restaurant.id = :restaurantId
            AND q.scannedAt BETWEEN :start AND :end
            GROUP BY FUNCTION('DATE', q.scannedAt)
            ORDER BY scanDate ASC
            """)
    List<Object[]> countByDate(@Param("restaurantId") UUID restaurantId,
                               @Param("start") LocalDateTime start,
                               @Param("end") LocalDateTime end);
}
