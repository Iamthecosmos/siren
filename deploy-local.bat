@echo off
echo 🚀 Starting local deployment...
echo.

echo 🧹 Cleaning previous builds...
if exist dist rmdir /s /q dist

echo 📦 Installing dependencies...
call npm install
if errorlevel 1 (
    echo ❌ Failed to install dependencies
    pause
    exit /b 1
)

echo 🔨 Building application...
call npm run build
if errorlevel 1 (
    echo ❌ Build failed
    pause
    exit /b 1
)

echo 🌟 Starting local server...
echo 📱 Your app will be available at: http://localhost:3000
echo 🔌 API will be available at: http://localhost:3000/api
echo.
echo Press Ctrl+C to stop the server
echo.

call npm run start
if errorlevel 1 (
    echo ❌ Server failed to start
    pause
    exit /b 1
) 