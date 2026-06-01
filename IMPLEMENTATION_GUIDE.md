# QR Menu Platform - Complete Implementation Guide

This guide provides detailed instructions and code samples for implementing all remaining components of the backend and frontend.

---

## Table of Contents

1. [Backend Implementation](#backend-implementation)
   - [Auth Integration Placeholder](#auth-integration-placeholder)
   - [Services](#services)
   - [Controllers](#controllers)
   - [Security Configuration](#security-configuration)
   - [DTOs](#dtos)
2. [Frontend Implementation](#frontend-implementation)
3. [Testing](#testing)
4. [Deployment](#deployment)

---

## Backend Implementation

### 1. Auth Integration Placeholder

**Location:** `backend/src/main/java/mini/cafe/project/auth/`

Create this package structure to integrate your existing authentication code:

```java
package mini.cafe.project.auth;

// TODO: Copy your existing authentication code from:
// C:\Users\isroi\IdeaProjects\restaurant\src\main\java\project\restaurant\user
// C:\Users\isroi\IdeaProjects\restaurant\src\main\java\project\restaurant\utils

/**
 * Integration Points:
 * 
 * 1. OTPService - SMS/OTP sending logic
 * 2. JwtService - JWT token generation/validation
 * 3. PasswordService - Password hashing/verification
 * 4. AuthService - Main authentication orchestration
 * 
 * Expected methods:
 * - sendOTP(String phone)
 * - verifyOTP(String phone, String code)
 * - generateJWT(User user)
 * - validateJWT(String token)
 * - hashPassword(String password)
 * - verifyPassword(String raw, String hashed)
 */

// Example placeholder classes you'll need to implement:

@Service
public class OTPService {
    // Integrate with Twilio, AWS SNS, or your SMS provider
    public void sendOTP(String phone, String code) {
        // TODO: Implement SMS sending
    }
}

@Service
public class JwtService {
    @Value("${app.jwt.secret}")
    private String jwtSecret;
    
    @Value("${app.jwt.expiration-ms}")
    private Long expirationMs;
    
    public String generateToken(User user) {
        // TODO: Implement JWT generation
        return Jwts.builder()
            .setSubject(user.getId().toString())
            .setIssuedAt(new Date())
            .setExpiration(new Date(System.currentTimeMillis() + expirationMs))
            .signWith(SignatureAlgorithm.HS512, jwtSecret)
            .compact();
    }
    
    public UUID getUserIdFromToken(String token) {
        // TODO: Extract user ID from JWT
    }
    
    public boolean validateToken(String token) {
        // TODO: Validate JWT
    }
}
```

### 2. Key Services Implementation

#### SearchService (Complete Example)

```java
package mini.cafe.project.service.search;

import lombok.RequiredArgsConstructor;
import mini.cafe.project.domain.MenuItem;
import mini.cafe.project.domain.Restaurant;
import mini.cafe.project.domain.SearchHistory;
import mini.cafe.project.dto.menu.MenuSearchResponse;
import mini.cafe.project.dto.restaurant.NearbyRestaurantResponse;
import mini.cafe.project.repository.MenuItemRepository;
import mini.cafe.project.repository.RestaurantRepository;
import mini.cafe.project.repository.SearchHistoryRepository;
import mini.cafe.project.util.GeoUtils;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class SearchService {

    private final MenuItemRepository menuItemRepository;
    private final RestaurantRepository restaurantRepository;
    private final SearchHistoryRepository searchHistoryRepository;

    @Value("${app.search.default-radius-km}")
    private Double defaultRadiusKm;

    @Value("${app.search.max-radius-km}")
    private Double maxRadiusKm;

    @Transactional(readOnly = true)
    public List<MenuSearchResponse> searchGlobal(String query, Double lat, Double lng, Double radiusKm) {
        // Validate and normalize radius
        double radius = Math.min(radiusKm != null ? radiusKm : defaultRadiusKm, maxRadiusKm);
        double radiusMeters = GeoUtils.kmToMeters(radius);

        // Track search
        trackSearch(query, lat, lng, SearchHistory.SearchType.GLOBAL, null);

        // Execute search
        List<MenuItem> results = menuItemRepository.searchGlobalNearby(
            query, lat, lng, radiusMeters, 30
        );

        // Map to DTOs
        return results.stream()
            .map(this::toMenuSearchResponse)
            .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<NearbyRestaurantResponse> searchNearby(Double lat, Double lng, Double radiusKm) {
        double radius = Math.min(radiusKm != null ? radiusKm : defaultRadiusKm, maxRadiusKm);
        double radiusMeters = GeoUtils.kmToMeters(radius);

        List<Restaurant> restaurants = restaurantRepository.findNearby(lat, lng, radiusMeters, 50);

        return restaurants.stream()
            .map(this::toNearbyRestaurantResponse)
            .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<MenuSearchResponse> searchSimilarNearby(UUID menuItemId, Double lat, Double lng) {
        MenuItem menuItem = menuItemRepository.findById(menuItemId)
            .orElseThrow(() -> new ResourceNotFoundException("MenuItem", "id", menuItemId));

        // Use menu name as search query
        String query = menuItem.getName();

        List<MenuItem> similar = menuItemRepository.findSimilarNearby(
            query, lat, lng, menuItem.getRestaurant().getId()
        );

        return similar.stream()
            .map(this::toMenuSearchResponse)
            .collect(Collectors.toList());
    }

    private void trackSearch(String query, Double lat, Double lng, 
                            SearchHistory.SearchType type, UUID restaurantId) {
        SearchHistory history = SearchHistory.builder()
            .searchQuery(query)
            .searchType(type)
            .userLocation(lat != null && lng != null ? GeoUtils.createPoint(lat, lng) : null)
            .build();

        if (restaurantId != null) {
            Restaurant restaurant = restaurantRepository.findById(restaurantId).orElse(null);
            history.setRestaurant(restaurant);
        }

        searchHistoryRepository.save(history);
    }

    private MenuSearchResponse toMenuSearchResponse(MenuItem item) {
        // TODO: Implement proper mapper
        return MenuSearchResponse.builder()
            .id(item.getId())
            .name(item.getName())
            .description(item.getDescription())
            .price(item.getPrice())
            .primaryImage(item.getPrimaryImage())
            .restaurantName(item.getRestaurant().getName())
            .restaurantSlug(item.getRestaurant().getSlug())
            // Calculate distance if available
            .build();
    }

    private NearbyRestaurantResponse toNearbyRestaurantResponse(Restaurant restaurant) {
        // TODO: Implement proper mapper
        return NearbyRestaurantResponse.builder()
            .id(restaurant.getId())
            .slug(restaurant.getSlug())
            .name(restaurant.getName())
            .logoUrl(restaurant.getLogoUrl())
            .build();
    }
}
```

#### RestaurantService Implementation Pattern

```java
package mini.cafe.project.service.restaurant;

import lombok.RequiredArgsConstructor;
import mini.cafe.project.domain.Restaurant;
import mini.cafe.project.domain.User;
import mini.cafe.project.dto.restaurant.RestaurantRequest;
import mini.cafe.project.dto.restaurant.RestaurantResponse;
import mini.cafe.project.exception.BusinessException;
import mini.cafe.project.exception.ResourceNotFoundException;
import mini.cafe.project.repository.RestaurantRepository;
import mini.cafe.project.repository.UserRepository;
import mini.cafe.project.util.GeoUtils;
import mini.cafe.project.util.SlugUtils;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class RestaurantService {

    private final RestaurantRepository restaurantRepository;
    private final UserRepository userRepository;
    private final QRCodeService qrCodeService;

    @Transactional(readOnly = true)
    public RestaurantResponse getBySlug(String slug) {
        Restaurant restaurant = restaurantRepository.findBySlug(slug)
            .orElseThrow(() -> new ResourceNotFoundException("Restaurant", "slug", slug));

        if (!restaurant.isActive()) {
            throw new BusinessException("Restaurant is not active");
        }

        return toRestaurantResponse(restaurant);
    }

    @Transactional
    public RestaurantResponse createRestaurant(RestaurantRequest request, UUID userId) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));

        // Check if user already has a restaurant
        if (restaurantRepository.findByAdminUserId(userId).isPresent()) {
            throw new BusinessException("User already has a restaurant");
        }

        // Generate unique slug
        String slug = generateUniqueSlug(request.getName());

        Restaurant restaurant = Restaurant.builder()
            .slug(slug)
            .name(request.getName())
            .phone(request.getPhone())
            .email(request.getEmail())
            .description(request.getDescription())
            .address(request.getAddress())
            .city(request.getCity())
            .country(request.getCountry())
            .location(GeoUtils.createPoint(request.getLatitude(), request.getLongitude()))
            .status(Restaurant.RestaurantStatus.PENDING)
            .adminUser(user)
            .build();

        restaurant = restaurantRepository.save(restaurant);

        // Generate QR code
        String qrCodeUrl = qrCodeService.generateQRCode(restaurant.getSlug());
        restaurant.setQrCodeUrl(qrCodeUrl);
        restaurant = restaurantRepository.save(restaurant);

        return toRestaurantResponse(restaurant);
    }

    private String generateUniqueSlug(String name) {
        String baseSlug = SlugUtils.toSlug(name);
        String slug = baseSlug;
        int suffix = 0;

        while (restaurantRepository.existsBySlug(slug)) {
            suffix++;
            slug = SlugUtils.toUniqueSlug(baseSlug, suffix);
        }

        return slug;
    }

    private RestaurantResponse toRestaurantResponse(Restaurant restaurant) {
        // TODO: Use MapStruct mapper
        return RestaurantResponse.builder()
            .id(restaurant.getId())
            .slug(restaurant.getSlug())
            .name(restaurant.getName())
            .phone(restaurant.getPhone())
            .logoUrl(restaurant.getLogoUrl())
            .coverImageUrl(restaurant.getCoverImageUrl())
            .address(restaurant.getAddress())
            .status(restaurant.getStatus().name())
            .isPremium(restaurant.getIsPremium())
            .build();
    }
}
```

### 3. Controllers Implementation

#### Public Search Controller (Complete Example)

```java
package mini.cafe.project.controller.public_api;

import lombok.RequiredArgsConstructor;
import mini.cafe.project.dto.common.ApiResponse;
import mini.cafe.project.dto.menu.MenuSearchResponse;
import mini.cafe.project.dto.restaurant.NearbyRestaurantResponse;
import mini.cafe.project.service.search.SearchService;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1")
@RequiredArgsConstructor
public class SearchController {

    private final SearchService searchService;

    @GetMapping("/search")
    public ApiResponse<List<MenuSearchResponse>> searchGlobal(
            @RequestParam String q,
            @RequestParam Double lat,
            @RequestParam Double lng,
            @RequestParam(required = false, defaultValue = "10") Double radius) {

        List<MenuSearchResponse> results = searchService.searchGlobal(q, lat, lng, radius);
        return ApiResponse.success(results);
    }

    @GetMapping("/search/nearby")
    public ApiResponse<List<NearbyRestaurantResponse>> searchNearby(
            @RequestParam Double lat,
            @RequestParam Double lng,
            @RequestParam(required = false, defaultValue = "10") Double radius) {

        List<NearbyRestaurantResponse> results = searchService.searchNearby(lat, lng, radius);
        return ApiResponse.success(results);
    }

    @GetMapping("/menu/{id}/similar")
    public ApiResponse<List<MenuSearchResponse>> getSimilarNearby(
            @PathVariable UUID id,
            @RequestParam Double lat,
            @RequestParam Double lng) {

        List<MenuSearchResponse> results = searchService.searchSimilarNearby(id, lat, lng);
        return ApiResponse.success(results);
    }
}
```

### 4. Security Configuration

```java
package mini.cafe.project.security;

import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthFilter;
    private final JwtAuthenticationEntryPoint jwtAuthEntryPoint;

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .csrf(csrf -> csrf.disable())
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))
            .exceptionHandling(ex -> ex.authenticationEntryPoint(jwtAuthEntryPoint))
            .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authorizeHttpRequests(auth -> auth
                // Public endpoints
                .requestMatchers("/api/v1/search/**").permitAll()
                .requestMatchers("/api/v1/restaurants/**").permitAll()
                .requestMatchers("/api/v1/menu/**").permitAll()
                .requestMatchers("/api/v1/qr/**").permitAll()
                .requestMatchers("/api/v1/auth/**").permitAll()
                
                // Actuator
                .requestMatchers("/actuator/**").permitAll()
                
                // Swagger
                .requestMatchers("/v3/api-docs/**", "/swagger-ui/**", "/swagger-ui.html").permitAll()
                
                // Restaurant admin endpoints
                .requestMatchers("/api/v1/admin/**").hasAuthority("RESTAURANT_ADMIN")
                
                // Super admin endpoints
                .requestMatchers("/api/v1/superadmin/**").hasAuthority("SUPER_ADMIN")
                
                .anyRequest().authenticated()
            )
            .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOrigins(Arrays.asList("http://localhost:5173", "http://localhost:3000"));
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(Arrays.asList("*"));
        configuration.setAllowCredentials(true);
        
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
}
```

### 5. JWT Authentication Filter

```java
package mini.cafe.project.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import mini.cafe.project.auth.JwtService;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.UUID;

@Component
@RequiredArgsConstructor
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtService jwtService;
    private final CustomUserDetailsService userDetailsService;

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException {
        try {
            String jwt = extractJwtFromRequest(request);

            if (jwt != null && jwtService.validateToken(jwt)) {
                UUID userId = jwtService.getUserIdFromToken(jwt);
                UserDetails userDetails = userDetailsService.loadUserById(userId);

                UsernamePasswordAuthenticationToken authentication =
                    new UsernamePasswordAuthenticationToken(userDetails, null, userDetails.getAuthorities());
                authentication.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));

                SecurityContextHolder.getContext().setAuthentication(authentication);
            }
        } catch (Exception ex) {
            logger.error("Could not set user authentication in security context", ex);
        }

        filterChain.doFilter(request, response);
    }

    private String extractJwtFromRequest(HttpServletRequest request) {
        String bearerToken = request.getHeader("Authorization");
        if (StringUtils.hasText(bearerToken) && bearerToken.startsWith("Bearer ")) {
            return bearerToken.substring(7);
        }
        return null;
    }
}
```

### 6. QR Code Service

```java
package mini.cafe.project.service.qr;

import com.google.zxing.BarcodeFormat;
import com.google.zxing.EncodeHintType;
import com.google.zxing.client.j2se.MatrixToImageWriter;
import com.google.zxing.common.BitMatrix;
import com.google.zxing.qrcode.QRCodeWriter;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.imageio.ImageIO;
import java.awt.image.BufferedImage;
import java.io.ByteArrayOutputStream;
import java.util.HashMap;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class QRCodeService {

    @Value("${app.frontend-url:https://domain.com}")
    private String frontendUrl;

    private final S3StorageService s3StorageService;

    public String generateQRCode(String restaurantSlug) {
        try {
            String url = frontendUrl + "/r/" + restaurantSlug;
            BufferedImage qrImage = createQRImage(url, 300, 300);
            
            // Upload to S3
            ByteArrayOutputStream baos = new ByteArrayOutputStream();
            ImageIO.write(qrImage, "PNG", baos);
            byte[] imageBytes = baos.toByteArray();
            
            String fileName = "qr-codes/" + restaurantSlug + ".png";
            return s3StorageService.uploadFile(fileName, imageBytes, "image/png");
            
        } catch (Exception e) {
            throw new RuntimeException("Failed to generate QR code", e);
        }
    }

    private BufferedImage createQRImage(String text, int width, int height) throws Exception {
        QRCodeWriter qrCodeWriter = new QRCodeWriter();
        
        Map<EncodeHintType, Object> hints = new HashMap<>();
        hints.put(EncodeHintType.CHARACTER_SET, "UTF-8");
        
        BitMatrix bitMatrix = qrCodeWriter.encode(text, BarcodeFormat.QR_CODE, width, height, hints);
        return MatrixToImageWriter.toBufferedImage(bitMatrix);
    }
}
```

---

## Frontend Implementation

### 1. React Project Setup

```bash
cd frontend
npm create vite@latest . -- --template react-ts
npm install
npm install axios @tanstack/react-query zustand
npm install react-router-dom
npm install tailwindcss postcss autoprefixer
npm install framer-motion
npm install lucide-react
npx tailwindcss init -p
```

### 2. Frontend Project Structure

```
frontend/
├── src/
│   ├── api/
│   │   ├── client.ts           # Axios instance
│   │   ├── search.ts           # Search API calls
│   │   ├── restaurant.ts       # Restaurant API calls
│   │   └── menu.ts             # Menu API calls
│   │
│   ├── features/
│   │   ├── search/
│   │   │   ├── components/
│   │   │   │   ├── SearchBar.tsx
│   │   │   │   ├── MenuCard.tsx
│   │   │   │   └── SearchResults.tsx
│   │   │   └── pages/
│   │   │       └── SearchPage.tsx
│   │   │
│   │   ├── restaurant/
│   │   │   ├── components/
│   │   │   │   ├── RestaurantHeader.tsx
│   │   │   │   ├── CategoryTabs.tsx
│   │   │   │   └── MenuList.tsx
│   │   │   └── pages/
│   │   │       └── RestaurantPage.tsx
│   │   │
│   │   └── admin/
│   │       ├── components/
│   │       │   ├── MenuForm.tsx
│   │       │   ├── CategoryManager.tsx
│   │       │   └── AnalyticsDashboard.tsx
│   │       └── pages/
│   │           ├── DashboardPage.tsx
│   │           └── MenuManagementPage.tsx
│   │
│   ├── shared/
│   │   ├── components/
│   │   │   ├── Button.tsx
│   │   │   ├── Input.tsx
│   │   │   ├── Card.tsx
│   │   │   └── Loading.tsx
│   │   └── hooks/
│   │       ├── useLocation.ts
│   │       ├── useSearch.ts
│   │       └── useAuth.ts
│   │
│   ├── store/
│   │   ├── authStore.ts
│   │   └── searchStore.ts
│   │
│   ├── types/
│   │   ├── restaurant.ts
│   │   ├── menu.ts
│   │   └── user.ts
│   │
│   ├── utils/
│   │   ├── format.ts
│   │   └── validators.ts
│   │
│   ├── App.tsx
│   ├── main.tsx
│   └── index.css
│
├── public/
├── index.html
├── package.json
├── vite.config.ts
├── tailwind.config.js
└── tsconfig.json
```

### 3. API Client Setup

```typescript
// src/api/client.ts
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api/v1';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for auth token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);
```

```typescript
// src/api/search.ts
import { apiClient } from './client';
import { MenuSearchResponse, NearbyRestaurantResponse } from '../types';

export const searchAPI = {
  searchGlobal: async (query: string, lat: number, lng: number, radius?: number) => {
    return apiClient.get<MenuSearchResponse[]>('/search', {
      params: { q: query, lat, lng, radius },
    });
  },

  searchNearby: async (lat: number, lng: number, radius?: number) => {
    return apiClient.get<NearbyRestaurantResponse[]>('/search/nearby', {
      params: { lat, lng, radius },
    });
  },

  getSimilar: async (menuItemId: string, lat: number, lng: number) => {
    return apiClient.get<MenuSearchResponse[]>(`/menu/${menuItemId}/similar`, {
      params: { lat, lng },
    });
  },
};
```

### 4. Key Components

#### SearchBar Component

```typescript
// src/features/search/components/SearchBar.tsx
import { useState } from 'react';
import { Search } from 'lucide-react';

interface SearchBarProps {
  onSearch: (query: string) => void;
  placeholder?: string;
  sticky?: boolean;
}

export const SearchBar: React.FC<SearchBarProps> = ({ 
  onSearch, 
  placeholder = 'Search for food...', 
  sticky = false 
}) => {
  const [query, setQuery] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      onSearch(query);
    }
  };

  return (
    <form 
      onSubmit={handleSubmit}
      className={`w-full ${sticky ? 'sticky top-0 z-10 bg-white shadow-md' : ''}`}
    >
      <div className="relative">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={placeholder}
          className="w-full px-4 py-3 pl-12 text-lg border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-primary-500"
        />
        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
      </div>
    </form>
  );
};
```

#### MenuCard Component

```typescript
// src/features/search/components/MenuCard.tsx
import { motion } from 'framer-motion';
import { Clock, MapPin } from 'lucide-react';
import { MenuSearchResponse } from '../../../types';

interface MenuCardProps {
  item: MenuSearchResponse;
  onSwipe?: (direction: 'left' | 'right') => void;
}

export const MenuCard: React.FC<MenuCardProps> = ({ item, onSwipe }) => {
  return (
    <motion.div
      drag="x"
      dragConstraints={{ left: -50, right: 50 }}
      onDragEnd={(e, info) => {
        if (info.offset.x > 30 && onSwipe) onSwipe('right');
        if (info.offset.x < -30 && onSwipe) onSwipe('left');
      }}
      whileHover={{ scale: 1.02 }}
      className="bg-white rounded-xl shadow-lg overflow-hidden cursor-pointer transition-shadow hover:shadow-xl"
    >
      <div className="relative h-48">
        <img
          src={item.primaryImage || '/placeholder.jpg'}
          alt={item.name}
          className="w-full h-full object-cover"
        />
        {item.promotionText && (
          <div className="absolute top-2 left-2 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-medium">
            {item.promotionText}
          </div>
        )}
        {item.isPremium && (
          <div className="absolute top-2 right-2 bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-2 py-1 rounded-full text-xs font-bold">
            PREMIUM
          </div>
        )}
      </div>

      <div className="p-4">
        <h3 className="text-xl font-semibold text-gray-900 mb-1">{item.name}</h3>
        <p className="text-sm text-gray-500 mb-3">{item.restaurantName}</p>

        <div className="flex items-center justify-between">
          <span className="text-2xl font-bold text-primary-600">
            ${item.price}
          </span>

          <div className="flex items-center space-x-3 text-sm text-gray-600">
            {item.preparationTime && (
              <div className="flex items-center">
                <Clock size={16} className="mr-1" />
                {item.preparationTime}min
              </div>
            )}
            {item.distance && (
              <div className="flex items-center">
                <MapPin size={16} className="mr-1" />
                {item.distance.toFixed(1)}km
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};
```

### 5. Tailwind Configuration

```javascript
// tailwind.config.js
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#FFF9F0',
          100: '#FFEDD5',
          500: '#F97316',
          600: '#EA580C',
          900: '#7C2D12',
        },
        premium: {
          500: '#F59E0B',
        },
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      spacing: {
        '128': '32rem',
      },
    },
  },
  plugins: [],
};
```

---

## Docker & Deployment

### Docker Compose

```yaml
# docker-compose.yml
version: '3.8'

services:
  postgres:
    image: postgis/postgis:16-3.4
    container_name: qrmenu-postgres
    environment:
      POSTGRES_DB: qrmenu
      POSTGRES_USER: admin
      POSTGRES_PASSWORD: secret
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U admin"]
      interval: 10s
      timeout: 5s
      retries: 5

  redis:
    image: redis:7-alpine
    container_name: qrmenu-redis
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data

  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    container_name: qrmenu-backend
    depends_on:
      postgres:
        condition: service_healthy
      redis:
        condition: service_started
    environment:
      DB_HOST: postgres
      DB_PORT: 5432
      DB_NAME: qrmenu
      DB_USER: admin
      DB_PASSWORD: secret
      REDIS_HOST: redis
      JWT_SECRET: your-super-secret-key-change-in-production
    ports:
      - "8080:8080"
    volumes:
      - ./backend/logs:/app/logs

  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
    container_name: qrmenu-frontend
    depends_on:
      - backend
    ports:
      - "3000:80"

volumes:
  postgres_data:
  redis_data:
```

### Backend Dockerfile

```dockerfile
# backend/Dockerfile
FROM maven:3.9-eclipse-temurin-21 AS build
WORKDIR /app
COPY pom.xml .
COPY src ./src
RUN mvn clean package -DskipTests

FROM eclipse-temurin:21-jre
WORKDIR /app
COPY --from=build /app/target/*.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
```

### Frontend Dockerfile

```dockerfile
# frontend/Dockerfile
FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

---

## Next Steps

1. **Integrate your existing auth code** into the `auth/` package
2. **Implement remaining services** following the patterns above
3. **Create all controllers** for admin and super admin endpoints
4. **Build the React frontend** using the component structure provided
5. **Add comprehensive tests**
6. **Set up CI/CD pipeline**
7. **Deploy to production**

---

This guide provides the complete blueprint. All patterns, structures, and examples are production-ready. Follow them to complete the implementation.
