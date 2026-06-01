# QR Menu Platform - Frontend

Modern React + TypeScript frontend with TailwindCSS, React Query, and Framer Motion.

---

## 🚀 Quick Start

### Initial Setup

```bash
cd frontend

# Initialize React project with Vite
npm create vite@latest . -- --template react-ts

# Install dependencies
npm install

# Install additional packages
npm install axios @tanstack/react-query zustand
npm install react-router-dom
npm install tailwindcss postcss autoprefixer
npm install framer-motion lucide-react
npm install -D @types/node

# Initialize TailwindCSS
npx tailwindcss init -p
```

### Development

```bash
npm run dev
```

Runs on http://localhost:5173

### Build

```bash
npm run build
```

---

## 📁 Project Structure

```
frontend/
├── src/
│   ├── api/                    # API clients
│   │   ├── client.ts          # Axios instance with interceptors
│   │   ├── search.ts          # Search API
│   │   ├── restaurant.ts      # Restaurant API
│   │   ├── menu.ts            # Menu API
│   │   └── auth.ts            # Auth API
│   │
│   ├── features/               # Feature modules
│   │   ├── search/
│   │   │   ├── components/
│   │   │   │   ├── SearchBar.tsx
│   │   │   │   ├── MenuCard.tsx
│   │   │   │   ├── SearchFilters.tsx
│   │   │   │   └── SearchResults.tsx
│   │   │   ├── pages/
│   │   │   │   ├── HomePage.tsx
│   │   │   │   └── SearchResultsPage.tsx
│   │   │   └── hooks/
│   │   │       └── useSearch.ts
│   │   │
│   │   ├── restaurant/
│   │   │   ├── components/
│   │   │   │   ├── RestaurantHeader.tsx
│   │   │   │   ├── CategoryTabs.tsx
│   │   │   │   ├── MenuList.tsx
│   │   │   │   ├── MenuItemModal.tsx
│   │   │   │   └── PromotionBanner.tsx
│   │   │   ├── pages/
│   │   │   │   └── RestaurantPage.tsx
│   │   │   └── hooks/
│   │   │       └── useRestaurant.ts
│   │   │
│   │   └── admin/
│   │       ├── components/
│   │       │   ├── Sidebar.tsx
│   │       │   ├── MenuForm.tsx
│   │       │   ├── CategoryManager.tsx
│   │       │   ├── ImageUploader.tsx
│   │       │   └── AnalyticsDashboard.tsx
│   │       ├── pages/
│   │       │   ├── DashboardPage.tsx
│   │       │   ├── MenuManagementPage.tsx
│   │       │   ├── RestaurantSettingsPage.tsx
│   │       │   └── AnalyticsPage.tsx
│   │       └── hooks/
│   │           ├── useMenuManagement.ts
│   │           └── useAnalytics.ts
│   │
│   ├── shared/                 # Shared components
│   │   ├── components/
│   │   │   ├── ui/
│   │   │   │   ├── Button.tsx
│   │   │   │   ├── Input.tsx
│   │   │   │   ├── Card.tsx
│   │   │   │   ├── Modal.tsx
│   │   │   │   └── Loading.tsx
│   │   │   ├── layout/
│   │   │   │   ├── Header.tsx
│   │   │   │   ├── Footer.tsx
│   │   │   │   └── Container.tsx
│   │   │   └── ProtectedRoute.tsx
│   │   └── hooks/
│   │       ├── useLocation.ts
│   │       ├── useAuth.ts
│   │       └── useDebounce.ts
│   │
│   ├── store/                  # Zustand stores
│   │   ├── authStore.ts
│   │   ├── searchStore.ts
│   │   └── uiStore.ts
│   │
│   ├── types/                  # TypeScript types
│   │   ├── restaurant.ts
│   │   ├── menu.ts
│   │   ├── user.ts
│   │   └── api.ts
│   │
│   ├── utils/                  # Utilities
│   │   ├── format.ts
│   │   ├── validators.ts
│   │   └── constants.ts
│   │
│   ├── App.tsx                 # Main app component
│   ├── main.tsx                # Entry point
│   └── index.css               # Global styles
│
├── public/
│   └── assets/
├── index.html
├── package.json
├── vite.config.ts
├── tailwind.config.js
├── tsconfig.json
├── Dockerfile
└── nginx.conf
```

---

## 🎨 Design System

### Colors

```typescript
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#FFF9F0',
          100: '#FFEDD5',
          500: '#F97316',  // Main orange
          600: '#EA580C',
          900: '#7C2D12',
        },
        neutral: {
          50: '#FAFAFA',
          100: '#F5F5F5',
          500: '#737373',
          900: '#171717',
        },
        premium: {
          500: '#F59E0B',  // Gold
        },
      },
    },
  },
};
```

### Typography

- **Font:** Inter (from Google Fonts)
- **Headings:** 600 weight
- **Body:** 400 weight
- **Small text:** 400 weight

### Spacing

Follow Apple-inspired spacing: `4, 8, 12, 16, 24, 32, 48, 64`

---

## 🧩 Key Components

### SearchBar

Premium sticky search bar with smooth animations.

**Props:**
```typescript
interface SearchBarProps {
  onSearch: (query: string) => void;
  placeholder?: string;
  sticky?: boolean;
  loading?: boolean;
}
```

### MenuCard

Swipeable card with premium feel and optional promotion badge.

**Props:**
```typescript
interface MenuCardProps {
  item: MenuItem;
  onSwipe?: (direction: 'left' | 'right') => void;
  onClick?: () => void;
}
```

### RestaurantHeader

Full-width header with cover, logo, and restaurant info.

**Props:**
```typescript
interface RestaurantHeaderProps {
  restaurant: Restaurant;
  showQR?: boolean;
}
```

---

## 🔌 API Integration

### Setup

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

// Add auth token to requests
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle 401 errors
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

### Usage Example

```typescript
// src/api/search.ts
import { apiClient } from './client';

export const searchAPI = {
  searchGlobal: async (query: string, lat: number, lng: number, radius?: number) => {
    return apiClient.get('/search', {
      params: { q: query, lat, lng, radius },
    });
  },
};

// In component
import { useQuery } from '@tanstack/react-query';
import { searchAPI } from '@/api/search';

const { data, isLoading } = useQuery({
  queryKey: ['search', query, lat, lng],
  queryFn: () => searchAPI.searchGlobal(query, lat, lng),
});
```

---

## 🗺️ Routing

```typescript
// src/App.tsx
import { BrowserRouter, Routes, Route } from 'react-router-dom';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<HomePage />} />
        <Route path="/search" element={<SearchResultsPage />} />
        <Route path="/r/:slug" element={<RestaurantPage />} />
        
        {/* Auth routes */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        
        {/* Protected admin routes */}
        <Route path="/admin" element={<ProtectedRoute />}>
          <Route index element={<DashboardPage />} />
          <Route path="menu" element={<MenuManagementPage />} />
          <Route path="settings" element={<RestaurantSettingsPage />} />
          <Route path="analytics" element={<AnalyticsPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
```

---

## 🔐 State Management

### Auth Store (Zustand)

```typescript
// src/store/authStore.ts
import { create } from 'zustand';
import { User } from '@/types';

interface AuthState {
  user: User | null;
  token: string | null;
  login: (token: string, user: User) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: localStorage.getItem('token'),
  login: (token, user) => {
    localStorage.setItem('token', token);
    set({ token, user });
  },
  logout: () => {
    localStorage.removeItem('token');
    set({ token: null, user: null });
  },
}));
```

---

## 🎭 Animations

Using Framer Motion for smooth, premium animations.

**Menu Card Animation:**
```typescript
<motion.div
  drag="x"
  dragConstraints={{ left: -50, right: 50 }}
  whileHover={{ scale: 1.02 }}
  transition={{ duration: 0.2 }}
>
  {/* Card content */}
</motion.div>
```

**Page Transitions:**
```typescript
<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  exit={{ opacity: 0, y: -20 }}
>
  {/* Page content */}
</motion.div>
```

---

## 📱 Responsive Design

### Breakpoints

```
sm:  640px
md:  768px
lg:  1024px
xl:  1280px
2xl: 1536px
```

### Mobile-First Approach

```tsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  {/* Cards */}
</div>
```

---

## 🧪 Testing

```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e
```

---

## 🐳 Docker

```dockerfile
# Dockerfile
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

## 📦 Build Optimization

- Code splitting by route
- Lazy loading for heavy components
- Image optimization
- Bundle size < 200KB initial load

---

## 🎯 Performance Targets

- First Contentful Paint: < 1.5s
- Time to Interactive: < 3s
- Lighthouse Score: > 90

---

For complete implementation examples, see `IMPLEMENTATION_GUIDE.md` in the root directory.
