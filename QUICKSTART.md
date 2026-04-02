# 🚀 Quick Start - Facebook Exporter

**Instalación y uso en 5 minutos** ⚡

---

## 📋 Requisitos Previos

- ✅ Google Chrome (versión 120 o superior)
- ✅ Ser administrador de al menos una Fanpage de Facebook
- ✅ Windows 10/11

---

## ⚡ Instalación Rápida (3 pasos)

### Paso 1: Verificar archivos
```
C:\geeodev\facebook-exporter\
├── manifest.json     ✅ Requerido
├── popup.html        ✅ Requerido
├── popup.js          ✅ Requerido
├── content.js        ✅ Requerido
├── utils.js          ✅ Requerido
├── background.js     ✅ Requerido
└── icons/
    ├── icon16.png    ✅ Requerido
    ├── icon48.png    ✅ Requerido
    └── icon128.png   ✅ Requerido
```

### Paso 2: Abrir Chrome Extensions
```
1. Abre Chrome
2. En la barra de direcciones escribe: chrome://extensions/
3. Presiona Enter
```

### Paso 3: Cargar extensión
```
1. Activa el interruptor "Modo de desarrollador" (arriba a la derecha)
2. Haz clic en "Cargar descomprimida"
3. Navega a: C:\geeodev\facebook-exporter\
4. Haz clic en "Seleccionar carpeta"
5. ✅ ¡Listo! Verás "Facebook Post Exporter" en la lista
```

---

## 📖 Uso Básico (4 pasos)

### Exportar Posts

### Paso 1: Ir a tu Fanpage
```
https://www.facebook.com/tu-pagina/
```

### Paso 2: Abrir la extensión
```
Haz clic en el ícono 📘 en la barra de extensiones (arriba a la derecha)
```

### Paso 3: Configurar
```
☐ Incluir comentarios (opcional, más lento)
📊 Máximo de posts: 50 (recomendado para prueba)
```

### Paso 4: Exportar
```
1. Haz clic en "📥 Exportar Posts"
2. Espera a que termine el auto-scroll (verás progreso)
3. Se descargarán 2 archivos automáticamente:
   - facebook-export-20260402-143022.json
   - facebook-export-20260402-143022.csv
```

### Descargar Imágenes en Bulk

### Paso 1: Ir a tu Fanpage
```
https://www.facebook.com/tu-pagina/
```

### Paso 2: Abrir la extensión
```
Haz clic en el ícono 📘
```

### Paso 3: Configurar
```
🖼️ Máximo de imágenes: 100 (recomendado)
☑️ Incluir miniaturas de videos (activado por defecto)
```

### Paso 4: Descargar
```
1. Haz clic en "🖼️ Descargar Imágenes"
2. Espera a que termine el auto-scroll
3. Se descargarán 3 archivos:
   - facebook-images-metadata-*.json (metadata)
   - facebook-images-gallery-*.html (galería visual)
   - facebook-images-downloads-*.m3u (lista para gestor)
```

### Paso 5: Descargar imágenes
```
Opción A: Abre la galería HTML y descarga individualmente
Opción B: Usa JDownloader 2 con el archivo .m3u
Opción C: Usa wget: wget -i facebook-images-downloads-*.m3u
```

---

## 📊 Formato de Salida

### Posts - JSON (ejemplo)
```json
[
  {
    "id": "123456789",
    "texto": "¡Hola guerreros! Hoy veremos...",
    "fecha_iso": "2024-01-15T14:30:00Z",
    "likes": 42,
    "comentarios_count": 7,
    "compartidos": 3,
    "url_post": "https://facebook.com/page/posts/123456789",
    "imagen_url": "https://...",
    "tipo": "photo"
  }
]
```

### Posts - CSV (ábrela en Excel)
```
ID,Texto,Fecha,Likes,Comentarios,Compartidos,URL,Imagen,Tipo
123456789,"¡Hola guerreros!...",2024-01-15T14:30:00Z,42,7,3,https://...,https://...,photo
```

### Imágenes - JSON (ejemplo)
```json
[
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
]
```

### Imágenes - M3U (para gestor de descargas)
```
#EXTM3U
# Facebook Images Download List
#EXTINF:-1,facebook-image-0001-123456789.jpg
https://scontent.xx.fbcdn.net/v/t1.0-9/...
```

---

## 🐛 Problemas Comunes (solución rápida)

### "No es Facebook"
```
✅ Solución: Asegúrate de estar en www.facebook.com (no m.facebook.com)
```

### "0 posts encontrados"
```
✅ Solución: Haz scroll manual 3-4 veces antes de exportar
```

### "0 imágenes encontradas"
```
✅ Solución: Asegúrate de estar en la sección de Posts, no en "About" o "Photos"
```

### Se congela la extensión
```
✅ Solución: Reduce a 20 posts o 50 imágenes, desactiva "Incluir comentarios"
```

### Selectores no funcionan
```
✅ Solución: Ver TROUBLESHOOTING.md o SELECTORES.md
```

### Imágenes se ven pixeladas
```
✅ Solución: La extensión ya intenta obtener URLs de alta resolución automáticamente
   Si persiste, la imagen original fue subida en baja calidad
```

---

## 📁 Archivos de Documentación

| Archivo | Propósito |
|---------|-----------|
| **README.md** | Documentación completa |
| **TROUBLESHOOTING.md** | Solución de problemas |
| **SELECTORES.md** | Guía de selectores Facebook |
| **IMAGENES_BULK.md** | Guía de descarga de imágenes ⭐ |
| **SESSION_SUMMARY.md** | Resumen de sesión |
| **QUICKSTART.md** | Este archivo - inicio rápido |

---

## 🎯 Próximos Pasos Recomendados

1. **Prueba con 20 posts** para verificar que funciona
2. **Revisa el JSON** descargado en un editor de texto
3. **Abre el CSV** en Excel para verificar formato
4. **Aumenta a 50-100 posts** cuando estés cómodo
5. **Lee TROUBLESHOOTING.md** por si hay problemas

---

## 📞 Comandos Útiles

### Recargar extensión
```
1. chrome://extensions/
2. Haz clic en 🔄 junto a Facebook Post Exporter
```

### Ver logs
```
1. chrome://extensions/
2. Haz clic en "service worker" en Facebook Post Exporter
3. Se abrirá la consola con logs
```

### Desinstalar
```
1. chrome://extensions/
2. Haz clic en "Quitar" en Facebook Post Exporter
```

---

## ⚠️ Recordatorios Legales

- ✅ Solo para páginas que **administras**
- ✅ Cumple con Ley 19.628 (Chile)
- ❌ No extraer datos de terceros sin consentimiento
- ❌ No comercializar datos extraídos

---

## 🤝 Soporte

Si tienes problemas:

1. Revisa **TROUBLESHOOTING.md**
2. Verifica consola del navegador (F12)
3. Prueba con menos posts (20 en vez de 500)
4. Reinicia Chrome completamente

---

**¡Éxito, Guerrero! 🗡️**

*Código Guerrero Dev - Chile 🇨🇱*
