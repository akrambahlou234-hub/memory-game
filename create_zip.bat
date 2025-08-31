@echo off
echo 🚀 إنشاء ملف ZIP للتطبيق...
echo.

REM إنشاء مجلد مؤقت
if exist temp_app rmdir /s /q temp_app
mkdir temp_app

REM نسخ الملفات المطلوبة
copy index.html temp_app\
copy style.css temp_app\
copy script.js temp_app\
copy manifest.json temp_app\
copy sw.js temp_app\
copy config.xml temp_app\

echo ✅ تم نسخ جميع الملفات
echo.

REM إنشاء ملف ZIP (يتطلب PowerShell)
powershell -command "Compress-Archive -Path temp_app\* -DestinationPath memory-game-app.zip -Force"

REM حذف المجلد المؤقت
rmdir /s /q temp_app

echo ✅ تم إنشاء ملف memory-game-app.zip
echo.
echo 📱 الآن يمكنك رفع الملف إلى PhoneGap Build
echo 🌐 اذهب إلى: https://build.phonegap.com
echo.
pause
