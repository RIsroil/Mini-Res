# Server Deploy - QR Menu Platform

Server: **188.245.65.247**

## 🚀 Quick Deploy (1 command)

### Windows:
```bash
deploy.bat
```

### Linux/Mac:
```bash
chmod +x deploy.sh
./deploy.sh
```

---

## 📋 Pre-requisites

Server'da bo'lishi kerak:
1. Docker (20.10+)
2. Docker Compose (2.0+)
3. Git

---

## 📦 Step-by-Step Manual Deployment

### 1. Server'ga Kirish

```bash
ssh user@188.245.65.247
```

### 2. Project Download

```bash
# Home directory'da
cd ~

# Project clone
git clone https://github.com/your-repo/qr-menu-platform.git
cd qr-menu-platform/deploy

# Yoki ZIP upload qilsangiz
# unzip qr-menu-platform.zip
# cd qr-menu-platform/deploy
```

### 3. Environment Setup

```bash
# .env.production faylini tahrirlash
nano .env.production

# Parollarni o'zgartiring:
# - DB_PASSWORD
# - JWT_SECRET
# - MINIO_SECRET_KEY
```

**IMPORTANT:** JWT_SECRET kamida 64 character bo'lishi kerak!

### 4. Deploy

```bash
# Deploy script'ni ishlatish
bash deploy.sh

# Yoki qo'lda
docker-compose -f docker-compose.prod.yml --env-file .env.production up -d
```

---

## 🌐 Access URLs

Ishga tushgandan keyin:

| Service | URL | Login |
|---------|-----|-------|
| Frontend | http://188.245.65.247:3000 | - |
| Backend API | http://188.245.65.247:8080 | - |
| Swagger Docs | http://188.245.65.247:8080/swagger-ui.html | - |
| MinIO Console | http://188.245.65.247:9001 | admin/password |

---

## 🔧 Common Commands

### Status Ko'rish
```bash
docker-compose -f docker-compose.prod.yml ps
```

### Logs Ko'rish
```bash
# Barcha servislar
docker-compose -f docker-compose.prod.yml logs -f

# Faqat backend
docker-compose -f docker-compose.prod.yml logs -f backend

# Faqat frontend
docker-compose -f docker-compose.prod.yml logs -f frontend
```

### Restart
```bash
# Barcha servislar
docker-compose -f docker-compose.prod.yml restart

# Faqat backend
docker-compose -f docker-compose.prod.yml restart backend
```

### Stop
```bash
docker-compose -f docker-compose.prod.yml stop
```

### To'liq O'chirish
```bash
docker-compose -f docker-compose.prod.yml down

# Volume bilan birga (DB ham o'chadi!)
docker-compose -f docker-compose.prod.yml down -v
```

---

## 🔄 Update Qilish

```bash
# Server'da project directory'ga boring
cd ~/qr-menu-platform

# Git pull (agar git'dan)
git pull origin main

# Deploy directory'ga o'ting
cd deploy

# Qayta deploy
bash deploy.sh
```

---

## 🔥 Firewall Settings

Server firewall'da quyidagi portlarni ochish kerak:

```bash
# Ubuntu/Debian
sudo ufw allow 3000/tcp  # Frontend
sudo ufw allow 8080/tcp  # Backend
sudo ufw allow 9000/tcp  # MinIO API
sudo ufw allow 9001/tcp  # MinIO Console

# CentOS/RHEL
sudo firewall-cmd --permanent --add-port=3000/tcp
sudo firewall-cmd --permanent --add-port=8080/tcp
sudo firewall-cmd --permanent --add-port=9000/tcp
sudo firewall-cmd --permanent --add-port=9001/tcp
sudo firewall-cmd --reload
```

---

## 📊 Monitoring

### Disk Space
```bash
docker system df
```

### Memory Usage
```bash
docker stats
```

### Container Status
```bash