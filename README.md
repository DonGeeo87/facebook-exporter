# 📘 Facebook Exporter

**Export posts and images from your Facebook Fanpages with a single click!**  
**¡Exporta posts e imágenes de tus Fanpages de Facebook con un solo clic!**

[![Version](https://img.shields.io/badge/version-1.1.0-blue.svg)](https://github.com/CodigoGuerreroDev/facebook-exporter/releases)
[![Chrome](https://img.shields.io/badge/chrome-120+-green.svg)](https://www.google.com/chrome/)
[![License](https://img.shields.io/badge/license-MIT-yellow.svg)](LICENSE)
[![Manifest](https://img.shields.io/badge/manifest-V3-orange.svg)](https://developer.chrome.com/docs/extensions/mv3/intro/)

---

## 🌐 Language / Idioma

- [🇺🇸 English](#-english)
- [🇪🇸 Español](#-español)

---

# 🇺🇸 English

## ⚡ Quick Start

```bash
# 1. Clone the repository
git clone https://github.com/CodigoGuerreroDev/facebook-exporter.git

# 2. Load in Chrome
# Go to chrome://extensions/ → Enable Developer Mode → Load unpacked → Select folder

# 3. Start exporting!
# Navigate to your Facebook Fanpage and click the extension icon
```

## 🎯 Features

### 📊 Export Posts
- **Format:** JSON + CSV
- **Data:** Text, date, likes, comments, shares, URL, images
- **Pagination:** Infinite scroll with auto-load
- **Limit:** Up to 1000 posts

### 🖼️ Download Images
- **Format:** ZIP with all images + metadata + HTML gallery
- **Features:** 
  - Auto-scroll to load more content
  - Filter small icons/avatars
  - Include video thumbnails
  - Smart image quality enhancement
- **Limit:** Up to 1000 images

### 🔘 Floating Button
- **Integrated modal** directly on Facebook
- **Quick access** without opening extension popup
- **Real-time progress** bar
- **ZIP download** option

## 📦 What's in the Box

```
facebook-exporter/
├── 📄 manifest.json          # Extension configuration (Manifest V3)
├── 🎨 popup.html             # Extension popup UI
├── 🔧 popup.js               # Popup logic
├── 📜 content.js             # Facebook content script + floating modal
├── 🛠️ utils.js               # Helper functions (ZIP, CSV, etc.)
├── ⚙️ background.js          # Service worker
├── 🖼️ jszip.min.js           # JSZip library for ZIP creation
├── 📂 icons/                 # Extension icons (16px, 48px, 128px)
├── 📚 README.md              # This file
├── 📖 QUICKSTART.md          # Quick start guide
├── 🐛 TROUBLESHOOTING.md     # Troubleshooting guide
└── 📝 ... (more documentation)
```

## 🚀 Installation

### Step 1: Clone or Download
```bash
git clone https://github.com/CodigoGuerreroDev/facebook-exporter.git
cd facebook-exporter
```

### Step 2: Load in Chrome
1. Open Chrome and go to `chrome://extensions/`
2. Enable **"Developer mode"** (toggle in top right)
3. Click **"Load unpacked"**
4. Select the `facebook-exporter` folder
5. ✅ Extension icon 📘 appears in toolbar

### Step 3: Pin Extension (Optional)
1. Click puzzle icon 🧩 in Chrome toolbar
2. Find "Facebook Post Exporter"
3. Click pin icon 📌

## 📖 Usage

### Export Posts
1. Navigate to your Facebook Fanpage
2. Click extension icon 📘
3. Configure options:
   - ☑ Include comments (optional, slower)
   - 📊 Maximum posts: 50 (recommended for test)
4. Click "📥 Export Posts"
5. Wait for auto-scroll to complete
6. ✅ Downloads: `facebook-export-*.json` + `facebook-export-*.csv`

### Download Images (ZIP)
1. Navigate to your Facebook Fanpage
2. Click extension icon 📘
3. Go to "🖼️ Download Images" section
4. Configure:
   - 🖼️ Maximum images: 100 (recommended)
   - ☑ Include video thumbnails
   - ☑ Download in ZIP (recommended)
5. Click "🖼️ Download Images"
6. ✅ Downloads: `facebook-images-*.zip` with:
   - `imagenes-facebook/` - All images
   - `metadata/imagenes-metadata.json` - Complete metadata
   - `galeria.html` - Visual gallery

### Using Floating Button ⭐
1. Go to your Facebook Fanpage
2. Look for floating button 📥 in bottom-right corner
3. Click button → Modal opens
4. Configure options
5. Click "Download Images"
6. ✅ Real-time progress + automatic ZIP download

## 🎨 ZIP Contents

```
facebook-images-20260402-143022.zip
├── imagenes-facebook/
│   ├── imagen-0001-123456789.jpg
│   ├── imagen-0002-987654321.jpg
│   └── ... (all images)
├── metadata/
│   └── imagenes-metadata.json
└── galeria.html
```

### Metadata Format (JSON)
```json
{
  "url": "https://scontent.xx.fbcdn.net/v/t1.0-9/..._o.jpg",
  "originalUrl": "https://scontent.xx.fbcdn.net/v/t1.0-9/..._s.jpg",
  "postId": "123456789",
  "postUrl": "https://facebook.com/page/posts/123456789",
  "fecha": "2024-01-15T14:30:00Z",
  "width": 1200,
  "height": 800,
  "tipo": "photo"
}
```

## 🛠️ Troubleshooting

### "Could not establish connection"
**Solution:** Reload extension in `chrome://extensions/` and refresh Facebook (F5)

### "0 posts/images found"
**Solution:** Scroll manually first to load content, then try again

### "JSZip is not defined"
**Solution:** Check internet connection (JSZip loads from CDN first time)

### Gallery doesn't show images
**Solution:** Open `galeria.html` from inside the ZIP or extract ZIP first

📖 **Full troubleshooting guide:** [TROUBLESHOOTING.md](TROUBLESHOOTING.md)

## 📋 Requirements

- ✅ Google Chrome 120+ or Microsoft Edge 120+
- ✅ Facebook Fanpage (you must be admin)
- ✅ Internet connection (first time for JSZip)

## ⚖️ Legal Notice

### Chile - Ley 19.628 (Personal Data Protection)

**✅ ALLOWED:**
- Export content from pages you administer
- Personal use and internal analysis
- Backup of your own posts

**❌ PROHIBITED:**
- Extract personal data from third parties without consent
- Commercialize extracted data
- Mass scraping of third-party pages
- Violation of Facebook Terms of Service

### Facebook Terms of Service
- Only for page administrators
- Not for mass automation
- Respect rate limiting

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

## 📄 License

This project is licensed under the MIT License - see [LICENSE](LICENSE) file for details.

## 👨‍💻 Author

**Código Guerrero Dev ⚔️**  
🇨🇱 Chile

- 📧 Email: [your-email@example.com]
- 🔗 Website: [your-website.com]
- 💼 LinkedIn: [your-linkedin]

## 🙏 Acknowledgments

- [JSZip](https://github.com/Stuk/jszip) - ZIP creation library
- [Chrome Extensions](https://developer.chrome.com/docs/extensions/) - Chrome Extensions Documentation
- Facebook for the platform (obviously 😄)

## 📚 Additional Documentation

| Document | Description |
|----------|-------------|
| [QUICKSTART.md](QUICKSTART.md) | Quick start guide (5 min) |
| [TROUBLESHOOTING.md](TROUBLESHOOTING.md) | Troubleshooting guide |
| [IMAGENES_BULK.md](IMAGENES_BULK.md) | Complete image download guide |
| [SELECTORES.md](SELECTORES.md) | Facebook selectors guide |
| [VERSION_1.1.0.md](VERSION_1.1.0.md) | Version 1.1.0 changelog |
| [FIX_GALERIA_ZIP.md](FIX_GALERIA_ZIP.md) | Gallery fix documentation |
| [FIX_LIMITES_1000.md](FIX_LIMITES_1000.md) | Limits unification fix |

## 🗺️ Roadmap

- [ ] Export videos (full video, not just thumbnails)
- [ ] Date range filter
- [ ] Exclude duplicate images
- [ ] Export comments per post
- [ ] Dark mode for popup
- [ ] Multiple languages support
- [ ] Export to Google Sheets

## 📈 Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.1.0 | Apr 2026 | ZIP download, floating button, gallery fix |
| 1.0.0 | Apr 2026 | Initial release: posts export, images bulk download |

---

# 🇪🇸 Español

## ⚡ Inicio Rápido

```bash
# 1. Clonar repositorio
git clone https://github.com/CodigoGuerreroDev/facebook-exporter.git

# 2. Cargar en Chrome
# Ve a chrome://extensions/ → Activa Modo Desarrollador → Cargar descomprimida → Selecciona carpeta

# 3. ¡Comienza a exportar!
# Navega a tu Fanpage de Facebook y haz clic en el ícono de la extensión
```

## 🎯 Características

### 📊 Exportar Posts
- **Formato:** JSON + CSV
- **Datos:** Texto, fecha, likes, comentarios, compartidos, URL, imágenes
- **Paginación:** Scroll infinito con carga automática
- **Límite:** Hasta 1000 posts

### 🖼️ Descargar Imágenes
- **Formato:** ZIP con todas las imágenes + metadata + galería HTML
- **Características:**
  - Auto-scroll para cargar más contenido
  - Filtrado de íconos/avatars pequeños
  - Inclusión de miniaturas de videos
  - Mejora inteligente de calidad
- **Límite:** Hasta 1000 imágenes

### 🔘 Botón Flotante
- **Modal integrado** directamente en Facebook
- **Acceso rápido** sin abrir popup de extensión
- **Barra de progreso** en tiempo real
- **Opción de descarga ZIP**

## 📦 ¿Qué Hay en la Caja?

```
facebook-exporter/
├── 📄 manifest.json          # Configuración de extensión (Manifest V3)
├── 🎨 popup.html             # UI del popup de extensión
├── 🔧 popup.js               # Lógica del popup
├── 📜 content.js             # Content script de Facebook + modal flotante
├── 🛠️ utils.js               # Funciones helper (ZIP, CSV, etc.)
├── ⚙️ background.js          # Service worker
├── 🖼️ jszip.min.js           # Librería JSZip para crear ZIPs
├── 📂 icons/                 # Íconos de extensión (16px, 48px, 128px)
├── 📚 README.md              # Este archivo
├── 📖 QUICKSTART.md          # Guía de inicio rápido
├── 🐛 TROUBLESHOOTING.md     # Guía de solución de problemas
└── 📝 ... (más documentación)
```

## 🚀 Instalación

### Paso 1: Clonar o Descargar
```bash
git clone https://github.com/CodigoGuerreroDev/facebook-exporter.git
cd facebook-exporter
```

### Paso 2: Cargar en Chrome
1. Abre Chrome y ve a `chrome://extensions/`
2. Activa **"Modo de desarrollador"** (interruptor arriba a la derecha)
3. Haz clic en **"Cargar descomprimida"**
4. Selecciona la carpeta `facebook-exporter`
5. ✅ Ícono de la extensión 📘 aparece en la barra

### Paso 3: Fijar Extensión (Opcional)
1. Haz clic en ícono de rompecabezas 🧩 en barra de Chrome
2. Busca "Facebook Post Exporter"
3. Haz clic en ícono de alfiler 📌

## 📖 Uso

### Exportar Posts
1. Navega a tu Fanpage de Facebook
2. Haz clic en ícono de extensión 📘
3. Configura opciones:
   - ☑ Incluir comentarios (opcional, más lento)
   - 📊 Máximo de posts: 50 (recomendado para prueba)
4. Haz clic en "📥 Exportar Posts"
5. Espera a que termine el auto-scroll
6. ✅ Descargas: `facebook-export-*.json` + `facebook-export-*.csv`

### Descargar Imágenes (ZIP)
1. Navega a tu Fanpage de Facebook
2. Haz clic en ícono de extensión 📘
3. Ve a sección "🖼️ Descargar Imágenes"
4. Configura:
   - 🖼️ Máximo de imágenes: 100 (recomendado)
   - ☑ Incluir miniaturas de videos
   - ☑ Descargar en ZIP (recomendado)
5. Haz clic en "🖼️ Descargar Imágenes"
6. ✅ Descarga: `facebook-images-*.zip` con:
   - `imagenes-facebook/` - Todas las imágenes
   - `metadata/imagenes-metadata.json` - Metadata completa
   - `galeria.html` - Galería visual

### Usar Botón Flotante ⭐
1. Ve a tu Fanpage de Facebook
2. Busca botón flotante 📥 en esquina inferior derecha
3. Haz clic en botón → Se abre modal
4. Configura opciones
5. Haz clic en "Descargar Imágenes"
6. ✅ Progreso en tiempo real + descarga automática de ZIP

## 🎨 Contenido del ZIP

```
facebook-images-20260402-143022.zip
├── imagenes-facebook/
│   ├── imagen-0001-123456789.jpg
│   ├── imagen-0002-987654321.jpg
│   └── ... (todas las imágenes)
├── metadata/
│   └── imagenes-metadata.json
└── galeria.html
```

### Formato de Metadata (JSON)
```json
{
  "url": "https://scontent.xx.fbcdn.net/v/t1.0-9/..._o.jpg",
  "originalUrl": "https://scontent.xx.fbcdn.net/v/t1.0-9/..._s.jpg",
  "postId": "123456789",
  "postUrl": "https://facebook.com/page/posts/123456789",
  "fecha": "2024-01-15T14:30:00Z",
  "width": 1200,
  "height": 800,
  "tipo": "photo"
}
```

## 🛠️ Solución de Problemas

### "Could not establish connection"
**Solución:** Recarga extensión en `chrome://extensions/` y refresca Facebook (F5)

### "0 posts/imágenes encontrados"
**Solución:** Haz scroll manual primero para cargar contenido, luego intenta de nuevo

### "JSZip no está definido"
**Solución:** Verifica conexión a internet (JSZip carga desde CDN la primera vez)

### Galería no muestra imágenes
**Solución:** Abre `galeria.html` desde dentro del ZIP o extrae el ZIP primero

📖 **Guía completa de solución de problemas:** [TROUBLESHOOTING.md](TROUBLESHOOTING.md)

## 📋 Requisitos

- ✅ Google Chrome 120+ o Microsoft Edge 120+
- ✅ Fanpage de Facebook (debes ser administrador)
- ✅ Conexión a internet (primera vez para JSZip)

## ⚖️ Aviso Legal

### Chile - Ley 19.628 (Protección de Datos Personales)

**✅ PERMITIDO:**
- Exportar contenido de páginas que administras
- Uso personal y análisis interno
- Backup de tus propios posts

**❌ PROHIBIDO:**
- Extraer datos personales de terceros sin consentimiento
- Comercializar datos extraídos
- Scraping masivo de páginas de terceros
- Violación de Términos de Servicio de Facebook

### Términos de Servicio de Facebook
- Solo para administradores de páginas
- No para automatización masiva
- Respetar rate limiting

## 🤝 Contribuciones

1. Fork del repositorio
2. Crear rama de feature (`git checkout -b feature/AmazingFeature`)
3. Commit cambios (`git commit -m 'Add AmazingFeature'`)
4. Push a rama (`git push origin feature/AmazingFeature`)
5. Abrir Pull Request

## 📄 Licencia

Este proyecto está licenciado bajo MIT License - ver archivo [LICENSE](LICENSE) para detalles.

## 👨‍💻 Autor

**Código Guerrero Dev ⚔️**  
🇨🇱 Chile

- 📧 Email: [tu-email@example.com]
- 🔗 Website: [tu-website.com]
- 💼 LinkedIn: [tu-linkedin]

## 🙏 Agradecimientos

- [JSZip](https://github.com/Stuk/jszip) - Librería de creación de ZIPs
- [Chrome Extensions](https://developer.chrome.com/docs/extensions/) - Documentación de Extensiones Chrome
- Facebook por la plataforma (obviamente 😄)

## 📚 Documentación Adicional

| Documento | Descripción |
|-----------|-------------|
| [QUICKSTART.md](QUICKSTART.md) | Guía de inicio rápido (5 min) |
| [TROUBLESHOOTING.md](TROUBLESHOOTING.md) | Guía de solución de problemas |
| [IMAGENES_BULK.md](IMAGENES_BULK.md) | Guía completa de descarga de imágenes |
| [SELECTORES.md](SELECTORES.md) | Guía de selectores de Facebook |
| [VERSION_1.1.0.md](VERSION_1.1.0.md) | Changelog versión 1.1.0 |
| [FIX_GALERIA_ZIP.md](FIX_GALERIA_ZIP.md) | Documentación de fix de galería |
| [FIX_LIMITES_1000.md](FIX_LIMITES_1000.md) | Fix de unificación de límites |

## 🗺️ Roadmap

- [ ] Exportar videos (video completo, no solo miniaturas)
- [ ] Filtro por rango de fechas
- [ ] Excluir imágenes duplicadas
- [ ] Exportar comentarios por post
- [ ] Modo oscuro para popup
- [ ] Soporte para múltiples idiomas
- [ ] Exportar a Google Sheets

## 📈 Historial de Versiones

| Versión | Fecha | Cambios |
|---------|-------|---------|
| 1.1.0 | Abr 2026 | Descarga ZIP, botón flotante, fix galería |
| 1.0.0 | Abr 2026 | Lanzamiento inicial: exportar posts, descarga masiva de imágenes |

---

## 🌟 Star History

[![Star History Chart](https://api.star-history.com/svg?repos=CodigoGuerreroDev/facebook-exporter&type=Date)](https://star-history.com/#CodigoGuerreroDev/facebook-exporter&Date)

---

**Made with ⚔️ by Código Guerrero Dev - Chile 🇨🇱**
