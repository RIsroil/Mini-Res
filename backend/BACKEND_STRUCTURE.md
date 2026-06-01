# Backend Project Structure

## Complete Package Structure

```
src/main/java/mini/cafe/project/
├── ProjectApplication.java              # Main Spring Boot Application
├──
├── domain/                               # ✅ CREATED
│   ├── BaseEntity.java
│   ├── User.java
│   ├── Restaurant.java
│   ├── MenuCategory.java
│   ├── MenuItem.java
│   ├── QRScan.java
│   └── SearchHistory.java
├──
├── dto/                                  # Data Transfer Objects
│   ├── auth/
│   │   ├── LoginRequest.java
│   │   ├── SendOTPRequest.java
│   │   ├── VerifyOTPRequest.java
│   │   ├── ForgotPasswordRequest.java
│   │   ├── ResetPasswordRequest.java
│   │   └── AuthResponse.java
│   │
│   ├── restaurant/
│   │   ├── RestaurantRequest.java
│   │   ├── RestaurantResponse.java
│   │   ├── RestaurantDetailResponse.java
│   │   ├── RestaurantUpdateRequest.java
│   │   └── NearbyRestaurantResponse.java
│   │
│   ├── menu/
│   │   ├── MenuItemRequest.java
│   │   ├── MenuItemResponse.java
│   │   ├── MenuItemDetailResponse.java
│   │   ├── MenuItemUpdateRequest.java
│   │   └── MenuSearchResponse.java
│   │
│   ├── category/
│   │   ├── CategoryRequest.java
│   │   ├── CategoryResponse.java
│   │   ├── CategoryReorderRequest.java
│   │   └── CategoryWithItemsResponse.java
│   │
│   ├── analytics/
│   │   ├── AnalyticsOverviewResponse.java
│   │   ├── QRScanStatsResponse.java
│   │   ├── SearchStatsResponse.java
│   │   └── TopItemsResponse.java
│   │
│   └── common/
│       ├── PageResponse.java
│       ├── ApiResponse.java
│       ├── ErrorResponse.java
│       ├── LocationDto.java
│       └── WorkingHoursDto.java
├──
├── repository/                           # Data Access Layer
│   ├── UserRepository.java
│   ├── RestaurantRepository.java
│   ├── MenuCategoryRepository.java
│   ├── MenuItemRepository.java
│   ├── QRScanRepository.java
│   └── SearchHistoryRepository.java
├──
├── service/                              # Business Logic Layer
│   ├── auth/
│   │   ├── AuthService.java
│   │   ├── OTPService.java
│   │   ├── JwtService.java
│   │   └── PasswordService.java
│   │
│   ├── restaurant/
│   │   ├── RestaurantService.java
│   │   └── RestaurantAdminService.java
│   │
│   ├── menu/
│   │   ├── MenuItemService.java
│   │   └── MenuCategoryService.java
│   │
│   ├── search/
│   │   ├── SearchService.java
│   │   └── SearchHistoryService.java
│   │
│   ├── qr/
│   │   ├── QRCodeService.java
│   │   └── QRScanTrackingService.java
│   │
│   ├── analytics/
│   │   ├── RestaurantAnalyticsService.java
│   │   └── PlatformAnalyticsService.java
│   │
│   ├── storage/
│   │   └── S3StorageService.java
│   │
│   └── superadmin/
│       └── SuperAdminService.java
├──
├── controller/                           # API Controllers
│   ├── public_api/
│   │   ├── SearchController.java
│   │   ├── RestaurantPublicController.java
│   │   ├── MenuPublicController.java
│   │   └── QRTrackingController.java
│   │
│   ├── admin/
│   │   ├── RestaurantAdminController.java
│   │   ├── MenuAdminController.java
│   │   ├── CategoryAdminController.java
│   │   └── AnalyticsAdminController.java
│   │
│   ├── superadmin/
│   │   ├── SuperAdminRestaurantController.java
│   │   └── SuperAdminAnalyticsController.java
│   │
│   └── AuthController.java
├──
├── security/                             # Security Configuration
│   ├── SecurityConfig.java
│   ├── JwtAuthenticationFilter.java
│   ├── JwtAuthenticationEntryPoint.java
│   ├── UserPrincipal.java
│   └── CustomUserDetailsService.java
├──
├── config/                               # Application Configuration
│   ├── WebConfig.java
│   ├── CacheConfig.java
│   ├── S3Config.java
│   ├── OpenAPIConfig.java
│   └── AsyncConfig.java
├──
├── exception/                            # Exception Handling
│   ├── GlobalExceptionHandler.java
│   ├── ResourceNotFoundException.java
│   ├── UnauthorizedException.java
│   ├── ValidationException.java
│   ├── BusinessException.java
│   └── FileUploadException.java
├──
├── util/                                 # Utilities
│   ├── GeoUtils.java
│   ├── SlugUtils.java
│   ├── FileUtils.java
│   ├── ValidationUtils.java
│   └── DeviceDetectorUtils.java
├──
└── mapper/                               # MapStruct Mappers
    ├── RestaurantMapper.java
    ├── MenuItemMapper.java
    ├── MenuCategoryMapper.java
    ├── UserMapper.java
    └── AnalyticsMapper.java
```

## API Endpoint Summary

### Public API (Anonymous)

```
GET    /api/v1/search                     - Global menu search
GET    /api/v1/search/nearby              - Nearby restaurants
GET    /api/v1/restaurants/{slug}         - Restaurant details
GET    /api/v1/restaurants/{slug}/menu    - Restaurant menu
GET    /api/v1/menu/{id}                  - Menu item details
GET    /api/v1/menu/{id}/similar          - Similar nearby items
POST   /api/v1/qr/track                   - Track QR scan
```

### Authentication

```
POST   /api/v1/auth/register              - Restaurant registration
POST   /api/v1/auth/send-otp              - Send OTP
POST   /api/v1/auth/verify-otp            - Verify OTP
POST   /api/v1/auth/login                 - Login (phone + password)
POST   /api/v1/auth/forgot-password       - Forgot password
POST   /api/v1/auth/reset-password        - Reset password
POST   /api/v1/auth/refresh               - Refresh JWT token
```

### Restaurant Admin API

```
GET    /api/v1/admin/restaurant           - Get my restaurant
PUT    /api/v1/admin/restaurant           - Update restaurant
POST   /api/v1/admin/restaurant/logo      - Upload logo
POST   /api/v1/admin/restaurant/cover     - Upload cover image

GET    /api/v1/admin/menu                 - List menu items
POST   /api/v1/admin/menu                 - Create menu item
PUT    /api/v1/admin/menu/{id}            - Update menu item
DELETE /api/v1/admin/menu/{id}            - Delete menu item
POST   /api/v1/admin/menu/{id}/images     - Upload menu images
DELETE /api/v1/admin/menu/{id}/images/{i} - Delete menu image

GET    /api/v1/admin/categories           - List categories
POST   /api/v1/admin/categories           - Create category
PUT    /api/v1/admin/categories/{id}      - Update category
DELETE /api/v1/admin/categories/{id}      - Delete category
PATCH  /api/v1/admin/categories/reorder   - Reorder categories

GET    /api/v1/admin/analytics/overview   - Analytics overview
GET    /api/v1/admin/analytics/scans      - QR scan analytics
GET    /api/v1/admin/analytics/searches   - Search analytics
```

### Super Admin API

```
GET    /api/v1/superadmin/restaurants               - List all restaurants
GET    /api/v1/superadmin/restaurants/{id}          - Restaurant details
PATCH  /api/v1/superadmin/restaurants/{id}/approve  - Approve restaurant
PATCH  /api/v1/superadmin/restaurants/{id}/block    - Block restaurant
PATCH  /api/v1/superadmin/restaurants/{id}/premium  - Toggle premium

GET    /api/v1/superadmin/analytics/platform        - Platform analytics
GET    /api/v1/superadmin/analytics/top-restaurants - Top restaurants
GET    /api/v1/superadmin/analytics/top-searches    - Top searches
```

## Key Service Methods

### SearchService
```java
List<MenuSearchResponse> searchGlobal(String query, Double lat, Double lng, Double radiusKm)
List<NearbyRestaurantResponse> searchNearbyRestaurants(Double lat, Double lng, Double radiusKm)
List<MenuItemResponse> searchSimilarNearby(UUID menuItemId, Double lat, Double lng)
```

### RestaurantService
```java
RestaurantDetailResponse getBySlug(String slug)
RestaurantResponse createRestaurant(RestaurantRequest request, UUID userId)
RestaurantResponse updateRestaurant(UUID restaurantId, RestaurantUpdateRequest request)
String uploadLogo(UUID restaurantId, MultipartFile file)
```

### MenuItemService
```java
List<MenuItemResponse> getRestaurantMenu(UUID restaurantId)
MenuItemResponse createMenuItem(UUID restaurantId, MenuItemRequest request)
MenuItemResponse updateMenuItem(UUID id, MenuItemUpdateRequest request)
void deleteMenuItem(UUID id)
```

### QRCodeService
```java
String generateQRCode(String restaurantSlug)
BufferedImage createQRImage(String url)
String uploadQRToS3(BufferedImage qrImage, String restaurantSlug)
```

### AnalyticsService
```java
AnalyticsOverviewResponse getRestaurantOverview(UUID restaurantId)
List<QRScanStatsResponse> getQRScanStats(UUID restaurantId, LocalDate from, LocalDate to)
List<SearchStatsResponse> getSearchStats(UUID restaurantId, LocalDate from, LocalDate to)
Map<String, Object> getPlatformAnalytics()
```

## Key Repository Queries

### RestaurantRepository
```java
@Query("SELECT r FROM Restaurant r WHERE ST_DWithin(r.location, ST_Point(:lng, :lat), :radiusMeters)")
List<Restaurant> findNearby(@Param("lat") Double lat, @Param("lng") Double lng, @Param("radiusMeters") Double radiusMeters);

Optional<Restaurant> findBySlug(String slug);
Optional<Restaurant> findByAdminUserId(UUID adminUserId);
List<Restaurant> findByStatus(Restaurant.RestaurantStatus status);
```

### MenuItemRepository
```java
@Query("SELECT mi FROM MenuItem mi JOIN mi.restaurant r WHERE " +
       "mi.isActive = true AND r.status = 'ACTIVE' AND " +
       "ST_DWithin(r.location, ST_Point(:lng, :lat), :radiusMeters) AND " +
       "mi.searchVector @@ plainto_tsquery(:query)")
List<MenuItem> searchGlobalNearby(@Param("query") String query, @Param("lat") Double lat, 
                                    @Param("lng") Double lng, @Param("radiusMeters") Double radiusMeters);

List<MenuItem> findByRestaurantIdAndIsActiveTrue(UUID restaurantId);
List<MenuItem> findByCategoryIdOrderByCreatedAtDesc(UUID categoryId);
```

## Testing Strategy

### Unit Tests
- Service layer tests with Mockito
- Repository tests with @DataJpaTest
- Utility tests

### Integration Tests
- API tests with MockMvc
- Database tests with TestContainers (PostGIS)
- Security tests with @WithMockUser

### Example Test Structure
```
src/test/java/mini/cafe/project/
├── service/
│   ├── SearchServiceTest.java
│   ├── RestaurantServiceTest.java
│   └── MenuItemServiceTest.java
├── repository/
│   ├── RestaurantRepositoryTest.java
│   └── MenuItemRepositoryTest.java
└── controller/
    ├── SearchControllerTest.java
    └── RestaurantAdminControllerTest.java
```

## Next Steps

1. ✅ Domain entities created
2. ✅ Database migrations created
3. ⏳ Create repositories
4. ⏳ Create DTOs
5. ⏳ Create services
6. ⏳ Create controllers
7. ⏳ Configure security
8. ⏳ Create exception handlers
9. ⏳ Create utilities
10. ⏳ Write tests

## Development Workflow

1. Start PostgreSQL with PostGIS:
   ```bash
   docker run --name qrmenu-postgres \
     -e POSTGRES_DB=qrmenu \
     -e POSTGRES_USER=admin \
     -e POSTGRES_PASSWORD=secret \
     -p 5432:5432 \
     postgis/postgis:16-3.4
   ```

2. Start Redis:
   ```bash
   docker run --name qrmenu-redis -p 6379:6379 redis:7-alpine
   ```

3. Run application:
   ```bash
   cd backend
   ./mvnw spring-boot:run
   ```

4. Access Swagger UI:
   ```
   http://localhost:8080/swagger-ui.html
   ```

## Environment Variables

Create `.env` file in backend directory:
```
DB_HOST=localhost
DB_PORT=5432
DB_NAME=qrmenu
DB_USER=admin
DB_PASSWORD=secret

JWT_SECRET=your-super-secret-key-minimum-256-bits-change-in-production
JWT_EXPIRATION_MS=3600000

REDIS_HOST=localhost
REDIS_PORT=6379

AWS_ACCESS_KEY=your-aws-access-key
AWS_SECRET_KEY=your-aws-secret-key
AWS_BUCKET_NAME=qrmenu-images
AWS_REGION=us-east-1
```

---

**Status:** Core domain entities and database schema complete. Ready for implementation phase.
