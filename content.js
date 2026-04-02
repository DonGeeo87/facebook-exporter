/**
 * content.js - Content Script para Facebook Exporter
 * Extrae posts de Facebook con manejo de paginación infinita
 * Código Guerrero Dev
 */

// Estado global de la extracción
let extractionState = {
  isExtracting: false,
  shouldStop: false,
  extractedPosts: [],
  includeComments: false,
  maxPosts: 100,
  currentProgress: 0,
  lastScrollTop: 0,
  consecutiveNoNewPosts: 0,
  // Estado para descarga de imágenes
  maxImages: 100,
  includeVideos: true,
  imageProgress: 0,
  downloadedImages: []
};

/**
 * Escucha mensajes del popup
 */
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'startExtraction') {
    extractionState.includeComments = request.includeComments || false;
    extractionState.maxPosts = request.maxPosts || 100;
    
    startExtraction()
      .then(posts => {
        sendResponse({ 
          success: true, 
          posts: posts,
          count: posts.length 
        });
      })
      .catch(error => {
        console.error('Error en extracción:', error);
        sendResponse({ 
          success: false, 
          error: error.message 
        });
      });
    
    // Mantener el canal abierto para respuesta asíncrona
    return true;
  }
  
  if (request.action === 'downloadImages') {
    extractionState.maxImages = request.maxImages || 100;
    extractionState.includeVideos = request.includeVideos !== false;
    
    downloadAllImages()
      .then(result => {
        sendResponse({ 
          success: true, 
          images: result.images,
          count: result.count 
        });
      })
      .catch(error => {
        console.error('Error en descarga de imágenes:', error);
        sendResponse({ 
          success: false, 
          error: error.message 
        });
      });
    
    // Mantener el canal abierto para respuesta asíncrona
    return true;
  }
  
  if (request.action === 'stopExtraction') {
    extractionState.shouldStop = true;
    sendResponse({ success: true, message: 'Deteniendo...' });
    return true;
  }
  
  if (request.action === 'getProgress') {
    sendResponse({
      progress: extractionState.currentProgress,
      total: extractionState.extractedPosts.length,
      max: extractionState.maxPosts,
      isExtracting: extractionState.isExtracting,
      imageProgress: extractionState.imageProgress || 0,
      maxImages: extractionState.maxImages || 0
    });
    return true;
  }
});

/**
 * Inicia el proceso de extracción de posts
 * @returns {Promise<Array>} Array de posts extraídos
 */
async function startExtraction() {
  console.log('🚀 Iniciando extracción de posts...');
  
  extractionState.isExtracting = true;
  extractionState.shouldStop = false;
  extractionState.extractedPosts = [];
  extractionState.currentProgress = 0;
  extractionState.lastScrollTop = 0;
  extractionState.consecutiveNoNewPosts = 0;
  
  // Crear observador para detectar nuevos posts
  const observer = setupMutationObserver();
  
  try {
    // Scroll inicial para cargar contenido
    await scrollToLoadContent();
    
    // Extraer posts iniciales
    await extractPostsFromPage();
    
    // Auto-scroll hasta alcanzar límite o no haber más contenido
    while (extractionState.extractedPosts.length < extractionState.maxPosts && 
           !extractionState.shouldStop &&
           extractionState.consecutiveNoNewPosts < 3) {
      
      // Verificar timeout de 30 segundos por iteración
      const startTime = Date.now();
      const timeout = 30000;
      
      console.log(`📜 Scrolling... Posts: ${extractionState.extractedPosts.length}/${extractionState.maxPosts}`);
      
      const previousCount = extractionState.extractedPosts.length;
      
      // Realizar scroll
      await scrollToLoadContent();
      
      // Esperar a que carguen nuevos posts
      await sleep(2000);
      
      // Extraer nuevos posts
      await extractPostsFromPage();
      
      // Verificar si se cargaron nuevos posts
      if (extractionState.extractedPosts.length === previousCount) {
        extractionState.consecutiveNoNewPosts++;
        console.log(`⚠️ No se cargaron posts nuevos (${extractionState.consecutiveNoNewPosts}/3)`);
      } else {
        extractionState.consecutiveNoNewPosts = 0;
      }
      
      // Verificar timeout
      if (Date.now() - startTime > timeout) {
        console.warn('⏰ Timeout de 30s alcanzado en esta iteración');
        break;
      }
      
      // Actualizar progreso
      extractionState.currentProgress = extractionState.extractedPosts.length;
      updateProgressBadge();
    }
    
    console.log(`✅ Extracción completada: ${extractionState.extractedPosts.length} posts`);
    
  } catch (error) {
    console.error('❌ Error durante extracción:', error);
    throw error;
  } finally {
    // Limpiar observador
    observer.disconnect();
    extractionState.isExtracting = false;
    resetProgressBadge();
  }
  
  return extractionState.extractedPosts;
}

/**
 * Configura MutationObserver para detectar nuevos posts dinámicos
 * @returns {MutationObserver} Observador configurado
 */
function setupMutationObserver() {
  const observer = new MutationObserver((mutations) => {
    // Solo procesar si hay nuevas inserciones de nodos
    const addedNodes = mutations
      .flatMap(m => Array.from(m.addedNodes))
      .filter(node => node.nodeType === Node.ELEMENT_NODE);
    
    if (addedNodes.length > 0) {
      console.log(`🔍 MutationObserver detectó ${addedNodes.length} nuevos nodos`);
    }
  });
  
  // Observar el body completo
  observer.observe(document.body, {
    childList: true,
    subtree: true
  });
  
  return observer;
}

/**
 * Realiza scroll hacia abajo para cargar más contenido
 * @param {number} delay - Tiempo de espera entre scrolls
 */
async function scrollToLoadContent(delay = 2000) {
  const scrollHeight = document.documentElement.scrollHeight;
  const viewportHeight = window.innerHeight;
  
  // Scroll suave hacia abajo
  window.scrollTo({
    top: scrollHeight,
    behavior: 'smooth'
  });
  
  // Esperar a que cargue contenido
  await sleep(delay);
  
  // Scroll un poco más arriba y volver abajo (técnica para forzar carga)
  window.scrollTo({
    top: scrollHeight - viewportHeight,
    behavior: 'smooth'
  });
  
  await sleep(500);
  
  // Volver al fondo
  window.scrollTo({
    top: scrollHeight,
    behavior: 'smooth'
  });
  
  await sleep(500);
}

/**
 * Extrae todos los posts visibles en la página actual
 */
async function extractPostsFromPage() {
  // ⚠️ SELECTORES ROBUSTOS - Priorizar atributos sobre clases
  // Facebook cambia clases frecuentemente, pero los roles ARIA son más estables
  
  const postSelectors = [
    '[role="article"]',                    // Selector principal (más estable)
    '[data-pagelet="FeedUnit"]',           // Pagelet de unidades del feed
    '[data-pagelet="MainFeed"]',           // Feed principal
    '.x1y0btm7',                           // Clase común de posts (backup)
    '[data-testid="post_container"]',      // Contenedor de post
    '.ecm0bbvt',                           // Otra clase común (backup)
    'article[role="article"]'              // Article con role
  ];
  
  // Combinar todos los posts encontrados
  const allPosts = new Set();
  
  for (const selector of postSelectors) {
    try {
      const elements = document.querySelectorAll(selector);
      elements.forEach(el => allPosts.add(el));
    } catch (e) {
      // Selector no válido, continuar con el siguiente
      console.debug(`Selector no válido: ${selector}`);
    }
  }
  
  console.log(`📦 Posts encontrados en página: ${allPosts.size}`);
  
  // Procesar cada post
  for (const postElement of Array.from(allPosts)) {
    if (extractionState.shouldStop) break;
    if (extractionState.extractedPosts.length >= extractionState.maxPosts) break;
    
    try {
      // Extraer datos del post con reintentos
      const postData = await extractPostDataWithRetry(postElement, 3);
      
      if (postData && postData.texto && !extractionState.extractedPosts.find(p => p.id === postData.id)) {
        extractionState.extractedPosts.push(postData);
        console.log(`✅ Post extraído: ${postData.id} - ${postData.texto.substring(0, 50)}...`);
      }
    } catch (error) {
      console.warn('⚠️ Error extrayendo post:', error.message);
      // Continuar con el siguiente post
    }
  }
}

/**
 * Extrae datos de un post con sistema de reintentos
 * @param {HTMLElement} postElement - Elemento del post
 * @param {number} maxRetries - Número máximo de reintentos
 * @returns {Promise<Object|null>} Datos del post o null si falla
 */
async function extractPostDataWithRetry(postElement, maxRetries = 3) {
  let lastError = null;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const data = extractPostData(postElement);
      if (data) return data;
      
      // Si no hay datos, esperar y reintentar
      if (attempt < maxRetries) {
        await sleep(500 * attempt);
      }
    } catch (error) {
      lastError = error;
      if (attempt < maxRetries) {
        await sleep(500 * attempt);
      }
    }
  }
  
  if (lastError) {
    console.error(`❌ Falló extracción después de ${maxRetries} reintentos:`, lastError);
  }
  
  return null;
}

/**
 * Extrae datos de un elemento de post individual
 * @param {HTMLElement} postElement - Elemento del post
 * @returns {Object|null} Datos del post
 */
function extractPostData(postElement) {
  if (!postElement) return null;
  
  // Extraer URL del post
  const postUrl = extractPostUrl(postElement);
  const postId = extractPostId(postUrl);
  
  // Si no hay ID o URL, probablemente no sea un post válido
  if (!postId && !postUrl) {
    return null;
  }
  
  // Extraer texto del post
  const text = extractPostText(postElement);
  
  // Extraer fecha
  const dateElement = postElement.querySelector('abbr[data-utime], time[datetime]');
  const dateText = dateElement?.getAttribute('data-utime') 
    ? new Date(parseInt(dateElement.getAttribute('data-utime')) * 1000).toISOString()
    : parseFacebookDate(dateElement?.textContent || '');
  
  // Extraer reacciones (likes)
  const likes = extractReactions(postElement);
  
  // Extraer comentarios
  const commentsCount = extractCommentsCount(postElement);
  
  // Extraer compartidos
  const shares = extractShares(postElement);
  
  // Extraer imagen principal
  const imageUrl = extractMainImage(postElement);
  
  // Determinar tipo de post
  const postType = determinePostType(postElement);
  
  return {
    id: postId || `post_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    texto: cleanText(text),
    fecha_iso: dateText,
    likes: likes,
    comentarios_count: commentsCount,
    compartidos: shares,
    url_post: postUrl || `https://facebook.com/posts/${postId}`,
    imagen_url: imageUrl,
    tipo: postType
  };
}

/**
 * Extrae la URL del post
 * @param {HTMLElement} postElement - Elemento del post
 * @returns {string|null} URL del post
 */
function extractPostUrl(postElement) {
  // Buscar enlace al post
  const linkSelectors = [
    'a[href*="/posts/"]',
    'a[href*="/permalink/"]',
    'a[href*="?id="]',
    'a[href*="activity_id/"]',
    'time + a',
    'abbr + a'
  ];
  
  for (const selector of linkSelectors) {
    const link = postElement.querySelector(selector);
    if (link && link.href) {
      return link.href;
    }
  }
  
  // Intentar encontrar enlace en metadata
  const metaLink = postElement.querySelector('[role="article"] a[href*="facebook.com"]');
  if (metaLink && metaLink.href) {
    return metaLink.href;
  }
  
  return null;
}

/**
 * Extrae el texto principal del post
 * @param {HTMLElement} postElement - Elemento del post
 * @returns {string} Texto del post
 */
function extractPostText(postElement) {
  // Selectores para texto de posts
  const textSelectors = [
    '[data-testid="post_text"]',           // Selector oficial de texto
    '.x1lliihq',                           // Clase común de texto
    '.x193iq5w',                           // Otra clase de texto
    '[role="article"] span[dir="auto"]',   // Span con dirección automática
    '.ecm0bbvt span:not([aria-hidden])',   // Span visible
    'div[data-pagelet="FeedUnit"] span'    // Span en pagelet
  ];
  
  for (const selector of textSelectors) {
    const element = postElement.querySelector(selector);
    if (element && element.textContent) {
      const text = element.textContent.trim();
      if (text.length > 10) {  // Evitar textos muy cortos
        return text;
      }
    }
  }
  
  // Fallback: buscar todos los spans y tomar el más largo
  const spans = postElement.querySelectorAll('span');
  let longestText = '';
  
  spans.forEach(span => {
    const text = span.textContent?.trim() || '';
    if (text.length > longestText.length && text.length > 20) {
      longestText = text;
    }
  });
  
  return longestText;
}

/**
 * Extrae el número de reacciones (likes)
 * @param {HTMLElement} postElement - Elemento del post
 * @returns {number} Número de likes
 */
function extractReactions(postElement) {
  // Buscar contenedor de reacciones
  const reactionSelectors = [
    '[aria-label*=" Me gusta"]',
    '[aria-label*=" Me encanta"]',
    '[aria-label*="divertido"]',
    '[aria-label*="wow"]',
    '[aria-label*="triste"]',
    '[aria-label*="enojado"]',
    '[data-testid="reactions_count"]',
    '.x78zum5'  // Clase común de reacciones
  ];
  
  for (const selector of reactionSelectors) {
    const element = postElement.querySelector(selector);
    if (element) {
      const label = element.getAttribute('aria-label') || element.textContent;
      const match = label.match(/(\d+(?:[.,]\d+)?)\s*(?:k|m|mil|millón)?/i);
      if (match) {
        let count = parseFloat(match[1].replace(',', '.'));
        
        // Manejar abreviaciones
        if (label.toLowerCase().includes('k') || label.toLowerCase().includes('mil')) {
          count *= 1000;
        }
        if (label.toLowerCase().includes('m') || label.toLowerCase().includes('millón')) {
          count *= 1000000;
        }
        
        return Math.round(count);
      }
    }
  }
  
  return 0;
}

/**
 * Extrae el número de comentarios
 * @param {HTMLElement} postElement - Elemento del post
 * @returns {number} Número de comentarios
 */
function extractCommentsCount(postElement) {
  // Buscar botón de comentarios
  const commentSelectors = [
    '[aria-label*="comentario"]',
    '[aria-label*="comment"]',
    '[data-testid="comment_count"]',
    'span.x1n2onr6'  // Clase común de contador
  ];
  
  for (const selector of commentSelectors) {
    const element = postElement.querySelector(selector);
    if (element) {
      const label = element.getAttribute('aria-label') || element.textContent;
      const match = label.match(/(\d+)/);
      if (match) {
        return parseInt(match[1]);
      }
    }
  }
  
  return 0;
}

/**
 * Extrae el número de compartidos
 * @param {HTMLElement} postElement - Elemento del post
 * @returns {number} Número de compartidos
 */
function extractShares(postElement) {
  // Buscar texto de compartidos
  const shareSelectors = [
    '[aria-label*="compartido"]',
    '[aria-label*="shared"]',
    '[data-testid="share_count"]'
  ];
  
  for (const selector of shareSelectors) {
    const element = postElement.querySelector(selector);
    if (element) {
      const label = element.getAttribute('aria-label') || element.textContent;
      const match = label.match(/(\d+)/);
      if (match) {
        return parseInt(match[1]);
      }
    }
  }
  
  return 0;
}

/**
 * Extrae la imagen principal del post
 * @param {HTMLElement} postElement - Elemento del post
 * @returns {string|null} URL de la imagen
 */
function extractMainImage(postElement) {
  // Buscar imágenes en el post
  const imgSelectors = [
    'img[alt=""]',                        // Imágenes sin alt (usualmente contenido)
    'img[src*="photos"]',                 // Imágenes de fotos
    'img[data-contentid]',                // Imágenes con content ID
    '[role="article"] img',               // Imágenes en article
    'img.xmedia1234'                      // Clase común de imágenes
  ];
  
  for (const selector of imgSelectors) {
    const img = postElement.querySelector(selector);
    if (img && img.src) {
      // Filtrar imágenes pequeñas (iconos, avatares)
      if (img.naturalWidth > 100 && img.naturalHeight > 100) {
        return img.src;
      }
      // Intentar obtener versión de mayor calidad
      if (img.src.includes('_s.')) {
        return img.src.replace('_s.', '_o.').replace(/_\d+_s\./, '_o.');
      }
    }
  }
  
  return null;
}

/**
 * Actualiza el badge de progreso (si está disponible)
 */
function updateProgressBadge() {
  // Nota: El badge se actualiza principalmente desde el popup
  // Esta función es para consistencia
  console.log(`📊 Progreso: ${extractionState.extractedPosts.length}/${extractionState.maxPosts}`);
}

/**
 * Resetea el badge de progreso
 */
function resetProgressBadge() {
  console.log('🔄 Progreso reseteado');
}

/**
 * Descarga todas las imágenes de la Fanpage
 * @returns {Promise<Object>} Resultado con imágenes encontradas
 */
async function downloadAllImages() {
  console.log('🖼️ Iniciando descarga de imágenes...');
  
  extractionState.isExtracting = true;
  extractionState.shouldStop = false;
  extractionState.downloadedImages = [];
  extractionState.imageProgress = 0;
  
  const observer = setupMutationObserver();
  
  try {
    // Scroll inicial para cargar contenido
    await scrollToLoadContent();
    
    // Extraer imágenes iniciales
    await extractImagesFromPage();
    
    // Auto-scroll hasta alcanzar límite o no haber más contenido
    while (extractionState.downloadedImages.length < extractionState.maxImages && 
           !extractionState.shouldStop &&
           extractionState.consecutiveNoNewPosts < 3) {
      
      const startTime = Date.now();
      const timeout = 30000;
      
      console.log(`📜 Scrolling... Imágenes: ${extractionState.downloadedImages.length}/${extractionState.maxImages}`);
      
      const previousCount = extractionState.downloadedImages.length;
      
      // Realizar scroll
      await scrollToLoadContent();
      
      // Esperar a que carguen nuevas imágenes
      await sleep(2000);
      
      // Extraer nuevas imágenes
      await extractImagesFromPage();
      
      // Verificar si se cargaron nuevas imágenes
      if (extractionState.downloadedImages.length === previousCount) {
        extractionState.consecutiveNoNewPosts++;
        console.log(`⚠️ No se cargaron imágenes nuevas (${extractionState.consecutiveNoNewPosts}/3)`);
      } else {
        extractionState.consecutiveNoNewPosts = 0;
      }
      
      // Verificar timeout
      if (Date.now() - startTime > timeout) {
        console.warn('⏰ Timeout de 30s alcanzado en esta iteración');
        break;
      }
      
      // Actualizar progreso
      extractionState.imageProgress = extractionState.downloadedImages.length;
    }
    
    console.log(`✅ Extracción de imágenes completada: ${extractionState.downloadedImages.length} imágenes`);
    
  } catch (error) {
    console.error('❌ Error durante extracción de imágenes:', error);
    throw error;
  } finally {
    observer.disconnect();
    extractionState.isExtracting = false;
  }
  
  return {
    images: extractionState.downloadedImages,
    count: extractionState.downloadedImages.length
  };
}

/**
 * Extrae todas las imágenes visibles en la página actual
 */
async function extractImagesFromPage() {
  const imgSelectors = [
    'img[alt=""]',                        // Imágenes sin alt (contenido)
    'img[src*="photos"]',                 // Imágenes de fotos
    'img[data-contentid]',                // Imágenes con content ID
    '[role="article"] img',               // Imágenes en article
    'img.xmedia1234',                     // Clase común de imágenes
    'img[src*="fbcdn.net"]',              // Imágenes de CDN de Facebook
    'div[role="img"] img',                // Imágenes en div role=img
    '[data-pagelet="FeedUnit"] img'       // Imágenes en pagelet
  ];
  
  // También buscar videos si está activado
  if (extractionState.includeVideos) {
    imgSelectors.push('video[poster]');   // Videos con poster
    imgSelectors.push('[data-testid="video_preview"] img');
  }
  
  const allImages = new Set();
  
  for (const selector of imgSelectors) {
    try {
      const elements = document.querySelectorAll(selector);
      elements.forEach(el => allImages.add(el));
    } catch (e) {
      console.debug(`Selector no válido: ${selector}`);
    }
  }
  
  console.log(`🖼️ Imágenes encontradas en página: ${allImages.size}`);
  
  // Procesar cada imagen
  for (const imgElement of Array.from(allImages)) {
    if (extractionState.shouldStop) break;
    if (extractionState.downloadedImages.length >= extractionState.maxImages) break;
    
    try {
      const imageData = extractImageData(imgElement);
      
      if (imageData && imageData.url && !extractionState.downloadedImages.find(img => img.url === imageData.url)) {
        extractionState.downloadedImages.push(imageData);
        console.log(`✅ Imagen extraída: ${imageData.url.substring(0, 50)}...`);
      }
    } catch (error) {
      console.warn('⚠️ Error extrayendo imagen:', error.message);
    }
  }
}

/**
 * Extrae datos de una imagen individual
 * @param {HTMLElement} imgElement - Elemento de imagen
 * @returns {Object|null} Datos de la imagen
 */
function extractImageData(imgElement) {
  if (!imgElement) return null;
  
  let imageUrl = '';
  let postUrl = '';
  let postId = '';
  
  // Obtener URL de la imagen
  if (imgElement.tagName === 'VIDEO') {
    // Es un video, obtener poster
    imageUrl = imgElement.getAttribute('poster');
  } else if (imgElement.tagName === 'IMG') {
    // Es una imagen
    imageUrl = imgElement.src || imgElement.getAttribute('src');
  }
  
  if (!imageUrl) return null;
  
  // Filtrar imágenes pequeñas (iconos, avatares, emojis)
  // Usar naturalWidth/Height si está disponible, sino estimar
  const width = imgElement.naturalWidth || imgElement.width || 0;
  const height = imgElement.naturalHeight || imgElement.height || 0;
  
  if (width > 0 && width < 50 || height > 0 && height < 50) {
    return null; // Imagen muy pequeña, probablemente ícono
  }
  
  // Filtrar imágenes de perfil pequeñas
  if (imageUrl.includes('profile.php') || imageUrl.includes('scontent') && width < 100) {
    return null;
  }
  
  // Intentar obtener URL del post padre
  const postElement = imgElement.closest('[role="article"]');
  if (postElement) {
    postUrl = extractPostUrl(postElement);
    postId = extractPostId(postUrl) || '';
  }
  
  // Obtener fecha si está disponible
  let fecha = '';
  if (postElement) {
    const dateElement = postElement.querySelector('abbr[data-utime], time[datetime]');
    if (dateElement) {
      const utime = dateElement.getAttribute('data-utime');
      if (utime) {
        fecha = new Date(parseInt(utime) * 1000).toISOString();
      }
    }
  }
  
  // Intentar obtener URL de mayor calidad
  let highResUrl = imageUrl;
  if (imageUrl.includes('_s.')) {
    highResUrl = imageUrl.replace('_s.', '_o.').replace(/_\d+_s\./, '_o.');
  } else if (imageUrl.includes('cb=')) {
    // Remover parámetro cb para URL más limpia
    highResUrl = imageUrl.replace(/&cb=\d+/, '');
  }

  return {
    url: highResUrl,
    originalUrl: imageUrl,
    postId: postId,
    postUrl: postUrl,
    fecha: fecha,
    width: width || 0,
    height: height || 0,
    tipo: imgElement.tagName === 'VIDEO' ? 'video_thumbnail' : 'photo'
  };
}

/**
 * Crea el modal de descarga integrado en Facebook
 */
function createFloatingModal() {
  // Verificar si ya existe
  if (document.getElementById('fb-exporter-modal')) {
    return;
  }

  // Crear botón flotante
  const floatingBtn = document.createElement('button');
  floatingBtn.id = 'fb-exporter-floating-btn';
  floatingBtn.innerHTML = '📥<span style="font-size: 10px; display: block;">Export</span>';
  floatingBtn.title = 'Facebook Exporter - Descargar imágenes';
  
  // Crear modal
  const modal = document.createElement('div');
  modal.id = 'fb-exporter-modal';
  modal.className = 'fb-exporter-modal-hidden';
  
  modal.innerHTML = `
    <div class="fb-exporter-modal-content">
      <div class="fb-exporter-modal-header">
        <h2>🖼️ Facebook Exporter</h2>
        <button class="fb-exporter-close-btn" id="fb-exporter-close-btn">&times;</button>
      </div>
      
      <div class="fb-exporter-modal-body">
        <p style="margin-bottom: 15px; color: #666; font-size: 13px;">
          Descarga todas las imágenes visibles en esta página
        </p>
        
        <div class="fb-exporter-option">
          <label for="fb-exporter-max-images">Máximo de imágenes:</label>
          <select id="fb-exporter-max-images" style="width: 100%; padding: 8px; margin-top: 5px; border-radius: 6px; border: 1px solid #ddd;">
            <option value="50">50 imágenes</option>
            <option value="100" selected>100 imágenes</option>
            <option value="200">200 imágenes</option>
            <option value="500">500 imágenes</option>
            <option value="1000">1000 imágenes</option>
          </select>
        </div>
        
        <div class="fb-exporter-option" style="margin-top: 12px;">
          <label style="display: flex; align-items: center; cursor: pointer;">
            <input type="checkbox" id="fb-exporter-include-videos" checked style="margin-right: 8px;">
            Incluir miniaturas de videos
          </label>
        </div>
        
        <div class="fb-exporter-option" style="margin-top: 12px;">
          <label style="display: flex; align-items: center; cursor: pointer;">
            <input type="checkbox" id="fb-exporter-download-zip" checked style="margin-right: 8px;">
            Descargar en ZIP (recomendado)
          </label>
        </div>
        
        <div id="fb-exporter-progress" class="fb-exporter-progress" style="display: none;">
          <div class="fb-exporter-progress-bar">
            <div class="fb-exporter-progress-fill" id="fb-exporter-progress-fill"></div>
          </div>
          <p id="fb-exporter-progress-text" style="text-align: center; font-size: 12px; margin-top: 5px;">0/100...</p>
        </div>
      </div>
      
      <div class="fb-exporter-modal-footer">
        <button id="fb-exporter-start-btn" class="fb-exporter-btn-primary">
          📥 Descargar Imágenes
        </button>
        <button id="fb-exporter-cancel-btn" class="fb-exporter-btn-secondary" style="display: none;">
          ⏹️ Cancelar
        </button>
      </div>
      
      <div class="fb-exporter-modal-info">
        <p>⚡ Las imágenes se descargan automáticamente en un archivo ZIP</p>
        <p style="margin: 5px 0 0 0; font-size: 11px; color: #888;">
          Código Guerrero Dev ⚔️ | v1.1.0
        </p>
      </div>
    </div>
  `;

  // Agregar estilos CSS
  const styles = document.createElement('style');
  styles.textContent = `
    /* Botón flotante */
    #fb-exporter-floating-btn {
      position: fixed;
      bottom: 80px;
      right: 20px;
      width: 60px;
      height: 60px;
      border-radius: 50%;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      border: none;
      color: white;
      font-size: 20px;
      cursor: pointer;
      box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
      z-index: 999998;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      transition: all 0.3s ease;
      font-weight: bold;
    }
    
    #fb-exporter-floating-btn:hover {
      transform: scale(1.1);
      box-shadow: 0 6px 20px rgba(102, 126, 234, 0.6);
    }
    
    #fb-exporter-floating-btn:active {
      transform: scale(0.95);
    }
    
    /* Modal */
    #fb-exporter-modal {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.6);
      backdrop-filter: blur(4px);
      z-index: 999999;
      display: flex;
      align-items: center;
      justify-content: center;
      opacity: 0;
      visibility: hidden;
      transition: all 0.3s ease;
    }
    
    #fb-exporter-modal.fb-exporter-modal-visible {
      opacity: 1;
      visibility: visible;
    }
    
    #fb-exporter-modal.fb-exporter-modal-hidden {
      opacity: 0;
      visibility: hidden;
    }
    
    .fb-exporter-modal-content {
      background: white;
      border-radius: 16px;
      width: 90%;
      max-width: 450px;
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
      overflow: hidden;
      transform: translateY(-20px);
      transition: transform 0.3s ease;
    }
    
    #fb-exporter-modal.fb-exporter-modal-visible .fb-exporter-modal-content {
      transform: translateY(0);
    }
    
    .fb-exporter-modal-header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 20px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    
    .fb-exporter-modal-header h2 {
      margin: 0;
      font-size: 18px;
      font-weight: 600;
    }
    
    .fb-exporter-close-btn {
      background: rgba(255, 255, 255, 0.2);
      border: none;
      color: white;
      width: 32px;
      height: 32px;
      border-radius: 50%;
      font-size: 24px;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: background 0.2s;
    }
    
    .fb-exporter-close-btn:hover {
      background: rgba(255, 255, 255, 0.3);
    }
    
    .fb-exporter-modal-body {
      padding: 20px;
    }
    
    .fb-exporter-option {
      margin-bottom: 12px;
    }
    
    .fb-exporter-option label {
      font-size: 13px;
      color: #333;
      font-weight: 500;
    }
    
    .fb-exporter-modal-footer {
      padding: 15px 20px;
      background: #f8f9fa;
      display: flex;
      gap: 10px;
      justify-content: flex-end;
    }
    
    .fb-exporter-btn-primary {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      border: none;
      padding: 12px 24px;
      border-radius: 8px;
      font-size: 14px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s;
      display: flex;
      align-items: center;
      gap: 8px;
    }
    
    .fb-exporter-btn-primary:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
    }
    
    .fb-exporter-btn-primary:disabled {
      opacity: 0.6;
      cursor: not-allowed;
      transform: none;
    }
    
    .fb-exporter-btn-secondary {
      background: #e9ecef;
      color: #495057;
      border: none;
      padding: 12px 24px;
      border-radius: 8px;
      font-size: 14px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s;
    }
    
    .fb-exporter-btn-secondary:hover {
      background: #dee2e6;
    }
    
    .fb-exporter-modal-info {
      padding: 12px 20px;
      background: #f0f2f5;
      border-top: 1px solid #e9ecef;
    }
    
    .fb-exporter-modal-info p {
      margin: 0;
      font-size: 12px;
      color: #666;
    }
    
    .fb-exporter-progress-bar {
      width: 100%;
      height: 8px;
      background: #e9ecef;
      border-radius: 4px;
      overflow: hidden;
      margin-bottom: 8px;
    }
    
    .fb-exporter-progress-fill {
      height: 100%;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      border-radius: 4px;
      transition: width 0.3s ease;
      width: 0%;
    }
  `;

  // Agregar al DOM
  document.body.appendChild(styles);
  document.body.appendChild(floatingBtn);
  document.body.appendChild(modal);

  // Event listeners
  setupModalEvents(floatingBtn, modal);

  console.log('✅ Modal flotante de Facebook Exporter creado');
}

/**
 * Configura los event listeners del modal
 */
function setupModalEvents(floatingBtn, modal) {
  const closeBtn = document.getElementById('fb-exporter-close-btn');
  const startBtn = document.getElementById('fb-exporter-start-btn');
  const cancelBtn = document.getElementById('fb-exporter-cancel-btn');

  // Abrir modal
  floatingBtn.addEventListener('click', () => {
    modal.classList.remove('fb-exporter-modal-hidden');
    modal.classList.add('fb-exporter-modal-visible');
  });

  // Cerrar modal
  const closeModal = () => {
    modal.classList.remove('fb-exporter-modal-visible');
    modal.classList.add('fb-exporter-modal-hidden');
  };

  closeBtn.addEventListener('click', closeModal);

  // Cerrar al hacer clic fuera del modal
  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      closeModal();
    }
  });

  // Iniciar descarga
  startBtn.addEventListener('click', async () => {
    const maxImages = parseInt(document.getElementById('fb-exporter-max-images').value);
    const includeVideos = document.getElementById('fb-exporter-include-videos').checked;
    const downloadZip = document.getElementById('fb-exporter-download-zip').checked;

    // Ocultar botón de inicio, mostrar cancel
    startBtn.style.display = 'none';
    cancelBtn.style.display = 'flex';
    cancelBtn.disabled = false;

    // Mostrar progreso
    const progressContainer = document.getElementById('fb-exporter-progress');
    const progressFill = document.getElementById('fb-exporter-progress-fill');
    const progressText = document.getElementById('fb-exporter-progress-text');
    progressContainer.style.display = 'block';

    try {
      // Extraer imágenes
      extractionState.maxImages = maxImages;
      extractionState.includeVideos = includeVideos;
      extractionState.downloadedImages = [];
      extractionState.imageProgress = 0;

      // Scroll y extracción
      await scrollToLoadContent();
      await extractImagesFromPage();

      let consecutiveNoNewPosts = 0;

      while (extractionState.downloadedImages.length < maxImages && consecutiveNoNewPosts < 3) {
        const previousCount = extractionState.downloadedImages.length;

        await scrollToLoadContent();
        await sleep(2000);
        await extractImagesFromPage();

        if (extractionState.downloadedImages.length === previousCount) {
          consecutiveNoNewPosts++;
        } else {
          consecutiveNoNewPosts = 0;
        }

        // Actualizar progreso
        const currentCount = extractionState.downloadedImages.length;
        progressFill.style.width = `${(currentCount / maxImages) * 100}%`;
        progressText.textContent = `${currentCount}/${maxImages}...`;
      }

      // Descargar
      if (extractionState.downloadedImages.length > 0) {
        if (downloadZip) {
          const zipFilename = generateFilename('facebook-images', 'zip');
          await downloadImagesAsZip(extractionState.downloadedImages, zipFilename);
          progressText.textContent = '✅ ZIP descargado exitosamente';
        } else {
          // Descarga metadata y galería (como en popup.js)
          const jsonFilename = generateFilename('facebook-images-metadata', 'json');
          const jsonBlob = new Blob([JSON.stringify(extractionState.downloadedImages, null, 2)], { type: 'application/json' });
          const jsonUrl = URL.createObjectURL(jsonBlob);
          
          const a = document.createElement('a');
          a.href = jsonUrl;
          a.download = jsonFilename;
          a.click();
          URL.revokeObjectURL(jsonUrl);
          
          progressText.textContent = '✅ Metadata descargada';
        }
      } else {
        progressText.textContent = '⚠️ No se encontraron imágenes';
      }

    } catch (error) {
      console.error('Error en descarga desde modal:', error);
      progressText.textContent = '❌ Error: ' + error.message;
    } finally {
      // Restaurar botones
      startBtn.style.display = 'flex';
      cancelBtn.style.display = 'none';
      cancelBtn.disabled = false;

      // Ocultar progreso después de 3 segundos
      setTimeout(() => {
        progressContainer.style.display = 'none';
        closeModal();
      }, 3000);
    }
  });

  // Cancelar descarga
  cancelBtn.addEventListener('click', () => {
    extractionState.shouldStop = true;
    cancelBtn.disabled = true;
    cancelBtn.textContent = 'Deteniendo...';
  });
}

// Inicializar modal cuando el DOM esté listo
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', createFloatingModal);
} else {
  createFloatingModal();
}

console.log('✅ content.js cargado - Content Script de Facebook activo');
