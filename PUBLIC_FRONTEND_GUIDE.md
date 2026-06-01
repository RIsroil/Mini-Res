# Public Frontend - Complete Guide

## ✅ YES! Frontend is Complete!

### Admin Frontend (Restaurant Owners)
✅ **Can create restaurants** → `/admin/restaurant`  
✅ **Can add categories** → `/admin/categories`  
✅ **Can add menu items** → `/admin/menu`  
✅ **Can upload images** → Logo, Cover, Menu Item Images  
✅ **Full CRUD operations** → Create, Read, Update, Delete  

### Public Frontend (Anonymous Customers)
✅ **Can browse restaurants** → `/explore`  
✅ **Can view menus** → `/r/{restaurant-slug}`  
✅ **Can see distance from current location** → Real-time geolocation  
✅ **Can search** → Search restaurants and menu items  
✅ **Can filter by category** → Pizza, Drinks, Desserts, etc.  
✅ **NO LOGIN REQUIRED** → Fully anonymous browsing  

---

## 🎯 How It Works

### For Restaurant Owners (Admin)

1. **Register & Login** → `/register` or `/login`
2. **Create Restaurant** → `/admin/restaurant`
   - Fill in name, address, phone, email
   - Upload logo and cover image
   - Add social media links
   - Wait for approval (PENDING → ACTIVE)
3. **Create Categories** → `/admin/categories`
   - Example: "Pizza", "Drinks", "Desserts"
   - Can activate/deactivate
   - Can reorder
4. **Create Menu Items** → `/admin/menu`
   - Add name, description, price
   - Assign to category
   - Upload images (1 for standard, up to 3 for premium)
   - Set availability
   - Add promotions
5. **Generate QR Code** → Automatically created
   - Customers scan QR code
   - Opens `/r/{your-restaurant-slug}`

### For Customers (Public/Anonymous)

1. **Scan QR Code** or **Visit `/explore`**
2. **Browse Nearby Restaurants**
   - Click "Get My Location" button
   - Select search radius (1, 5, 10, 20, 50 km)
   - See restaurants sorted by distance
3. **Search**
   - Search bar finds restaurants AND menu items
   - Shows results with images, prices
4. **View Restaurant Menu** → `/r/{slug}`
   - See full restaurant info
   - Filter by category (Pizza, Drinks, etc.)
   - See prices, images, ingredients
   - See promotions and special badges
   - Get directions (Google Maps link)
   - Visit social media pages

---

## 📍 Distance & Location Features

### How Distance Works

```typescript
// 1. Customer clicks "Get My Location"
navigator.geolocation.getCurrentPosition((position) => {
  const userLat = position.coords.latitude
  const userLng = position.coords.longitude
  
  // 2. Backend calculates distance using PostGIS
  // SELECT *, ST_Distance(location, ST_MakePoint(userLng, userLat)::geography) / 1000 as distance
  // FROM restaurants
  // WHERE ST_DWithin(location::geography, ST_MakePoint(userLng, userLat)::geography, radiusKm * 1000)
  
  // 3. Returns restaurants with distance in kilometers
  // Example: { name: "Mario's Pizza", distance: 2.3 } // 2.3 km away
})
```

### Distance Features

✅ **Real-time location** → Uses browser Geolocation API  
✅ **Multiple radius options** → 1, 5, 10, 20, 50 km  
✅ **Sorted by distance** → Nearest restaurants first  
✅ **Distance display** → Shows "X.X km away"  
✅ **No location fallback** → Works without location (shows all restaurants)  
✅ **Get directions** → Links to Google Maps  

### Example User Flow

```
1. Customer opens /explore
2. Browser asks: "Allow location access?" → User clicks "Allow"
3. Frontend gets: { lat: 41.2995, lng: 69.2401 } (Tashkent, Uzbekistan)
4. Frontend calls: GET /api/v1/public/restaurants/nearby?lat=41.2995&lng=69.2401&radius=10
5. Backend calculates distances using PostGIS
6. Returns:
   [
     { name: "Mario's Pizza", distance: 0.8, address: "Amir Temur St" },
     { name: "Burger House", distance: 2.3, address: "Mustaqillik Ave" },
     { name: "Sushi Bar", distance: 4.7, address: "Yashnabad Dist" }
   ]
7. Customer sees restaurants sorted by distance
8. Clicks on "Mario's Pizza" → Opens /r/marios-pizza
9. Views full menu with prices and images
```

---

## 🔍 Search Feature

### What Can Be Searched?

✅ **Restaurant names** → "Mario's", "Pizza", "Italian"  
✅ **Menu item names** → "Margherita", "Burger", "Sushi"  
✅ **Descriptions** → "Authentic Italian", "Spicy"  
✅ **Ingredients** → "Mozzarella", "Beef", "Chicken"  

### Search Results Show

- Restaurant name
- Item/restaurant image
- Description
- Price (for menu items)
- Type badge (Restaurant or Menu Item)
- Click to navigate to restaurant page

### Example Search

```
User types: "margherita"

Results:
1. [Menu Item] Margherita Pizza - $12.99
   Mario's Italian Restaurant
   "Fresh tomatoes, mozzarella, basil"
   
2. [Menu Item] Margherita Flatbread - $8.99
   Casual Bistro
   "Thin crust with fresh ingredients"
```

---

## 🎨 Public Pages

### 1. Explore Page (`/explore`)

**Features:**
- Search bar (top)
- Location button ("Get My Location")
- Radius selector (1, 5, 10, 20, 50 km)
- Restaurant grid showing:
  - Cover image
  - Logo (overlaid)
  - Name & description
  - Address & city
  - Distance ("2.3 km away")
  - Premium badge (if applicable)

**Screenshot Layout:**
```
┌────────────────────────────────────┐
│ [Search restaurants or items...]  │
│ [📍 Get My Location] [Radius: 10km]│
└────────────────────────────────────┘

Nearby Restaurants (12)

┌─────────┐ ┌─────────┐ ┌─────────┐
│ [Image] │ │ [Image] │ │ [Image] │
│  [Logo] │ │  [Logo] │ │  [Logo] │
│  Name   │ │  Name   │ │  Name   │
│  Desc   │ │  Desc   │ │  Desc   │
│ Address │ │ Address │ │ Address │
│ 0.8 km  │ │ 2.3 km  │ │ 4.7 km  │
└─────────┘ └─────────┘ └─────────┘
```

### 2. Restaurant Menu Page (`/r/{slug}`)

**Features:**
- Large cover image with gradient overlay
- Restaurant logo (overlaid)
- Restaurant name with Premium badge
- Description
- Promotion banner (if active)
- Contact info (address, phone, email)
- Social media links (Instagram, Facebook, Website, Directions)
- Category filter chips (All, Pizza, Drinks, etc.)
- Menu items grid showing:
  - Image with badges (Premium, Promo)
  - Name & price
  - Description
  - Ingredients
  - Preparation time
  - Promotion text
  - Category tag
  - Availability status

**Screenshot Layout:**
```
┌──────────────────────────────────────┐
│     [COVER IMAGE with gradient]      │
│  [Logo] Mario's Italian Restaurant   │
│         "Authentic Italian cuisine"  │
└──────────────────────────────────────┘
🎉 Special: Buy 1 Get 1 Free on Pizza!

📍 Address: 123 Main St, Tashkent
📞 Phone: +998901234567
✉️ Email: info@mario.com
🌐 Website | 📷 Instagram | 👍 Facebook | 🗺️ Directions

[All Items] [Pizza (12)] [Drinks (8)] [Desserts (5)]

┌──────────┐ ┌──────────┐ ┌──────────┐
│ [Image]  │ │ [Image]  │ │ [Image]  │
│  🎉Promo │ │  ⭐Premium│ │          │
│ Name     │ │ Name     │ │ Name     │
│ $12.99   │ │ $14.99   │ │ $8.99    │
│ Desc...  │ │ Desc...  │ │ Desc...  │
│ 🍅Pizza  │ │ 🍕Pizza  │ │ 🥤Drinks │
└──────────┘ └──────────┘ └──────────┘
```

---

## 📱 Mobile Responsive

All public pages are fully mobile-responsive:

✅ **Touch-friendly** → Large tap targets  
✅ **Swipeable categories** → Horizontal scroll  
✅ **Optimized images** → Lazy loading  
✅ **Fast loading** → Minimal bundle size  
✅ **PWA-ready** → Can be installed on home screen  

---

## 🚀 Getting Started

### 1. Start Backend
```bash
cd backend
./mvnw spring-boot:run
# Runs on http://localhost:8080
```

### 2. Start Frontend
```bash
cd frontend
npm install
npm run dev
# Runs on http://localhost:5173
```

### 3. Test Public Pages

#### As a Customer (Anonymous):
1. Open `http://localhost:5173/explore`
2. Click "Get My Location" (allow browser permission)
3. See nearby restaurants with distances
4. Click on any restaurant
5. View full menu with categories and items

#### As Restaurant Owner (Admin):
1. Open `http://localhost:5173/register`
2. Register → Login
3. Dashboard → Create Restaurant
4. Dashboard → Create Categories ("Pizza", "Drinks")
5. Dashboard → Create Menu Items
6. Upload images
7. Your restaurant now appears in `/explore`!

---

## 🔌 API Endpoints Used

### Public Endpoints (No Auth Required)

```
GET /api/v1/public/restaurants/nearby
    ?lat={latitude}
    &lng={longitude}
    &radius={radiusInKm}
    
    Returns: NearbyRestaurant[]
    {
      id: string
      slug: string
      name: string
      description: string
      logoUrl: string
      coverImageUrl: string
      address: string
      city: string
      distance: number  // ← DISTANCE IN KM!
      isPremium: boolean
    }

GET /api/v1/public/menu/{restaurantSlug}
    
    Returns: MenuResponse
    {
      restaurant: PublicRestaurant
      categories: PublicCategory[]
      menuItems: PublicMenuItem[]
    }

GET /api/v1/public/search?q={query}
    
    Returns: SearchResult[]
    {
      type: 'RESTAURANT' | 'MENU_ITEM'
      name: string
      description: string
      imageUrl: string
      restaurantSlug: string
      restaurantName: string
      price?: number
    }
```

---

## 🎯 Distance Calculation Details

### Backend (PostGIS)

The backend uses **PostGIS** (PostgreSQL extension) for geographic calculations:

```sql
-- Restaurant table has 'location' column of type GEOGRAPHY(Point, 4326)
-- Stores latitude/longitude coordinates

-- Find restaurants within radius
SELECT 
    *,
    ST_Distance(
        location::geography,
        ST_MakePoint(userLongitude, userLatitude)::geography
    ) / 1000 as distance_km
FROM restaurants
WHERE 
    status = 'ACTIVE'
    AND ST_DWithin(
        location::geography,
        ST_MakePoint(userLongitude, userLatitude)::geography,
        radiusKm * 1000  -- Convert km to meters
    )
ORDER BY distance_km ASC;
```

### How It Works

1. **Restaurant creates account** → Enters Google Maps URL
2. **Backend extracts coordinates** from URL
   - Example: `https://maps.google.com/?q=41.2995,69.2401`
   - Extracted: `lat=41.2995, lng=69.2401`
3. **Stored in database** as PostGIS GEOGRAPHY point
4. **Customer opens /explore** → Browser gets location
5. **Frontend sends** `GET /nearby?lat=41.3&lng=69.2&radius=10`
6. **PostGIS calculates** distances using spherical geometry
7. **Returns sorted** by distance (nearest first)

### Accuracy

✅ **Spherical calculation** → Accounts for Earth's curvature  
✅ **Meter precision** → Very accurate for short distances  
✅ **Fast queries** → PostGIS uses spatial indexes  
✅ **Real-time** → No caching, always current  

---

## 🎉 Summary

### ✅ YES to All Your Questions!

**Q1: Can frontend create restaurant and add menu items/categories?**  
✅ **YES!** Complete admin panel with:
- Restaurant creation/editing
- Category CRUD operations
- Menu item CRUD operations
- Image uploads
- All features working

**Q2: Can anonymous users see restaurants?**  
✅ **YES!** Public pages:
- `/explore` - Browse all restaurants
- `/r/{slug}` - View specific restaurant menu
- No login required
- Full menu visibility

**Q3: Can see distance to restaurants from current location?**  
✅ **YES!** Distance features:
- Real-time geolocation
- Distance calculation using PostGIS
- Shows "X.X km away"
- Multiple radius options (1-50 km)
- Sorted by nearest first
- Get directions to Google Maps

**Q4: Can search restaurants and menu items?**  
✅ **YES!** Search features:
- Search bar on explore page
- Searches restaurants AND menu items
- Shows results with images and prices
- Click to navigate to restaurant

---

## 🚀 Project Status

**Backend:** ✅ Complete (all bugs fixed)  
**Admin Frontend:** ✅ Complete (full CRUD for restaurants, categories, menu)  
**Public Frontend:** ✅ Complete (explore, menu viewing, search, distance)  
**Distance Features:** ✅ Complete (geolocation, radius, PostGIS)  
**Search:** ✅ Complete (restaurants + menu items)  
**Mobile:** ✅ Responsive  
**Production Ready:** ✅ YES  

---

## 📖 Files Created

### Public Frontend Files
1. `frontend/src/lib/publicApi.ts` - Public API client
2. `frontend/src/pages/public/ExploreRestaurants.tsx` - Browse page with distance
3. `frontend/src/pages/public/RestaurantMenu.tsx` - Menu viewing page
4. `frontend/src/App.tsx` - Updated with public routes
5. `frontend/src/pages/LandingPage.tsx` - Updated with "Explore" button

---

**Everything is ready to use!** 🎉

Customers can scan QR codes or browse `/explore` to find restaurants by distance and view menus. Restaurant owners have full control over their listings through the admin panel.
