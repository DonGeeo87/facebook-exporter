# 🖼️ Guía de Descarga de Imágenes - Facebook Exporter

**Funcionalidad exclusiva para descargar imágenes en bulk desde Fanpages**  
*Código Guerrero Dev ⚔️*

---

## 📋 ¿Qué hace esta funcionalidad?

La opción **"Descargar Imágenes"** te permite:

1. **Extraer todas las imágenes** visibles en una Fanpage de Facebook
2. **Auto-scroll inteligente** para cargar más contenido automáticamente
3. **Filtrado automático** de íconos, avatares y imágenes pequeñas
4. **Generar 3 archivos** para diferentes usos:
   - JSON con metadata completa
   - HTML con galería visual
   - M3U para gestores de descargas

---

## 🚀 Uso Paso a Paso

### 1. Navega a tu Fanpage

```
https://www.facebook.com/tu-pagina/
```

Asegúrate de estar en la sección de **Posts** o **Feed**, no en "About" o "Photos".

### 2. Abre la extensión

Haz clic en el ícono 📘 de Facebook Exporter en la barra de Chrome.

### 3. Configura las opciones

**Sección "Descargar Imágenes":**

| Opción | Descripción | Recomendado |
|--------|-------------|-------------|
| Máximo de imágenes | Cantidad máxima a extraer | 100-200 |
| Incluir miniaturas de videos | Extrae posters de videos | ✅ Activado |

### 4. Haz clic en "Descargar Imágenes"

- La extensión comenzará a hacer auto-scroll automáticamente
- Verás el progreso en tiempo real
- El proceso puede tardar varios minutos dependiendo de la cantidad

### 5. Archivos descargados

Recibirás **3 archivos** automáticamente:

```
facebook-images-metadata-20260402-143022.json
facebook-images-gallery-20260402-143022.html
facebook-images-downloads-20260402-143022.m3u
```

---

## 📁 Descripción de Archivos

### 1. Metadata JSON

```json
{
  "url": "https://scontent.xx.fbcdn.net/v/t1.0-9/...",
  "originalUrl": "https://scontent.xx.fbcdn.net/v/t1.0-9/...",
  "postId": "123456789",
  "postUrl": "https://facebook.com/page/posts/123456789",
  "fecha": "2024-01-15T14:30:00Z",
  "width": 1200,
  "height": 800,
  "tipo": "photo"
}
```

**Contiene:**
- URL de alta resolución de cada imagen
- ID y URL del post original
- Fecha de publicación
- Dimensiones (ancho x alto)
- Tipo (photo o video_thumbnail)

### 2. Galería HTML

**Archivo visual** que puedes abrir en tu navegador:

- Muestra todas las imágenes en una cuadrícula
- Cada imagen tiene su información (post, fecha, dimensiones)
- Botón "Descargar Individual" para cada una
- Barra informativa con tips

**Ventaja:** Puedes ver rápidamente qué imágenes te interesan antes de descargar.

### 3. Lista M3U

**Archivo de playlist** para gestores de descargas:

```
#EXTM3U
# Facebook Images Download List
# Total images: 100
#EXTINF:-1,facebook-image-0001-123456789.jpg
https://scontent.xx.fbcdn.net/v/t1.0-9/...
```

**Compatible con:**
- JDownloader 2
- Internet Download Manager (IDM)
- Free Download Manager
- wget (línea de comandos)

---

## 🎯 Métodos de Descarga

### Método A: Galería HTML (Recomendado para pocas imágenes)

**Ideal para:** 10-50 imágenes

1. Abre `facebook-images-gallery-*.html` en Chrome
2. Revisa las imágenes que te interesan
3. Haz clic derecho → "Guardar imagen como..."
4. O usa el botón "Descargar Individual"

**Ventajas:**
- Visual e intuitivo
- Puedes seleccionar solo las que quieres
- Ves la información de cada imagen

**Desventajas:**
- Manual, lento para muchas imágenes

---

### Método B: JDownloader 2 (Recomendado para muchas imágenes)

**Ideal para:** 50-1000+ imágenes

**Paso 1: Instalar JDownloader**
```
1. Ve a: https://jdownloader.org/
2. Descarga JDownloader 2 (gratis)
3. Instala en tu computadora
```

**Paso 2: Cargar lista M3U**
```
1. Abre JDownloader 2
2. Ve a "Descargas" → "Añadir enlaces"
3. Busca y selecciona: facebook-images-downloads-*.m3u
4. Haz clic en "Aceptar"
```

**Paso 3: Iniciar descarga**
```
1. JDownloader analizará los enlaces
2. Verás todas las imágenes en la lista
3. Haz clic en "Iniciar descargas"
4. ¡Listo! Se descargarán automáticamente
```

**Ventajas:**
- Descarga automática y masiva
- Reintenta si falla alguna
- Muestra progreso
- Puedes pausar/reanudar

---

### Método C: wget (Línea de comandos)

**Ideal para:** Usuarios avanzados

```bash
# Navega a la carpeta de descargas
cd C:\Users\TuUsuario\Downloads

# Ejecuta wget con la lista M3U
wget -i facebook-images-downloads-*.m3u

# Opción con más control (reintentos, timeout)
wget -i facebook-images-downloads-*.m3u \
     --tries=3 \
     --waitretry=5 \
     --retry-connrefused \
     --timeout=30
```

**Instalar wget en Windows:**
```
# Opción 1: Usando Chocolatey
choco install wget

# Opción 2: Usando Winget
winget install GnuWin32.Wget

# Opción 3: Descargar directamente
# https://eternallybored.org/misc/wget/
```

---

## ⚙️ Configuración Recomendada

### Para posts recientes (último mes)
```
Máximo de imágenes: 50-100
Incluir videos: ✅
Tiempo estimado: 2-5 minutos
```

### Para histórico completo
```
Máximo de imágenes: 500-1000
Incluir videos: ✅
Tiempo estimado: 15-30 minutos
```

### Solo imágenes destacadas
```
Máximo de imágenes: 20-50
Incluir videos: ❌
Tiempo estimado: 1-2 minutos
```

---

## 🔍 Filtrado Automático

La extensión **filtra automáticamente**:

✅ **Incluye:**
- Imágenes de posts (fotos subidas)
- Imágenes compartidas
- Miniaturas de videos (posters)
- Imágenes de álbumes

❌ **Excluye:**
- Íconos pequeños (< 50px)
- Avatares de perfil
- Emojis
- Imágenes de UI de Facebook
- Logos pequeños

---

## 💡 Tips y Trucos

### 1. Haz scroll manual primero
Antes de usar la extensión, haz scroll manual 2-3 veces para pre-cargar contenido.

### 2. Usa límites razonables
No intentes descargar 1000 imágenes de una vez. Mejor hazlo en lotes de 200.

### 3. Verifica la galería HTML
Antes de descargar todo, abre la galería para ver qué obtuviste.

### 4. Nombra los archivos
El archivo M3U ya incluye nombres como:
```
facebook-image-0001-123456789.jpg
```
Donde `123456789` es el ID del post.

### 5. Organiza por fecha
Usa la metadata JSON para organizar las imágenes:
```javascript
// Ejemplo: Agrupar por mes
const imagesByMonth = images.reduce((acc, img) => {
  const month = img.fecha.substring(0, 7); // "2024-01"
  if (!acc[month]) acc[month] = [];
  acc[month].push(img);
  return acc;
}, {});
```

---

## ⚠️ Problemas Comunes

### "0 imágenes encontradas"

**Causa:** No hay contenido cargado en la página

**Solución:**
```
1. Haz scroll manual hacia abajo 5-10 veces
2. Asegúrate de estar en la sección de Posts
3. No estés en "About", "Photos", o "Videos"
4. Refresca la página e intenta de nuevo
```

### "Las imágenes se ven pixeladas"

**Causa:** Facebook sirve versiones de baja resolución

**Solución:**
La extensión ya intenta obtener URLs de alta resolución automáticamente:
```javascript
// Reemplaza _s. (small) por _o. (original)
if (imageUrl.includes('_s.')) {
  highResUrl = imageUrl.replace('_s.', '_o.');
}
```

Si aún se ven mal, la imagen original puede haber sido subida en baja calidad.

### "JDownloader no reconoce el archivo M3U"

**Causa:** Formato incorrecto o ruta con espacios

**Solución:**
```
1. Mueve el archivo .m3u a una ruta sin espacios
   Ej: C:\downloads\facebook\

2. En JDownloader:
   - Arrastra el archivo .m3u a la ventana
   - O usa "Añadir enlaces" desde el menú
```

### "wget descarga archivos HTML en vez de imágenes"

**Causa:** Los enlaces de Facebook requieren headers especiales

**Solución:**
```bash
wget -i facebook.m3u \
     --user-agent="Mozilla/5.0" \
     --referer="https://www.facebook.com/" \
     --adjust-extension
```

---

## 📊 Metadata Disponible

Cada imagen incluye esta información en el JSON:

| Campo | Tipo | Descripción |
|-------|------|-------------|
| url | string | URL de alta resolución |
| originalUrl | string | URL original extraída |
| postId | string | ID del post donde aparece |
| postUrl | string | URL completa del post |
| fecha | string | Fecha de publicación (ISO) |
| width | number | Ancho en píxeles |
| height | number | Alto en píxeles |
| tipo | string | "photo" o "video_thumbnail" |

---

## 🔗 URLs de Facebook

### Patrones comunes

```
# Imágenes de photos
https://scontent.xx.fbcdn.net/v/t1.0-9/...

# Imágenes con ID
https://facebook.com/photo.php?fbid=123456789

# CDN de Facebook
https://xx.fbcdn.net/v/...
```

### Obtener máxima calidad

La extensión automáticamente convierte:
```
De: .../12345_n.jpg (normal)
A:  .../12345_o.jpg (original)

De: .../12345_s.jpg (small, 320px)
A:  .../12345_o.jpg (original, full size)
```

---

## 📞 Soporte

Si tienes problemas:

1. Revisa esta guía completa
2. Verifica TROUBLESHOOTING.md
3. Abre la consola del navegador (F12) para ver errores
4. Prueba con menos imágenes primero (20-50)

---

**¡Éxito descargando imágenes, Guerrero! 🗡️**

*Código Guerrero Dev - Chile 🇨🇱*
