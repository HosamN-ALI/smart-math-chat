# تشغيل LibreChat مع المعلم الذكي

## الطريقة 1: استخدام Docker (الأسهل والموصى بها)

### الخطوات:

#### 1. تأكد من تثبيت Docker
```bash
docker --version
docker-compose --version
```

إذا لم يكن مثبتاً، قم بتثبيت Docker Desktop من:
- Windows/Mac: https://www.docker.com/products/docker-desktop
- Linux: `sudo apt install docker.io docker-compose`

#### 2. نسخ ملف البيئة
```bash
cp .env.librechat .env
```

#### 3. تشغيل LibreChat
```bash
docker-compose up -d
```

هذا الأمر سيقوم بـ:
- تحميل صورة LibreChat من GitHub
- إعداد قاعدة بيانات MongoDB
- تشغيل LibreChat على المنفذ 3080

#### 4. فتح المتصفح
انتقل إلى: **http://localhost:3080**

#### 5. إنشاء حساب
- انقر على "تسجيل" (Sign up)
- أدخل البريد الإلكتروني وكلمة المرور
- سجل الدخول

#### 6. استخدام المعلم الذكي
- في واجهة الدردشة، اختر "المعلم الذكي" من قائمة النماذج
- ابدأ بطرح أسئلتك الرياضية!

### إيقاف الخدمة:
```bash
docker-compose down
```

### إعادة التشغيل:
```bash
docker-compose restart
```

### عرض السجلات:
```bash
docker-compose logs -f librechat
```

---

## الطريقة 2: التثبيت اليدوي (متقدم)

إذا كنت تفضل عدم استخدام Docker:

### 1. تثبيت LibreChat
```bash
git clone https://github.com/danny-avila/LibreChat.git
cd LibreChat
npm install
```

### 2. نسخ الملفات
انسخ الملفات التالية من مشروعنا إلى مجلد LibreChat:
- `librechat.yaml` → جذر مجلد LibreChat
- `.env.librechat` → `.env` في جذر مجلد LibreChat

### 3. تشغيل MongoDB
```bash
# استخدم Docker لـ MongoDB فقط
docker run -d -p 27017:27017 --name mongodb mongo:latest
```

### 4. تشغيل LibreChat
```bash
npm run backend
# في نافذة أخرى:
npm run frontend
```

### 5. فتح المتصفح
انتقل إلى: **http://localhost:3080**

---

## المميزات المتاحة في LibreChat:

### ✅ الواجهة العربية
- دعم كامل للغة العربية
- اتجاه RTL تلقائي
- خط عربي واضح ومريح

### ✅ إدارة المحادثات
- حفظ المحادثات تلقائياً
- البحث في المحادثات السابقة
- تنظيم المحادثات في مجلدات

### ✅ مشاركة المحادثات
- إمكانية مشاركة المحادثات مع الآخرين
- تصدير المحادثات

### ✅ تحميل الملفات
- رفع صور المسائل الرياضية
- رفع ملفات PDF للمراجع
- معالجة ذكية للصور والنصوص

### ✅ تخصيص الإعدادات
- ضبط درجة الحرارة
- تحديد طول الإجابات
- تخصيص السلوك

---

## استكشاف الأخطاء:

### المشكلة: "Cannot connect to database"
**الحل:**
```bash
# تأكد من تشغيل MongoDB
docker-compose ps

# إعادة تشغيل الخدمات
docker-compose restart
```

### المشكلة: "Port 3080 already in use"
**الحل:**
```bash
# غير المنفذ في docker-compose.yml
ports:
  - "8080:3080"  # استخدم 8080 بدلاً من 3080
```

### المشكلة: "Edge Function not responding"
**الحل:**
- تأكد من صحة `VITE_SUPABASE_URL` في `.env`
- تأكد من صحة `REQUESTY_API_KEY`
- تحقق من سجلات Supabase Edge Function

### المشكلة: "No models available"
**الحل:**
- تأكد من وجود ملف `librechat.yaml` في المكان الصحيح
- تحقق من متغيرات البيئة في `.env`

---

## الأوامر المفيدة:

```bash
# عرض الحاويات النشطة
docker-compose ps

# عرض استخدام الموارد
docker stats

# مسح البيانات وإعادة البدء من جديد
docker-compose down -v
docker-compose up -d

# تحديث LibreChat لآخر إصدار
docker-compose pull
docker-compose up -d

# النسخ الاحتياطي لقاعدة البيانات
docker exec smart-math-mongodb mongodump --out /data/backup
```

---

## الإعدادات المتقدمة:

### تغيير اللغة الافتراضية:
عدّل في `librechat.yaml`:
```yaml
interface:
  language: ar
  endpointsMenu: true
```

### تعطيل التسجيل:
في `.env`:
```env
ALLOW_REGISTRATION=false
```

### تفعيل المصادقة الثنائية:
في `.env`:
```env
ENABLE_2FA=true
```

---

## ملاحظات مهمة:

1. **الأمان**: المفاتيح الموجودة في `.env.librechat` هي للتطوير فقط. غيّرها في الإنتاج!

2. **الأداء**: Docker يستهلك موارد. تأكد من توفر:
   - 4GB RAM على الأقل
   - 10GB مساحة تخزين

3. **التحديثات**: LibreChat يتحدث بانتظام. استخدم:
   ```bash
   docker-compose pull
   docker-compose up -d
   ```

4. **البيانات**: جميع المحادثات تُحفظ في MongoDB. للحفاظ عليها، لا تستخدم `-v` عند إيقاف Docker.

---

## الدعم:

- **LibreChat**: https://docs.librechat.ai
- **مشاكل تقنية**: https://github.com/danny-avila/LibreChat/issues
- **المجتمع**: https://discord.gg/LibreChat
