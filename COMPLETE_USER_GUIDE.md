# QR Menu Platform - Complete User Guide

## Table of Contents
1. [Understanding the System](#understanding-the-system)
2. [Workflow Order](#workflow-order)
3. [Backend Bug Fixes Summary](#backend-bug-fixes-summary)
4. [Getting Started](#getting-started)
5. [Admin Panel Features](#admin-panel-features)
6. [API Endpoints](#api-endpoints)
7. [Testing Guide](#testing-guide)

---

## Understanding the System

### Key Concepts

**MenuCategory vs MenuItem - Which to Create First?**

- **MenuCategory** = Category/Group (e.g., "Pizza", "Drinks", "Desserts", "Salads")
- **MenuItem** = Individual food/drink items (e.g., "Margherita Pizza", "Coca Cola", "Caesar Salad")

**Creation Order:**
1. **First**: Create your Restaurant
2. **Second**: Create Categories (Pizza, Drinks, etc.)
3. **Third**: Create Menu Items (Margherita Pizza, Sprite, etc.) and assign them to categories

**Example Structure:**
```
Restaurant: "Mario's Italian Restaurant"
├── Category: "Pizza"
│   ├── MenuItem: "Margherita Pizza" ($12.99)
│   ├── MenuItem: "Pepperoni Pizza" ($14.99)
│   └── MenuItem: "Hawaiian Pizza" ($13.99)
├── Category: "Drinks"
│   ├── MenuItem: "Coca Cola" ($2.99)
│   ├── MenuItem: "Sprite" ($2.99)
│   └── MenuItem: "Water" ($1.99)
└── Category: "Desserts"
    ├── MenuItem: "Tiramisu" ($6.99)
    └── MenuItem: "Gelato" ($5.99)
```

---

## Workflow Order

### Step 1: Register & Login
1. Register a new account with phone number
2. Verify OTP
3. Set password
4. Login

### Step 2: Create Restaurant
1. Navigate to Dashboard → Restaurant Management
2. Fill in restaurant details:
   - Name, Phone, Email
   - Description
   - Address, City, Country
   - Google Maps URL (coordinates will be extracted automatically)
   - Social media links (Instagram, Facebook, Website)
3. Upload Logo and Cover Image
4. Wait for admin approval (Status: PENDING → ACTIVE)

### Step 3: Create Categories
1. Navigate to Dashboard → Categories Management
2. Click "+ Add Category"
3. Enter category name (e.g., "Pizza", "Drinks")
4. Optionally add an icon URL
5. Categories are created with `isActive = true` by default
6. You can:
   - Toggle Active/Inactive status
   - Edit category name
   - Delete category (only if no menu items exist in it)
   - Reorder categories

### Step 4: Create Menu Items
1. Navigate to Dashboard → Menu Items Management
2. Click "+ Add Menu Item"
3. Fill in details:
   - **Required**: Name, Description, Price
   - **Optional**: 
     - Category (select from dropdown)
     - Ingredients
     - Preparation time (minutes)
     - Promotion text
     - Promotion active checkbox
     - Premium badge checkbox
4. After creating, upload item image(s)
5. You can:
   - Toggle availability (in stock / out of stock)
   - Edit menu item details
   - Delete menu item
   - Upload/delete images

---

## Backend Bug Fixes Summary

All 10 bugs mentioned in the prompt have been fixed:

### ✅ Security Fixes (CRITICAL)

**Bug 1: CategoryAdminController - Missing Ownership Verification**
- **Fixed**: Added `restaurantId` parameter to `updateCategory()`, `deleteCategory()`, `toggleActive()`
- **Security**: Now verifies category belongs to current user's restaurant before any operation
- Files: `CategoryAdminController.java`, `MenuCategoryService.java`

**Bug 2: MenuAdminController - Missing Ownership Verification**
- **Fixed**: Added `restaurantId` parameter to `updateMenuItem()`, `deleteMenuItem()`, `toggleAvailability()`
- **Security**: Now verifies menu item belongs to current user's restaurant before any operation
- Files: `MenuAdminController.java`, `MenuItemService.java`

### ✅ Logic Fixes

**Bug 3: deleteCategory() - Soft-deleted items blocking deletion**
- **Fixed**: Now only checks active (non-soft-deleted) menu items
- **Code**: `filter(item -> item.getDeletedAt() == null)`
- File: `MenuCategoryService.java:87`

**Bug 4: getRestaurantCategories() - Admin can't see inactive categories**
- **Fixed**: Added `getAllRestaurantCategoriesForAdmin()` method
- **Behavior**: Returns ALL categories (active + inactive) for admin panel
- File: `MenuCategoryService.java:37`

**Bug 5: getMyRestaurant() - PENDING/BLOCKED restaurants inaccessible**
- **Fixed**: Added `getByIdForAdmin()` method that skips status check
- **Behavior**: Admins can view their restaurant regardless of status
- Files: `RestaurantService.java`, `RestaurantAdminController.java`

**Bug 6: updateMenuItem() - Category set to null when not provided**
- **Fixed**: Only updates category if `categoryId` is explicitly provided
- **Behavior**: Preserves existing category when field is omitted
- File: `MenuItemService.java:90`

**Bug 10: reorderCategories() - Soft-deleted categories cause mismatch**
- **Fixed**: Added `@Where` annotation to entities + removed manual filtering
- File: `MenuCategoryService.java:94`

### ✅ Documentation Fixes

**Bug 7: MenuAdminController - Confusing TODO comments**
- **Fixed**: Replaced with clear references to `ImageUploadController` endpoints
- File: `MenuAdminController.java:87`

**Bug 9: RestaurantAdminController - Confusing TODO comments**
- **Fixed**: Documented existing endpoints for logo/cover upload
- File: `RestaurantAdminController.java:59`

### ✅ Enhancement

**Bug 8: CategoryResponse - Missing timestamps**
- **Fixed**: Added `createdAt` and `updatedAt` fields
- Files: `CategoryResponse.java`, `MenuCategoryService.java:149`

### ✅ Additional Improvements

**Bug 11: Automatic Soft-Delete Filtering**
- **Fixed**: Added `@Where(clause = "deleted_at IS NULL")` annotation
- **Entities**: `MenuCategory`, `MenuItem`
- **Benefit**: All JPA queries automatically exclude soft-deleted records

**Bug 12: Exception Handling**
- **Fixed**: Replaced `RuntimeException` with `ResourceNotFoundException`
- **Benefit**: Proper HTTP 404 responses instead of 500 errors
- Files: All admin controllers

---

## Getting Started

### Prerequisites
```bash
# Backend
- Java 17+
- PostgreSQL 14+ with PostGIS extension
- MinIO (for image storage)

# Frontend
- Node.js 18+
- npm or yarn
```

### Installation

#### 1. Backend Setup
```bash
cd backend

# Configure application.properties or application.yml
# Set database credentials
# Set MinIO credentials
# Set JWT secret

# Run
./mvnw spring-boot:run
```

#### 2. Frontend Setup
```bash
cd frontend

# Install dependencies
npm install

# Create .env file
echo "VITE_API_BASE_URL=http://localhost:8080" > .env

# Run development server
npm run dev
```

#### 3. Database Setup
```sql
-- Enable PostGIS extension
CREATE EXTENSION IF NOT EXISTS postgis;

-- The application will auto-create tables via JPA
```

---

## Admin Panel Features

### 1. Restaurant Management (`/admin/restaurant`)
- View current restaurant status (PENDING/ACTIVE/BLOCKED)
- Create or update restaurant information
- Upload logo and cover image
- Update social media links
- View QR code (once approved)

### 2. Categories Management (`/admin/categories`)
- View all categories (including inactive)
- Create new categories
- Edit category name and icon
- Toggle active/inactive status
- Delete categories (only if empty)
- Reorder categories (drag & drop or manual order)

### 3. Menu Items Management (`/admin/menu`)
- View all menu items with images
- Create new menu items
- Assign items to categories
- Set price and preparation time
- Add promotional text and badges
- Upload multiple images (1 for standard, 3 for premium)
- Toggle availability (in stock / out of stock)
- Delete menu items (soft delete)

---

## API Endpoints

### Authentication
```
POST   /api/v1/auth/register
POST   /api/v1/auth/login
POST   /api/v1/auth/send-otp
POST   /api/v1/auth/verify-otp
POST   /api/v1/auth/forgot-password
POST   /api/v1/auth/reset-password
POST   /api/v1/auth/refresh
```

### Restaurant Admin
```
GET    /api/v1/admin/restaurant           # Get my restaurant
POST   /api/v1/admin/restaurant           # Create restaurant
PUT    /api/v1/admin/restaurant           # Update restaurant
POST   /api/v1/admin/images/restaurant/logo
POST   /api/v1/admin/images/restaurant/cover
```

### Categories Admin
```
GET    /api/v1/admin/categories           # Get all my categories (incl. inactive)
POST   /api/v1/admin/categories           # Create category
PUT    /api/v1/admin/categories/{id}      # Update category (with ownership check)
DELETE /api/v1/admin/categories/{id}      # Delete category (with ownership check)
PATCH  /api/v1/admin/categories/{id}/toggle-active  # Toggle active status
PATCH  /api/v1/admin/categories/reorder   # Reorder categories
```

### Menu Items Admin
```
GET    /api/v1/admin/menu                 # Get all my menu items
POST   /api/v1/admin/menu                 # Create menu item
PUT    /api/v1/admin/menu/{id}            # Update menu item (with ownership check)
DELETE /api/v1/admin/menu/{id}            # Delete menu item (with ownership check)
PATCH  /api/v1/admin/menu/{id}/toggle-availability
POST   /api/v1/admin/images/menu/{menuItemId}
DELETE /api/v1/admin/images/menu/{menuItemId}/{imageIndex}
```

### Public API (for customers)
```
GET    /api/v1/public/restaurants/{slug}
GET    /api/v1/public/menu/{restaurantSlug}
GET    /api/v1/public/search?q={query}
GET    /api/v1/public/restaurants/nearby?lat={lat}&lng={lng}
```

---

## Testing Guide

### Test Scenario 1: Restaurant Creation
```bash
# 1. Register and login
curl -X POST http://localhost:8080/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "phone": "+998901234567",
    "fullName": "John Doe",
    "email": "john@example.com"
  }'

# 2. Verify OTP (you'll receive it via SMS/email in production)
curl -X POST http://localhost:8080/api/v1/auth/verify-otp \
  -H "Content-Type: application/json" \
  -d '{
    "phone": "+998901234567",
    "code": "123456"
  }'

# 3. Set password
curl -X POST http://localhost:8080/api/v1/auth/set-password \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "phone": "+998901234567",
    "password": "SecurePass123!"
  }'

# 4. Create restaurant
curl -X POST http://localhost:8080/api/v1/admin/restaurant \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "name": "Mario Italian Restaurant",
    "phone": "+998901234567",
    "email": "info@mario.com",
    "description": "Authentic Italian cuisine",
    "address": "123 Main St",
    "city": "Tashkent",
    "country": "Uzbekistan",
    "addressUrl": "https://maps.google.com/?q=41.2995,69.2401"
  }'
```

### Test Scenario 2: Category Creation
```bash
# 1. Create "Pizza" category
curl -X POST http://localhost:8080/api/v1/admin/categories \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "name": "Pizza"
  }'

# 2. Create "Drinks" category
curl -X POST http://localhost:8080/api/v1/admin/categories \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "name": "Drinks"
  }'

# 3. Get all categories
curl -X GET http://localhost:8080/api/v1/admin/categories \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Test Scenario 3: Menu Item Creation
```bash
# Get category ID from previous response, then:

# 1. Create menu item with category
curl -X POST http://localhost:8080/api/v1/admin/menu \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "name": "Margherita Pizza",
    "description": "Fresh tomatoes, mozzarella, basil",
    "ingredients": "Tomato, Mozzarella, Basil, Olive Oil",
    "price": 12.99,
    "preparationTimeMinutes": 15,
    "categoryId": "CATEGORY_UUID_HERE"
  }'

# 2. Create menu item without category
curl -X POST http://localhost:8080/api/v1/admin/menu \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "name": "Coca Cola",
    "description": "Refreshing cola drink",
    "price": 2.99,
    "preparationTimeMinutes": 0
  }'
```

### Test Scenario 4: Ownership Security Test
```bash
# Try to edit another admin's category (should fail with 403 or 400)
curl -X PUT http://localhost:8080/api/v1/admin/categories/OTHER_ADMIN_CATEGORY_ID \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "name": "Hacked Category"
  }'

# Expected response: 
# {
#   "success": false,
#   "message": "Category does not belong to this restaurant",
#   "data": null
# }
```

### Test Scenario 5: Soft Delete Test
```bash
# 1. Create a category with items
# 2. Soft-delete all items in the category
curl -X DELETE http://localhost:8080/api/v1/admin/menu/{itemId} \
  -H "Authorization: Bearer YOUR_TOKEN"

# 3. Now delete the category (should succeed)
curl -X DELETE http://localhost:8080/api/v1/admin/categories/{categoryId} \
  -H "Authorization: Bearer YOUR_TOKEN"

# Before fix: Would fail saying "category has items"
# After fix: Succeeds because soft-deleted items don't count
```

---

## Common Issues & Solutions

### Issue 1: Can't delete category
**Error**: "Cannot delete category with existing menu items"
**Solution**: 
1. Check if category has active menu items
2. Delete or reassign all menu items in that category
3. Soft-deleted items don't block deletion (this was Bug #3, now fixed)

### Issue 2: Can't see my restaurant (status PENDING)
**Error**: "Restaurant is not available"
**Solution**: 
- This is fixed in Bug #5
- Admins can now see their restaurant regardless of status
- Public users still can't see PENDING/BLOCKED restaurants

### Issue 3: Category becomes uncategorized after update
**Error**: Menu item loses category after update
**Solution**:
- This is fixed in Bug #6
- Always include `categoryId` in update requests
- If you don't want to change category, send the current `categoryId`

### Issue 4: Unauthorized to edit own category/menu
**Error**: "Category/MenuItem does not belong to this restaurant"
**Solution**:
- This was Bugs #1 and #2, now fixed
- Make sure you're logged in with correct account
- Each admin can only edit their own restaurant's data

---

## Frontend Usage

### Login & Dashboard
1. Open `http://localhost:5173`
2. Login with your credentials
3. Dashboard shows:
   - Quick stats (views, scans, items)
   - Quick action buttons to manage restaurant, categories, menu

### Restaurant Management
1. Click "Restaurant" card on dashboard
2. Fill in all required fields
3. Upload logo (recommended: 200x200px)
4. Upload cover (recommended: 1200x400px)
5. Click "Create Restaurant" or "Update Restaurant"

### Categories Management
1. Click "Categories" card on dashboard
2. Click "+ Add Category"
3. Enter category name (e.g., "Pizza")
4. Optionally add icon URL
5. Categories appear in a table with:
   - Name, Order, Item Count, Status, Created Date
   - Actions: Activate/Deactivate, Edit, Delete

### Menu Items Management
1. Click "Menu Items" card on dashboard
2. Click "+ Add Menu Item"
3. Fill in form:
   - Name, description (required)
   - Price (required)
   - Category (dropdown, optional)
   - Ingredients, prep time (optional)
   - Promotion settings (optional)
4. After creating, upload image using file input below each card
5. Items appear as cards with:
   - Image, Name, Price
   - Description, Category badge
   - Availability status
   - Actions: Toggle, Edit, Delete

---

## Production Deployment

### Backend
```bash
# Build JAR
./mvnw clean package -DskipTests

# Run with production profile
java -jar target/qr-menu-*.jar --spring.profiles.active=prod
```

### Frontend
```bash
# Build for production
npm run build

# Serve with nginx or any static file server
# Output in: dist/
```

### Environment Variables
```bash
# Backend
DATABASE_URL=jdbc:postgresql://...
MINIO_URL=http://...
JWT_SECRET=your-secret-key

# Frontend
VITE_API_BASE_URL=https://api.yourdomain.com
```

---

## Support

For issues or questions:
1. Check this guide first
2. Review the API documentation
3. Check backend logs for detailed error messages
4. Contact: isroilrakhimov2@gmail.com

---

## Summary

**All 10+ bugs have been fixed!** ✅

The system is now:
- **Secure**: Ownership checks prevent unauthorized access
- **Reliable**: Soft-delete logic works correctly
- **User-friendly**: Admins can see all their data regardless of status
- **Complete**: Full CRUD operations for Restaurant, Categories, and Menu Items

**Remember the workflow:**
1. Create Restaurant → 2. Create Categories → 3. Create Menu Items

Happy managing your QR Menu! 🍕🍔🍰
