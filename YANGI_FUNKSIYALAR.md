# Yangi Qo'shilgan Funksiyalar

## ✅ Barcha Talab Qilingan Funksiyalar Qo'shildi

### 1. ✅ Orqaga Tugmasi
**Qayerda:** Restaurant, Categories, Menu sahifalarida  
**Nima qiladi:** Dashboard'ga qaytaradi  
**Icon:** `←` (ArrowLeft) "Orqaga" yozuvi bilan

### 2. ✅ Promotion Active va Premium Badge Tushuntirildi

**Menu Item yaratish/tahrirlashda:**

#### Promotion Active (Aksiya Faol)
- **Checkbox** bilan yoqiladi
- **Nima qiladi:** Menu itemda qizil "🎉 PROMO" belgisi ko'rinadi
- **Qo'shimcha:** Promotion text kiritish mumkin (masalan: "Buy 1 Get 1 Free")
- **Ko'rinish:** Mijozlar uchun menuda qizil aksiya belgisi bilan ko'rsatiladi

#### Premium Badge (Premium Belgi)
- **Checkbox** bilan yoqiladi  
- **Nima qiladi:** Menu itemda binafsha "⭐ PREMIUM" belgisi ko'rinadi
- **Qachon ishlatiladi:** Maxsus/premium taomlar uchun
- **Ko'rinish:** Mijozlar uchun menuda binafsha premium belgisi bilan ko'rsatiladi

**Ko'rsatma:** Forma ichida ko'k rangli info box'da tushuntirilgan.

### 3. ✅ Rasm Yuklash Limiti

**Standard Restaurantlar:** 1 ta rasm  
**Premium Restaurantlar:** 3 tagacha rasm

**Ko'rsatma:**
- Rasm yuklash input'i ostida qizil yoki yashil matn ko'rinadi
- Agar limit to'lsa, input disabled bo'ladi
- Hozirgi rasm soni ko'rsatiladi: "(2/3 rasm)"

**Kod:**
```typescript
<input
  type="file"
  accept="image/*"
  disabled={item.images.length >= (restaurant?.isPremium ? 3 : 1)}
/>
<p className="text-xs text-gray-500">
  {restaurant?.isPremium
    ? 'Premium: 3 tagacha rasm yuklash mumkin'
    : 'Standard: 1 ta rasm yuklash mumkin'}
</p>
```

### 4. ✅ QR Code Ko'rish Sahifasi

**Route:** `/admin/qr-code`  
**Dashboard'dan:** "View QR Code" tugmasi orqali  

**Funksiyalar:**
- QR Code'ni ko'rish (katta o'lchamda)
- Yuklab olish (Download) - PNG format
- Print qilish - To'g'ridan-to'g'ri printer'ga
- Ulashish (Share) - Link nusxalash yoki ijtimoiy tarmoqqa ulashish

**Holatlar:**
- ✅ Restaurant ACTIVE - QR code ko'rsatiladi
- ⚠️ Restaurant PENDING - "Admin tasdiqlashini kuting" xabari
- ❌ Restaurant yo'q - "Avval restaurant yarating" xabari

**QR Code'dan foydalanish bo'yicha ko'rsatma ham mavjud.**

### 5. ✅ Telefon Raqamni Yangilash (DB Check bilan)

**Backend Logic:**
```java
@Transactional
public void updatePhoneNumber(UUID userId, String newPhone, String otp) {
    otpService.verifyOTP(newPhone, otp);
    
    // DB'dan tekshirish
    userRepository.findByPhone(newPhone).ifPresent(existingUser -> {
        // Agar ACTIVE user bo'lsa - xatolik
        if (existingUser.getDeletedAt() == null) {
            throw new BusinessException("This phone number is already registered");
        }
        // Agar DELETED user bo'lsa - ruxsat beriladi
    });
    
    user.setPhone(newPhone);
    userRepository.save(user);
}
```

**Qoidalar:**
1. Telefon DB'da mavjud emas → ✅ Ruxsat beriladi
2. Telefon DB'da mavjud, lekin deleted user → ✅ Ruxsat beriladi
3. Telefon DB'da mavjud, active user → ❌ Xatolik: "Bu raqam allaqachon ro'yxatdan o'tgan"

**Route:** `/update-phone`  
**Profile'dan:** "Telefon raqam" qismidagi "O'zgartirish" tugmasi orqali

### 6. ✅ Parolni O'zgartirish (Change Password)

**Route:** `/profile` ichida modal  
**Ochish:** "Parolni o'zgartirish" tugmasi

**Forma:**
- Hozirgi parol (required)
- Yangi parol (min 6 belgili, required)
- Yangi parolni tasdiqlang (required)

**Validatsiya:**
- Hozirgi parol to'g'ri bo'lishi kerak
- Yangi parol kamida 6 ta belgi
- Yangi parollar bir-biriga mos kelishi kerak

**Backend API:**
```
POST /api/v1/auth/change-password
Authorization: Bearer {token}
Body: {
  "currentPassword": "old123",
  "newPassword": "new456"
}
```

### 7. ✅ Akkauntni O'chirish (Delete Account)

**Route:** `/profile` ichida modal  
**Ochish:** "Akkauntni o'chirish" tugmasi (qizil rangli)

**Shartlar:**
1. ❌ Restaurant mavjud → **Xatolik:** "Avval restaurant'ni o'chiring"
2. ✅ Restaurant yo'q yoki o'chirilgan → Ruxsat beriladi

**Forma:**
- Parol (required) - tasdiqlash uchun
- "DELETE" yozish (required) - xatoga yo'l qo'ymaslik uchun

**Ogohlantirish:**
```
⚠️ Diqqat!
Bu amalni qaytarib bo'lmaydi. Barcha ma'lumotlaringiz butunlay o'chiriladi.

Muhim: Akkauntni o'chirish uchun avval restaurant'ni o'chirishingiz kerak.
```

**Backend Logic:**
```java
@Transactional
public void deleteAccount(UUID userId, String password) {
    User user = userRepository.findById(userId)...;
    
    // Parolni tekshirish
    if (!passwordEncoder.matches(password, user.getPasswordHash())) {
        throw new BusinessException("Password is incorrect");
    }
    
    // Restaurant borligini tekshirish
    if (user.getRestaurant() != null && user.getRestaurant().getDeletedAt() == null) {
        throw new BusinessException("Cannot delete account. Please delete your restaurant first.");
    }
    
    // Soft delete
    user.softDelete();
    userRepository.save(user);
}
```

**Natija:** User logout qilinadi va login sahifasiga yo'naltiriladi.

**Backend API:**
```
DELETE /api/v1/auth/delete-account
Authorization: Bearer {token}
Body: {
  "password": "user_password"
}
```

---

## 🎯 Analytics Haqida

**Status:** ⚠️ Hali ishga tushmagan

Analytics funksiyasi backend'da asosiy kod yozilgan, lekin hali to'liq integrate qilinmagan:
- QR scan tracking
- View tracking
- Popular items tracking

**Kelajakda qo'shilishi kerak:**
- Dashboard'da statistika ko'rsatish
- Grafiklar (Chart.js yoki Recharts)
- Export qilish (Excel/PDF)

---

## 📱 Foydalanish Qo'llanmasi

### Restaurant Owner uchun:

1. **Restaurant yaratish:**
   - Dashboard → Restaurant → Ma'lumotlarni to'ldirish
   - Logo va cover yuklash
   - Status: PENDING → Admin tasdiqlaydi → ACTIVE

2. **Kategoriya qo'shish:**
   - Dashboard → Categories → "+ Add Category"
   - Nom kiriting (masalan: "Pizza", "Ichimliklar")

3. **Menu item qo'shish:**
   - Dashboard → Menu → "+ Add Menu Item"
   - Nom, narx, tavsif kiriting
   - Kategoriya tanlang
   - Rasm yuklang (Standard: 1, Premium: 3)
   - Promotion/Premium belgisi qo'shing (ixtiyoriy)

4. **QR Code olish:**
   - Dashboard → View QR Code
   - Yuklab olish/Print qilish
   - Stol ustiga joylashtirish

5. **Sozlamalar:**
   - Profile → Parolni o'zgartirish
   - Profile → Telefon raqamni yangilash
   - Profile → Akkauntni o'chirish (faqat restaurant o'chirilgandan keyin)

### Mijoz uchun:

1. **QR Code skanerlash** yoki **`/explore` sahifasiga kirish**
2. "Get My Location" → Yaqin atrofidagi restaurantlarni ko'rish
3. Restaurant tanlash → Menyu ko'rish
4. Kategoriya bo'yicha filtr qilish
5. Narxlar, rasmlar, tarkib ko'rish
6. Yo'nalish olish (Google Maps)

---

## 🔧 Texnik Ma'lumotlar

### Backend Yangi Endpoint'lar:

```java
POST   /api/v1/auth/change-password
DELETE /api/v1/auth/delete-account
POST   /api/v1/auth/send-otp-for-phone-update  // Yangilangan
POST   /api/v1/auth/update-phone              // Yangilangan
```

### Frontend Yangi Sahifalar:

```typescript
/admin/qr-code            // QRCodeView.tsx
/profile                   // Profile.tsx (yangilangan)
```

### Yangi DTO'lar:

```java
ChangePasswordRequest.java
DeleteAccountRequest.java
```

---

## ✅ Tayyor Funksiyalar Ro'yxati

1. ✅ Orqaga tugmalari (Restaurant, Categories, Menu)
2. ✅ Promotion va Premium Badge tushuntirildi
3. ✅ Rasm yuklash limiti ko'rsatildi
4. ✅ QR Code ko'rish sahifasi
5. ✅ Telefon yangilash (DB check bilan)
6. ✅ Parolni o'zgartirish
7. ✅ Akkauntni o'chirish (restaurant o'chirilgandan keyin)
8. ⚠️ Analytics (keyingi versiyada)

---

**Hammasi tayyor!** 🎉

Endi siz to'liq ishlaydigan QR Menu platformasiga egasiz.
