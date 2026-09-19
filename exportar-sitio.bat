@echo off
chcp 65001 >nul
cd /d "%~dp0"
echo.
echo  Regenerando el sitio publicado (carpeta docs)
echo.

where php >nul 2>nul
if errorlevel 1 ( echo  No se encontro PHP en el PATH. & pause & exit /b 1 )
if not exist vendor ( echo  Falta vendor: corre primero iniciar-local.bat & pause & exit /b 1 )

php artisan sitio:exportar
if errorlevel 1 ( echo. & echo  Fallo la exportacion. & pause & exit /b 1 )

echo.
echo  Subiendo a GitHub...
git add -A
git commit -m "Actualizar el sitio publicado"
git push

echo.
echo  Listo. GitHub Pages se actualiza en un par de minutos.
pause
