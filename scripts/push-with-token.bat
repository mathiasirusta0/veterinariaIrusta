@echo off
chcp 65001 > nul
echo =======================================================
echo   VET SYSTEM — Subir a https://github.com/mathiasirusta0/veterinariaIrusta
echo =======================================================
echo.
echo Para autorizar la subida a tu cuenta mathiasirusta0:
echo.
echo 1. Ingresá a: https://github.com/settings/tokens
echo 2. Generá un "Personal Access Token (classic)" con permiso "repo".
echo.
set /p GH_TOKEN="Pegá tu Token de GitHub aquí: "

if "%GH_TOKEN%"=="" (
    echo [ERROR] No ingresaste ningún token.
    pause
    exit /b
)

echo.
echo Configurando credenciales y subiendo...
git remote set-url origin https://mathiasirusta0:%GH_TOKEN%@github.com/mathiasirusta0/veterinariaIrusta.git
git branch -M main
git push -u origin main

echo.
if %ERRORLEVEL% equ 0 (
    echo =======================================================
    echo  ¡Proyecto subido exitosamente a:
    echo  https://github.com/mathiasirusta0/veterinariaIrusta
    echo =======================================================
    git remote set-url origin https://github.com/mathiasirusta0/veterinariaIrusta.git
) else (
    echo [ERROR] Hubo un problema con la autenticación.
)
echo.
pause
