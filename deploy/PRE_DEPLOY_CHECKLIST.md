# 🚀 Pre-Deploy Checklist

Deploy qilishdan **OLDIN** bu checklist'ni bajaring!

---

## ☑️ 1. Local'da Compile Check

```bash
# Backend compile
cd backend
./mvnw clean package -DskipTests

# Expected: BUILD SUCCESS
```

**Agar error bo'lsa:** Deploy qilmang, avval local'da fix qiling.

---

## ☑️ 2. Files Upload Server'ga

### Variant A: WinSCP (Tavsiya)
1. WinSCP oching
2. Connect: `188.245.65.247`
3. Upload: `C:\Users\isroi\Downloads\project\project` → `/home/username/qr-menu-platform`

### Variant B: SCP Command
```powershell
# Windows PowerShell
scp -r "C:\Users\isroi\Downloads\project\project" username@188.245.65.247:~/qr-menu-platform
```

**Duration:** 5-10 minut (internet tezligiga bog'liq)

---

## ☑️ 3. Server'ga SSH Kirish

```bash
ssh username@188.245.65.247
```

---

## ☑️ 4. Docker Check

```bash
# Docker installed?
docker --version
# Expected: Docker version 20.10+

# Docker Compose installed?
docker-compose --version
# Expected: Docker Compose version 2.0+

# Docker running?
docker ps
# Should NOT error
```

**Agar yo'q bo'lsa:**
```bash
# Docker install (Ubuntu/Debian)
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER

# Docker Compose install
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Logout va qayta login (group permission)
exit
ssh username@188.245.65.247
```

---

## ☑️ 5. Project Directory Check

```bash
cd ~/qr-menu-platform
ls -la

# Expected files:
# - backend/
# - frontend/
# - deploy/
```

**Agar yo'q bo'lsa:** Files upload qilmagan bo'lsangiz, step 2'ga qayting.

---

## ☑️ 6. Environment Variables (JUDA MUHIM! 🔴)

```bash
cd ~/qr-menu-platform/deploy
nano .env.production
```

**O'zgartirish KERAK:**

```env
# ❌ DEFAULT (xavfsiz emas!)
DB_PASSWORD=QrMenu2024!SecurePassword
JWT_SECRET=your-super-secret-jwt-key-must-be-at-least-64-characters-long
MINIO_SECRET_KEY=QrMenuMinIO2024!SecurePassword

# ✅ O'ZGARTIRILGAN (sizning parollaringiz)
DB_PASSWORD=SizningKuchliParolingiz123!@#
JWT_SECRET=juda-uzun-maxfiy-kalit-qiyin-topish-uchun-kamida-64-ta-belgi-kerak-minimum
MINIO_SECRET_KEY=MinioUchunKuchliParol2024!Secure@Random
```

**JWT_SECRET generatsiya:**
```bash
openssl rand -base64 64
# Yoki:
cat /dev/urandom | tr -dc 'a-zA-Z0-9!@#$%^&*' | fold -w 64 | head -n 1
```

**Save:** `Ctrl + O`, `Enter`, `Ctrl + X`

---

## ☑️ 7. Firewall Portlarni Ochish

```bash
# Ubuntu/Debian
sudo ufw status

# Agar active bo'lsa, portlarni ochish:
sudo ufw allow 3000/tcp
sudo ufw allow 8080/tcp
sudo ufw allow 9000/tcp
sudo ufw allow 9001/tcp
sudo ufw reload
```

**Cloud Provider (AWS/DigitalOcean/etc.):**
- Security Group'da portlarni ochish: 3000, 8080, 9000, 9001

---

## ☑️ 8. Port Conflict Check (Mebel Project)

```bash
# Qaysi portlar band?
netstat -tulpn | grep -E '3000|8080|9000'

# Mebel project portlari (conflict bo'lmasligi kerak):
# - 9060 (backend)
# - 5432 (postgres)
# - 9001 (minio console - conflict!)
```

**Agar 9001 port band bo'lsa:**

Mebel project MinIO console'ni o'chirish yoki boshqa portga o'zgartirish kerak.

**Yoki QR Menu MinIO console'ni 9002'ga o'zgartirish:**
```bash
nano docker-compose.prod.yml

# Change:
ports:
  - "9000:9000"
  - "9002:9001"  # 9001 → 9002
```

---

## ☑️ 9. Disk Space Check

```bash
df -h

# Expected: /dev/... 10G+ free space
```

**Agar kam bo'lsa:**
```bash
# Tozalash
docker system prune -a
```

---

## ✅ READY TO DEPLOY!

Agar barcha checklist ✅ bo'lsa:

```bash
cd ~/qr-menu-platform/deploy
bash deploy.sh
```

---

## 🎬 Deploy Jarayoni

```
🚀 QR Menu Platform - Production Deployment
==========================================

📦 Step 1: Checking environment...        [10s]  ✅
📦 Step 2: Stopping existing containers... [5s]   ✅
📦 Step 3: Building images...             [3-5min] ✅
   ↳ Backend: Maven build              [2-3 min]
   ↳ Frontend: NPM build               [1-2 min]
📦 Step 4: Starting services...           [10s]  ✅
📦 Step 5: Waiting for health...          [10s]  ✅

✅ Deployment Complete!

Access URLs:
  Frontend:  http://188.245.65.247:3000
  Backend:   http://188.245.65.247:8080
  MinIO:     http://188.245.65.247:9001
```

**Total time:** 5-7 minut

---

## 🧪 Post-Deploy Tests

### 1. Frontend Test
```bash
# Browser
http://188.245.65.247:3000

# Expected: Login/Register page
```

### 2. Backend Health
```bash
curl http://188.245.65.247:8080/actuator/health

# Expected: {"status":"UP"}
```

### 3. Swagger API
```bash
# Browser
http://188.245.65.247:8080/swagger-ui.html

# Expected: Swagger UI with all endpoints
```

### 4. MinIO Console
```bash
# Browser
http://188.245.65.247:9001

# Login: .env.production dagi MINIO credentials
# Expected: MinIO dashboard
# Check: qrmenu-images bucket created
```

### 5. Full Flow Test
1. ✅ Register (phone OTP)
2. ✅ Login
3. ✅ Restaurant yaratish
4. ✅ Logo upload → MinIO'da ko'rinadi
5. ✅ Cover upload → MinIO'da ko'rinadi
6. ✅ QR Code → http://188.245.65.247:3000/admin/qr-code
7. ✅ QR kod download/print

---

## ❌ Deploy Fails - Troubleshooting

### Error: "Cannot connect to Docker daemon"

```bash
# Start Docker service
sudo systemctl start docker
sudo systemctl enable docker

# Add user to docker group
sudo usermod -aG docker $USER
exit
# Re-login
```

### Error: "Port already in use"

```bash
# Check what's using port
netstat -tulpn | grep 3000

# Stop conflicting service
docker-compose down  # If another compose project
# Or
sudo systemctl stop service-name
```

### Error: "Build failed"

```bash
# Check logs
docker-compose -f docker-compose.prod.yml logs backend
docker-compose -f docker-compose.prod.yml logs frontend

# Clean and rebuild
docker-compose -f docker-compose.prod.yml down
docker system prune -a
bash deploy.sh
```

### Error: "Bucket not found"

```bash
# Check backend logs
docker logs qrmenu-backend | grep -i minio

# Manually create bucket in MinIO console
# http://188.245.65.247:9001
# Create bucket: qrmenu-images
# Set public read policy
```

---

## 🔄 Update/Redeploy

```bash
# 1. Upload yangi fayllar (WinSCP)

# 2. Server'ga kirish
ssh username@188.245.65.247
cd ~/qr-menu-platform/deploy

# 3. Rebuild
bash deploy.sh

# Yoki manual:
docker-compose -f docker-compose.prod.yml down
docker-compose -f docker-compose.prod.yml build --no-cache
docker-compose -f docker-compose.prod.yml up -d
```

---

## 📝 Summary

**Pre-deploy:**
- [ ] Files uploaded to server
- [ ] .env.production parollari o'zgartirildi
- [ ] Docker installed & running
- [ ] Firewall ports ochiq
- [ ] Port conflicts yo'q
- [ ] Disk space yetarli

**Deploy:**
```bash
bash deploy.sh
```

**Post-deploy:**
- [ ] Frontend accessible
- [ ] Backend health UP
- [ ] MinIO bucket created
- [ ] Full flow test passed

---

**Good luck! 🚀**

Muammo bo'lsa, logs ko'ring:
```bash
docker-compose -f docker-compose.prod.yml logs -f
```
