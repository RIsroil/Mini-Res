# API Testing Guide

Quick guide to test all implemented endpoints.

---

## 🚀 Setup

```bash
# 1. Start services
docker-compose up -d postgres redis

# 2. Run backend
cd backend
./mvnw spring-boot:run

# 3. Backend runs on: http://localhost:8080
```

---

## 📝 Test Sequence

### 1. Health Check

```bash
curl http://localhost:8080/actuator/health
```

Expected: `{"status":"UP"}`

---

### 2. Register Restaurant Admin

```bash
curl -X POST http://localhost:8080/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "phone": "+998901234567",
    "fullName": "Pizza Palace",
    "email": "admin@pizzapalace.com"
  }'
```

Expected: `{"success":true,"message":"Registration successful. OTP sent to your phone."}`

---

### 3. Verify OTP & Login

**Note:** In development, check logs for OTP code

```bash
curl -X POST http://localhost:8080/api/v1/auth/verify-otp \
  -H "Content-Type: application/json" \
  -d '{
    "phone": "+998901234567",
    "code": "123456"
  }'
```

Expected: JWT tokens in response. **Save the accessToken!**

```json
{
  "success": true,
  "data": {
    "accessToken": "eyJhbGc...",
    "refreshToken": "eyJhbGc...",
    "userId": "...",
    "phone": "+998901234567",
    "role": "RESTAURANT_ADMIN"
  }
}
```

---

### 4. Create Restaurant (Protected)

```bash
TOKEN="YOUR_ACCESS_TOKEN_HERE"

curl -X POST http://localhost:8080/api/v1/admin/restaurant \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "name": "Pizza Palace",
    "phone": "+998901234567",
    "email": "info@pizzapalace.com",
    "description": "Best pizza in town!",
    "address": "123 Main Street",
    "city": "Tashkent",
    "country": "Uzbekistan",
    "latitude": 41.311081,
    "longitude": 69.240562,
    "workingHours": {
      "monday": {"open": "09:00", "close": "22:00", "closed": false},
      "tuesday": {"open": "09:00", "close": "22:00", "closed": false},
      "sunday": {"closed": true}
    }
  }'
```

Expected: Restaurant created with PENDING status

---

### 5. Approve Restaurant (Super Admin)

**Login as super admin first:**

```bash
curl -X POST http://localhost:8080/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "phone": "+998901234567",
    "password": "admin123"
  }'
```

**Approve:**

```bash
ADMIN_TOKEN="SUPER_ADMIN_TOKEN"
RESTAURANT_ID="RESTAURANT_UUID"

curl -X PATCH "http://localhost:8080/api/v1/superadmin/restaurants/$RESTAURANT_ID/approve" \
  -H "Authorization: Bearer $ADMIN_TOKEN"
```

---

### 6. Create Menu Category

```bash
curl -X POST http://localhost:8080/api/v1/admin/categories \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "name": "Pizzas"
  }'
```

---

### 7. Create Menu Item

```bash
CATEGORY_ID="CATEGORY_UUID"

curl -X POST http://localhost:8080/api/v1/admin/menu \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "name": "Margherita Pizza",
    "description": "Classic pizza with tomato sauce, mozzarella, and basil",
    "ingredients": "Tomato sauce, Mozzarella cheese, Fresh basil, Olive oil",
    "price": 45000,
    "preparationTimeMinutes": 15,
    "promotionText": "Buy 2 get 1 cola free!",
    "promotionActive": true,
    "categoryId": "'$CATEGORY_ID'"
  }'
```

---

### 8. Global Search (Public)

```bash
curl "http://localhost:8080/api/v1/search?q=pizza&lat=41.311&lng=69.240&radius=10"
```

Expected: List of menu items matching "pizza" within 10km

---

### 9. Search Nearby Restaurants (Public)

```bash
curl "http://localhost:8080/api/v1/search/nearby?lat=41.311&lng=69.240&radius=5"
```

Expected: List of nearby restaurants

---

### 10. Get Restaurant by Slug (Public)

```bash
curl "http://localhost:8080/api/v1/restaurants/pizza-palace"
```

---

### 11. Track QR Scan (Public)

```bash
curl -X POST "http://localhost:8080/api/v1/qr/track/pizza-palace?lat=41.311&lng=69.240" \
  -H "User-Agent: Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X)"
```

---

### 12. View Analytics (Protected)

```bash
curl http://localhost:8080/api/v1/admin/analytics/overview \
  -H "Authorization: Bearer $TOKEN"
```

Expected: Analytics overview with scans, searches, etc.

---

### 13. Upload Restaurant Logo (Protected)

```bash
curl -X POST http://localhost:8080/api/v1/admin/images/restaurant/logo \
  -H "Authorization: Bearer $TOKEN" \
  -F "file=@/path/to/logo.jpg"
```

---

### 14. Upload Menu Item Image (Protected)

```bash
MENU_ITEM_ID="MENU_ITEM_UUID"

curl -X POST "http://localhost:8080/api/v1/admin/images/menu/$MENU_ITEM_ID" \
  -H "Authorization: Bearer $TOKEN" \
  -F "file=@/path/to/pizza.jpg"
```

---

### 15. Platform Analytics (Super Admin)

```bash
curl http://localhost:8080/api/v1/superadmin/analytics/platform \
  -H "Authorization: Bearer $ADMIN_TOKEN"
```

---

## 🧪 Postman Collection

Import this into Postman for easier testing:

**Base URL:** `http://localhost:8080`

**Environment Variables:**
- `baseUrl`: http://localhost:8080
- `token`: (set after login)
- `restaurantId`: (set after restaurant creation)

**Collections:**
1. Auth
   - Register
   - Send OTP
   - Verify OTP
   - Login
   
2. Public
   - Global Search
   - Nearby Restaurants
   - Get Restaurant
   - Track QR Scan
   
3. Restaurant Admin
   - Create Restaurant
   - Update Restaurant
   - Create Category
   - Create Menu Item
   - Upload Images
   - View Analytics
   
4. Super Admin
   - View All Restaurants
   - Approve Restaurant
   - Block Restaurant
   - Toggle Premium
   - Platform Analytics

---

## 📊 Expected Data Flow

```
1. Register → 2. Verify OTP → 3. Create Restaurant (PENDING)
                                      ↓
4. Super Admin Approves → Restaurant ACTIVE
                                      ↓
5. Create Categories → 6. Create Menu Items → 7. Upload Images
                                      ↓
8. Public can search & view → 9. QR scans tracked → 10. Analytics generated
```

---

## 🐛 Troubleshooting

### Issue: 401 Unauthorized
- Check if token is valid
- Token might be expired (1 hour)
- Use refresh token endpoint

### Issue: 404 Not Found
- Verify endpoint URL
- Check if restaurant/menu item exists
- Ensure restaurant is ACTIVE (not PENDING)

### Issue: 400 Bad Request
- Check request body format
- Verify all required fields
- Check validation constraints

### Issue: 500 Internal Server Error
- Check backend logs
- Verify database is running
- Ensure PostGIS extension is enabled

---

## 📝 Quick Tips

1. **Save tokens:** Store access token after login
2. **Use variables:** Save IDs in environment variables
3. **Check logs:** Backend logs show OTP codes in development
4. **Test order:** Follow the sequence above
5. **Super admin:** Default credentials in database migration

---

**Happy Testing! 🚀**
