# 🚀 Server'ga Deploy - To'liq Ko'rsatma

**Server IP:** 188.245.65.247  
**Mebel Project Port:** 9060 (conflict yo'q)  
**QR Menu Ports:** 3000 (Frontend), 8080 (Backend), 9000/9001 (MinIO)

---

## ✅ Tayyor Bo'lgan Fayllar

```
project/
├── backend/
│   ├── src/
│   ├── pom.xml
│   └── Dockerfile ✅
├── frontend/
│   ├── src/
│   ├── package.json
│   ├── Dockerfile ✅
│   └── nginx.conf ✅
└── deploy/
    ├── docker-compose.prod.yml ✅
    ├── .env.production ✅
    ├── deploy.sh ✅
    ├── deploy.bat ✅
    ├── QUICK_START.md ✅
    └── README.md ✅
```

---

## 📋 Deployment Checklist

### ☑️ Local'da (Sizning Kompyuteringizda)

- [x] Docker compose file yaratildi
- [x] Environment variables tayyor
- [x] Deploy scriptlar tayyor (Linux va Windows)
- [x] Dockerfile'lar mavjud
- [ ] **SHUNGA E'TIBOR:** `.env.production` fayldagi parollarni **ALBATTA** o'zgartiring!

### ☑️ Server'da

- [ ] Docker o'rnatilgan
- [ ] Docker Compose o'rnatilgan  
- [ ] Portlar ochiq (3000, 8080, 9000, 9001)
- [ ] Project fayllari upload qilingan
- [ ] `.env.production` parollari o'zgartirilgan
- [ ] Deploy script ishga tushirilgan

---

## 🎯 Deploy Qilish (3 Bosqich)

### 1️⃣ Fayllarni Server'ga Ko'chirish

**Variant A: WinSCP (Tavsiya etiladi - Oson)**

1. WinSCP dasturini oching
2. Yangi ulanish yaratish:
   ```
   File Protocol: SFTP
   Host name: 188.245.65.247
   Port: 22
   User name: [server username]
   Password: [server password]
   ```
3. Connect bosing
4. Local: `C:\Users\isroi\Downloads\project\project`
5. Remote: `/home/[username]/qr-menu-platform`
6. Drag & Drop bilan yuklang (5-10 daqiqa)

**Variant B: Command Line (Tezroq)**

```powershell
# Windows PowerShell (Local)
scp -r "C:\Users\isroi\Downloads\project\project" username@188.245.65.247:~/qr-menu-platform
```

```bash
# Linux/Mac
scp -r /path/to/project username@188.245.65.247:~/qr-menu-platform
```

**Variant C: ZIP orqali (Katta hajm uchun)**

```powershell
# Local: ZIP yaratish
cd C:\Users\isroi\Downloads\project
Compress-Archive -Path "project" -DestinationPath "qr-menu.zip"

# Upload
scp qr-menu.zip username@188.245.65.247:~/

# Server'da extract
ssh username@188.245.65.247
cd ~
unzip qr-menu.zip
mv project qr-menu-platform
```

---

### 2️⃣ Parollarni O'zgartirish (JUDA MUHIM! 🔴)

```bash
# Server'ga SSH orqali kirish
ssh username@188.245.65.247

# Deploy directory'ga o'tish
cd ~/qr-menu-platform/deploy

# .env.production ni tahrirlash
nano .env.production
```

**O'zgartirish kerak bo'lgan qismlar:**

```env
# Database parol
DB_PASSWORD=SizningKuchliParolingiz123!@#

# JWT secret (KAMIDA 64 character!)
JWT_SECRET=juda-uzun-maxfiy-kalit-qiyin-topish-uchun-kamida-64-ta-belgi-kerak

# MinIO parol
MINIO_SECRET_KEY=MinioUchunKuchliParol2024!Secure
```

**JWT Secret generatsiya:**

```bash
# Random 64-character secret
openssl rand -base64 64

# Yoki oddiy uzun string:
# JWT_SECRET=qr-menu-2024-production-super-secret-key-very-long-and-secure-minimum-64-characters
```

**Saqlash:** `Ctrl + O`, `Enter`, `Ctrl + X`

---

### 3️⃣ Deploy!

```bash
# Ishonch hosil qiling: deploy directory'dasiz
pwd
# Output: /home/username/qr-menu-platform/deploy

# Deploy script'ni ishga tushiring
bash deploy.sh
```

**Deploy jarayoni:**

```
🚀 QR Menu Platform - Production Deployment
==========================================

📦 Step 1: Checking environment...        [10s]
✅ Environment file found

📦 Step 2: Stopping existing containers... [5s]
✅ Stopped

📦 Step 3: Building images...             [2-5 min]
  ↳ Backend: Maven build + Docker        [2-3 min]
  ↳ Frontend: NPM build + Nginx          [1-2 min]
✅ Built

📦 Step 4: Starting services...           [10s]
  ↳ PostgreSQL with PostGIS
  ↳ Redis
  ↳ MinIO
  ↳ Backend (Spring Boot)
  ↳ Frontend (React + Nginx)
✅ Services started

📦 Step 5: Waiting for health...          [10s]
✅ Deployment Complete!
```

---

## 🌐 Test Qilish

Deploy tugagandan keyin (3-5 daqiqada):

### 1. Frontend Test

Browser'da: **http://188.245.65.247:3000**

Ko'rinishi kerak:
- ✅ Login/Register sahifa
- ✅ Uzbekcha interfeys
- ✅ Phone number input

### 2. Backend Test

Browser'da: **http://188.245.65.247:8080/actuator/health**

Ko'rinishi kerak:
```json
{"status":"UP"}
```

### 3. API Docs Test

**http://188.245.65.247:8080/swagger-ui.html**

Ko'rinishi kerak:
- ✅ Swagger UI
- ✅ Auth endpoints
- ✅ Restaurant endpoints
- ✅ Menu endpoints

### 4. MinIO Test

**http://188.245.65.247:9001**

Login:
- Username: `qrmenu_minio_admin`
- Password: `.env.production` dagi `MINIO_SECRET_KEY`

---

## 🔍 Status Tekshirish

```bash
# Container status
docker-compose -f docker-compose.prod.yml ps

# Expected output:
# qrmenu-postgres    running  (healthy)
# qrmenu-redis       running
# qrmenu-minio       running
# qrmenu-backend     running
# qrmenu-frontend    running
```

### Logs Ko'rish

```bash
# Barcha servislar
docker-compose -f docker-compose.prod.yml logs -f

# Faqat backend
docker-compose -f docker-compose.prod.yml logs -f backend | tail -50

# Faqat frontend
docker-compose -f docker-compose.prod.yml logs -f frontend

# Faqat database
docker-compose -f docker-compose.prod.yml logs -f postgres
```

---

## 🔥 Firewall Sozlash

Agar portlar tashqaridan ochilmagan bo'lsa:

### Ubuntu/Debian:

```bash
# Firewall statusini ko'rish
sudo ufw status

# Portlarni ochish
sudo ufw allow 3000/tcp comment 'QR Menu Frontend'
sudo ufw allow 8080/tcp comment 'QR Menu Backend'
sudo ufw allow 9000/tcp comment 'MinIO API'
sudo ufw allow 9001/tcp comment 'MinIO Console'

# Firewall reload
sudo ufw reload

# Tasdiqlash
sudo ufw status numbered
```

### CentOS/RHEL:

```bash
# Firewall statusini ko'rish
sudo firewall-cmd --list-all

# Portlarni ochish
sudo firewall-cmd --permanent --add-port=3000/tcp
sudo firewall-cmd --permanent --add-port=8080/tcp
sudo firewall-cmd --permanent --add-port=9000/tcp
sudo firewall-cmd --permanent --add-port=9001/tcp

# Reload
sudo firewall-cmd --reload

# Tasdiqlash
sudo firewall-cmd --list-ports
```

### Cloud Provider (AWS, DigitalOcean, etc.):

Security Group yoki Firewall settings'da quyidagi portlarni ochish:
- **3000** - Frontend
- **8080** - Backend API
- **9000** - MinIO API
- **9001** - MinIO Console

---

## ❓ Troubleshooting

### Problem 1: "Cannot connect to frontend"

```bash
# Frontend container ishlayaptimi?
docker ps | grep qrmenu-frontend

# Logs ko'rish
docker logs qrmenu-frontend

# Restart
docker-compose -f docker-compose.prod.yml restart frontend
```

### Problem 2: "API 500 error"

```bash
# Backend logs
docker logs qrmenu-backend --tail 100

# Database ulanish tekshirish
docker exec -it qrmenu-postgres pg_isready -U qrmenu_user

# Backend restart
docker-compose -f docker-compose.prod.yml restart backend
```

### Problem 3: "Images yuklanmayapti"

```bash
# MinIO ishlayaptimi?
docker ps | grep qrmenu-minio

# MinIO console'ga kirish
# http://188.245.65.247:9001
# Bucket yaratilganmi tekshiring: qrmenu-images
```

### Problem 4: "Port already in use"

```bash
# Port band ekanligini ko'rish
netstat -tulpn | grep -E '3000|8080'

# Yoki
lsof -i :3000
lsof -i :8080

# Eski containerni to'xtatish
docker-compose -f docker-compose.prod.yml down
```

### Problem 5: "Out of disk space"

```bash
# Disk usage
df -h

# Docker disk usage
docker system df

# Tozalash (ehtiyotkorlik bilan!)
docker system prune -a --volumes
```

---

## 🔄 Update Qilish (Yangi Versiya)

```bash
# 1. Yangi fayllarni upload qiling (WinSCP yoki scp)

# 2. Server'ga kirish
ssh username@188.245.65.247
cd ~/qr-menu-platform/deploy

# 3. Rebuild va restart
bash deploy.sh

# Yoki qo'lda:
docker-compose -f docker-compose.prod.yml down
docker-compose -f docker-compose.prod.yml build --no-cache
docker-compose -f docker-compose.prod.yml up -d
```

---

## 🛑 Stop/Restart Commands

```bash
cd ~/qr-menu-platform/deploy

# Hammani to'xtatish
docker-compose -f docker-compose.prod.yml stop

# Hammani ishga tushirish
docker-compose -f docker-compose.prod.yml start

# Restart (to'xtatib qayta ishga tushirish)
docker-compose -f docker-compose.prod.yml restart

# Faqat backend restart
docker-compose -f docker-compose.prod.yml restart backend

# To'liq o'chirish (DB saqlanadi)
docker-compose -f docker-compose.prod.yml down

# To'liq o'chirish + Database (XAVFLI!)
docker-compose -f docker-compose.prod.yml down -v
```

---

## 📊 Monitoring

### Resource Usage

```bash
# Realtime stats
docker stats

# Disk usage
docker system df

# Container details
docker inspect qrmenu-backend
```

### Database Access

```bash
# PostgreSQL'ga kirish
docker exec -it qrmenu-postgres psql -U qrmenu_user -d qrmenu

# SQL query
\dt  # Jadvallar ro'yxati
\q   # Chiqish
```

### Backup

```bash
# Database backup
docker exec qrmenu-postgres pg_dump -U qrmenu_user qrmenu > backup_$(date +%Y%m%d).sql

# Restore
docker exec -i qrmenu-postgres psql -U qrmenu_user qrmenu < backup_20240601.sql
```

---

## 🎉 Success Criteria

Deploy muvaffaqiyatli bo'lganligi:

- [x] Frontend: http://188.245.65.247:3000 ochiladi
- [x] Backend health: http://188.245.65.247:8080/actuator/health - `{"status":"UP"}`
- [x] Swagger: http://188.245.65.247:8080/swagger-ui.html
- [x] Register qilish mumkin (phone OTP keladi)
- [x] Login qilish mumkin
- [x] Restaurant yaratish mumkin
- [x] Menu qo'shish mumkin
- [x] Image upload ishlaydi (MinIO)

---

## 📞 Support

Muammo bo'lsa:

1. Logs ko'ring: `docker-compose logs -f`
2. Container status: `docker-compose ps`
3. Port tekshiring: `netstat -tulpn`
4. Firewall: `sudo ufw status`

---

**Muvaffaqiyatli Deploy! 🚀**

Mebel (9060) va QR Menu (3000, 8080) bir serverda ishlaydi!
