# Script PowerShell para generar íconos PNG para Facebook Exporter
# Código Guerrero Dev

$ErrorActionPreference = "Stop"

# Ruta de la carpeta de íconos
$iconsPath = Join-Path $PSScriptRoot "icons"

# Crear carpeta si no existe
if (-not (Test-Path $iconsPath)) {
    New-Item -ItemType Directory -Path $iconsPath | Out-Null
    Write-Host "📁 Carpeta icons creada: $iconsPath" -ForegroundColor Green
}

# Función para crear ícono con System.Drawing
function CrearIcono {
    param(
        [int]$Size,
        [string]$OutputPath
    )
    
    # Cargar ensamblado System.Drawing
    Add-Type -AssemblyName System.Drawing
    
    # Crear bitmap
    $bitmap = New-Object System.Drawing.Bitmap($Size, $Size)
    $graphics = [System.Drawing.Graphics]::FromImage($bitmap)
    $graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
    
    # Crear degradado
    $rect = New-Object System.Drawing.Rectangle(0, 0, $Size, $Size)
    $brush = New-Object System.Drawing.Drawing2D.LinearGradientBrush(
        $rect,
        [System.Drawing.Color]::FromArgb(102, 126, 234),  # #667eea
        [System.Drawing.Color]::FromArgb(118, 75, 162),   # #764ba2
        [System.Drawing.Drawing2D.LinearGradientMode]::ForwardDiagonal
    )
    
    # Dibujar fondo con esquinas redondeadas
    $path = New-Object System.Drawing.Drawing2D.GraphicsPath
    $radius = $Size / 8
    $arcSize = $radius * 2
    
    # Esquina superior izquierda
    $path.AddArc(0, 0, $arcSize, $arcSize, 180, 90)
    # Esquina superior derecha
    $path.AddArc($Size - $arcSize, 0, $arcSize, $arcSize, 270, 90)
    # Esquina inferior derecha
    $path.AddArc($Size - $arcSize, $Size - $arcSize, $arcSize, $arcSize, 0, 90)
    # Esquina inferior izquierda
    $path.AddArc(0, $Size - $arcSize, $arcSize, $arcSize, 90, 90)
    $path.CloseFigure()
    
    $graphics.FillPath($brush, $path)
    
    # Dibujar borde blanco sutil
    $pen = New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(77, 255, 255, 255), [Math]::Max(1, $Size / 32))
    $graphics.DrawPath($pen, $path)
    
    # Dibujar letra "F"
    $fontFamily = New-Object System.Drawing.FontFamily("Arial")
    $fontSize = $Size * 0.55
    $font = New-Object System.Drawing.Font($fontFamily, $fontSize, [System.Drawing.FontStyle]::Bold)
    $stringFormat = New-Object System.Drawing.StringFormat
    $stringFormat.Alignment = [System.Drawing.StringAlignment]::Center
    $stringFormat.LineAlignment = [System.Drawing.StringAlignment]::Center
    
    # Ajustar posición del texto
    $textRect = New-Object System.Drawing.RectangleF(0, 0, $Size, $Size)
    $graphics.DrawString("F", $font, [System.Drawing.Brushes]::White, $textRect, $stringFormat)
    
    # Guardar archivo
    $bitmap.Save($OutputPath, [System.Drawing.Imaging.ImageFormat]::Png)
    
    # Limpiar recursos
    $graphics.Dispose()
    $bitmap.Dispose()
    $brush.Dispose()
    $pen.Dispose()
    $font.Dispose()
    $path.Dispose()
    
    Write-Host "✅ icon${Size}.png generado" -ForegroundColor Green
}

# Generar todos los íconos
Write-Host "`n🎨 Generando íconos para Facebook Exporter..." -ForegroundColor Cyan
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Gray

CrearIcono -Size 16 -OutputPath (Join-Path $iconsPath "icon16.png")
CrearIcono -Size 48 -OutputPath (Join-Path $iconsPath "icon48.png")
CrearIcono -Size 128 -OutputPath (Join-Path $iconsPath "icon128.png")

Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Gray
Write-Host "`n✅ ¡Todos los íconos generados exitosamente!" -ForegroundColor Green
Write-Host "📁 Ubicación: $iconsPath" -ForegroundColor Cyan
Write-Host "`n🚀 Ahora puedes cargar la extensión en Chrome:" -ForegroundColor Yellow
Write-Host "   1. Ve a chrome://extensions/" -ForegroundColor White
Write-Host "   2. Activa 'Modo de desarrollador'" -ForegroundColor White
Write-Host "   3. Haz clic en 'Cargar descomprimida'" -ForegroundColor White
Write-Host "   4. Selecciona: $PSScriptRoot" -ForegroundColor White
