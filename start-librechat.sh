#!/bin/bash

echo "================================================"
echo "🧮 المعلم الذكي - Smart Math Teacher"
echo "================================================"
echo ""

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker غير مثبت!"
    echo "الرجاء تثبيت Docker من: https://www.docker.com/products/docker-desktop"
    exit 1
fi

if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose غير مثبت!"
    echo "الرجاء تثبيت Docker Compose"
    exit 1
fi

echo "✅ Docker مثبت بنجاح"
echo ""

# Check if .env file exists
if [ ! -f .env ]; then
    echo "📋 نسخ ملف الإعدادات..."
    cp .env.librechat .env
    echo "✅ تم نسخ ملف .env"
else
    echo "✅ ملف .env موجود"
fi

echo ""
echo "🚀 تشغيل LibreChat..."
echo ""

# Start Docker Compose
docker-compose up -d

echo ""
echo "⏳ انتظار تشغيل الخدمات..."
sleep 10

# Check if containers are running
if docker-compose ps | grep -q "Up"; then
    echo ""
    echo "================================================"
    echo "✅ LibreChat يعمل الآن!"
    echo "================================================"
    echo ""
    echo "🌐 افتح المتصفح على: http://localhost:3080"
    echo ""
    echo "📝 خطوات الاستخدام:"
    echo "   1. انقر على 'تسجيل' لإنشاء حساب جديد"
    echo "   2. سجل الدخول"
    echo "   3. اختر 'المعلم الذكي' من القائمة"
    echo "   4. ابدأ بطرح أسئلتك!"
    echo ""
    echo "📊 لعرض السجلات:"
    echo "   docker-compose logs -f librechat"
    echo ""
    echo "🛑 لإيقاف الخدمة:"
    echo "   docker-compose down"
    echo ""
    echo "================================================"
else
    echo ""
    echo "❌ حدث خطأ في التشغيل"
    echo "عرض السجلات:"
    docker-compose logs
fi
