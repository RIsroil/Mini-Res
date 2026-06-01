# 🚀 Deploy Summary - AUTO EVERYTHING!

## ✅ O'zgartirilgan Narsalar

### 1. **Auto .env.production Generation** ✨

**File:** `deploy/deploy.sh` va `deploy/deploy.bat`

**Features:**
- ✅ `.env.production` avtomatik yaratiladi (agar yo'q bo'lsa)
- ✅ Secure random parollar generatsiya qilinadi:
  - `DB_PASSWORD` - 24 characters
  - `JWT_SECRET` - 64 characters  
  - `MINIO_SECRET_KEY` - 24 characters
- ✅ Parollar screen'da ko'rsatiladi (save qiling!)
- ✅ Agar `.env.production` mavjud bo'lsa, o'zgarmaydi

### 2. **Bucket & QR Code Fixes**

- ✅ MinIO bucket **PUBLIC** (automatic policy)
- ✅ QR Code MinIO'ga yuklanadi (512x512 PNG)
- ✅ Image URLs to'g'ri ko'rinadi
- ✅ QR Code download/print/share

### 3. **Restaurant Delete API**

- ✅ Backend: `DELETE /api/v1/admin/restaurant`
- ✅ Soft delete (data saqlanadi)

---

## 🎯 Qanday Deploy Qilish

### Variant 1: Server'da (Tavsiya)

```bash
# 1. Files upload (WinSCP yoki scp)
scp -r project username@188.245.65.247:~/qr-menu-platform

# 2. SSH kirish
ssh username@188.245.65.247

# 3. Deploy!
cd ~/qr-menu-platform/deploy
bash deploy.sh
```

**Parollar avtomatik yaratiladi!** Manual edit kerak emas!

### Variant 2: Local Test (Docker)

```bash
# Frontend directory'da
cd frontend
npm run docker:up

# Backend run
cd backend
./mvnw spring-boot:run

# Frontend dev
cd frontend
npm run dev
```

**Access:** http://localhost:5173

---

## 📋 Deploy Output

```
🚀 QR Menu Platform - Production Deployment
==========================================

📦 Step 1: Checking environment...
📝 Creating .env.production with secure random passwords...
✅ .env.production created with secure passwords

IMPORTANT: Save these credentials!
Database Password: xK9mP2rTvL3nQ8wR4mZ7yB1cF5gH9jK2
JWT Secret: aB7cD4eF2gH9iJ1kL3mN5oP8qR0sT6uV...
MinIO Secret: qR5sT8pN2mL6kJ9hF4dB7cA1eG3wZ0yX

Press ENTER to continue deployment...

📦 Step 2: Stopping existing containers... ✅
📦 Step 3: Building images... ✅ (3-5 min)
   ↳ Backend: Maven build
   ↳ Frontend: NPM build
📦 Step 4: Starting services... ✅
📦 Step 5: Waiting for services to be healthy... ✅

✅ Deployment Complete!

Access URLs:
  Frontend:  http://188.245.65.247:3000
  Backend:   http://188.245.65.247:8080
  API Docs:  http://188.245.65.247:8080/swagger-ui.html
  MinIO:     http://188.245.65.247:9001
```

---

## 🌐 Access & Login

### Frontend
**URL:** http://188.245.65.247:3000

**First Time:**
1. Register (phone + OTP)
2. Login
3. Create restaurant
4. Add menu

### MinIO Console
**URL:** http://188.245.65.247:9001

**Login:**
- Username: `qrmenu_minio_admin`
- Password: `.env.production` dagi `MINIO_SECRET_KEY`

### Swagger API
**URL:** http://188.245.65.247:8080/swagger-ui.html

---

## 🔍 Verification Checklist

- [ ] Frontend accessible: http://188.245.65.247:3000
- [ ] Backend health: `curl http://188.245.65.247:8080/actuator/health`
- [ ] Swagger UI works
- [ ] MinIO console login works
- [ ] Register & Login works
- [ ] Restaurant creation works
- [ ] Logo/Cover upload works (check MinIO)
- [ ] QR Code generation works
- [ ] Menu items creation works

---

## 📊 MinIO Bucket Structure

```
qrmenu-images/  (PUBLIC bucket)
├── restaurants/
│   ├── logos/
│   │   └── uuid.png
│   └── covers/
│       └── uuid.png
├── menu-items/
│   └── uuid.png
└── qr-codes/
    └── restaurant-slug.png
```

**All files PUBLIC accessible:**
```
http://188.245.65.247:9000/qrmenu-images/restaurants/logos/uuid.png
http://188.245.65.247:9000/qrmenu-images/qr-codes/slug.png
```

---

## 🔧 Common Commands

### Status
```bash
docker-compose -f docker-compose.prod.yml ps
```

### Logs
```bash
# All services
docker-compose -f docker-compose.prod.yml logs -f

# Backend only
docker-compose -f docker-compose.prod.yml logs -f backend
```

### Restart
```bash
docker-compose -f docker-compose.prod.yml restart
```

### Update
```bash
# Upload new files, then:
cd ~/qr-menu-platform/deploy
bash deploy.sh
```

---

## ⚠️ Important Notes

### 1. Firewall Ports
```bash
sudo ufw allow 3000/tcp  # Frontend
sudo ufw allow 8080/tcp  # Backend
sudo ufw allow 9000/tcp  # MinIO API
sudo ufw allow 9001/tcp  # MinIO Console
```

### 2. Port Conflicts (Mebel Project)
- Mebel: `9060` (backend), `5432` (postgres), `9001` (minio console)
- QR Menu: `3000`, `8080`, `9000`, `9001`

**Potential conflict:** Port `9001` (MinIO console)

**If conflict exists, change QR Menu MinIO console:**
```yaml
# docker-compose.prod.yml
ports:
  - "9002:9001"  # Changed from 9001 to 9002
```

### 3. Save Generated Passwords!
When deploy.sh runs first time, **SAVE THE PASSWORDS** shown on screen!

Later access:
```bash
cat ~/qr-menu-platform/deploy/.env.production
```

---

## 🎯 Mebel + QR Menu Together

**Same Server - Different Ports:**

| Project | Frontend | Backend | Database | MinIO |
|---------|----------|---------|----------|-------|
| Mebel | domain.com | 9060 | 5432 | 9001 |
| QR Menu | :3000 | :8080 | 5432* | 9000/9001 |

*Different database names - no conflict

**Both running simultaneously!** ✅

---

## 📝 Files Created/Modified

### New Files:
```
deploy/
├── docker-compose.prod.yml    ✅ Production compose
├── .env.example              ✅ Template
├── deploy.sh                 ✅ Auto-env + deploy (Linux)
├── deploy.bat                ✅ Auto-env + deploy (Windows)
├── QUICK_START.md            ✅ Quick guide
├── README.md                 ✅ Full docs
├── PRE_DEPLOY_CHECKLIST.md   ✅ Checklist
└── SERVER_DEPLOY_STEPS.md    ✅ Step-by-step

backend/
└── .env.example              ✅ Local dev template
```

### Modified Files:
```
backend/
├── src/.../QRCodeService.java              ✅ MinIO upload implemented
├── src/resources/application.yml           ✅ Added app.frontend-url
└── pom.xml                                 ✅ (already has ZXing)

frontend/
└── (no changes - already working)
```

---

## ✅ Ready to Deploy!

**Checklist:**
- [x] Docker compose production config ready
- [x] Auto .env generation implemented
- [x] Secure password generation
- [x] QR Code MinIO upload working
- [x] Bucket PUBLIC policy
- [x] Restaurant delete API
- [x] Documentation complete

**Deploy command:**
```bash
bash deploy.sh
```

**Everything else is automatic!** 🎉

---

## 🚀 Next Steps

1. **Upload** files to server (WinSCP/scp)
2. **Run** `bash deploy.sh`
3. **Save** generated passwords
4. **Test** http://188.245.65.247:3000
5. **Create** first restaurant
6. **Enjoy!** ✨

---

**Deploy time:** ~7-10 minutes  
**Manual work:** ~5 minutes (file upload)  
**Auto work:** Everything else!

**Tayyor!** 🎯
