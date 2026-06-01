package mini.cafe.project.dto.analytics;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AnalyticsOverviewResponse {

    // QR Scan metrics
    private Long totalScans;
    private Long scansToday;
    private Long scansThisWeek;
    private Long scansThisMonth;

    // Search metrics
    private Long totalSearches;
    private Long searchesToday;
    private Long searchesThisWeek;

    // Restaurant metrics
    private Long totalMenuItems;
    private Long activeMenuItems;
    private Long totalCategories;

    // Performance metrics
    private Double avgScansPerDay;
    private String mostPopularMenuItem;
    private String peakHour;
}
