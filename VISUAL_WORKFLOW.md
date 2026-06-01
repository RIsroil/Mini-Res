# Visual Workflow Guide

## 🎯 Complete System Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                     QR MENU PLATFORM                            │
│                                                                 │
│  Restaurant Owners (Admin)          Customers (Public)         │
│         ↓                                  ↓                    │
│    Admin Panel                        Public Pages             │
│    (Login Required)                   (No Login)               │
└─────────────────────────────────────────────────────────────────┘
```

---

## 👨‍💼 Restaurant Owner Journey

### Step 1: Register & Login
```
┌──────────────────────────┐
│  📱 Register             │
│  • Phone: +998901234567  │
│  • OTP Verification      │
│  • Set Password          │
└──────────────────────────┘
           ↓
┌──────────────────────────┐
│  🔐 Login                │
│  • Phone + Password      │
│  • Get Access Token      │
└──────────────────────────┘
```

### Step 2: Create Restaurant
```
┌──────────────────────────────────────┐
│  🏪 Restaurant Management            │
│  (/admin/restaurant)                 │
│                                      │
│  • Name: "Mario's Italian"           │
│  • Phone: +998901234567              │
│  • Email: info@mario.com             │
│  • Address: 123 Main St, Tashkent    │
│  • Google Maps: [paste link]         │
│    → Coordinates extracted:          │
│      lat: 41.2995, lng: 69.2401      │
│  • Upload Logo (200x200px)           │
│  • Upload Cover (1200x400px)         │
│                                      │
│  Status: PENDING → ACTIVE ✅         │
└──────────────────────────────────────┘
```

### Step 3: Create Categories
```
┌──────────────────────────────────────┐
│  📁 Categories Management            │
│  (/admin/categories)                 │
│                                      │
│  ┌────────────────────────────────┐  │
│  │ Category 1: "Pizza"      [✓]   │  │
│  │ Items: 12    Order: 1          │  │
│  │ [Edit] [Delete] [Deactivate]   │  │
│  └────────────────────────────────┘  │
│  ┌────────────────────────────────┐  │
│  │ Category 2: "Drinks"     [✓]   │  │
│  │ Items: 8     Order: 2          │  │
│  │ [Edit] [Delete] [Deactivate]   │  │
│  └────────────────────────────────┘  │
│  ┌────────────────────────────────┐  │
│  │ Category 3: "Desserts"   [✓]   │  │
│  │ Items: 5     Order: 3          │  │
│  │ [Edit] [Delete] [Deactivate]   │  │
│  └────────────────────────────────┘  │
│                                      │
│  [+ Add Category]                    │
└──────────────────────────────────────┘
```

### Step 4: Create Menu Items
```
┌──────────────────────────────────────────────────────┐
│  🍕 Menu Management (/admin/menu)                    │
│                                                      │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐   │
│  │   [Image]   │ │   [Image]   │ │   [Image]   │   │
│  │  🎉 PROMO   │ │  ⭐ PREMIUM  │ │             │   │
│  │             │ │             │ │             │   │
│  │ Margherita  │ │ Pepperoni   │ │ Coca Cola   │   │
│  │ Pizza       │ │ Pizza       │ │             │   │
│  │ $12.99      │ │ $14.99      │ │ $2.99       │   │
│  │             │ │             │ │             │   │
│  │ 🍕 Pizza    │ │ 🍕 Pizza    │ │ 🥤 Drinks   │   │
│  │ ✅ Available│ │ ✅ Available│ │ ✅ Available│   │
│  │             │ │             │ │             │   │
│  │ [Toggle]    │ │ [Toggle]    │ │ [Toggle]    │   │
│  │ [Edit]      │ │ [Edit]      │ │ [Edit]      │   │
│  │ [Delete]    │ │ [Delete]    │ │ [Delete]    │   │
│  │ Upload Image│ │ Upload Image│ │ Upload Image│   │
│  └─────────────┘ └─────────────┘ └─────────────┘   │
│                                                      │
│  [+ Add Menu Item]                                   │
└──────────────────────────────────────────────────────┘
```

---

## 👥 Customer Journey

### Option 1: Scan QR Code
```
┌────────────────────────┐
│  📱 Customer's Phone   │
│                        │
│  Camera → Scan QR Code │
│           ↓            │
│  Opens: /r/marios      │
└────────────────────────┘
```

### Option 2: Browse Nearby
```
┌────────────────────────────────────────┐
│  🔍 Explore Page (/explore)            │
│                                        │
│  [Search restaurants or items...]      │
│  [📍 Get My Location] [Radius: 10 km] │
│                                        │
│  Your Location: 41.3000, 69.2500      │
└────────────────────────────────────────┘
           ↓
┌────────────────────────────────────────┐
│  Nearby Restaurants (12 found)         │
│                                        │
│  ┌──────────────┐ ┌──────────────┐    │
│  │  [Image]     │ │  [Image]     │    │
│  │   [Logo]     │ │   [Logo]     │    │
│  │ Mario's      │ │ Burger House │    │
│  │ Italian      │ │              │    │
│  │ Restaurant   │ │ Fast food    │    │
│  │              │ │              │    │
│  │ 123 Main St  │ │ 456 Ave St   │    │
│  │ Tashkent     │ │ Tashkent     │    │
│  │              │ │              │    │
│  │ 📍 0.8 km    │ │ 📍 2.3 km    │    │
│  └──────────────┘ └──────────────┘    │
└────────────────────────────────────────┘
```

### View Restaurant Menu
```
┌───────────────────────────────────────────────────┐
│  🏪 Mario's Italian Restaurant                    │
│  (/r/marios)                                      │
│                                                   │
│  ┌─────────────────────────────────────────────┐ │
│  │        [COVER IMAGE - 1200x400]             │ │
│  │                                             │ │
│  │  [Logo] Mario's Italian Restaurant          │ │
│  │         "Authentic Italian cuisine"         │ │
│  └─────────────────────────────────────────────┘ │
│                                                   │
│  🎉 SPECIAL: Buy 1 Get 1 Free on Pizza!          │
│                                                   │
│  📍 123 Main St, Tashkent                        │
│  📞 +998901234567                                │
│  ✉️ info@mario.com                               │
│  🌐 Website | 📷 Instagram | 🗺️ Directions        │
│                                                   │
│  ┌───────────────────────────────────────────┐   │
│  │ [All Items] [Pizza (12)] [Drinks (8)]     │   │
│  │            [Desserts (5)]                  │   │
│  └───────────────────────────────────────────┘   │
│                                                   │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐            │
│  │ [Image] │ │ [Image] │ │ [Image] │            │
│  │  🎉     │ │         │ │         │            │
│  │         │ │         │ │         │            │
│  │Margherit│ │Pepperoni│ │Hawaiian │            │
│  │  Pizza  │ │  Pizza  │ │  Pizza  │            │
│  │ $12.99  │ │ $14.99  │ │ $13.99  │            │
│  │         │ │         │ │         │            │
│  │Fresh    │ │Spicy    │ │Sweet &  │            │
│  │tomatoes │ │pepperoni│ │savory   │            │
│  │         │ │         │ │         │            │
│  │🕐 15 min│ │🕐 15 min│ │🕐 20 min│            │
│  │🍕 Pizza │ │🍕 Pizza │ │🍕 Pizza │            │
│  └─────────┘ └─────────┘ └─────────┘            │
└───────────────────────────────────────────────────┘
```

---

## 🔄 Data Flow Diagram

### Creating a Menu Item

```
Admin Dashboard
      ↓
[+ Add Menu Item]
      ↓
┌──────────────────────────┐
│ Form:                    │
│ • Name: "Margherita"     │
│ • Description: "..."     │
│ • Price: 12.99           │
│ • Category: Pizza        │
│ • Upload Image           │
└──────────────────────────┘
      ↓
Frontend (React)
  - Validates form
  - Creates FormData
      ↓
API Call:
POST /api/v1/admin/menu
Authorization: Bearer {token}
      ↓
Backend Controller
  - Verifies JWT token
  - Gets current user
  - Gets user's restaurant
      ↓
Service Layer
  - Validates categoryId
  - Checks ownership
  - Creates MenuItem entity
      ↓
Database (PostgreSQL)
  - Saves to menu_items table
  - Returns saved entity
      ↓
Backend Response
  - MenuItem DTO
  - Success message
      ↓
Frontend Updates
  - Shows toast notification
  - Refreshes menu list
  - Displays new item card
```

### Customer Viewing Menu

```
Customer Opens
  /r/marios
      ↓
Frontend (React)
  - Extracts slug from URL
  - Shows loading spinner
      ↓
API Call:
GET /api/v1/public/menu/marios
(No auth required!)
      ↓
Backend Controller
  - Finds restaurant by slug
  - Checks status = ACTIVE
      ↓
Service Layer
  - Gets restaurant
  - Gets active categories
  - Gets available menu items
  - Filters by isActive=true
      ↓
Database Query
SELECT r.*, c.*, m.*
FROM restaurants r
LEFT JOIN menu_categories c ON c.restaurant_id = r.id
LEFT JOIN menu_items m ON m.category_id = c.id
WHERE r.slug = 'marios'
  AND r.status = 'ACTIVE'
  AND c.deleted_at IS NULL
  AND c.is_active = true
  AND m.deleted_at IS NULL
  AND m.is_active = true
  AND m.is_available = true
ORDER BY c.display_order, m.name
      ↓
Backend Response
{
  restaurant: { name, logo, cover, ... },
  categories: [ {id, name, ...}, ... ],
  menuItems: [ {name, price, image, ...}, ... ]
}
      ↓
Frontend Renders
  - Restaurant header
  - Category chips
  - Menu item cards
```

### Finding Nearby Restaurants

```
Customer Opens /explore
      ↓
[Get My Location]
      ↓
Browser Geolocation API
navigator.geolocation.getCurrentPosition()
      ↓
User Approves
  ✅ Allow location access
      ↓
Get Coordinates
  lat: 41.3000
  lng: 69.2500
      ↓
API Call:
GET /api/v1/public/restaurants/nearby
  ?lat=41.3000
  &lng=69.2500
  &radius=10
      ↓
Backend (PostGIS Query)
SELECT 
  r.*,
  ST_Distance(
    r.location::geography,
    ST_MakePoint(69.2500, 41.3000)::geography
  ) / 1000 as distance_km
FROM restaurants r
WHERE r.status = 'ACTIVE'
  AND ST_DWithin(
    r.location::geography,
    ST_MakePoint(69.2500, 41.3000)::geography,
    10000  -- 10 km in meters
  )
ORDER BY distance_km ASC;
      ↓
Results:
[
  { name: "Mario's", distance: 0.8 },
  { name: "Burger House", distance: 2.3 },
  { name: "Sushi Bar", distance: 4.7 }
]
      ↓
Frontend Displays
┌──────────────┐
│ Mario's      │
│ 📍 0.8 km    │
└──────────────┘
┌──────────────┐
│ Burger House │
│ 📍 2.3 km    │
└──────────────┘
┌──────────────┐
│ Sushi Bar    │
│ 📍 4.7 km    │
└──────────────┘
```

---

## 🔐 Security Flow

### Admin Trying to Edit Another Admin's Category

```
Admin A (restaurantId: aaa-111)
tries to edit Category X (restaurantId: bbb-222)
      ↓
PUT /api/v1/admin/categories/xxx-999
Authorization: Bearer {tokenA}
{
  "name": "Hacked Category"
}
      ↓
CategoryAdminController
  - Verifies JWT → Gets User A
  - Gets Restaurant A (aaa-111)
      ↓
MenuCategoryService.updateCategory(xxx-999, request, aaa-111)
  - Finds Category X
  - Checks: category.restaurantId === aaa-111?
  - Result: NO! (Category X belongs to bbb-222)
      ↓
throw BusinessException(
  "Category does not belong to this restaurant"
)
      ↓
GlobalExceptionHandler
  - Catches BusinessException
  - Returns HTTP 400 Bad Request
      ↓
Response:
{
  "success": false,
  "message": "Category does not belong to this restaurant",
  "data": null
}
      ↓
Frontend
  - Shows error toast
  - Category remains unchanged
  - Admin A cannot hack Admin B's data ✅
```

---

## 📊 Database Schema Overview

```
users
  - id (UUID)
  - phone (unique)
  - password (hashed)
  - full_name
  - email
      ↓ owns
restaurants
  - id (UUID)
  - slug (unique)
  - admin_user_id → users.id
  - name, phone, email
  - location (GEOGRAPHY Point)
  - logo_url, cover_image_url
  - status (PENDING/ACTIVE/BLOCKED)
  - is_premium
  - deleted_at
      ↓ has many
menu_categories
  - id (UUID)
  - restaurant_id → restaurants.id
  - name
  - display_order
  - is_active
  - deleted_at
      ↓ has many
menu_items
  - id (UUID)
  - restaurant_id → restaurants.id
  - category_id → menu_categories.id
  - name, description, ingredients
  - price
  - images (JSONB array)
  - is_active, is_available
  - promotion_active, promotion_text
  - has_premium_badge
  - deleted_at
```

---

## 🎯 Complete Feature Matrix

| Feature | Admin | Customer | Status |
|---------|-------|----------|--------|
| Register/Login | ✅ | ❌ | ✅ Complete |
| Create Restaurant | ✅ | ❌ | ✅ Complete |
| Edit Restaurant | ✅ | ❌ | ✅ Complete |
| Upload Logo/Cover | ✅ | ❌ | ✅ Complete |
| Create Categories | ✅ | ❌ | ✅ Complete |
| Edit Categories | ✅ | ❌ | ✅ Complete |
| Delete Categories | ✅ | ❌ | ✅ Complete |
| Toggle Category Active | ✅ | ❌ | ✅ Complete |
| Create Menu Items | ✅ | ❌ | ✅ Complete |
| Edit Menu Items | ✅ | ❌ | ✅ Complete |
| Delete Menu Items | ✅ | ❌ | ✅ Complete |
| Upload Item Images | ✅ | ❌ | ✅ Complete |
| Toggle Availability | ✅ | ❌ | ✅ Complete |
| View Restaurants | ❌ | ✅ | ✅ Complete |
| View Menus | ❌ | ✅ | ✅ Complete |
| Find Nearby | ❌ | ✅ | ✅ Complete |
| See Distance | ❌ | ✅ | ✅ Complete |
| Search | ❌ | ✅ | ✅ Complete |
| Filter by Category | ❌ | ✅ | ✅ Complete |
| Get Directions | ❌ | ✅ | ✅ Complete |
| Scan QR Code | ❌ | ✅ | ✅ Complete |

---

## 🚀 Deployment Architecture

```
┌─────────────────────────────────────────────┐
│             PRODUCTION SETUP                │
└─────────────────────────────────────────────┘

Frontend (Static Files)
  - Vite Build → dist/
  - Deploy to: Vercel/Netlify/Nginx
  - URL: https://qrmenu.com
      ↓
API Gateway / CDN
  - Cloudflare / AWS CloudFront
      ↓
Backend (Spring Boot)
  - Docker Container
  - Deploy to: AWS EC2 / DigitalOcean / Heroku
  - URL: https://api.qrmenu.com
      ↓
Database (PostgreSQL + PostGIS)
  - AWS RDS / DigitalOcean Managed DB
  - Automated backups
      ↓
File Storage (MinIO / S3)
  - Images, QR Codes
  - CDN for fast delivery
```

---

**Project Complete!** 🎉

All features working, all bugs fixed, production ready!
