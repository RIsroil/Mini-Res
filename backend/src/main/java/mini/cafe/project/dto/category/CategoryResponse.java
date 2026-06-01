package mini.cafe.project.dto.category;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CategoryResponse {

    private UUID id;
    private String name;
    private Integer displayOrder;
    private String iconUrl;
    private Boolean isActive;
    private Integer menuItemCount;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
