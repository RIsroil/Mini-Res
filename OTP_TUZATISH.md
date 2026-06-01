# OTP Service Tuzatildi

## ❌ Muammo

`OTPService.sendOTP()` metodi har safar user'ni DB'dan qidirar edi:

```java
@Transactional
public void sendOTP(String phone) {
    User user = userRepository.findByPhone(phone)
            .orElseThrow(() -> new BusinessException("User not found"));
    // ...
}
```

**Nima muammo edi:**
1. ❌ Register qilayotgan yangi user hali DB'da yo'q → Xatolik
2. ❌ Telefon yangilayotganda yangi telefon DB'da yo'q → Xatolik
3. ❌ Har doim user borligini talab qiladi

---

## ✅ Yechim

### Dual Storage Strategy

OTP'ni 2 xil joyda saqlaymiz:

1. **DB'da** - Mavjud user'lar uchun (login, forgot password)
2. **In-Memory Cache** - Yangi telefon'lar uchun (register, phone update)

---

## 🔧 O'zgarishlar

### 1. In-Memory Cache Qo'shildi

```java
// ConcurrentHashMap - thread-safe cache
private final Map<String, OTPData> tempOTPCache = new ConcurrentHashMap<>();

private static class OTPData {
    String code;
    LocalDateTime expiresAt;
}
```

### 2. sendOTP() - Ikki Holatni Qo'llab-quvvatlaydi

```java
@Transactional
public void sendOTP(String phone) {
    Optional<User> userOptional = userRepository.findByPhone(phone);
    
    String otp = generateOTP();
    LocalDateTime expiresAt = LocalDateTime.now().plusMinutes(5);
    
    if (userOptional.isPresent() && userOptional.get().getDeletedAt() == null) {
        // CASE 1: Active user mavjud - DB'ga yozamiz
        User user = userOptional.get();
        user.setOtpCode(otp);
        user.setOtpExpiresAt(expiresAt);
        userRepository.save(user);
        
        tempOTPCache.remove(phone); // Cache'dan o'chiramiz
    } else {
        // CASE 2: User yo'q yoki deleted - Cache'ga yozamiz
        tempOTPCache.put(phone, new OTPData(otp, expiresAt));
    }
    
    sendSMS(phone, otp);
}
```

### 3. verifyOTP() - Ikki Joydan Tekshiradi

```java
@Transactional
public boolean verifyOTP(String phone, String code) {
    Optional<User> userOptional = userRepository.findByPhone(phone);
    
    if (userOptional.isPresent() && userOptional.get().getDeletedAt() == null) {
        // CASE 1: User DB'da bor - DB'dan tekshiramiz
        User user = userOptional.get();
        
        if (user.getOtpCode() == null) {
            throw new BusinessException("No OTP found");
        }
        
        if (user.getOtpExpiresAt().isBefore(LocalDateTime.now())) {
            throw new BusinessException("OTP expired");
        }
        
        if (!user.getOtpCode().equals(code)) {
            throw new BusinessException("Invalid OTP");
        }
        
        // Success - tozalaymiz
        user.setOtpVerified(true);
        user.setOtpCode(null);
        user.setOtpExpiresAt(null);
        userRepository.save(user);
        
        return true;
    } else {
        // CASE 2: User yo'q - Cache'dan tekshiramiz
        OTPData otpData = tempOTPCache.get(phone);
        
        if (otpData == null) {
            throw new BusinessException("No OTP found");
        }
        
        if (otpData.expiresAt.isBefore(LocalDateTime.now())) {
            tempOTPCache.remove(phone);
            throw new BusinessException("OTP expired");
        }
        
        if (!otpData.code.equals(code)) {
            throw new BusinessException("Invalid OTP");
        }
        
        // Success - cache'dan o'chiramiz
        tempOTPCache.remove(phone);
        
        return true;
    }
}
```

### 4. Auto Cleanup - Har 5 Daqiqada

```java
@Scheduled(fixedRate = 300000) // 5 minut
public void cleanExpiredOTPs() {
    LocalDateTime now = LocalDateTime.now();
    
    tempOTPCache.entrySet().removeIf(entry -> 
        entry.getValue().expiresAt.isBefore(now)
    );
}
```

### 5. Scheduling Yoqildi

```java
@SpringBootApplication
@EnableScheduling  // ← Qo'shildi
public class ProjectApplication {
    // ...
}
```

---

## 🎯 Qanday Ishlaydi

### Scenario 1: Register (Yangi User)

```
1. User: +998901234567 bilan register
2. Backend: DB'da yo'q → Cache'ga OTP yozadi
3. SMS: "Your OTP: 123456"
4. User: OTP kiriting
5. Backend: Cache'dan tekshiradi → ✅ To'g'ri
6. Backend: User yaratadi + OTP cache'dan o'chiriladi
```

### Scenario 2: Login (Mavjud User)

```
1. User: +998901234567 bilan login
2. Backend: DB'da bor → DB'ga OTP yozadi
3. SMS: "Your OTP: 123456"
4. User: OTP kiriting
5. Backend: DB'dan tekshiradi → ✅ To'g'ri
6. Backend: User.otpVerified = true, otpCode = null
```

### Scenario 3: Phone Update

```
1. User: Yangi telefon +998909999999
2. Backend: DB'da yo'q → Cache'ga OTP yozadi
3. SMS: "Your OTP: 123456"
4. User: OTP kiriting
5. Backend: Cache'dan tekshiradi → ✅ To'g'ri
6. Backend: User.phone = +998909999999, Cache o'chiriladi
```

### Scenario 4: Forgot Password

```
1. User: +998901234567 uchun parol unutdim
2. Backend: DB'da bor → DB'ga OTP yozadi
3. SMS: "Your OTP: 123456"
4. User: OTP kiriting
5. Backend: DB'dan tekshiradi → ✅ To'g'ri
6. Backend: Yangi parol o'rnatish ruxsati beriladi
```

---

## ⚙️ Xususiyatlar

### ✅ Afzalliklar

1. **Xavfsiz** - ConcurrentHashMap thread-safe
2. **Avtomatik Tozalanadi** - Har 5 daqiqada expired OTP'lar o'chiriladi
3. **Ikki Strategiya** - DB va Cache parallel ishlaydi
4. **Deleted User Check** - Deleted user'larni ham hisobga oladi

### ⚠️ Cheklovlar

1. **In-Memory** - Server restart bo'lsa cache yo'qoladi
2. **Scalability** - Multi-instance deployment'da Redis kerak bo'ladi

---

## 🚀 Production Uchun Tavsiyalar

### Redis bilan Integration (Kelajakda)

```java
@Autowired
private RedisTemplate<String, OTPData> redisTemplate;

public void sendOTP(String phone) {
    // ...
    if (userOptional.isEmpty()) {
        // In-memory o'rniga Redis'ga yozamiz
        redisTemplate.opsForValue().set(
            "otp:" + phone, 
            otpData, 
            5, 
            TimeUnit.MINUTES
        );
    }
}
```

### Monitoring

```java
// Metrics qo'shish
@Scheduled(fixedRate = 60000)
public void logCacheSize() {
    logger.info("Active OTP cache size: {}", tempOTPCache.size());
}
```

---

## ✅ Test Qilish

### Test 1: Register

```bash
# 1. Send OTP
curl -X POST http://localhost:8080/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "phone": "+998901234567",
    "fullName": "Test User",
    "email": "test@example.com"
  }'

# OTP: 123456 (development)

# 2. Verify OTP
curl -X POST http://localhost:8080/api/v1/auth/verify-otp \
  -H "Content-Type: application/json" \
  -d '{
    "phone": "+998901234567",
    "code": "123456"
  }'
```

### Test 2: Phone Update

```bash
# 1. Send OTP to new phone
curl -X POST http://localhost:8080/api/v1/auth/send-otp-for-phone-update \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "phone": "+998909999999"
  }'

# 2. Verify and update
curl -X POST http://localhost:8080/api/v1/auth/update-phone \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "newPhone": "+998909999999",
    "otp": "123456"
  }'
```

---

## 📊 Xulosa

| Feature | Oldin | Endi |
|---------|-------|------|
| Register | ❌ Ishlamaydi | ✅ Ishlaydi |
| Phone Update | ❌ Ishlamaydi | ✅ Ishlaydi |
| Login | ✅ Ishlaydi | ✅ Ishlaydi |
| Forgot Password | ✅ Ishlaydi | ✅ Ishlaydi |
| Auto Cleanup | ❌ Yo'q | ✅ Har 5 daqiqada |
| Thread Safe | ❌ Yo'q | ✅ ConcurrentHashMap |
| Deleted User Check | ❌ Yo'q | ✅ Bor |

---

**Hammasi to'g'rilandi!** ✅

Endi OTP service barcha holatlar uchun to'g'ri ishlaydi.
