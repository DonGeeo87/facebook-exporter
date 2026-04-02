@echo off
chcp 65001 >nul
cls
echo ════════════════════════════════════════════════════════════
echo    📘 Facebook Exporter - Instalación Rápida
echo    Código Guerrero Dev ⚔️
echo ════════════════════════════════════════════════════════════
echo.
echo ✅ Archivos verificados:
echo.

dir /b manifest.json popup.html popup.js content.js utils.js background.js README.md >nul 2>&1 && (
    echo    ✅ manifest.json
    echo    ✅ popup.html
    echo    ✅ popup.js
    echo    ✅ content.js
    echo    ✅ utils.js
    echo    ✅ background.js
    echo    ✅ README.md
) || (
    echo    ❌ ERROR: Faltan archivos críticos
    pause
    exit /b 1
)

echo.
dir /b icons\*.png >nul 2>&1 && (
    echo    ✅ Íconos PNG generados
) || (
    echo    ⚠️  Íconos no encontrados, ejecuta generar-iconos.ps1 primero
)

echo.
echo ════════════════════════════════════════════════════════════
echo 🚀 INSTALACIÓN EN CHROME
echo ════════════════════════════════════════════════════════════
echo.
echo Sigue estos pasos:
echo.
echo   1. Abre Chrome y navega a:
echo      chrome://extensions/
echo.
echo   2. Activa el interruptor "Modo de desarrollador"
echo      (esquina superior derecha)
echo.
echo   3. Haz clic en "Cargar descomprimida"
echo.
echo   4. Selecciona esta carpeta:
echo      %CD%
echo.
echo   5. ¡Listo! Verás el ícono en tu barra de extensiones
echo.
echo ════════════════════════════════════════════════════════════
echo 📖 USO RÁPIDO
echo ════════════════════════════════════════════════════════════
echo.
echo   1. Ve a tu Fanpage de Facebook
echo   2. Haz clic en el ícono de la extensión
echo   3. Configura opciones (máx posts, incluir comentarios)
echo   4. Haz clic en "Exportar Posts"
echo   5. Espera a que termine el auto-scroll
echo   6. Se descargarán JSON + CSV automáticamente
echo.
echo ════════════════════════════════════════════════════════════
echo ⚠️  NOTAS IMPORTANTES
echo ════════════════════════════════════════════════════════════
echo.
echo   • Solo para páginas que ADMINISTRAS
echo   • No funciona en m.facebook.com (móvil)
echo   • Si hay errores, actualiza selectores en content.js
echo   • Cumple con Ley 19.628 (Protección de Datos Chile)
echo.
echo ════════════════════════════════════════════════════════════
echo.
pause
