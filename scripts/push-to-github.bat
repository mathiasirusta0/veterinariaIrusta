@echo off
chcp 65001 > nul
echo =======================================================
echo   VET SYSTEM — Asistente de Subida a GitHub
echo   Cuenta: mathias778ir@gmail.com
echo =======================================================
echo.
echo 1. Si ya creaste el repositorio en GitHub (ej: https://github.com/usuario/vet-system.git):
set /p REPO_URL="Ingresá la URL del repositorio de GitHub: "

if "%REPO_URL%"=="" (
    echo [ERROR] No ingresaste ninguna URL. Operación cancelada.
    pause
    exit /b
)

echo.
echo [1/3] Configurando remoto origin...
git remote remove origin 2>nul
git remote add origin %REPO_URL%

echo [2/3] Verificando rama principal (main)...
git branch -M main

echo [3/3] Subiendo todo el código a GitHub...
git push -u origin main

echo.
if %ERRORLEVEL% equ 0 (
    echo =======================================================
    echo  ¡Proyecto subido exitosamente a GitHub!
    echo =======================================================
) else (
    echo =======================================================
    echo  Hubo un inconveniente al subir.
    echo  Verificá que tengas permisos de escritura o tu Personal Access Token (PAT).
    echo =======================================================
)
echo.
pause
