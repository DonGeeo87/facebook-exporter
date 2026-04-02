# 🐛 Troubleshooting - Facebook Exporter

**Guía de solución de problemas**  
*Código Guerrero Dev ⚔️*

---

## ❌ Errores Comunes y Soluciones

### 1. "❌ No es Facebook" en el popup

**Síntoma:** El botón de exportar está deshabilitado con mensaje "No es Facebook"

**Causa:** No estás en una URL de Facebook

**Solución:**
```
1. Navega a: https://www.facebook.com/
2. O a tu Fanpage: https://www.facebook.com/tu-pagina/
3. NO uses: m.facebook.com (versión móvil)
4. Recarga la página y haz clic en la extensión
```

**Verificación:**
```javascript
// En Consola DevTools:
console.log(window.location.href);
// Debe contener "facebook.com"
```

---

### 2. "0 posts encontrados" o "Post 0/50..."

**Síntoma:** La extracción termina inmediatamente con 0 posts

**Causas posibles:**
- Facebook cambió sus selectores
- No hay contenido cargado aún
- Estás en una sección sin posts (ej: About, Photos)

**Solución A: Cargar contenido manualmente**
```
1. En la página de Facebook, haz scroll hacia abajo 3-4 veces
2. Espera a que carguen varios posts
3. Ahora haz clic en la extensión y exporta
```

**Solución B: Actualizar selectores**
```javascript
// 1. Abre DevTools (F12)
// 2. En Consola, ejecuta:
document.querySelectorAll('[role="article"]').length

// 3. Si retorna 0, prueba:
document.querySelectorAll('[data-pagelet="FeedUnit"]').length

// 4. Si encuentras posts, actualiza content.js:
const postSelectors = [
  '[role="article"]',           // Cambia si no funciona
  '[data-pagelet="FeedUnit"]',  // Mueve este primero
  // ...
];
```

**Solución C: Verificar página**
```
✅ Funciona en:
- https://www.facebook.com/tu-pagina/
- https://www.facebook.com/tu-pagina/posts/
- https://www.facebook.com/feed/

❌ No funciona en:
- https://www.facebook.com/tu-pagina/about/
- https://www.facebook.com/tu-pagina/photos/
- https://m.facebook.com/ (móvil)
```

---

### 3. La extensión se congela o no responde

**Síntoma:** El progreso se queda pegado en "Post X/50..."

**Causas:**
- Demasiados posts (500+)
- Incluir comentarios activado
- Conexión lenta a internet

**Solución:**
```
1. Haz clic en "Detener"
2. Reduce el máximo de posts a 20 o 50
3. Desactiva "Incluir comentarios"
4. Cierra otras pestañas de Facebook
5. Intenta nuevamente
```

**Prevención:**
- Usa 50 posts como valor default
- Solo activa comentarios si es necesario
- Espera a que cargue bien la página antes de exportar

---

### 4. Posts con texto vacío o incompleto

**Síntoma:** Los posts exportados tienen `"texto": ""` o texto cortado

**Causa:** Selector de texto desactualizado

**Solución:**
```javascript
// En content.js, actualiza textSelectors:
const textSelectors = [
  '[data-testid="post_text"]',   // Principal
  '.x1lliihq',                   // Backup 1
  '.x193iq5w',                   // Backup 2
  '[role="article"] span[dir="auto"]',  // Backup 3
  // Agrega más según necesites
];
```

**Depuración:**
```javascript
// En DevTools Console, con un post seleccionado:
const post = document.querySelector('[role="article"]');
const spans = post.querySelectorAll('span');

spans.forEach((span, i) => {
  const text = span.textContent.trim();
  if (text.length > 20) {
    console.log(`Span ${i}: ${text.substring(0, 50)}...`);
  }
});
```

---

### 5. Likes/comentarios siempre en 0

**Síntoma:** Todos los posts tienen `"likes": 0, "comentarios_count": 0`

**Causa:** Selectores de reacciones desactualizados

**Solución:**
```javascript
// En content.js, actualiza extractReactions():
const reactionSelectors = [
  '[aria-label*=" Me gusta"]',   // En español
  '[aria-label*=" Me encanta"]',
  '[data-testid="reactions_count"]',
  // Agrega más según necesites
];
```

**Depuración:**
```javascript
// En DevTools Console:
const post = document.querySelector('[role="article"]');

// Buscar reacciones:
const reactions = post.querySelectorAll('[aria-label*=" Me"]');
console.log('Reacciones encontradas:', reactions.length);

// Ver aria-labels:
reactions.forEach(r => {
  console.log('Aria-label:', r.getAttribute('aria-label'));
});
```

---

### 6. Imágenes no se detectan

**Síntoma:** `"imagen_url": null` en todos los posts

**Causa:** Selectores de imágenes desactualizados

**Solución:**
```javascript
// En content.js, actualiza extractMainImage():
const imgSelectors = [
  'img[alt=""]',                 // Principal
  'img[src*="photos"]',          // Backup 1
  'img[data-contentid]',         // Backup 2
  '[role="article"] img'         // Backup 3
];
```

**Depuración:**
```javascript
// En DevTools Console:
const post = document.querySelector('[role="article"]');
const imgs = post.querySelectorAll('img');

console.log('Imágenes encontradas:', imgs.length);

imgs.forEach((img, i) => {
  console.log(`Img ${i}:`, {
    src: img.src.substring(0, 50),
    alt: img.alt,
    width: img.naturalWidth,
    height: img.naturalHeight
  });
});
```

---

### 7. Auto-scroll no funciona

**Síntoma:** La página no hace scroll automáticamente

**Causas:**
- Error en scrollToLoadContent()
- Facebook cambió estructura de scroll
- Ventana muy pequeña

**Solución:**
```javascript
// En content.js, verifica scrollToLoadContent():
async function scrollToLoadContent(delay = 2000) {
  const scrollHeight = document.documentElement.scrollHeight;
  
  window.scrollTo({
    top: scrollHeight,
    behavior: 'smooth'
  });
  
  await sleep(delay);
  
  // Verifica que el scroll funcionó:
  console.log('Scroll top:', window.scrollY);
  console.log('Scroll height:', scrollHeight);
}
```

**Alternativa manual:**
```
1. Desactiva auto-scroll
2. Haz scroll manual hasta cargar todos los posts que necesitas
3. Luego usa la extensión para extraer
```

---

### 8. Error: "No se pudo extraer el post"

**Síntoma:** Mensaje de error en consola o popup

**Causas:**
- Post eliminado o privado
- Error de timeout
- Estructura HTML muy diferente

**Solución:**
```javascript
// El código ya tiene reintentos (retry x3)
// Si persiste, aumenta reintentos:

async function extractPostDataWithRetry(postElement, maxRetries = 5) {
  // Cambia 3 por 5 o más
  // ...
}
```

---

### 9. Archivos JSON/CSV no se descargan

**Síntoma:** La extracción termina pero no hay archivos descargados

**Causas:**
- Chrome bloquea descargas múltiples
- Permiso de downloads no concedido
- Error en chrome.downloads.download()

**Solución:**
```
1. Ve a chrome://extensions/
2. Busca Facebook Exporter
3. Haz clic en "Detalles"
4. Verifica que "Descargas" esté activado
5. Reintenta la exportación
```

**Alternativa manual:**
```javascript
// En DevTools Console de Facebook:
console.log(JSON.stringify(posts, null, 2));
// Copia el output y guárdalo como .json manualmente
```

---

### 10. Error de permisos al instalar

**Síntoma:** Chrome muestra "No se pudo cargar el manifiesto"

**Causas:**
- manifest.json mal formado
- Íconos no encontrados
- Ruta incorrecta

**Solución:**
```
1. Verifica que manifest.json sea válido:
   - Abre en editor de texto
   - Busca errores de sintaxis JSON
   - Verifica comas y llaves

2. Verifica que los íconos existan:
   - icons/icon16.png
   - icons/icon48.png
   - icons/icon128.png

3. Si faltan íconos, ejecuta:
   powershell -ExecutionPolicy Bypass -File generar-iconos.ps1
```

---

## 🔧 Comandos de Diagnóstico

### Verificar estado de la extensión
```
1. chrome://extensions/
2. Busca "Facebook Exporter"
3. Verifica que esté activada (toggle azul)
4. Haz clic en "service worker" para ver logs
```

### Ver logs del content script
```
1. Abre Facebook en una pestaña
2. Presiona F12 para DevTools
3. Ve a Console
4. Deberías ver: "✅ content.js cargado"
```

### Ver logs del popup
```
1. Haz clic en el ícono de la extensión
2. Presiona Ctrl + Shift + I (abre DevTools del popup)
3. Ve a Console
4. Interactúa con el popup y verás los logs
```

---

## 📞 Checklist de Verificación Rápida

Cuando algo no funcione, verifica en este orden:

- [ ] ¿Estás en facebook.com (no m.facebook.com)?
- [ ] ¿La extensión está instalada y activada?
- [ ] ¿Hay posts visibles en la página?
- [ ] ¿Los selectores encuentran posts? (probar en consola)
- [ ] ¿El popup muestra "Exportar Posts" habilitado?
- [ ] ¿Hay errores en la consola? (F12)
- [ ] ¿Los íconos de la extensión se ven correctamente?

---

## 🆘 Si Nada Funciona

### Reset completo:

```
1. chrome://extensions/
2. Elimina Facebook Exporter
3. Cierra Chrome completamente
4. Vuelve a abrir Chrome
5. Ve a chrome://extensions/
6. Activa Modo desarrollador
7. Haz clic en "Cargar descomprimida"
8. Selecciona: C:\geeodev\facebook-exporter
9. Abre facebook.com
10. Prueba con 10 posts primero
```

### Reportar problema:

Incluye esta información:
1. URL exacta donde falla
2. Captura de pantalla del error
3. Logs de consola (F12)
4. Versión de Chrome (chrome://version/)
5. ¿Cuántos posts intentaste exportar?

---

**¡No te rindas, Guerrero! El código se vence con persistencia ⚔️**

*Código Guerrero Dev 🇨🇱*
