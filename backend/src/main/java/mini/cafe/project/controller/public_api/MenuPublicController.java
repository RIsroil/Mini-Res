package mini.cafe.project.controller.public_api;

import lombok.RequiredArgsConstructor;
import mini.cafe.project.dto.common.ApiResponse;
import mini.cafe.project.dto.menu.MenuItemResponse;
import mini.cafe.project.service.menu.MenuItemService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/menu")
@RequiredArgsConstructor
public class MenuPublicController {

    private final MenuItemService menuItemService;

    @GetMapping("/{id}")
    public ApiResponse<MenuItemResponse> getMenuItem(@PathVariable UUID id) {
        MenuItemResponse menuItem = menuItemService.getById(id);
        return ApiResponse.success(menuItem);
    }
}
