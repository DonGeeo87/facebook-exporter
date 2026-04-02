# 🔧 Guía de Selectores de Facebook

**Última actualización:** 2 de Abril de 2026  
**Versión:** 1.0.0

---

## 📌 Selectores Actuales (content.js)

```javascript
const postSelectors = [
  '[role="article"]',                    // ✅ PRINCIPAL - Más estable
  '[data-pagelet="FeedUnit"]',           // ✅ Pagelet oficial
  '[data-pagelet="MainFeed"]',           // ✅ Feed principal
  '.x1y0btm7',                           // ⚠️ Backup - Clase común
  '[data-testid="post_container"]',      // ✅ Atributo de test
  '.ecm0bbvt',                           // ⚠️ Backup - Otra clase
  'article[role="article"]'              // ✅ Article semántico
];
```

---

## 🔍 Cómo Depurar Selectores

### Paso 1: Abrir DevTools
1. En Facebook, presiona `F12` o `Ctrl + Shift + I`
2. Ve a la pestaña **Elements** (Elementos)

### Paso 2: Usar el selector
1. Haz clic en el ícono de selección (arriba izquierda en DevTools)
2. Haz clic en un post de Facebook
3. Observa la estructura HTML

### Paso 3: Identificar atributos estables
Busca en este orden:
1. `role="article"` - ARIA role (más estable)
2. `data-pagelet="..."` - Pagelets de React
3. `data-testid="..."` - Atributos de testing
4. `<article>` - Elemento semántico
5. Clases que empiezan con `x` - Clases de utilidad (cambian frecuentemente)

### Paso 4: Probar en Consola
```javascript
// En la consola de DevTools, prueba:
document.querySelectorAll('[role="article"]').length
// Debería mostrar el número de posts visibles

// Prueba nuevos selectores:
document.querySelectorAll('[data-pagelet="FeedUnit"]').length
```

---

## ⚠️ Selectores Comunes que Cambian

### Clases de Utilidad (evitar si es posible)
Facebook usa clases generadas automáticamente como:
- `.x1y0btm7` - Cambia frecuentemente
- `.ecm0bbvt` - Cambia frecuentemente
- `.x78zum5` - Cambia frecuentemente

**Recomendación:** Úsalas solo como backup, no como selector principal.

### Atributos Estables (priorizar)
- `[role="article"]` - Estándar ARIA, poco probable que cambie
- `[data-pagelet="FeedUnit"]` - Pagelet oficial de Facebook
- `[data-testid="post_container"]` - Atributo de testing
- `<article>` - Elemento HTML semántico

---

## 🛠️ Cómo Actualizar Selectores

### 1. Identificar el nuevo selector
```javascript
// En DevTools Console, ejecuta:
const posts = document.querySelectorAll('[role="article"]');
console.log('Posts encontrados:', posts.length);
posts.forEach((post, i) => {
  console.log(`Post ${i}:`, post.className.substring(0, 50));
});
```

### 2. Actualizar content.js
```javascript
const postSelectors = [
  '[role="article"]',           // Mantener siempre primero
  '[data-pagelet="FeedUnit"]',  // Mantener
  // Agrega el nuevo selector aquí:
  '[data-nuevo-atributo="valor"]',
  '.nueva-clase-comun',
  // ... el resto
];
```

### 3. Probar inmediatamente
```javascript
// En DevTools Console:
const selectors = [
  '[role="article"]',
  '[data-pagelet="FeedUnit"]',
  '.nueva-clase-comun'
];

selectors.forEach(sel => {
  const count = document.querySelectorAll(sel).length;
  console.log(`${sel}: ${count} elementos`);
});
```

### 4. Recargar extensión
1. `chrome://extensions/`
2. Haz clic en 🔄 en Facebook Exporter
3. Refresca la página de Facebook
4. Prueba exportar 5 posts

---

## 📋 Selectores por Tipo de Contenido

### Para Texto del Post
```javascript
const textSelectors = [
  '[data-testid="post_text"]',   // ✅ Oficial
  '.x1lliihq',                   // ⚠️ Backup
  '.x193iq5w',                   // ⚠️ Backup
  '[role="article"] span[dir="auto"]',  // ✅ Span con dirección
  'div[data-pagelet="FeedUnit"] span'   // ✅ Span en pagelet
];
```

### Para Reacciones (Likes)
```javascript
const reactionSelectors = [
  '[aria-label*=" Me gusta"]',   // ✅ En español
  '[aria-label*=" Me encanta"]', // ✅
  '[data-testid="reactions_count"]', // ✅ Test ID
  '.x78zum5'                     // ⚠️ Clase backup
];
```

### Para Comentarios
```javascript
const commentSelectors = [
  '[aria-label*="comentario"]',  // ✅
  '[aria-label*="comment"]',     // ✅ En inglés
  '[data-testid="comment_count"]', // ✅
  'span.x1n2onr6'                // ⚠️ Backup
];
```

### Para Imágenes
```javascript
const imgSelectors = [
  'img[alt=""]',                 // ✅ Sin alt (contenido)
  'img[src*="photos"]',          // ✅ De photos
  'img[data-contentid]',         // ✅ Con ID
  '[role="article"] img'         // ✅ En article
];
```

---

## 🐛 Problemas Comunes y Soluciones

### Problema: 0 posts encontrados
**Causa:** Selectores desactualizados

**Solución:**
```javascript
// 1. En DevTools Console, identifica posts:
document.querySelectorAll('[role="article"]').length

// 2. Si es 0, busca alternativas:
document.querySelectorAll('[data-pagelet]').length

// 3. Actualiza content.js con el selector que funcione
```

### Problema: Posts duplicados
**Causa:** Múltiples selectores capturan el mismo elemento

**Solución:**
```javascript
// El código ya usa Set para evitar duplicados:
const allPosts = new Set();
// Si ves duplicados, revisa la lógica de extracción de IDs
```

### Problema: Texto vacío
**Causa:** Selector de texto incorrecto

**Solución:**
```javascript
// Prueba selectores alternativos en orden:
const textSelectors = [
  '[data-testid="post_text"]',
  '[role="article"] span[dir="auto"]',
  // Fallback: tomar el span más largo
];
```

---

## 📞 Checklist de Verificación

Cuando Facebook actualice su UI, verifica:

- [ ] ¿`[role="article"]` todavía funciona?
- [ ] ¿Hay nuevos `data-*` atributos?
- [ ] ¿Las clases cambiaron completamente?
- [ ] ¿El texto se extrae correctamente?
- [ ] ¿Las reacciones se cuentan bien?
- [ ] ¿Las imágenes se detectan?
- [ ] ¿El auto-scroll sigue funcionando?

**Tiempo estimado:** 10-15 minutos

---

## 🔗 Recursos Útiles

- [Facebook ARIA Best Practices](https://www.facebook.com/accessibility)
- [Chrome DevTools Selector](https://developer.chrome.com/docs/devtools/)
- [W3C ARIA Roles](https://www.w3.org/TR/wai-aria-1.1/#roles)

---

**Mantén esta guía actualizada cada vez que modifiques los selectores.**

*Código Guerrero Dev ⚔️*
