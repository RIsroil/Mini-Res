# QR Smart Menu Platform 🍽️

A modern, production-ready SaaS platform for restaurants to create QR-based digital menus with smart nearby search capabilities.

[![Spring Boot](https://img.shields.io/badge/Spring%20Boot-4.0.6-green.svg)](https://spring.io/projects/spring-boot)
[![React](https://img.shields.io/badge/React-18+-blue.svg)](https://reactjs.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16+-blue.svg)](https://www.postgresql.org/)
[![PostGIS](https://img.shields.io/badge/PostGIS-3.4-orange.svg)](https://postgis.net/)

---

## 🎯 Project Overview

This is **NOT a delivery app** or POS system. It's a lightweight QR menu platform where:

- ✅ Restaurants manage their digital menus  
- ✅ Users discover food nearby (anonymous, no login required)  
- ✅ QR codes link directly to restaurant pages  
- ✅ Mobile-first, premium UI/UX  
- ✅ Real-time PostGIS geolocation search  

---

## 🚀 Key Features

### For Anonymous Users
- 🔍 **Global Search** - Find menu items across all restaurants nearby
- 📍 **Nearby Discovery** - Automatically discover restaurants by location
- 📱 **QR Scan** - Scan restaurant QR codes to view menus instantly
- 🍔 **Similar Items** - See similar menu items from nearby restaurants

### For Restaurant Admins
- 🏪 **Restaurant Management** - Create and manage restaurant profile
- 📋 **Menu Management** - Add/edit menu items with categories
- 🖼️ **Image Upload** - Standard: 1 image, Premium: 3 images with slider
- 🎉 **Promotions** - Text-based promotions (menu-level & restaurant-level)
- 📊 **Analytics** - QR scans, searches, top items, peak hours
- ⏰ **Working Hours** - Flexible schedule management

### For Super Admin
- ✅ **Restaurant Approval** - Approve/block restaurant registrations
- 👑 **Premium Management** - Grant premium status to restaurants
- 📈 **Platform Analytics** - System-wide metrics, top restaurants, trends
- 🔍 **Top Searches** - Global search trends and insights

---

## 🏗️ Architecture

### Technology Stack

**Backend:**
- Java 21
- Spring Boot 4.0.6
- PostgreSQL 16 + PostGIS
- Redis (caching)
- Spring Security + JWT
- Flyway (migrations)
- MapStruct (mapping)
- Hibernate Spatial

**Frontend:**
- React 18
- TypeScript
- TailwindCSS
- React Query
- Zustand
- Framer Motion
- Axios

**Infrastructure:**
- Docker + Docker Compose
- AWS S3 (image storage)
- Nginx (reverse proxy)

### Database Schema

```
users ─┬─ restaurants ─┬─ menu_categories ─── menu_items
       │                ├─ qr_scans
       │                └─ search_history
       └─ (authentication)
```

All entities include PostGIS `Point` geometry for geospatial queries.

---

## 📦 Project Structure

```
project/
├── backend/                     # Spring Boot application
│   ├── src/main/java/mini/cafe/project/
│   │   ├── domain/             # ✅ Entities (JPA + PostGIS)
│   │   ├── repository/         # ✅ Repositories with spatial queries
│   │   ├── service/            # ⏳ Business logic
│   │   ├── controller/         # ⏳ REST controllers
│   │   ├── dto/                # ⏳ Request/Response objects
│   │   ├── security/           # ⏳ JWT + Spring Security
│   │   ├── config/             # ⏳ Configuration
│   │   ├── exception/          # ✅ Exception handling
│   │   ├── util/               # ✅ Utilities (Geo, Slug, etc.)
│   │   └── mapper/             # ⏳ MapStruct mappers
│   ├── src/main/resources/
│   │   ├── db/migration/       # ✅ Flyway SQL migrations
│   │   └── application.yml     # ✅ Configuration
│   ├── Dockerfile              # ✅ Docker build
│   └── pom.xml                 # ✅ Dependencies
│
├── frontend/                    # React application
│   ├── src/
│   │   ├── features/           # Feature modules
│   │   ├── shared/             # Shared components
│   │   ├── api/                # API clients
│   │   ├── store/              # State management
│   │   └── types/              # TypeScript types
│   ├── Dockerfile
│   └── package.json
│
├── docker-compose.yml           # ✅ Multi-container setup
├── .env.example                 # ✅ Environment variables template
├── ARCHITECTURE.md              # ✅ Complete architecture document
├── IMPLEMENTATION_GUIDE.md      # ✅ Step-by-step implementation
└── README.md                    # This file

Legend: ✅ Complete | ⏳ To implement
```

---

## 🛠️ Getting Started

### Prerequisites

- Java 21+
- Node.js 20+
- Docker & Docker Compose
- PostgreSQL 16+ with PostGIS (or use Docker)
- Redis (or use Docker)

### Quick Start (Docker)

1. **Clone and configure:**

```bash
cd C:\Users\isroi\Downloads\project\project
cp .env.example .env
# Edit .env with your configuration
```

2. **Start all services:**

```bash
docker-compose up -d
```

This starts:
- PostgreSQL with PostGIS (port 5432)
- Redis (port 6379)
- Backend API (port 8080)
- Frontend (port 3000)

3. **Access the application:**

- Frontend: http://localhost:3000
- Backend API: http://localhost:8080
- Swagger UI: http://localhost:8080/swagger-ui.html
- Actuator Health: http://localhost:8080/actuator/health

### Manual Setup (Development)

#### 1. Database Setup

```bash
# Using Docker
docker run --name qrmenu-postgres \
  -e POSTGRES_DB=qrmenu \
  -e POSTGRES_USER=admin \
  -e POSTGRES_PASSWORD=secret \
  -p 5432:5432 \
  -d postgis/postgis:16-3.4

# Using local PostgreSQL
psql -U postgres
CREATE DATABASE qrmenu;
CREATE EXTENSION postgis;
```

#### 2. Redis Setup

```bash
docker run --name qrmenu-redis -p 6379:6379 -d redis:7-alpine
```

#### 3. Backend Setup

```bash
cd backend

# Configure environment
cp ../.env.example .env
# Edit .env with your settings

# Build and run
./mvnw clean install
./mvnw spring-boot:run
```

Backend will start on http://localhost:8080

#### 4. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Start dev server
npm run dev
```

Frontend will start on http://localhost:5173

---

## 🔧 Configuration

### Environment Variables

See `.env.example` for all available configuration options.

**Critical Settings:**

```env
# Database
DB_HOST=localhost
DB_NAME=qrmenu
DB_USER=admin
DB_PASSWORD=secret

# Security
JWT_SECRET=your-256-bit-secret-key-change-in-production

# AWS S3 (for image uploads)
AWS_ACCESS_KEY=your-key
AWS_SECRET_KEY=your-secret
AWS_BUCKET_NAME=qrmenu-images
```

### Database Migrations

Flyway automatically runs migrations on startup. Migration files are in:
```
backend/src/main/resources/db/migration/
```

Current schema includes:
- V1__init_schema.sql (PostGIS + all tables)

---

## 🔐 Authentication Flow

### Restaurant Admin (Phone + OTP)

```
1. User enters phone number
2. System sends 6-digit OTP via SMS
3. User verifies OTP
4. System issues JWT token
5. Frontend stores token in httpOnly cookie
```

### Integration Point

**IMPORTANT:** This project is designed to integrate with your existing authentication code:

```
Source: C:\Users\isroi\IdeaProjects\restaurant\src\main\java\project\restaurant\user
Target: backend/src/main/java/mini/cafe/project/auth/
```

See `IMPLEMENTATION_GUIDE.md` for detailed integration instructions.

---

## 📍 PostGIS Spatial Queries

Example nearby search:

```sql
SELECT r.*, 
  ST_Distance(
    r.location::geography,
    ST_SetSRID(ST_MakePoint(:lng, :lat), 4326)::geography
  ) / 1000 AS distance_km
FROM restaurants r
WHERE ST_DWithin(
  r.location::geography,
  ST_SetSRID(ST_MakePoint(:lng, :lat), 4326)::geography,
  10000  -- 10km radius
)
ORDER BY distance_km ASC;
```

All spatial queries use PostGIS geography type for accurate distance calculations.

---

## 🎨 UI/UX Design Principles

This project follows **premium, modern food-tech aesthetics**:

✅ DO:
- Apple-level spacing and typography
- Smooth, subtle animations
- Clean, minimalist design
- Mobile-first responsive layouts
- Premium shadows and gradients

❌ DON'T:
- Cartoonish or childish UI
- Overloaded animations
- Excessive glassmorphism
- Cluttered interfaces

**Color Palette:**
- Primary: Orange (#F97316) - warm & appetizing
- Neutral: Grays - clean & professional
- Success: Green (#10B981) - fresh & healthy
- Premium: Gold (#F59E0B) - luxury accent

---

## 🧪 Testing

### Backend Tests

```bash
cd backend
./mvnw test
```

Test coverage includes:
- Unit tests (JUnit 5 + Mockito)
- Integration tests (TestContainers + PostGIS)
- Repository tests (@DataJpaTest)
- Controller tests (MockMvc)

### Frontend Tests

```bash
cd frontend
npm run test
```

---

## 📊 API Documentation

### Public Endpoints (Anonymous)

```
GET  /api/v1/search?q={query}&lat={lat}&lng={lng}&radius={km}
GET  /api/v1/search/nearby?lat={lat}&lng={lng}
GET  /api/v1/restaurants/{slug}
GET  /api/v1/restaurants/{slug}/menu
GET  /api/v1/menu/{id}
GET  /api/v1/menu/{id}/similar?lat={lat}&lng={lng}
```

### Restaurant Admin (Protected)

```
GET    /api/v1/admin/restaurant
PUT    /api/v1/admin/restaurant
POST   /api/v1/admin/menu
PUT    /api/v1/admin/menu/{id}
DELETE /api/v1/admin/menu/{id}
GET    /api/v1/admin/analytics/overview
```

### Super Admin (Protected)

```
GET    /api/v1/superadmin/restaurants
PATCH  /api/v1/superadmin/restaurants/{id}/approve
PATCH  /api/v1/superadmin/restaurants/{id}/block
GET    /api/v1/superadmin/analytics/platform
```

**Full API documentation:** http://localhost:8080/swagger-ui.html

---

## 🚢 Deployment

### Production Checklist

- [ ] Change `JWT_SECRET` to strong 256-bit key
- [ ] Update database credentials
- [ ] Configure AWS S3 credentials
- [ ] Set up SMS provider (Twilio, AWS SNS)
- [ ] Enable HTTPS/SSL
- [ ] Configure CORS whitelist
- [ ] Set up monitoring (Prometheus + Grafana)
- [ ] Configure logging (ELK stack)
- [ ] Set up backups (database, S3)
- [ ] Configure CDN for images (CloudFront)

### Docker Production

```bash
docker-compose -f docker-compose.prod.yml up -d
```

### Cloud Deployment Options

**Recommended:**
- AWS ECS + RDS + ElastiCache + S3
- Google Cloud Run + Cloud SQL + Memorystore
- Azure App Service + Azure Database + Redis

**Estimated Monthly Cost:** ~$280-400 (see ARCHITECTURE.md)

---

## 📈 Performance Targets

- API response time: < 200ms (p95)
- Search query latency: < 300ms
- QR page load: < 1s
- Bundle size: < 200KB (initial)
- Uptime: 99.9%

---

## 🗺️ Roadmap

### MVP (Current Phase)
- ✅ Database schema with PostGIS
- ✅ Domain entities
- ✅ Repository layer with spatial queries
- ⏳ Service layer
- ⏳ REST API controllers
- ⏳ Security & authentication
- ⏳ React frontend
- ⏳ Docker deployment

### Phase 2
- [ ] Image optimization & CDN
- [ ] Advanced analytics dashboard
- [ ] Email notifications
- [ ] Rate limiting per restaurant
- [ ] Search autocomplete
- [ ] Multi-language support

### Phase 3
- [ ] Mobile apps (React Native)
- [ ] Premium subscriptions
- [ ] Advanced promotions (time-based)
- [ ] Customer reviews & ratings
- [ ] Reservation integration
- [ ] Menu AI recommendations

---

## 📚 Documentation

- **ARCHITECTURE.md** - Complete system architecture
- **BACKEND_STRUCTURE.md** - Backend package structure
- **IMPLEMENTATION_GUIDE.md** - Step-by-step implementation guide
- **API_DOCS** - Swagger UI at `/swagger-ui.html`

---

## 🤝 Contributing

This is a proprietary project. Contributions are managed internally.

---

## 📄 License

Proprietary - All Rights Reserved

---

## 🐛 Troubleshooting

### Common Issues

**1. PostgreSQL connection refused**
```bash
# Check if PostGIS extension is installed
psql -U admin -d qrmenu -c "SELECT PostGIS_version();"
```

**2. Flyway migration fails**
```bash
# Repair Flyway if needed
./mvnw flyway:repair
```

**3. JWT token validation fails**
```bash
# Ensure JWT_SECRET is at least 256 bits
echo $JWT_SECRET | wc -c  # Should be >= 32 chars
```

**4. Redis connection fails**
```bash
redis-cli ping  # Should return PONG
```

### Logs

- Backend: `backend/logs/qrmenu.log`
- Docker: `docker-compose logs -f backend`
- Database: `docker-compose logs -f postgres`

---

## 📞 Support

For technical issues or questions:
1. Check documentation in `/docs`
2. Review `IMPLEMENTATION_GUIDE.md`
3. Check existing issues
4. Contact the development team

---

## 🎯 Success Metrics

**User Engagement:**
- Daily QR scans
- Search queries/day
- Average session duration

**Restaurant Metrics:**
- Active restaurants
- Menu items published
- Premium conversion rate

**Technical Metrics:**
- API response time
- System uptime
- Error rate

---

**Built with ❤️ for the modern restaurant industry**

*Version 1.0 - May 2026*
