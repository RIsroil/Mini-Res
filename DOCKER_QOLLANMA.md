# Docker'da Ishga Tushirish Qo'llanmasi

## ✅ Ha, Docker'da To'liq Ishga Tushirish Mumkin!

Loyiha to'liq Docker va Docker Compose bilan sozlangan.

---

## 📋 Kerakli Dasturlar

1. **Docker Desktop** (yoki Docker Engine)
   - Windows: https://www.docker.com/products/docker-desktop
   - Versiya: 20.10 yoki yuqori

2. **Docker Compose** (Docker Desktop bilan birga keladi)
   - Versiya: 2.0 yoki yuqori

---

## 🏗️ Arxitektura

Docker Compose 5 ta container ishga tushiradi:

```
┌─────────────────────────────────────────────┐
│           QR Menu Platform                  │
├─────────────────────────────────────────────┤
│                                             │
│  Frontend (React + Vite)                    │
│  └─ Port: 3000                             │
│  └─ Nginx (production server)              │
│                                             │
│  Backend (Spring Boot)                      │
│  └─ Port: 8080                             │
│  └─ REST API                               │
│                                             │
│  PostgreSQL + PostGIS                       │
│  └─ Port: 5432                             │
│  └─ Database                               │
│                                             │
│  Redis                                      │
│  └─ Port: 6379                             │
│  └─ Cache (future use)                     │
│                                             │
│  MinIO                                      │
│  └─ Port: 9000 (API)                       │
│  └─ Port: 9001 (Console)                   │
│  └─ File Storage (images, QR codes)        │
│                                             │
└─────────────────────────────────────────────┘
```

---

## 🚀 Ishga Tushirish

### 1. Environment Variables

`.env` fayl yarating (yoki mavjud `.env.example` ni nusxalang):

```bash
# Project root'da
cp .env.example .env
```

**Minimal .env:**
```env
# Database
DB_NAME=qrmenu
DB_USER=postgres
DB_PASSWORD=your_strong_password_here

# JWT
JWT_SECRET=your-super-secret-jwt-key-minimum-32-chars-long

# MinIO
MINIO_ACCESS_KEY=minioadmin
MINIO_SECRET_KEY=minioadmin123
MINIO_BUCKET_NAME=qrmenu-images
MINIO_PUBLIC_URL=http://localhost:9000

# CORS
CORS_ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000,http://localhost:8080

# Frontend
VITE_API_BASE_URL=http://localhost:8080/api/v1
```

### 2. Build va Run

#### Barcha Servislarni Birga Ishga Tushirish:

```bash
# Build va run
docker-compose up --build

# Yoki background'da ishlatish
docker-compose up --build -d
```

#### Alohida Servislarni Build Qilish:

```bash
# Faqat backend
docker-compose build backend

# Faqat frontend
docker-compose build frontend

# Faqat database
docker-compose up -d postgres
```

### 3. Log'larni Ko'rish

```bash
# Barcha servislar
docker-compose logs -f

# Faqat backend
docker-compose logs -f backend

# Faqat frontend
docker-compose logs -f frontend

# So'nggi 100 ta log
docker-compose logs --tail=100 backend
```

### 4. Servislarni To'xtatish

```bash
# To'xtatish (container'lar saqlanadi)
docker-compose stop

# To'liq o'chirish (container'lar o'chiriladi)
docker-compose down

# Container va volume'larni o'chirish (DB ham tozalanadi)
docker-compose down -v
```

---

## 🔗 URL'lar

Container'lar ishga tushgandan keyin quyidagi URL'lar ishlaydi:

| Servis | URL | Login |
|--------|-----|-------|
| Frontend | http://localhost:3000 | - |
| Backend API | http://localhost:8080 | - |
| Backend Swagger | http://localhost:8080/swagger-ui.html | - |
| PostgreSQL | localhost:5432 | postgres / your_password |
| MinIO Console | http://localhost:9001 | minioadmin / minioadmin123 |
| MinIO API | http://localhost:9000 | - |
| Redis | localhost:6379 | - |

---

## 🧪 Test Qilish

### 1. Backend Health Check

```bash
curl http://localhost:8080/actuator/health
```

Javob:
```json
{
  "status": "UP"
}
```

### 2. Frontend Test

Browser'da: `http://localhost:3000`

Landing page ochilishi kerak.

### 3. Database Test

```bash
# PostgreSQL container'ga kirish
docker exec -it qrmenu-postgres psql -U postgres -d qrmenu

# PostGIS extension mavjudligini tekshirish
\dx

# Jadvallarni ko'rish
\dt

# Chiqish
\q
```

### 4. MinIO Test

1. Browser: `http://localhost:9001`
2. Login: `minioadmin` / `minioadmin123`
3. Bucket yaratilganini tekshiring: `qrmenu-images`

---

## 🐛 Debugging

### Container ichidagi Loglarni Ko'rish

```bash
# Backend container'ga kirish
docker exec -it qrmenu-backend bash

# Frontend container'ga kirish
docker exec -it qrmenu-frontend sh

# PostgreSQL container'ga kirish
docker exec -it qrmenu-postgres bash
```

### Database Ma'lumotlarni Ko'rish

```bash
docker exec -it qrmenu-postgres psql -U postgres -d qrmenu

-- Users
SELECT id, phone, full_name, role, created_at FROM users;

-- Restaurants
SELECT id, name, slug, status, is_premium FROM restaurants;

-- Menu Items
SELECT id, name, price, is_active FROM menu_items LIMIT 10;
```

### Container'ni Qayta Ishga Tushirish

```bash
# Bitta container
docker-compose restart backend

# Barcha container'lar
docker-compose restart
```

---

## 📊 Production Deployment

### 1. Production .env

```env
# Database - use strong password
DB_PASSWORD=super_strong_production_password_here

# JWT - use random 64-char string
JWT_SECRET=your-production-jwt-secret-key-min-64-chars-recommended

# MinIO - use strong credentials
MINIO_ACCESS_KEY=production_access_key
MINIO_SECRET_KEY=production_secret_key_min_32_chars

# Public URLs
MINIO_PUBLIC_URL=https://cdn.yourdomain.com
CORS_ALLOWED_ORIGINS=https://yourdomain.com,https://www.yourdomain.com

# Frontend
VITE_API_BASE_URL=https://api.yourdomain.com/api/v1
```

### 2. Production Build

```bash
# Production environment bilan build
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d
```

### 3. HTTPS (Nginx Reverse Proxy)

Production'da Nginx reverse proxy va Let's Encrypt qo'shing:

```yaml
# docker-compose.prod.yml
services:
  nginx-proxy:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx/nginx.conf:/etc/nginx/nginx.conf
      - ./nginx/ssl:/etc/nginx/ssl
    depends_on:
      - backend
      - frontend
```

---

## 🔄 Update Qilish

### Backend Code'ni Yangilash

```bash
# Backend'ni qayta build qilish
docker-compose build backend

# Restart
docker-compose restart backend
```

### Frontend Code'ni Yangilash

```bash
# Frontend'ni qayta build qilish
docker-compose build frontend

# Restart
docker-compose restart frontend
```

### Database Migration

```bash
# Spring Boot automatic migration (Flyway yoki Liquibase)
# Restart backend - migration avtomatik amalga oshadi
docker-compose restart backend
```

---

## 💾 Backup va Restore

### Database Backup

```bash
# Backup yaratish
docker exec qrmenu-postgres pg_dump -U postgres qrmenu > backup_$(date +%Y%m%d).sql

# Restore
docker exec -i qrmenu-postgres psql -U postgres qrmenu < backup_20240101.sql
```

### MinIO Backup

```bash
# MinIO volume'ni backup qilish
docker run --rm \
  -v qrmenu_minio_data:/data \
  -v $(pwd):/backup \
  alpine tar czf /backup/minio_backup_$(date +%Y%m%d).tar.gz -C /data .
```

---

## 🎯 Tez-Tez Beriladigan Savollar

### Q: Container'lar ishga tushmayapti

**A:** Log'larni tekshiring:
```bash
docker-compose logs backend
```

Agar port band bo'lsa:
```bash
# Windows'da portni tekshirish
netstat -ano | findstr :8080

# Port band bo'lsa, process'ni o'chirish yoki docker-compose.yml'da portni o'zgartiring
```

### Q: Database connection error

**A:** PostgreSQL tayyor bo'lishini kuting:
```bash
# Health check
docker-compose ps

# postgres "healthy" bo'lishi kerak
```

### Q: MinIO'ga rasm yuklanmayapti

**A:** Bucket yaratilganini tekshiring:
```bash
# MinIO console: http://localhost:9001
# Create bucket: qrmenu-images
# Set policy: public (read access)
```

### Q: Frontend backend'ga ulanmayapti (CORS error)

**A:** `.env` fayldagi CORS sozlamalarini tekshiring:
```env
CORS_ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5173
```

---

## 📝 Docker Commands Cheat Sheet

```bash
# Build
docker-compose build                    # Barcha servislar
docker-compose build --no-cache         # Cache'siz build

# Start/Stop
docker-compose up                       # Foreground
docker-compose up -d                    # Background
docker-compose stop                     # To'xtatish
docker-compose down                     # O'chirish
docker-compose down -v                  # Volume bilan o'chirish

# Logs
docker-compose logs -f                  # Real-time logs
docker-compose logs --tail=100          # So'nggi 100 ta log

# Status
docker-compose ps                       # Running containers
docker-compose top                      # Processes

# Execute
docker exec -it qrmenu-backend bash     # Backend shell
docker exec -it qrmenu-postgres psql    # PostgreSQL CLI

# Cleanup
docker system prune                     # Unused containers/images
docker volume prune                     # Unused volumes
```

---

## ✅ Tayyor!

Endi loyihangiz Docker'da to'liq ishlaydi:

1. ✅ Frontend (React + Vite) - Port 3000
2. ✅ Backend (Spring Boot) - Port 8080
3. ✅ PostgreSQL + PostGIS - Port 5432
4. ✅ Redis - Port 6379
5. ✅ MinIO - Port 9000, 9001

**Ishga tushirish:**
```bash
docker-compose up -d
```

**Ochish:**
- Frontend: http://localhost:3000
- Backend: http://localhost:8080
- MinIO: http://localhost:9001

**Muvaffaqiyat!** 🚀
