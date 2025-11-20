@echo off
chcp 65001 >nul

echo ================================================
echo 🧮 المعلم الذكي - Smart Math Teacher
echo ================================================
echo.

REM Check if Docker is installed
docker --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Docker غير مثبت!
    echo الرجاء تثبيت Docker من: https://www.docker.com/products/docker-desktop
    pause
    exit /b 1
)

echo ✅ Docker مثبت بنجاح
echo.

REM Check if .env file exists
if not exist .env (
    echo 📋 نسخ ملف الإعدادات...
    copy .env.librechat .env
    echo ✅ تم نسخ ملف .env
) else (
    echo ✅ ملف .env موجود
)

echo.
echo 🚀 تشغيل LibreChat...
echo.

REM Start Docker Compose
docker-compose up -d

echo.
echo ⏳ انتظار تشغيل الخدمات...
timeout /t 10 /nobreak >nul

echo.
echo ================================================
echo ✅ LibreChat يعمل الآن!
echo ================================================
echo.
echo 🌐 افتح المتصفح على: http://localhost:3080
echo.
echo 📝 خطوات الاستخدام:
echo    1. انقر على 'تسجيل' لإنشاء حساب جديد
echo    2. سجل الدخول
echo    3. اختر 'المعلم الذكي' من القائمة
echo    4. ابدأ بطرح أسئلتك!
echo.
echo 📊 لعرض السجلات:
echo    docker-compose logs -f librechat
echo.
echo 🛑 لإيقاف الخدمة:
echo    docker-compose down
echo.
echo ================================================
echo.
pause
