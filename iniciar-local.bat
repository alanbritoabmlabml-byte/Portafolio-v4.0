@echo off
chcp 65001 >nul
cd /d "%~dp0"
echo.
echo  Portafolio v4.0 - arranque local
echo.

where php >nul 2>nul
if errorlevel 1 (
  echo  No se encontro PHP en el PATH. Instala PHP 8.2 o superior.
  pause & exit /b 1
)

if not exist vendor (
  echo  Instalando dependencias con Composer...
  call composer install --no-interaction || (echo  Fallo composer install & pause & exit /b 1)
)

if not exist .env copy .env.example .env >nul
findstr /B /C:"APP_KEY=base64" .env >nul || php artisan key:generate

if not exist database\database.sqlite type nul > database\database.sqlite

php artisan migrate:fresh --seed --force

echo.
echo  Listo. Abriendo http://localhost:8010
start "" http://localhost:8010
php artisan serve --port=8010
