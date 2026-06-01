# ✅ Bucket & QR Code Fixes

## O'zgartirilgan Narsalar

### 1. ✅ MinIO Bucket - PUBLIC

**File:** `backend/src/main/java/mini/cafe/project/config/MinioConfig.java`

```java
private String publicReadPolicy(String bucket) {
    return """
        {
            "Version": "2012-10-17",
            "Statement": [{
                "Effect": "Allow",
                "Principal": {"AWS": "*"},
                "Action": ["s3:GetObject"],
                "Resource": ["arn:aws:s3:::%s/*"]
            }]
        }
        """.formatted(bucket);
}
```

**Status:** ✅ Bucket avtomatik PUBLIC yaratiladi
**Bucket Name:** `qrmenu-images`

---

### 2. ✅ QR Code - MinIO'ga Saqlash

**File:** `backend/src/main/java/mini/cafe/project/service/qr/QRCodeService.java`

**Avvalgi muammo:** TODO comment bor edi, QR kod generatsiya qilinmasdi

**Yangi implementatsiya:**
```java
@Service
@RequiredArgsConstructor
public class QRCodeService {
    private final MinioClient minioClient;

    @Value("${app.frontend-url}")
    private String frontendUrl;

    @Value("${minio.public-url}")
    private String minioPublicUrl;

    @Value("${minio.bucket-name}")
    private String bucketName;

    public String generateQRCode(String restaurantSlug) {
        // 1. Generate QR image (512x512)
        String url = frontendUrl + "/r/" + restaurantSlug;
        BufferedImage qrImage = createQRImage(url, 512, 512);
        
        // 2. Convert to PNG bytes
        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        ImageIO.write(qrImage, "PNG", baos);
        byte[] imageBytes = baos.toByteArray();
        
        // 3. Upload to MinIO
        String objectName = "qr-codes/" + restaurantSlug + ".png";
        minioClient.putObject(PutObjectArgs.builder()
            .bucket(bucketName)
            .object(objectName)
            .stream(new ByteArrayInputStream(imageBytes), imageBytes.length, -1)
            .contentType("image/png")
            .build());
        
        // 4. Return public URL
        return minioPublicUrl + "/" + bucketName + "/" + objectName;
    }
}
```

**Status:** ✅ QR Code MinIO'ga yuklanadi va public URL qaytaradi

---

### 3. ✅ Frontend URL Configuration

**File:** `backend/src/main/resources/application.yml`

```yaml
app:
  frontend-url: ${FRONTEND_URL:http://localhost:5173}
```

**Production (docker-compose.prod.yml):**
```yaml
environment:
  FRONTEND_URL: http://188.245.65.247:3000
```

**QR Code URL format:**
```
http://188.245.65.247:3000/r/restaurant-slug
```

---

### 4. ✅ Image URL Structure

**Logo URL:**
```
http://localhost:9000/qrmenu-images/restaurants/logos/uuid.png
```

**Cover URL:**
```
http://localhost:9000/qrmenu-images/restaurants/covers/uuid.png
```

**QR Code URL:**
```
http://localhost:9000/qrmenu-images/qr-codes/restaurant-slug.png
```

**Production:**
```
http://188.245.65.247:9000/qrmenu-images/restaurants/logos/uuid.png
http://188.245.65.247:9000/qrmenu-images/qr-codes/restaurant-slug.png
```

---

## 🧪 Test Qilish

### Local Development

1. **MinIO ishga tushirish:**
```bash
cd frontend
npm run docker:up
```

2. **Backend ishga tushirish:**
```bash
cd backend
./mvnw spring-boot:run
```

3. **Frontend ishga tushirish:**
```bash
cd frontend
npm run dev
```

4. **MinIO Console:**
- URL: http://localhost:9001
- Login: `minioadmin` / `minioadmin`
- Bucket: `qrmenu-images` (avtomatik yaratiladi)

5. **Test:**
   - Register → Login
   - Restaurant yaratish
   - Logo yuklash → Check MinIO console
   - Cover yuklash → Check MinIO console
   - QR Code sahifasiga o'tish → QR kod ko'rinishi kerak

---

### Production (Server)

1. **Deploy:**
```bash
cd ~/qr-menu-platform/deploy
bash deploy.sh
```

2. **MinIO Console:**
- URL: http://188.245.65.247:9001
- Login: `.env.production` dagi credentials

3. **Test:**
   - Frontend: http://188.245.65.247:3000
   - Restaurant yaratish
   - Logo upload
   - QR Code: http://188.245.65.247:3000/admin/qr-code

---

## 🔍 Troubleshooting

### Image ko'rinmayapti

**Problem:** Frontend'da image URL `http://localhost:9000/...` bo'lib qolyapti

**Fix:**
```bash
# Backend environment check
echo $MINIO_PUBLIC_URL
# Should be: http://188.245.65.247:9000

# Docker container restart
docker-compose -f docker-compose.prod.yml restart backend
```

### QR Code generate bo'lmayapti

**Check:**
```bash
# Backend logs
docker logs qrmenu-backend | grep -i "qr"

# Expected:
# Generated and uploaded QR code: http://188.245.65.247:9000/qrmenu-images/qr-codes/restaurant-slug.png
```

### Bucket not found

**Fix:**
```bash
# MinIO console'ga kirish
# http://188.245.65.247:9001

# Bucket yaratish (agar avtomatik yaratilmagan bo'lsa)
# Name: qrmenu-images
# Access: Public
```

---

## 📊 MinIO Bucket Structure

```
qrmenu-images/
├── restaurants/
│   ├── logos/
│   │   ├── uuid-1.png
│   │   ├── uuid-2.jpg
│   │   └── ...
│   └── covers/
│       ├── uuid-1.png
│       └── ...
├── menu-items/
│   ├── uuid-1.png
│   ├── uuid-2.jpg
│   └── ...
└── qr-codes/
    ├── restaurant-slug-1.png
    ├── restaurant-slug-2.png
    └── ...
```

---

## ✅ Checklist

**Backend:**
- [x] MinioConfig - PUBLIC policy
- [x] QRCodeService - MinIO upload implemented
- [x] application.yml - frontend-url config
- [x] docker-compose.prod.yml - FRONTEND_URL environment

**Frontend:**
- [x] QRCodeView page - QR display
- [x] RestaurantManagement - Logo/Cover preview
- [x] Image URL'lar to'g'ri display qilinadi

**MinIO:**
- [x] Bucket: `qrmenu-images`
- [x] Public read policy
- [x] Folders: `restaurants/logos`, `restaurants/covers`, `menu-items`, `qr-codes`

---

## 🎯 Expected Results

1. **Logo Upload:**
   - File MinIO'ga yuklanadi: `qrmenu-images/restaurants/logos/uuid.png`
   - Public URL: `http://188.245.65.247:9000/qrmenu-images/restaurants/logos/uuid.png`
   - Frontend'da logo ko'rinadi

2. **QR Code:**
   - Restaurant ACTIVE bo'lganda
   - QR kod avtomatik generatsiya qilinadi
   - MinIO'ga yuklanadi: `qrmenu-images/qr-codes/slug.png`
   - QR sahifada ko'rinadi: http://188.245.65.247:3000/admin/qr-code
   - Download, Print, Share ishleydi

3. **Menu Item Images:**
   - File MinIO'ga yuklanadi: `qrmenu-images/menu-items/uuid.png`
   - Public URL: `http://188.245.65.247:9000/qrmenu-images/menu-items/uuid.png`
   - Menu card'da ko'rinadi

---

**Xulosa:** Barcha image'lar MinIO'da PUBLIC bucket'da saqlanadi va to'g'ri ko'rinadi! ✅
