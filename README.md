# المعلم الذكي - Smart Math Teacher

نظام ذكي لتعليم الرياضيات بالمنهج السعودي باستخدام تقنية RAG (Retrieval-Augmented Generation).

## المميزات

- تعليم رياضيات ذكي مبني على المنهج السعودي
- استخدام Claude 3.5 Sonnet عبر Requesty
- بحث دلالي في المحتوى التعليمي
- واجهة عربية مع دعم RTL
- قاعدة بيانات متجهات سحابية (Qdrant Cloud)

## التثبيت السريع

### 1. تثبيت المكتبات
```bash
npm install
```

### 2. إضافة ملفات PDF
ضع ملفات المنهج في مجلد `./data`

### 3. معالجة الملفات
```bash
npm run ingest
```

### 4. البناء
```bash
npm run build
```

## الإعدادات

جميع الإعدادات موجودة في ملف `.env`:

```env
QDRANT_URL=https://your-qdrant-cloud-url
QDRANT_API_KEY=your_qdrant_key
REQUESTY_API_KEY=your_requesty_key
REQUESTY_BASE_URL=https://router.requesty.ai/v1
```

## التكامل مع LibreChat

1. انسخ ملف `librechat.yaml` إلى مجلد LibreChat
2. أضف `REQUESTY_API_KEY` في بيئة LibreChat
3. أعد تشغيل LibreChat

للمزيد من التفاصيل، راجع [SETUP.md](./SETUP.md)

## الهيكل التقني

```
Student Question → LibreChat → Supabase Edge Function
                                        ↓
                              Qdrant Cloud Search
                                        ↓
                              Claude 3.5 Sonnet
                                        ↓
                              Enhanced Answer
```

## الدعم

للمشاكل التقنية، راجع قسم Troubleshooting في [SETUP.md](./SETUP.md)
