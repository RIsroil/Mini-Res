# QR Menu Platform - Complete Architecture Document

## Executive Summary

**Project Name:** QR Smart Menu Platform  
**Type:** SaaS Restaurant Discovery & Menu Management Platform  
**Architecture:** Monolith (Backend) + SPA (Frontend)  
**Primary Use Case:** QR-based restaurant menus, nearby food discovery, menu management

---

## 1. SYSTEM OVERVIEW

### 1.1 Core Concept
This is NOT a delivery app or POS system. It's a lightweight platform where:
- Restaurants create accounts and manage digital menus
- Users (anonymous) discover nearby food and scan QR codes
- Real-time geolocation-based search
- Mobile-first experience

### 1.2 User Types

| User Type | Authentication | Capabilities |
|-----------|---------------|--------------|
| **Anonymous User** | None | Search globally, view menus, scan QR, browse nearby |
| **Restaurant Admin** | Phone + OTP | Manage restaurant, menus, promotions, settings |
| **Super Admin** | Email + Password | Approve restaurants, analytics, platform management |

### 1.3 Technology Stack

**Backend:**
- Java 21
- Spring Boot 4.0.6
- PostgreSQL 16+
- PostGIS (spatial extension)
- Spring Security + JWT
- Flyway (migrations)
- MapStruct (DTO mapping)
- Hibernate Spatial

**Frontend:**
- React 18+
- TypeScript
- TailwindCSS
- React Query (data fetching)
- Zustand (state management)
- Axios (HTTP client)
- Framer Motion (animations)
- React Router v6

**Infrastructure:**
- Docker + Docker Compose
- Nginx (reverse proxy)
- Redis (caching, sessions)
- AWS S3 / MinIO (image storage)

---

## 2. ARCHITECTURE PATTERNS

### 2.1 Backend Architecture: Clean Layered Architecture

```
┌─────────────────────────────────────────┐
│         Presentation Layer              │
│  (Controllers, DTOs, Validation)        │
└──────────────┬──────────────────────────┘
               │
┌──────────────▼──────────────────────────┐
│         Application Layer               │
│  (Services, Business Logic, Mapping)    │
└──────────────┬──────────────────────────┘
               │
┌──────────────▼──────────────────────────┐
│         Domain Layer                    │
│  (Entities, Domain Logic, Enums)        │
└──────────────┬──────────────────────────┘
               │
┌──────────────▼──────────────────────────┐
│         Infrastructure Layer            │
│  (Repositories, External Services)      │
└─────────────────────────────────────────┘
```

### 2.2 Frontend Architecture: Feature-Based Structure

```
src/
├── features/           # Feature modules
│   ├── search/
│   ├── restaurant/
│   └── admin/
├── shared/            # Shared components
├── api/               # API clients
├── hooks/             # Custom hooks
├── store/             # Zustand stores
└── utils/             # Utilities
```

---

## 3. DATABASE ARCHITECTURE

### 3.1 Core Entities

#### Restaurant
```sql
CREATE TABLE restaurants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slug VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    email VARCHAR(255),
    description TEXT,
    logo_url VARCHAR(500),
    cover_image_url VARCHAR(500),
    
    -- Address
    address TEXT,
    city VARCHAR(100),
    country VARCHAR(100),
    
    -- Location (PostGIS)
    location GEOGRAPHY(Point, 4326),
    
    -- Social
    instagram_url VARCHAR(255),
    facebook_url VARCHAR(255),
    website_url VARCHAR(255),
    
    -- Working Hours
    working_hours JSONB, -- {"monday": {"open": "09:00", "close": "22:00"}, ...}
    
    -- Status
    status VARCHAR(20) DEFAULT 'PENDING', -- PENDING, ACTIVE, BLOCKED, INACTIVE
    is_premium BOOLEAN DEFAULT FALSE,
    
    -- Promotion
    global_promotion_text TEXT,
    promotion_active BOOLEAN DEFAULT FALSE,
    
    -- Admin
    admin_user_id UUID REFERENCES users(id),
    
    -- Audit
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP
);

-- Spatial index for nearby search
CREATE INDEX idx_restaurants_location ON restaurants USING GIST(location);
CREATE INDEX idx_restaurants_status ON restaurants(status);
CREATE INDEX idx_restaurants_slug ON restaurants(slug);
```

#### MenuItem
```sql
CREATE TABLE menu_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    restaurant_id UUID NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
    category_id UUID REFERENCES menu_categories(id),
    
    name VARCHAR(255) NOT NULL,
    description TEXT,
    ingredients TEXT,
    price DECIMAL(10,2) NOT NULL,
    
    preparation_time_minutes INTEGER, -- e.g., 15
    
    -- Promotion
    promotion_text TEXT,
    promotion_active BOOLEAN DEFAULT FALSE,
    
    -- Status
    is_active BOOLEAN DEFAULT TRUE,
    is_available BOOLEAN DEFAULT TRUE, -- Daily availability
    
    -- Premium badge
    has_premium_badge BOOLEAN DEFAULT FALSE,
    
    -- Images
    images JSONB, -- ["url1", "url2", "url3"]
    
    -- Search
    search_vector tsvector,
    
    -- Audit
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP
);

CREATE INDEX idx_menu_items_restaurant ON menu_items(restaurant_id);
CREATE INDEX idx_menu_items_category ON menu_items(category_id);
CREATE INDEX idx_menu_items_active ON menu_items(is_active);
CREATE INDEX idx_menu_items_search ON menu_items USING GIN(search_vector);
```

#### MenuCategory
```sql
CREATE TABLE menu_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    restaurant_id UUID NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
    
    name VARCHAR(100) NOT NULL,
    display_order INTEGER DEFAULT 0,
    icon_url VARCHAR(255),
    
    is_active BOOLEAN DEFAULT TRUE,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_menu_categories_restaurant ON menu_categories(restaurant_id);
```

#### User (Restaurant Admin)
```sql
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    phone VARCHAR(20) UNIQUE NOT NULL,
    
    -- OTP fields (for your existing auth integration)
    otp_code VARCHAR(6),
    otp_expires_at TIMESTAMP,
    otp_verified BOOLEAN DEFAULT FALSE,
    
    -- Password (for reset functionality)
    password_hash VARCHAR(255),
    
    -- Profile
    full_name VARCHAR(255),
    email VARCHAR(255),
    
    -- Status
    is_active BOOLEAN DEFAULT TRUE,
    role VARCHAR(20) DEFAULT 'RESTAURANT_ADMIN', -- RESTAURANT_ADMIN, SUPER_ADMIN
    
    -- Security
    last_login_at TIMESTAMP,
    failed_login_attempts INTEGER DEFAULT 0,
    locked_until TIMESTAMP,
    
    -- Audit
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_users_phone ON users(phone);
CREATE INDEX idx_users_role ON users(role);
```

#### QRScan (Analytics)
```sql
CREATE TABLE qr_scans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    restaurant_id UUID NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
    
    -- User info (anonymous)
    ip_address VARCHAR(45),
    user_agent TEXT,
    device_type VARCHAR(50), -- MOBILE, TABLET, DESKTOP
    
    -- Location
    scan_location GEOGRAPHY(Point, 4326),
    
    -- Timestamp
    scanned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_qr_scans_restaurant ON qr_scans(restaurant_id);
CREATE INDEX idx_qr_scans_date ON qr_scans(scanned_at);
```

#### SearchHistory (Analytics)
```sql
CREATE TABLE search_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    search_query VARCHAR(255) NOT NULL,
    search_type VARCHAR(20), -- GLOBAL, RESTAURANT_SPECIFIC
    
    restaurant_id UUID REFERENCES restaurants(id),
    
    results_count INTEGER DEFAULT 0,
    
    -- User info (anonymous)
    ip_address VARCHAR(45),
    user_location GEOGRAPHY(Point, 4326),
    
    -- Timestamp
    searched_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_search_history_query ON search_history(search_query);
CREATE INDEX idx_search_history_date ON search_history(searched_at);
```

### 3.2 Entity Relationship Diagram

```
┌──────────────┐         ┌──────────────┐
│    User      │1───────*│ Restaurant   │
│ (Admin)      │         │              │
└──────────────┘         └──────┬───────┘
                                │
                         ┌──────▼───────┐
                         │MenuCategory  │
                         └──────┬───────┘
                                │
                         ┌──────▼───────┐
                         │  MenuItem    │
                         └──────────────┘

Restaurant 1──────* QRScan
Restaurant 1──────* SearchHistory
```

---

## 4. API ARCHITECTURE

### 4.1 API Structure

**Base URL:** `https://api.domain.com/api/v1`

### 4.2 Public Endpoints (Anonymous)

#### Search
```
GET  /search?q={query}&lat={lat}&lng={lng}&radius={km}
GET  /search/nearby?lat={lat}&lng={lng}&radius={km}
```

#### Restaurant
```
GET  /restaurants/{slug}
GET  /restaurants/{slug}/menu
GET  /restaurants/{slug}/categories
```

#### Menu
```
GET  /menu/{menuItemId}
GET  /menu/{menuItemId}/similar?lat={lat}&lng={lng}
```

### 4.3 Restaurant Admin Endpoints (Protected)

#### Auth
```
POST /auth/register
POST /auth/send-otp
POST /auth/verify-otp
POST /auth/login
POST /auth/forgot-password
POST /auth/reset-password
POST /auth/refresh-token
```

#### Restaurant Management
```
GET    /admin/restaurant
PUT    /admin/restaurant
PATCH  /admin/restaurant/settings
POST   /admin/restaurant/logo
POST   /admin/restaurant/cover
```

#### Menu Management
```
GET    /admin/menu
POST   /admin/menu
PUT    /admin/menu/{id}
DELETE /admin/menu/{id}
POST   /admin/menu/{id}/images
DELETE /admin/menu/{id}/images/{index}
```

#### Category Management
```
GET    /admin/categories
POST   /admin/categories
PUT    /admin/categories/{id}
DELETE /admin/categories/{id}
PATCH  /admin/categories/reorder
```

#### Analytics
```
GET /admin/analytics/overview
GET /admin/analytics/scans
GET /admin/analytics/searches
```

### 4.4 Super Admin Endpoints (Protected)

```
GET    /superadmin/restaurants?status={status}&page={page}
PATCH  /superadmin/restaurants/{id}/approve
PATCH  /superadmin/restaurants/{id}/block
PATCH  /superadmin/restaurants/{id}/premium
GET    /superadmin/analytics/platform
GET    /superadmin/analytics/top-restaurants
GET    /superadmin/analytics/top-searches
```

---

## 5. SECURITY ARCHITECTURE

### 5.1 Authentication Flow

#### Restaurant Admin (Phone + OTP)
```
1. User enters phone number
2. Backend sends OTP via SMS (6-digit code)
3. User enters OTP
4. Backend verifies OTP
5. Backend issues JWT (access + refresh tokens)
6. Frontend stores tokens in httpOnly cookies
```

#### Super Admin (Email + Password)
```
1. User enters email + password
2. Backend verifies credentials
3. Backend issues JWT tokens
4. Frontend stores tokens
```

### 5.2 Authorization Matrix

| Resource | Anonymous | Restaurant Admin | Super Admin |
|----------|-----------|------------------|-------------|
| Search | ✅ | ✅ | ✅ |
| View Restaurant | ✅ | ✅ | ✅ |
| Manage Own Restaurant | ❌ | ✅ | ✅ |
| Manage Other Restaurant | ❌ | ❌ | ✅ |
| Approve Restaurant | ❌ | ❌ | ✅ |
| Platform Analytics | ❌ | ❌ | ✅ |

### 5.3 Security Measures

- **Rate Limiting:** 100 requests/minute per IP
- **CORS:** Whitelist frontend domains
- **XSS Protection:** Content Security Policy headers
- **SQL Injection:** Parameterized queries (JPA)
- **File Upload:** Validate image types, max 5MB
- **API Keys:** For mobile apps (future)

---

## 6. POSTGIS SPATIAL QUERIES

### 6.1 Nearby Restaurant Search

```sql
SELECT 
    r.id,
    r.name,
    r.slug,
    r.logo_url,
    ST_Distance(
        r.location,
        ST_MakePoint(:lng, :lat)::geography
    ) / 1000 AS distance_km
FROM restaurants r
WHERE 
    r.status = 'ACTIVE'
    AND ST_DWithin(
        r.location,
        ST_MakePoint(:lng, :lat)::geography,
        :radius_meters
    )
ORDER BY distance_km ASC
LIMIT 50;
```

### 6.2 Nearby Similar Menu Items

```sql
SELECT 
    mi.id,
    mi.name,
    mi.price,
    r.name as restaurant_name,
    r.slug as restaurant_slug,
    ST_Distance(
        r.location,
        ST_MakePoint(:lng, :lat)::geography
    ) / 1000 AS distance_km
FROM menu_items mi
INNER JOIN restaurants r ON mi.restaurant_id = r.id
WHERE 
    r.status = 'ACTIVE'
    AND mi.is_active = TRUE
    AND mi.search_vector @@ plainto_tsquery('english', :query)
    AND mi.restaurant_id != :current_restaurant_id
    AND ST_DWithin(
        r.location,
        ST_MakePoint(:lng, :lat)::geography,
        5000 -- 5km radius
    )
ORDER BY 
    ts_rank(mi.search_vector, plainto_tsquery('english', :query)) DESC,
    distance_km ASC
LIMIT 10;
```

### 6.3 Global Menu Search

```sql
SELECT 
    mi.id,
    mi.name,
    mi.description,
    mi.price,
    mi.preparation_time_minutes,
    mi.images,
    mi.promotion_text,
    r.id as restaurant_id,
    r.name as restaurant_name,
    r.slug as restaurant_slug,
    r.logo_url,
    ST_Distance(
        r.location,
        ST_MakePoint(:lng, :lat)::geography
    ) / 1000 AS distance_km
FROM menu_items mi
INNER JOIN restaurants r ON mi.restaurant_id = r.id
WHERE 
    r.status = 'ACTIVE'
    AND mi.is_active = TRUE
    AND (
        mi.search_vector @@ plainto_tsquery('english', :query)
        OR LOWER(mi.name) LIKE LOWER(CONCAT('%', :query, '%'))
    )
    AND ST_DWithin(
        r.location,
        ST_MakePoint(:lng, :lat)::geography,
        :radius_meters
    )
ORDER BY 
    distance_km ASC,
    ts_rank(mi.search_vector, plainto_tsquery('english', :query)) DESC
LIMIT 30;
```

---

## 7. FRONTEND ARCHITECTURE

### 7.1 Design System

#### Color Palette (Modern Food-Tech)
```css
/* Primary - Warm & Appetizing */
--primary-50:  #FFF9F0;
--primary-100: #FFEDD5;
--primary-500: #F97316; /* Orange */
--primary-600: #EA580C;
--primary-900: #7C2D12;

/* Neutral - Clean & Professional */
--neutral-50:  #FAFAFA;
--neutral-100: #F5F5F5;
--neutral-500: #737373;
--neutral-900: #171717;

/* Success - Fresh & Healthy */
--success-500: #10B981;

/* Premium - Luxury Gold */
--premium-500: #F59E0B;
```

#### Typography
```css
/* Headings - Inter */
font-family: 'Inter', sans-serif;
--h1: 2.5rem / 600
--h2: 2rem / 600
--h3: 1.5rem / 600

/* Body - Inter */
--body-lg: 1.125rem / 400
--body-md: 1rem / 400
--body-sm: 0.875rem / 400
```

#### Spacing System (Apple-inspired)
```
4px, 8px, 12px, 16px, 24px, 32px, 48px, 64px
```

### 7.2 Component Library

#### MenuCard
```tsx
<MenuCard
  image={string | string[]}
  name={string}
  description={string}
  price={number}
  preparationTime={number}
  promotionText={string}
  restaurantName={string}
  distance={number}
  isPremium={boolean}
  onSwipe={(direction) => void}
/>
```

#### RestaurantHeader
```tsx
<RestaurantHeader
  logo={string}
  cover={string}
  name={string}
  phone={string}
  social={{instagram, facebook, website}}
  address={string}
  workingHours={object}
  globalPromotion={string}
/>
```

#### SearchBar (Sticky)
```tsx
<SearchBar
  placeholder={string}
  onSearch={(query) => void}
  loading={boolean}
  sticky={boolean}
/>
```

### 7.3 Page Structure

#### Homepage (Global Search)
```
/
├── Hero Section
├── Search Bar (prominent)
├── Popular Categories
├── Trending Menus (nearby)
└── How It Works
```

#### Restaurant Page
```
/r/{slug}
├── Restaurant Header
├── Global Promotion Banner
├── Search Bar (restaurant-specific)
├── Categories (horizontal scroll)
├── Menu Items (by category)
└── Footer
```

#### Search Results
```
/search?q=burger&lat=41.123&lng=69.456
├── Search Header
├── Filters (distance, price, preparation time)
├── Result Count
└── Menu Cards (grid/list)
```

---

## 8. AUTHENTICATION INTEGRATION POINTS

### 8.1 Your Existing Auth Module

**Location:** `C:\Users\isroi\IdeaProjects\restaurant\src\main\java\project\restaurant\user`

**Expected Components:**
```
user/
├── service/
│   ├── OTPService.java
│   ├── AuthService.java
│   └── PasswordService.java
├── dto/
│   ├── SendOTPRequest.java
│   ├── VerifyOTPRequest.java
│   └── AuthResponse.java
└── controller/
    └── AuthController.java

utils/
├── JWTUtil.java
├── PhoneValidator.java
└── OTPGenerator.java
```

### 8.2 Integration Strategy

1. **Copy your auth package** into the new project structure
2. **Adapt User entity** to match your existing schema
3. **Wire OTPService** with SMS provider (Twilio, AWS SNS, etc.)
4. **Configure JWT** with proper secret keys
5. **Add SecurityConfig** to protect admin endpoints

### 8.3 Security Configuration

```java
@Configuration
@EnableWebSecurity
public class SecurityConfig {
    
    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) {
        http
            .csrf().disable()
            .authorizeHttpRequests(auth -> auth
                // Public endpoints
                .requestMatchers("/api/v1/search/**").permitAll()
                .requestMatchers("/api/v1/restaurants/**").permitAll()
                .requestMatchers("/api/v1/menu/**").permitAll()
                .requestMatchers("/api/v1/auth/**").permitAll()
                
                // Restaurant admin endpoints
                .requestMatchers("/api/v1/admin/**").hasRole("RESTAURANT_ADMIN")
                
                // Super admin endpoints
                .requestMatchers("/api/v1/superadmin/**").hasRole("SUPER_ADMIN")
                
                .anyRequest().authenticated()
            )
            .sessionManagement()
                .sessionCreationPolicy(SessionCreationPolicy.STATELESS)
            .and()
            .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);
        
        return http.build();
    }
}
```

---

## 9. PERFORMANCE OPTIMIZATION

### 9.1 Database Optimization

- **Indexes:** Created on all foreign keys, search fields, location
- **Connection Pool:** HikariCP with 20 connections
- **Query Optimization:** Use pagination, avoid N+1 queries
- **Caching:** Redis for restaurant details, menu items (5 min TTL)

### 9.2 Image Optimization

- **Upload:** Max 5MB, convert to WebP
- **Storage:** AWS S3 or MinIO
- **CDN:** CloudFront for fast delivery
- **Thumbnails:** Generate 3 sizes (small, medium, large)

### 9.3 API Performance

- **Response Time:** < 200ms for search queries
- **Compression:** Gzip enabled
- **Pagination:** Default 20 items per page
- **Caching:** ETag headers for static content

### 9.4 Frontend Performance

- **Code Splitting:** Route-based lazy loading
- **Image Loading:** Lazy loading with placeholder
- **Bundle Size:** < 200KB initial load
- **Caching:** Service workers (future)

---

## 10. PREMIUM FEATURES

### 10.1 Standard Restaurant
- Max 1 image per menu item
- Basic analytics
- Standard QR code

### 10.2 Premium Restaurant
- Max 3 images per menu item (slider)
- Advanced analytics
- Priority in search results (future)
- Custom QR code branding
- Promotional badge on menus

### 10.3 Premium Badge UI
```tsx
{isPremium && (
  <div className="absolute top-2 right-2">
    <span className="bg-gradient-to-r from-yellow-400 to-orange-500 
                     text-white text-xs px-2 py-1 rounded-full">
      PREMIUM
    </span>
  </div>
)}
```

---

## 11. QR CODE SYSTEM

### 11.1 QR Generation

```java
@Service
public class QRCodeService {
    
    public String generateQRCode(String restaurantSlug) {
        String url = "https://domain.com/r/" + restaurantSlug;
        
        // Use ZXing library
        QRCodeWriter qrCodeWriter = new QRCodeWriter();
        BitMatrix bitMatrix = qrCodeWriter.encode(
            url, 
            BarcodeFormat.QR_CODE, 
            300, 
            300
        );
        
        // Save to S3
        String qrCodeUrl = uploadToS3(bitMatrix, restaurantSlug);
        return qrCodeUrl;
    }
}
```

### 11.2 QR Scan Tracking

```java
@PostMapping("/track-scan")
public void trackScan(@RequestBody QRScanRequest request) {
    QRScan scan = QRScan.builder()
        .restaurantId(request.getRestaurantId())
        .ipAddress(request.getIpAddress())
        .userAgent(request.getUserAgent())
        .deviceType(detectDeviceType(request.getUserAgent()))
        .scanLocation(createPoint(request.getLat(), request.getLng()))
        .build();
    
    qrScanRepository.save(scan);
}
```

---

## 12. ANALYTICS & REPORTING

### 12.1 Restaurant Admin Dashboard

**Metrics:**
- Total scans (today, week, month, all-time)
- Top searched menu items
- Peak hours
- Geographic distribution of scans
- Menu views
- Promotion click-through rate

### 12.2 Super Admin Dashboard

**Metrics:**
- Total restaurants (active, pending, blocked)
- Total menu items
- Total scans (platform-wide)
- Top performing restaurants
- Most searched items globally
- User geographic distribution
- Growth charts (daily/weekly/monthly)

---

## 13. DEPLOYMENT ARCHITECTURE

### 13.1 Production Infrastructure

```
┌─────────────┐
│   Nginx     │ (Load Balancer, SSL)
└──────┬──────┘
       │
   ┌───▼────┐
   │ React  │ (Static files)
   └────────┘
       │
   ┌───▼────────┐
   │ Spring Boot│ (API Server)
   └───┬────────┘
       │
   ┌───▼────────┐
   │ PostgreSQL │ (Database + PostGIS)
   └────────────┘
       │
   ┌───▼────────┐
   │   Redis    │ (Cache)
   └────────────┘
       │
   ┌───▼────────┐
   │   S3/MinIO │ (Images)
   └────────────┘
```

### 13.2 Docker Compose Structure

```yaml
services:
  postgres:
    image: postgis/postgis:16-3.4
    environment:
      POSTGRES_DB: qrmenu
      POSTGRES_USER: admin
      POSTGRES_PASSWORD: secret
    volumes:
      - postgres_data:/var/lib/postgresql/data
    
  redis:
    image: redis:7-alpine
    
  backend:
    build: ./backend
    environment:
      SPRING_DATASOURCE_URL: jdbc:postgresql://postgres:5432/qrmenu
      REDIS_HOST: redis
    depends_on:
      - postgres
      - redis
    
  frontend:
    build: ./frontend
    depends_on:
      - backend
    
  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
    depends_on:
      - frontend
      - backend
```

### 13.3 Environment Variables

**Backend (.env)**
```
# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=qrmenu
DB_USER=admin
DB_PASSWORD=secret

# JWT
JWT_SECRET=your-secret-key-min-256-bits
JWT_EXPIRATION_MS=3600000

# SMS Provider (Twilio example)
TWILIO_ACCOUNT_SID=your-sid
TWILIO_AUTH_TOKEN=your-token
TWILIO_PHONE_NUMBER=+1234567890

# S3
AWS_ACCESS_KEY=your-key
AWS_SECRET_KEY=your-secret
AWS_BUCKET_NAME=qrmenu-images
AWS_REGION=us-east-1

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379
```

**Frontend (.env)**
```
VITE_API_BASE_URL=https://api.domain.com/api/v1
VITE_GOOGLE_MAPS_API_KEY=your-key
```

---

## 14. SCALABILITY CONSIDERATIONS

### 14.1 Current Architecture (MVP)
- Single server (4 CPU, 16GB RAM)
- Handles ~1000 concurrent users
- ~100K restaurants
- ~1M menu items

### 14.2 Future Scaling Path

**Phase 1: Vertical Scaling**
- Increase server resources
- Optimize queries
- Add Redis caching

**Phase 2: Horizontal Scaling**
- Multiple backend instances (load balanced)
- Database read replicas
- CDN for static assets

**Phase 3: Microservices (if needed)**
```
- Search Service (Elasticsearch)
- Restaurant Service
- Menu Service
- Analytics Service
- Notification Service
```

### 14.3 Database Sharding Strategy (Future)
- Shard by geography (city/country)
- Keep user/auth data centralized

---

## 15. MOBILE APP CONSIDERATIONS (Future)

### 15.1 API Compatibility
- Current REST API works with mobile
- Add API versioning support
- Implement pagination for mobile

### 15.2 Mobile-Specific Features
- Push notifications
- Offline mode (favorite restaurants)
- Camera integration (QR scanner)
- Location permissions

---

## 16. MONITORING & OBSERVABILITY

### 16.1 Application Monitoring
- **Spring Boot Actuator:** Health checks, metrics
- **Prometheus + Grafana:** Metrics visualization
- **ELK Stack:** Centralized logging

### 16.2 Key Metrics to Track
- API response times
- Database query performance
- Search query latency
- QR scan frequency
- Error rates
- Cache hit rates

---

## 17. TESTING STRATEGY

### 17.1 Backend Testing
- **Unit Tests:** JUnit 5 + Mockito
- **Integration Tests:** TestContainers (PostgreSQL + PostGIS)
- **API Tests:** MockMvc
- **Performance Tests:** JMeter

### 17.2 Frontend Testing
- **Unit Tests:** Vitest
- **Component Tests:** React Testing Library
- **E2E Tests:** Playwright
- **Visual Tests:** Chromatic

---

## 18. ESTIMATED TIMELINE

### Phase 1: Foundation (2-3 weeks)
- Database schema + migrations
- Auth integration
- Basic CRUD APIs
- Restaurant registration flow

### Phase 2: Core Features (3-4 weeks)
- Menu management
- Search functionality (PostGIS)
- QR code generation
- Restaurant page

### Phase 3: Frontend (3-4 weeks)
- Design system
- Homepage
- Restaurant page
- Search results
- Admin dashboard

### Phase 4: Polish (2 weeks)
- Performance optimization
- Analytics
- Super admin dashboard
- Testing

### Phase 5: Deployment (1 week)
- Docker setup
- CI/CD pipeline
- Production deployment
- Monitoring setup

**Total: ~12-14 weeks**

---

## 19. COST ESTIMATION (Monthly)

### Infrastructure
- **AWS EC2 (t3.large):** $60
- **AWS RDS PostgreSQL:** $100
- **AWS S3 (1TB):** $23
- **CloudFront CDN:** $50
- **Redis Cache:** $30
- **Domain + SSL:** $15

**Total Infrastructure:** ~$280/month

### Third-Party Services
- **Twilio SMS (10K OTPs):** $75
- **Monitoring (DataDog/New Relic):** $50

**Total Monthly:** ~$400

---

## 20. SUCCESS METRICS (KPIs)

### User Engagement
- Daily active users (DAU)
- QR scans per day
- Search queries per day
- Average session duration

### Restaurant Metrics
- Total restaurants
- Restaurant approval rate
- Active restaurants (>1 scan/day)
- Premium conversion rate

### Technical Metrics
- API response time (p95 < 300ms)
- Uptime (99.9%)
- Error rate (< 0.1%)
- Search success rate

---

## CONCLUSION

This architecture provides a solid foundation for a production-ready QR menu platform. The design prioritizes:

✅ **Scalability:** Clean architecture, optimized queries, caching  
✅ **Performance:** PostGIS for spatial queries, Redis caching, CDN  
✅ **Security:** JWT auth, rate limiting, input validation  
✅ **User Experience:** Mobile-first, fast loading, elegant UI  
✅ **Maintainability:** Clean code, separation of concerns, documentation  

The platform is designed to start as a monolith and scale horizontally as needed. Premium features provide a clear monetization path while keeping the core product free.

**Next Steps:**
1. Review and approve this architecture
2. Set up development environment
3. Integrate existing auth module
4. Begin Phase 1 implementation

---

**Document Version:** 1.0  
**Last Updated:** 2026-05-26  
**Author:** Claude (Architecture AI)
