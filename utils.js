/**
 * utils.js - Funciones helper para Facebook Exporter
 * Código Guerrero Dev - Herramientas utilitarias
 */

/**
 * Librería JSZip para crear archivos ZIP
 * Se carga desde CDN en el manifest
 */

/**
 * Pausa la ejecución por un tiempo determinado
 * @param {number} ms - Milisegundos a esperar
 * @returns {Promise<void>}
 */
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Guarda un archivo JSON para descarga
 * @param {Array} data - Datos a guardar
 * @param {string} filename - Nombre del archivo
 */
function saveJSON(data, filename) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Guarda un archivo CSV para descarga
 * @param {Array} data - Array de objetos a convertir
 * @param {string} filename - Nombre del archivo
 */
function saveCSV(data, filename) {
  if (!data || data.length === 0) {
    console.warn('No hay datos para exportar a CSV');
    return;
  }

  // Obtener todas las claves posibles
  const keys = Object.keys(data[0]);
  
  // Crear cabeceras
  const headers = keys.join(',');
  
  // Crear filas escapando comillas y comas
  const rows = data.map(obj => {
    return keys.map(key => {
      let value = obj[key];
      
      // Manejar valores nulos o indefinidos
      if (value === null || value === undefined) {
        value = '';
      }
      
      // Convertir a string y escapar
      value = String(value);
      
      // Escapar comillas dobles y envolver en comillas si contiene comas o saltos de línea
      if (value.includes(',') || value.includes('"') || value.includes('\n')) {
        value = '"' + value.replace(/"/g, '""') + '"';
      }
      
      return value;
    }).join(',');
  });
  
  // Unir todo con BOM para Excel
  const csvContent = '\uFEFF' + [headers, ...rows].join('\n');
  
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Genera nombre de archivo con timestamp
 * @param {string} prefix - Prefijo del archivo
 * @param {string} extension - Extensión del archivo
 * @returns {string} Nombre de archivo formateado
 */
function generateFilename(prefix, extension) {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const seconds = String(now.getSeconds()).padStart(2, '0');
  
  return `${prefix}-${year}${month}${day}-${hours}${minutes}${seconds}.${extension}`;
}

/**
 * Limpia texto eliminando exceso de emojis
 * @param {string} text - Texto a limpiar
 * @param {number} maxLength - Longitud máxima antes de limpiar emojis
 * @returns {string} Texto limpio
 */
function cleanText(text, maxLength = 500) {
  if (!text) return '';
  
  // Si el texto es muy largo, reducir emojis
  if (text.length > maxLength) {
    // Patrón para detectar emojis (rango básico)
    const emojiRegex = /[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F1E0}-\u{1F1FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu;
    text = text.replace(emojiRegex, '');
  }
  
  // Limpiar espacios extras y saltos de línea múltiples
  return text.trim().replace(/\n{3,}/g, '\n\n');
}

/**
 * Extrae el ID de un post desde su URL
 * @param {string} url - URL del post
 * @returns {string|null} ID del post o null si no se encuentra
 */
function extractPostId(url) {
  if (!url) return null;
  
  // Patrón para posts con /posts/
  const postsMatch = url.match(/\/posts\/(\d+)/);
  if (postsMatch) return postsMatch[1];
  
  // Patrón para posts con /permalink/
  const permalinkMatch = url.match(/\/permalink\/(\d+)/);
  if (permalinkMatch) return permalinkMatch[1];
  
  // Patrón para posts con ?id=
  const idMatch = url.match(/[?&]id=(\d+)/);
  if (idMatch) return idMatch[1];
  
  // Patrón para activity_id=
  const activityMatch = url.match(/activity_id\/(\d+)/);
  if (activityMatch) return activityMatch[1];
  
  return null;
}

/**
 * Convierte fecha relativa de Facebook a ISO
 * @param {string} dateText - Texto de fecha (ej: "2 h", "Ayer", "15 ene")
 * @returns {string} Fecha en formato ISO
 */
function parseFacebookDate(dateText) {
  if (!dateText) return new Date().toISOString();
  
  const now = new Date();
  const text = dateText.toLowerCase().trim();
  
  // Manejar casos especiales
  if (text.includes('ahora') || text.includes('just now')) {
    return now.toISOString();
  }
  
  // Manejar "ayer" / "yesterday"
  if (text.includes('ayer') || text.includes('yesterday')) {
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    return yesterday.toISOString();
  }
  
  // Manejar horas: "2 h", "3 horas", "5 hr"
  const hoursMatch = text.match(/(\d+)\s*(h|hr|hora|horas)/);
  if (hoursMatch) {
    const hours = parseInt(hoursMatch[1]);
    const date = new Date(now.getTime() - hours * 60 * 60 * 1000);
    return date.toISOString();
  }
  
  // Manejar minutos: "15 min", "30 m"
  const minsMatch = text.match(/(\d+)\s*(min|m)/);
  if (minsMatch) {
    const mins = parseInt(minsMatch[1]);
    const date = new Date(now.getTime() - mins * 60 * 1000);
    return date.toISOString();
  }
  
  // Manejar días: "3 d", "5 días"
  const daysMatch = text.match(/(\d+)\s*(d|día|días|day|days)/);
  if (daysMatch) {
    const days = parseInt(daysMatch[1]);
    const date = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
    return date.toISOString();
  }
  
  // Manejar semanas: "2 sem", "1 semana"
  const weeksMatch = text.match(/(\d+)\s*(sem|semana|semanas|week|weeks)/);
  if (weeksMatch) {
    const weeks = parseInt(weeksMatch[1]);
    const date = new Date(now.getTime() - weeks * 7 * 24 * 60 * 60 * 1000);
    return date.toISOString();
  }
  
  // Intentar parsear fecha completa (ej: "15 de enero de 2024")
  const dateMatch = text.match(/(\d{1,2})\s*(?:de\s*)?([a-z]+)\s*(?:de\s*)?(\d{4})?/i);
  if (dateMatch) {
    const day = parseInt(dateMatch[1]);
    const monthName = dateMatch[2].toLowerCase();
    const year = dateMatch[3] ? parseInt(dateMatch[3]) : now.getFullYear();
    
    const months = {
      'ene': 0, 'enero': 0, 'jan': 0, 'january': 0,
      'feb': 1, 'febrero': 1, 'féb': 1, 'feb': 1, 'february': 1,
      'mar': 2, 'marzo': 2, 'march': 2,
      'abr': 3, 'abril': 3, 'apr': 3, 'april': 3,
      'may': 4, 'mayo': 4, 'may': 4,
      'jun': 5, 'junio': 5, 'june': 5,
      'jul': 6, 'julio': 6, 'july': 6,
      'ago': 7, 'agosto': 7, 'aug': 7, 'august': 7,
      'sep': 8, 'sept': 8, 'septiembre': 8, 'september': 8,
      'oct': 9, 'octubre': 9, 'october': 9,
      'nov': 10, 'noviembre': 10, 'november': 10,
      'dic': 11, 'diciembre': 11, 'dec': 11, 'december': 11
    };
    
    const month = months[monthName] !== undefined ? months[monthName] : 0;
    const date = new Date(year, month, day);
    return date.toISOString();
  }
  
  // Si no se pudo parsear, retornar fecha actual
  return now.toISOString();
}

/**
 * Determina el tipo de post basado en su contenido
 * @param {HTMLElement} postElement - Elemento del post
 * @returns {string} Tipo de post: 'photo', 'video', 'link', 'text'
 */
function determinePostType(postElement) {
  if (!postElement) return 'text';
  
  // Verificar si tiene video
  if (postElement.querySelector('video, [data-testid="video_preview"]')) {
    return 'video';
  }
  
  // Verificar si tiene imagen
  if (postElement.querySelector('img[alt=""], img[src*="photos"], img[data-contentid]')) {
    return 'photo';
  }
  
  // Verificar si es link compartido
  if (postElement.querySelector('[role="link"] img, a[href*="facebook.com/l.php"]')) {
    return 'link';
  }
  
  return 'text';
}

/**
 * Descarga imágenes en un archivo ZIP usando JSZip
 * @param {Array} images - Array de objetos de imagen con url, postId, etc.
 * @param {string} zipFilename - Nombre del archivo ZIP
 * @returns {Promise<void>}
 */
async function downloadImagesAsZip(images, zipFilename) {
  if (!images || images.length === 0) {
    console.warn('No hay imágenes para comprimir');
    return;
  }

  try {
    // Crear nueva instancia de JSZip
    const zip = new JSZip();
    
    // Crear carpeta para las imágenes
    const imgFolder = zip.folder('imagenes-facebook');
    
    // Crear carpeta para metadata
    const metaFolder = zip.folder('metadata');
    
    // Agregar metadata JSON
    metaFolder.file('imagenes-metadata.json', JSON.stringify(images, null, 2));
    
    // Descargar cada imagen y agregarla al ZIP
    console.log(`📦 Descargando ${images.length} imágenes para el ZIP...`);

    for (let i = 0; i < images.length; i++) {
      const img = images[i];
      const index = String(i + 1).padStart(4, '0');
      const postId = img.postId || 'unknown';
      const filename = `imagen-${index}-${postId}.jpg`;

      try {
        // Fetch de la imagen
        const response = await fetch(img.url);
        const blob = await response.blob();

        // Agregar al ZIP
        imgFolder.file(filename, blob);

        console.log(`✅ Imagen ${i + 1}/${images.length}: ${filename}`);
      } catch (error) {
        console.warn(`⚠️ No se pudo descargar ${filename}:`, error.message);
        // Agregar archivo de texto indicando el error
        imgFolder.file(filename + '.txt', `Error al descargar: ${img.url}\nPost: ${img.postUrl}`);
      }

      // Pequeña pausa para no saturar
      if (i % 10 === 0 && i > 0) {
        await sleep(100);
      }
    }

    // Agregar galería HTML al ZIP
    console.log('📄 Agregando galería HTML al ZIP...');
    const galleryHtml = generateZipGalleryHtml(images);
    zip.file('galeria.html', galleryHtml);

    // Generar el ZIP
    console.log('📦 Generando archivo ZIP...');
    const content = await zip.generateAsync({
      type: 'blob',
      compression: 'DEFLATE',
      compressionOptions: { level: 6 }
    });

    // Descargar el ZIP
    const url = URL.createObjectURL(content);
    const a = document.createElement('a');
    a.href = url;
    a.download = zipFilename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    console.log('✅ ZIP generado y descargado exitosamente');
    
  } catch (error) {
    console.error('❌ Error creando ZIP:', error);
    throw error;
  }
}

/**
 * Crea un archivo HTML con galería de imágenes para incluir en el ZIP
 * La galería incluye JSZip y lee las imágenes directamente del ZIP
 * @param {Array} images - Array de objetos de imagen
 * @returns {string} Contenido HTML
 */
function generateZipGalleryHtml(images) {
  const imagesData = JSON.stringify(images);
  
  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Galería - Facebook Exporter</title>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js"></script>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      min-height: 100vh;
      padding: 20px;
    }
    
    .container {
      max-width: 1400px;
      margin: 0 auto;
    }
    
    header {
      text-align: center;
      color: white;
      margin-bottom: 30px;
    }
    
    header h1 {
      font-size: 32px;
      margin-bottom: 10px;
      text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
    }
    
    header p {
      font-size: 16px;
      opacity: 0.9;
    }
    
    .stats {
      display: flex;
      justify-content: center;
      gap: 20px;
      margin-top: 15px;
    }
    
    .stat-badge {
      background: rgba(255,255,255,0.2);
      backdrop-filter: blur(10px);
      padding: 10px 20px;
      border-radius: 20px;
      font-size: 14px;
    }
    
    .loading {
      text-align: center;
      color: white;
      padding: 60px 20px;
      font-size: 18px;
    }
    
    .loading-spinner {
      display: inline-block;
      width: 40px;
      height: 40px;
      border: 4px solid rgba(255,255,255,0.3);
      border-top-color: white;
      border-radius: 50%;
      animation: spin 1s linear infinite;
      margin-bottom: 15px;
    }
    
    @keyframes spin {
      to { transform: rotate(360deg); }
    }
    
    .gallery {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
      gap: 25px;
      padding: 20px;
      background: rgba(255,255,255,0.1);
      border-radius: 16px;
      backdrop-filter: blur(10px);
    }
    
    .image-card {
      background: white;
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 4px 15px rgba(0,0,0,0.2);
      transition: transform 0.3s ease, box-shadow 0.3s ease;
    }
    
    .image-card:hover {
      transform: translateY(-5px);
      box-shadow: 0 8px 25px rgba(0,0,0,0.3);
    }
    
    .image-card img {
      width: 100%;
      height: 250px;
      object-fit: cover;
      display: block;
      background: #f0f2f5;
    }
    
    .image-info {
      padding: 15px;
    }
    
    .image-info h3 {
      font-size: 14px;
      color: #333;
      margin-bottom: 10px;
      font-weight: 600;
    }
    
    .image-info p {
      font-size: 12px;
      color: #666;
      margin: 5px 0;
      display: flex;
      justify-content: space-between;
    }
    
    .image-info p strong {
      color: #444;
    }
    
    .image-actions {
      padding: 15px;
      border-top: 1px solid #eee;
      display: flex;
      gap: 10px;
    }
    
    .btn-download {
      flex: 1;
      padding: 10px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      border: none;
      border-radius: 8px;
      font-size: 13px;
      font-weight: 600;
      cursor: pointer;
      text-decoration: none;
      text-align: center;
      transition: opacity 0.2s;
    }
    
    .btn-download:hover {
      opacity: 0.9;
    }
    
    .error-message {
      background: rgba(244, 67, 54, 0.9);
      color: white;
      padding: 20px;
      border-radius: 12px;
      text-align: center;
      margin: 20px;
    }
    
    footer {
      text-align: center;
      margin-top: 40px;
      padding: 20px;
      color: white;
      opacity: 0.8;
      font-size: 13px;
    }
    
    .hidden { display: none; }
  </style>
</head>
<body>
  <div class="container">
    <header>
      <h1>🖼️ Galería de Imágenes Facebook</h1>
      <p>Código Guerrero Dev ⚔️</p>
      <div class="stats">
        <div class="stat-badge">📸 ${images.length} imágenes</div>
        <div class="stat-badge">📅 ${new Date().toLocaleDateString('es-CL')}</div>
      </div>
    </header>
    
    <div id="loading" class="loading">
      <div class="loading-spinner"></div>
      <p>Cargando imágenes del ZIP...</p>
    </div>
    
    <div id="error" class="error-message hidden">
      <p>⚠️ No se pudieron cargar las imágenes</p>
      <p style="font-size: 12px; margin-top: 10px; opacity: 0.8;">
        Asegúrate de que este archivo HTML esté dentro del ZIP<br>
        o de haber extraído todo el contenido del ZIP
      </p>
    </div>
    
    <div id="gallery" class="gallery hidden"></div>
  </div>
  
  <footer>
    <p>Generado por Facebook Exporter - Código Guerrero Dev ⚔️</p>
    <p>v1.1.0 | Chile</p>
  </footer>
  
  <script>
    // Datos de las imágenes (embedidos en el HTML)
    const imagesData = ${imagesData};
    
    // Intentar cargar imágenes desde el ZIP
    async function loadImagesFromZip() {
      const loading = document.getElementById('loading');
      const error = document.getElementById('error');
      const gallery = document.getElementById('gallery');
      
      try {
        // Verificar si JSZip está disponible
        if (typeof JSZip === 'undefined') {
          throw new Error('JSZip no está disponible');
        }
        
        // Buscar el archivo ZIP en la misma carpeta
        const zipFilename = window.location.pathname.split('/').pop().replace('.html', '.zip');
        
        // Intentar cargar el ZIP
        let zip;
        try {
          // Intentar cargar desde el mismo directorio
          const response = await fetch(zipFilename);
          if (!response.ok) throw new Error('No se encontró el ZIP');
          const blob = await response.blob();
          zip = await JSZip.loadAsync(blob);
        } catch (fetchError) {
          console.log('No se pudo cargar el ZIP externo, intentando estructura de carpetas...');
          
          // Si estamos dentro del ZIP extraído, buscar las carpetas
          try {
            const imgFolderResponse = await fetch('imagenes-facebook/');
            if (imgFolderResponse.ok) {
              // Estamos en la carpeta extraída, cargar imágenes individualmente
              await loadFromExtractedFolder(gallery, loading, error);
              return;
            }
          } catch (e) {
            // Intentar alternativa: buscar el ZIP con nombre genérico
            const possibleNames = [
              'facebook-images.zip',
              'facebook_images.zip',
              'images.zip',
              'download.zip'
            ];
            
            for (const name of possibleNames) {
              try {
                const response = await fetch(name);
                if (response.ok) {
                  const blob = await response.blob();
                  zip = await JSZip.loadAsync(blob);
                  break;
                }
              } catch (e) {
                continue;
              }
            }
          }
        }
        
        if (zip) {
          await loadFromZipObject(zip, gallery, loading, error);
        } else {
          // Fallback: intentar cargar imágenes como archivos locales
          await loadAsLocalFiles(gallery, loading, error);
        }
        
      } catch (error) {
        console.error('Error cargando imágenes:', error);
        loading.classList.add('hidden');
        error.classList.remove('hidden');
        error.innerHTML = '<p>⚠️ ' + error.message + '</p>';
      }
    }
    
    // Cargar imágenes desde un objeto ZIP
    async function loadFromZipObject(zip, gallery, loading, error) {
      const imgFolder = zip.folder('imagenes-facebook');
      const metaFolder = zip.folder('metadata');
      
      if (!imgFolder) {
        throw new Error('No se encontró la carpeta de imágenes en el ZIP');
      }
      
      // Obtener lista de archivos de imágenes
      const imageFiles = Object.keys(imgFolder.files).filter(name => 
        name.endsWith('.jpg') || name.endsWith('.png') || name.endsWith('.jpeg')
      ).sort();
      
      if (imageFiles.length === 0) {
        throw new Error('No se encontraron imágenes en el ZIP');
      }
      
      // Crear galería
      gallery.innerHTML = '';
      
      for (const [index, filename] of imageFiles.entries()) {
        const imageData = imagesData[index] || {};
        
        try {
          // Leer archivo del ZIP
          const file = imgFolder.file(filename);
          const blob = await file.async('blob');
          const imageUrl = URL.createObjectURL(blob);
          
          // Crear tarjeta de imagen
          const card = createImageCard(imageUrl, imageData, filename, index);
          gallery.appendChild(card);
        } catch (imgError) {
          console.error('Error cargando imagen ' + filename + ':', imgError);
        }
      }
      
      loading.classList.add('hidden');
      gallery.classList.remove('hidden');
    }
    
    // Cargar desde carpeta extraída
    async function loadFromExtractedFolder(gallery, loading, error) {
      gallery.innerHTML = '';
      
      for (let i = 0; i < Math.min(imagesData.length, 1000); i++) {
        const imageData = imagesData[i];
        const index = String(i + 1).padStart(4, '0');
        const postId = imageData.postId || 'unknown';
        const filename = 'imagen-' + index + '-' + postId + '.jpg';
        const imageUrl = 'imagenes-facebook/' + filename;
        
        const card = createImageCard(imageUrl, imageData, filename, i);
        gallery.appendChild(card);
      }
      
      loading.classList.add('hidden');
      gallery.classList.remove('hidden');
    }
    
    // Cargar como archivos locales (fallback)
    async function loadAsLocalFiles(gallery, loading, error) {
      gallery.innerHTML = '';
      
      for (let i = 0; i < Math.min(imagesData.length, 1000); i++) {
        const imageData = imagesData[i];
        const index = String(i + 1).padStart(4, '0');
        const postId = imageData.postId || 'unknown';
        const filename = 'imagen-' + index + '-' + postId + '.jpg';
        
        // Crear tarjeta con botón de descarga
        const card = document.createElement('div');
        card.className = 'image-card';
        card.innerHTML = '
          <div style="height: 250px; background: #f0f2f5; display: flex; align-items: center; justify-content: center; color: #999;">
            <span style="font-size: 48px;">📷</span>
          </div>
          <div class="image-info">
            <h3>Imagen ' + (i + 1) + '</h3>
            <p><strong>Post ID:</strong> <span>' + (postId || 'N/A') + '</span></p>
            <p><strong>Fecha:</strong> <span>' + (imageData.fecha || 'N/A') + '</span></p>
            <p><strong>Tipo:</strong> <span>' + (imageData.tipo || 'photo') + '</span></p>
            <p><strong>Dimensiones:</strong> <span>' + (imageData.width || 0) + 'x' + (imageData.height || 0) + '</span></p>
          </div>
          <div class="image-actions">
            <a href="imagenes-facebook/' + filename + '" download class="btn-download">⬇️ Descargar</a>
          </div>
        ';
        gallery.appendChild(card);
      }
      
      loading.classList.add('hidden');
      gallery.classList.remove('hidden');
    }
    
    // Crear tarjeta de imagen
    function createImageCard(imageUrl, imageData, filename, index) {
      const card = document.createElement('div');
      card.className = 'image-card';
      
      card.innerHTML = '
        <img src="' + imageUrl + '" alt="Imagen ' + (index + 1) + '" loading="lazy">
        <div class="image-info">
          <h3>Imagen ' + (index + 1) + '</h3>
          <p><strong>Post ID:</strong> <span>' + (imageData.postId || 'N/A') + '</span></p>
          <p><strong>Fecha:</strong> <span>' + (imageData.fecha || 'N/A') + '</span></p>
          <p><strong>Tipo:</strong> <span>' + (imageData.tipo || 'photo') + '</span></p>
          <p><strong>Dimensiones:</strong> <span>' + (imageData.width || 0) + 'x' + (imageData.height || 0) + '</span></p>
        </div>
        <div class="image-actions">
          <a href="' + imageUrl + '" download="' + filename + '" class="btn-download">⬇️ Descargar</a>
        </div>
      ';
      
      return card;
    }
    
    // Iniciar carga cuando el DOM esté listo
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', loadImagesFromZip);
    } else {
      loadImagesFromZip();
    }
  </script>
</body>
</html>`;
}

console.log('✅ utils.js cargado - Funciones helper disponibles');
