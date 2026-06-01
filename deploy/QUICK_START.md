# ⚡ Quick Start - Server Deploy (AUTO ENV)

Server: **188.245.65.247**

---

## 🚀 2 QADAMDA DEPLOY!

Parollar avtomatik generatsiya qilinadi - **manual edit kerak emas!**

---

## 📦 Step 1: Files Upload

### WinSCP (Tavsiya - Oson)

1. **WinSCP** ochish
2. **Connect:** `188.245.65.247:22`
3. **Upload:** 
   - Local: `C:\Users\isroi\Downloads\project\project`
   - Remote: `/home/username/qr-menu-platform`
4. **Drag & Drop** → 5-10 min

### SCP Command

```powershell
# Windows
scp -r "C:\Users\isroi\Downloads\project\project" username@188.245.65.247:~/qr-menu-platform

# Linux/Mac
scp -r /path/to/project username@188.245.65.247:~/qr-menu-platform
```

---

## 🎯 Step 2: Deploy Script

```bash
# SSH
ssh username@188.245.65.247

# Run deploy
cd ~/qr-menu-platform/deploy
bash deploy.sh
```

### ✨ Script Automatically:

1. ✅ Creates `.env.production` (if not exists)
2. ✅ Generates **secure random passwords**:
   - DB password (24 chars)
   - JWT secret (64 chars)
   - MinIO secret (24 chars)
3. ✅ Builds Docker images
4. ✅ Starts all services
5. ✅ Health check

### 📋 Output:

```
🚀 QR Menu Platform - Production Deployment
==========================================

📦 Step 1: Checking environment...
📝 Creating .env.production with secure random passwords...
✅ .env.production created

IMPORTANT: Save these credentials!
Database Password: xK9mP2...vL3nQ8
JWT Secret: aB7cD4...zY1xW2
MinIO Secret: qR5sT8...pN2mL6

Press ENTER to continue...

📦 Step 2: Stopping containers... ✅
📦 Step 3: Building images... ✅ (3-5 min)
📦 Step 4: Starting services... ✅
📦 Step 5: Health check... ✅

✅ Deployment Complete!

Access URLs:
  Frontend:  http://188.245.65.247:3000
  Backend:   http://188.245.65.247:8080
  MinIO:     http://188.245.65.247:9001
```

**TOTAL TIME:** ~7-10 minut

---

## 🔐 Generated Passwords

Script parollarni **screen'da show qiladi** - saqlang!

Keyinchalik ko'rish:

```bash
cat ~/qr-menu-platform/deploy/.env.production
```

---

## 🌐 Access URLs

| Service | URL |
|---------|-----|
| **Frontend** | http://188.245.65.247:3000 |
| **Backend API** | http://188.245.65.247:8080 |
| **Swagger** | http://188.245.65.247:8080/swagger-ui.html |
| **MinIO** | http://188.245.65.247:9001 |

**MinIO Login:**
- User: `qrmenu_minio_admin`
- Pass: `.env.production` dagi `MINIO_SECRET_KEY`

---

## 🔥 Firewall (Optional)

```bash
# Ubuntu
sudo ufw allow 3000/tcp
sudo ufw allow 8080/tcp
sudo ufw allow 9000/tcp
sudo ufw allow 9001/tcp
```

**Cloud:** Security Group'da portlarni oching.

---

## 🧪 Test

1. **Frontend:** http://188.245.65.247:3000
2. **Health:** `curl http://188.245.65.247:8080/actuator/health`
3. **Register** → Login → Restaurant → Menu

---

## 🔍 Logs

```bash
# All services
docker-compose -f docker-compose.prod.yml logs -f

# Backend only
docker-compose -f docker-compose.prod.yml logs -f backend
```

---

## 🛑 Stop/Restart

```bash
cd ~/qr-menu-platform/deploy

# Restart
docker-compose -f docker-compose.prod.yml restart

# Stop
docker-compose -f docker-compose.prod.yml stop
```

---

## 🔄 Update

```bash
# 1. Upload new files (WinSCP)
# 2. Redeploy
cd ~/qr-menu-platform/deploy
bash deploy.sh
```

Agar `.env.production` mavjud bo'lsa, parollar **o'zgarmaydi**.

---

## ❓ Troubleshooting

**Port conflict:**
```bash
netstat -tulpn | grep 3000
docker-compose down
```

**Build failed:**
```bash
docker system prune -a
bash deploy.sh
```

**Disk full:**
```bash
df -h
docker system prune -a
```

---

## 📝 Summary

**Deploy:**
1. Upload files (WinSCP)
2. Run `bash deploy.sh`

**Features:**
- ✅ Auto `.env.production`
- ✅ Auto secure passwords
- ✅ No manual editing
- ✅ One command deploy

**That's it!** 🎉
