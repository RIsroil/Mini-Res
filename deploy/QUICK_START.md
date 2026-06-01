# ⚡ Quick Start - Server'ga Deploy

Server: **188.245.65.247**

---

## 🚀 1 Minutda Deploy (Eng Tez Yo'l)

### Server'da (SSH orqali):

```bash
# 1. Project fayllarini server'ga upload qiling (WinSCP, FileZilla yoki scp)

# 2. Project directory'ga o'ting
cd ~/qr-menu-platform/deploy

# 3. Parollarni o'zgartiring
nano .env.production
# DB_PASSWORD, JWT_SECRET, MINIO_SECRET_KEY ni yangilang

# 4. Deploy!
bash deploy.sh
```

**✅ Tayyor!** 2-3 daqiqada ishga tushadi.

---

## 📦 Server'ga Fayl Upload Qilish

### Variant 1: WinSCP (Windows)

1. WinSCP ochish
2. Connect:
   - Host: `188.245.65.247`
   - Port: `22`
   - Username: `sizning_username`
   - Password: `sizning_password`
3. Local: `C:\Users\isroi\Downloads\project\project`
4. Remote: `/home/username/qr-menu-platform`
5. Upload (drag & drop)

### Variant 2: SCP Command

```bash
# Windows PowerShell
scp -r "C:\Users\isroi\Downloads\project\project" username@188.245.65.247:~/qr-menu-platform

# Linux/Mac
scp -r /path/to/project username@188.245.65.247:~/qr-menu-platform
```

### Variant 3: ZIP Upload

```bash
# Local: ZIP yaratish (Windows)
Compress-Archive -Path "C:\Users\isroi\Downloads\project\project\*" -DestinationPath qr-menu.zip

# Upload
scp qr-menu.zip username@188.245.65.247:~/

# Server'da: Extract
ssh username@188.245.65.247
unzip qr-menu.zip -d qr-menu-platform
```

---

## 🔐 Parollarni O'zgartirish (MUHIM!)

`deploy/.env.production` faylini tahrirlang:

```bash
nano /home/username/qr-menu-platform/deploy/.env.production
```

**O'zgartirish kerak:**

```env
# ❌ DEFAULT (xavfsiz emas)
DB_PASSWORD=QrMenu2024!SecurePassword
JWT_SECRET=your-super-secret-jwt-key-must-be-at-least-64-characters-long
MINIO_SECRET_KEY=QrMenuMinIO2024!SecurePassword

# ✅ SIZNING PAROLLARINGIZ
DB_PASSWORD=MeningKuchliParolim123!@#
JWT_SECRET=juda-uzun-va-murakkab-jwt-secret-key-kamida-64-character-minimum
MINIO_SECRET_KEY=MinioUchunMaxsusParol2024!Secure
```

**JWT_SECRET:** Kamida 64 character!

```bash
# Random secret generatsiya qilish
openssl rand -base64 64
```

---

## 🎯 Deploy Qilish

```bash
cd ~/qr-menu-platform/deploy

# Deploy
bash deploy.sh
```

### Deploy jarayoni:

1. ✅ Environment check
2. ✅ Stop old containers (agar bo'lsa)
3. ✅ Build Docker images (2-3 min)
4. ✅ Start services
5. ✅ Health check

---

## 🌐 Access

Deploy tugagandan keyin:

| Service | URL |
|---------|-----|
| **Frontend** | http://188.245.65.247:3000 |
| **Backend API** | http://188.245.65.247:8080 |
| **Swagger Docs** | http://188.245.65.247:8080/swagger-ui.html |
| **MinIO Console** | http://188.245.65.247:9001 |

---

## 🔍 Status Tekshirish

```bash
# Container status
docker-compose -f docker-compose.prod.yml ps

# Logs
docker-compose -f docker-compose.prod.yml logs -f

# Faqat backend logs
docker-compose -f docker-compose.prod.yml logs -f backend

# Database'ga kirish
docker exec -it qrmenu-postgres psql -U qrmenu_user -d qrmenu
```

---

## 🔥 Firewall (Agar kerak bo'lsa)

```bash
# Ubuntu/Debian
sudo ufw allow 3000/tcp
sudo ufw allow 8080/tcp
sudo ufw allow 9000/tcp
sudo ufw allow 9001/tcp

# Check status
sudo ufw status
```

---

## 🛑 Stop/Restart

```bash
# Stop
docker-compose -f docker-compose.prod.yml stop

# Restart
docker-compose -f docker-compose.prod.yml restart

# Restart faqat backend
docker-compose -f docker-compose.prod.yml restart backend

# To'liq o'chirish (DB saqlanadi)
docker-compose -f docker-compose.prod.yml down

# DB bilan birga o'chirish (XAVFLI!)
docker-compose -f docker-compose.prod.yml down -v
```

---

## 🔄 Update (Yangi versiya deploy)

```bash
# 1. Yangi fayllarni upload qiling (WinSCP/scp)

# 2. Rebuild & Restart
cd ~/qr-menu-platform/deploy
bash deploy.sh
```

---

## ❓ Troubleshooting

### Backend ishlamayapti

```bash
# Logs ko'rish
docker-compose -f docker-compose.prod.yml logs backend

# Container ichiga kirish
docker exec -it qrmenu-backend bash
```

### Database muammosi

```bash
# PostgreSQL check
docker exec -it qrmenu-postgres pg_isready

# Database kirish
docker exec -it qrmenu-postgres psql -U qrmenu_user -d qrmenu
```

### Port band

```bash
# Port ko'rish
netstat -tulpn | grep -E '3000|8080|9000'

# Yoki
lsof -i :3000
lsof -i :8080
```

### Disk to'lib ketdi

```bash
# Docker tozalash
docker system prune -a
docker volume prune
```

---

## 📊 Monitoring

```bash
# Resource usage
docker stats

# Disk usage
docker system df

# Container details
docker inspect qrmenu-backend
```

---

## 🎯 Mebel Project Bilan Birga

Mebel project: `9060` port
QR Menu: `3000`, `8080` portlar

**Conflict yo'q!** Ikkalasi birga ishlaydi.

**Access:**
- Mebel: http://domain.com (yoki http://188.245.65.247:9060)
- QR Menu: http://188.245.65.247:3000

---

## 📝 Keyingi Qadamlar

1. ✅ Deploy tugadi
2. Frontend'da Test: http://188.245.65.247:3000
3. Birinchi admin yaratish: Register → Phone OTP → Login
4. Restaurant yaratish
5. Menu qo'shish

---

## 🌟 Domain Qo'shish (Ixtiyoriy)

Agar subdomain qo'shmoqchi bo'lsangiz:

```bash
# Nginx install
sudo apt install nginx

# Config yaratish
sudo nano /etc/nginx/sites-available/qrmenu

# Subdomain: qrmenu.domain.com → localhost:3000
```

Keyinroq qo'shamiz agar kerak bo'lsa!

---

**Qisqasi:**
1. Upload files to server
2. Edit `.env.production`
3. Run `bash deploy.sh`
4. Done! 🎉
