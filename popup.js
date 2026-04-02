/**
 * popup.js - Lógica del popup para Facebook Exporter
 * Maneja la UI y comunicación con el content script
 * Código Guerrero Dev
 */

// Elementos del DOM
const btnExport = document.getElementById('btnExport');
const btnStop = document.getElementById('btnStop');
const includeComments = document.getElementById('includeComments');
const maxPostsSelect = document.getElementById('maxPosts');
const progressContainer = document.getElementById('progressContainer');
const progressFill = document.getElementById('progressFill');
const progressText = document.getElementById('progressText');
const statsContainer = document.getElementById('statsContainer');
const statusMessage = document.getElementById('statusMessage');
const statPosts = document.getElementById('statPosts');
const statPhotos = document.getElementById('statPhotos');
const statVideos = document.getElementById('statVideos');
// Nuevos elementos para descarga de imágenes
const btnDownloadImages = document.getElementById('btnDownloadImages');
const maxImagesSelect = document.getElementById('maxImages');
const includeVideos = document.getElementById('includeVideos');
const downloadZip = document.getElementById('downloadZip');

// Estado del popup
let isExtracting = false;
let currentMode = 'posts'; // 'posts' o 'images'
let currentTabId = null;

/**
 * Inicializa el popup
 */
async function init() {
  // Obtener tab activa
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  currentTabId = tab.id;

  // Verificar si estamos en Facebook
  if (!tab.url.includes('facebook.com')) {
    showStatus('Debes estar en Facebook para usar esta extensión', 'error');
    btnExport.disabled = true;
    btnDownloadImages.disabled = true;
    btnExport.innerHTML = '<span>❌</span><span>No es Facebook</span>';
    btnDownloadImages.innerHTML = '<span>❌</span><span>No es Facebook</span>';
    return;
  }

  console.log('✅ Popup inicializado en tab:', currentTabId);
}

/**
 * Muestra un mensaje de estado
 * @param {string} message - Mensaje a mostrar
 * @param {string} type - Tipo: 'success', 'error', 'info'
 */
function showStatus(message, type = 'info') {
  statusMessage.textContent = message;
  statusMessage.className = 'status ' + type;
}

/**
 * Oculta el mensaje de estado
 */
function hideStatus() {
  statusMessage.className = 'status';
}

/**
 * Actualiza la barra de progreso
 * @param {number} current - Posts actuales
 * @param {number} total - Máximo de posts
 */
function updateProgress(current, total) {
  const percentage = Math.min((current / total) * 100, 100);
  progressFill.style.width = percentage + '%';
  progressText.textContent = `Post ${current}/${total}...`;
}

/**
 * Muestra estadísticas de posts extraídos
 * @param {Array} posts - Array de posts
 */
function showStats(posts) {
  const photos = posts.filter(p => p.tipo === 'photo').length;
  const videos = posts.filter(p => p.tipo === 'video').length;
  
  statPosts.textContent = posts.length;
  statPhotos.textContent = photos;
  statVideos.textContent = videos;
  
  statsContainer.classList.remove('hidden');
}

/**
 * Inicia la extracción de posts
 */
async function startExtraction() {
  if (isExtracting) return;
  
  isExtracting = true;
  currentMode = 'posts';
  const maxPosts = parseInt(maxPostsSelect.value);
  const includeComms = includeComments.checked;
  
  // Actualizar UI
  btnExport.disabled = true;
  btnDownloadImages.disabled = true;
  btnExport.innerHTML = '<div class="spinner"></div><span>Extrayendo...</span>';
  btnStop.classList.remove('hidden');
  progressContainer.classList.remove('hidden');
  statsContainer.classList.add('hidden');
  hideStatus();
  
  try {
    console.log('🚀 Iniciando extracción desde popup...');
    
    // Enviar mensaje al content script
    const response = await chrome.tabs.sendMessage(currentTabId, {
      action: 'startExtraction',
      includeComments: includeComms,
      maxPosts: maxPosts
    });
    
    if (response.success) {
      console.log('✅ Extracción completada:', response.count, 'posts');
      
      // Actualizar progreso final
      updateProgress(response.posts.length, maxPosts);
      
      // Mostrar estadísticas
      showStats(response.posts);
      
      // Descargar archivos
      downloadFiles(response.posts);
      
      // Mostrar mensaje de éxito
      showStatus(`✅ ${response.count} posts exportados exitosamente`, 'success');
      
    } else {
      throw new Error(response.error || 'Error desconocido');
    }
    
  } catch (error) {
    console.error('❌ Error en extracción:', error);
    showStatus('❌ Error: ' + error.message, 'error');
  } finally {
    // Resetear UI
    isExtracting = false;
    currentMode = 'posts';
    btnExport.disabled = false;
    btnDownloadImages.disabled = false;
    btnExport.innerHTML = '<span>📥</span><span>Exportar Posts</span>';
    btnStop.classList.add('hidden');
    
    // Ocultar barra de progreso después de 3 segundos
    setTimeout(() => {
      progressContainer.classList.add('hidden');
    }, 3000);
  }
}

/**
 * Inicia la descarga de imágenes
 */
async function startDownloadImages() {
  if (isExtracting) return;
  
  isExtracting = true;
  currentMode = 'images';
  const maxImages = parseInt(maxImagesSelect.value);
  const includeVids = includeVideos.checked;
  const useZip = downloadZip.checked;
  
  // Actualizar UI
  btnExport.disabled = true;
  btnDownloadImages.disabled = true;
  btnDownloadImages.innerHTML = '<div class="spinner"></div><span>Extrayendo...</span>';
  btnStop.classList.remove('hidden');
  progressContainer.classList.remove('hidden');
  hideStatus();
  
  try {
    console.log('🖼️ Iniciando descarga de imágenes...');
    
    // Enviar mensaje al content script
    const response = await chrome.tabs.sendMessage(currentTabId, {
      action: 'downloadImages',
      maxImages: maxImages,
      includeVideos: includeVids
    });
    
    if (response.success) {
      console.log('✅ Imágenes extraídas:', response.count);
      
      // Actualizar progreso final
      updateProgress(response.images.length, maxImages);
      
      // Descargar imágenes
      if (useZip && response.images.length > 0) {
        // Usar JSZip para descargar todo en un archivo
        const zipFilename = generateFilename('facebook-images', 'zip');
        showStatus(`📦 Creando ZIP con ${response.count} imágenes...`, 'info');
        
        // Inyectar JSZip y crear ZIP
        await downloadImagesAsZip(response.images, zipFilename);
        
        showStatus(`✅ ZIP descargado con ${response.count} imágenes`, 'success');
      } else if (response.images.length > 0) {
        // Descarga tradicional (metadata + galería + m3u)
        await downloadImagesBulk(response.images);
        showStatus(`✅ ${response.count} imágenes extraídas. Archivos descargados.`, 'success');
      }
      
    } else {
      throw new Error(response.error || 'Error desconocido');
    }
    
  } catch (error) {
    console.error('❌ Error en descarga de imágenes:', error);
    showStatus('❌ Error: ' + error.message, 'error');
  } finally {
    // Resetear UI
    isExtracting = false;
    currentMode = 'posts';
    btnExport.disabled = false;
    btnDownloadImages.disabled = false;
    btnDownloadImages.innerHTML = '<span>🖼️</span><span>Descargar Imágenes</span>';
    btnStop.classList.add('hidden');
    
    // Ocultar barra de progreso después de 3 segundos
    setTimeout(() => {
      progressContainer.classList.add('hidden');
    }, 3000);
  }
}

/**
 * Detiene la extracción en curso
 */
async function stopExtraction() {
  try {
    await chrome.tabs.sendMessage(currentTabId, {
      action: 'stopExtraction'
    });
    
    showStatus('⏹️ Extracción detenida por el usuario', 'info');
    isExtracting = false;
    
  } catch (error) {
    console.error('Error al detener:', error);
  }
}

/**
 * Descarga los archivos JSON y CSV
 * @param {Array} posts - Posts extraídos
 */
function downloadFiles(posts) {
  // Generar nombres de archivo
  const jsonFilename = generateFilename('facebook-export', 'json');
  const csvFilename = generateFilename('facebook-export', 'csv');
  
  // Crear y descargar JSON
  const jsonBlob = new Blob([JSON.stringify(posts, null, 2)], { type: 'application/json' });
  const jsonUrl = URL.createObjectURL(jsonBlob);
  
  // Crear y descargar CSV
  const csvContent = convertToCSV(posts);
  const csvBlob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const csvUrl = URL.createObjectURL(csvBlob);
  
  // Descargar JSON
  chrome.downloads.download({
    url: jsonUrl,
    filename: jsonFilename,
    saveAs: false
  });
  
  // Descargar CSV después de un pequeño delay
  setTimeout(() => {
    chrome.downloads.download({
      url: csvUrl,
      filename: csvFilename,
      saveAs: false
    });
  }, 500);
  
  // Limpiar URLs
  setTimeout(() => {
    URL.revokeObjectURL(jsonUrl);
    URL.revokeObjectURL(csvUrl);
  }, 2000);
}

/**
 * Genera nombre de archivo con timestamp
 * @param {string} prefix - Prefijo del archivo
 * @param {string} extension - Extensión
 * @returns {string} Nombre de archivo
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
 * Convierte array de posts a formato CSV
 * @param {Array} posts - Posts a convertir
 * @returns {string} Contenido CSV
 */
function convertToCSV(posts) {
  if (!posts || posts.length === 0) return '';

  // Cabeceras
  const headers = ['ID', 'Texto', 'Fecha', 'Likes', 'Comentarios', 'Compartidos', 'URL', 'Imagen', 'Tipo'];

  // Filas
  const rows = posts.map(post => {
    return [
      post.id,
      `"${(post.texto || '').replace(/"/g, '""')}"`,  // Escapar comillas
      post.fecha_iso,
      post.likes,
      post.comentarios_count,
      post.compartidos,
      post.url_post,
      post.imagen_url || '',
      post.tipo
    ].join(',');
  });

  // Unir con BOM para Excel
  return '\uFEFF' + [headers.join(','), ...rows].join('\n');
}

/**
 * Descarga imágenes en bulk usando fetch + blob
 * @param {Array} images - Array de objetos de imagen
 */
async function downloadImagesBulk(images) {
  if (!images || images.length === 0) {
    console.warn('No hay imágenes para descargar');
    return;
  }

  console.log(`🖼️ Descargando ${images.length} imágenes...`);

  // Descargar metadata JSON primero
  const jsonFilename = generateFilename('facebook-images-metadata', 'json');
  const jsonBlob = new Blob([JSON.stringify(images, null, 2)], { type: 'application/json' });
  const jsonUrl = URL.createObjectURL(jsonBlob);

  chrome.downloads.download({
    url: jsonUrl,
    filename: jsonFilename,
    saveAs: false
  });

  // Descargar cada imagen individualmente
  // Nota: Chrome extensiones tienen limitaciones para descargar múltiples archivos
  // Se descarga la metadata y el usuario puede usar herramientas externas

  // Crear archivo HTML con todas las imágenes para visualización
  const htmlContent = generateImagesHtml(images);
  const htmlBlob = new Blob([htmlContent], { type: 'text/html' });
  const htmlUrl = URL.createObjectURL(htmlBlob);

  setTimeout(() => {
    chrome.downloads.download({
      url: htmlUrl,
      filename: generateFilename('facebook-images-gallery', 'html'),
      saveAs: false
    });
  }, 500);

  // Crear archivo M3U para descargar con gestor de descargas
  const m3uContent = generateM3U(images);
  const m3uBlob = new Blob([m3uContent], { type: 'audio/x-mpegurl' });
  const m3uUrl = URL.createObjectURL(m3uBlob);

  setTimeout(() => {
    chrome.downloads.download({
      url: m3uUrl,
      filename: generateFilename('facebook-images-downloads', 'm3u'),
      saveAs: false
    });
  }, 1000);

  // Limpiar URLs
  setTimeout(() => {
    URL.revokeObjectURL(jsonUrl);
    URL.revokeObjectURL(htmlUrl);
    URL.revokeObjectURL(m3uUrl);
  }, 2000);

  console.log('✅ Archivos de imágenes generados');
}

/**
 * Descarga imágenes en un archivo ZIP usando JSZip
 * @param {Array} images - Array de objetos de imagen
 * @param {string} zipFilename - Nombre del archivo ZIP
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

    // Agregar galería HTML
    const galleryHtml = generateZipGalleryHtml(images);
    zip.file('galeria.html', galleryHtml);

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
 * Genera archivo HTML con galería de imágenes
 * @param {Array} images - Array de objetos de imagen
 * @returns {string} Contenido HTML
 */
function generateImagesHtml(images) {
  const imageCards = images.map((img, index) => `
    <div class="image-card">
      <h3>Imagen ${index + 1}</h3>
      <img src="${img.url}" alt="Imagen ${index + 1}" style="max-width: 100%; height: auto; border-radius: 8px;">
      <p><strong>Post ID:</strong> ${img.postId || 'N/A'}</p>
      <p><strong>Fecha:</strong> ${img.fecha || 'N/A'}</p>
      <p><strong>Tipo:</strong> ${img.tipo}</p>
      <p><strong>Dimensiones:</strong> ${img.width}x${img.height}</p>
      <a href="${img.url}" download="facebook-image-${index + 1}.jpg" 
         style="display: inline-block; padding: 8px 16px; background: #667eea; color: white; 
                text-decoration: none; border-radius: 4px; margin-top: 8px;">
        ⬇️ Descargar Individual
      </a>
    </div>
  `).join('');
  
  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Galería - Facebook Exporter</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: #f0f2f5;
      padding: 20px;
      margin: 0;
    }
    h1 {
      text-align: center;
      color: #667eea;
      margin-bottom: 10px;
    }
    .subtitle {
      text-align: center;
      color: #666;
      margin-bottom: 30px;
    }
    .gallery {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
      gap: 20px;
      max-width: 1400px;
      margin: 0 auto;
    }
    .image-card {
      background: white;
      border-radius: 12px;
      padding: 15px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    }
    .image-card h3 {
      margin: 0 0 10px 0;
      color: #333;
      font-size: 14px;
    }
    .image-card p {
      font-size: 12px;
      color: #666;
      margin: 5px 0;
    }
    .info-bar {
      position: fixed;
      bottom: 0;
      left: 0;
      right: 0;
      background: #667eea;
      color: white;
      padding: 15px;
      text-align: center;
      box-shadow: 0 -2px 10px rgba(0,0,0,0.1);
    }
  </style>
</head>
<body>
  <h1>🖼️ Galería de Imágenes Facebook</h1>
  <p class="subtitle">${images.length} imágenes extraídas - Código Guerrero Dev</p>
  
  <div class="gallery">
    ${imageCards}
  </div>
  
  <div class="info-bar">
    💡 Tip: Haz clic derecho en cualquier imagen → "Guardar imagen como..." para descargar individualmente.
    <br>
    📥 Usa el archivo .m3u descargado con un gestor de descargas para bajar todas automáticamente.
  </div>
</body>
</html>`;
}

/**
 * Genera archivo M3U para gestor de descargas
 * @param {Array} images - Array de objetos de imagen
 * @returns {string} Contenido M3U
 */
function generateM3U(images) {
  let content = '#EXTM3U\n';
  content += '# Facebook Images Download List\n';
  content += '# Generated by Facebook Exporter - Código Guerrero Dev\n';
  content += `# Total images: ${images.length}\n`;
  content += `# Date: ${new Date().toISOString()}\n\n`;

  images.forEach((img, index) => {
    const filename = `facebook-image-${String(index + 1).padStart(4, '0')}-${img.postId || 'unknown'}.jpg`;
    content += `#EXTINF:-1,${filename}\n`;
    content += `${img.url}\n\n`;
  });

  return content;
}

/**
 * Genera archivo HTML con galería de imágenes para incluir en ZIP
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
    *{margin:0;padding:0;box-sizing:border-box}body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;background:linear-gradient(135deg,#667eea 0%,#764ba2 100%);min-height:100vh;padding:20px}.container{max-width:1400px;margin:0 auto}header{text-align:center;color:white;margin-bottom:30px}header h1{font-size:32px;margin-bottom:10px;text-shadow:2px 2px 4px rgba(0,0,0,0.3)}header p{font-size:16px;opacity:0.9}.stats{display:flex;justify-content:center;gap:20px;margin-top:15px}.stat-badge{background:rgba(255,255,255,0.2);backdrop-filter:blur(10px);padding:10px 20px;border-radius:20px;font-size:14px}.loading{text-align:center;color:white;padding:60px 20px;font-size:18px}.loading-spinner{display:inline-block;width:40px;height:40px;border:4px solid rgba(255,255,255,0.3);border-top-color:white;border-radius:50%;animation:spin 1s linear infinite;margin-bottom:15px}@keyframes spin{to{transform:rotate(360deg)}}.gallery{display:grid;grid-template-columns:repeat(auto-fill,minmax(320px,1fr));gap:25px;padding:20px;background:rgba(255,255,255,0.1);border-radius:16px;backdrop-filter:blur(10px)}.image-card{background:white;border-radius:12px;overflow:hidden;box-shadow:0 4px 15px rgba(0,0,0,0.2);transition:transform 0.3s ease,box-shadow 0.3s ease}.image-card:hover{transform:translateY(-5px);box-shadow:0 8px 25px rgba(0,0,0,0.3)}.image-card img{width:100%;height:250px;object-fit:cover;display:block;background:#f0f2f5}.image-info{padding:15px}.image-info h3{font-size:14px;color:#333;margin-bottom:10px;font-weight:600}.image-info p{font-size:12px;color:#666;margin:5px 0;display:flex;justify-content:space-between}.image-info p strong{color:#444}.image-actions{padding:15px;border-top:1px solid #eee;display:flex;gap:10px}.btn-download{flex:1;padding:10px;background:linear-gradient(135deg,#667eea 0%,#764ba2 100%);color:white;border:none;border-radius:8px;font-size:13px;font-weight:600;cursor:pointer;text-decoration:none;text-align:center;transition:opacity 0.2s}.btn-download:hover{opacity:0.9}.error-message{background:rgba(244,67,54,0.9);color:white;padding:20px;border-radius:12px;text-align:center;margin:20px}footer{text-align:center;margin-top:40px;padding:20px;color:white;opacity:0.8;font-size:13px}.hidden{display:none}
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
    <div id="loading" class="loading"><div class="loading-spinner"></div><p>Cargando imágenes del ZIP...</p></div>
    <div id="error" class="error-message hidden"><p>⚠️ No se pudieron cargar las imágenes</p><p style="font-size:12px;margin-top:10px;opacity:0.8">Asegúrate de que este archivo HTML esté dentro del ZIP<br>o de haber extraído todo el contenido del ZIP</p></div>
    <div id="gallery" class="gallery hidden"></div>
  </div>
  <footer><p>Generado por Facebook Exporter - Código Guerrero Dev ⚔️</p><p>v1.1.0 | Chile</p></footer>
  <script>
    const imagesData=${imagesData};
    async function loadImagesFromZip(){
      const loading=document.getElementById('loading'),error=document.getElementById('error'),gallery=document.getElementById('gallery');
      try{
        if(typeof JSZip==='undefined')throw new Error('JSZip no está disponible');
        let zip;
        try{
          const response=await fetch('facebook-images.zip');
          if(!response.ok)throw new Error('ZIP no encontrado');
          const blob=await response.blob();
          zip=await JSZip.loadAsync(blob);
        }catch(e){
          try{
            const imgResponse=await fetch('imagenes-facebook/');
            if(imgResponse.ok){
              gallery.innerHTML='';
              for(let i=0;i<Math.min(imagesData.length,1000);i++){
                const imageData=imagesData[i],index=String(i+1).padStart(4,'0'),postId=imageData.postId||'unknown',filename='imagen-'+index+'-'+postId+'.jpg',imageUrl='imagenes-facebook/'+filename;
                const card=document.createElement('div');
                card.className='image-card';
                card.innerHTML='<img src="'+imageUrl+'" alt="Imagen '+(i+1)+'" loading="lazy"><div class="image-info"><h3>Imagen '+(i+1)+'</h3><p><strong>Post ID:</strong> <span>'+(postId||'N/A')+'</span></p><p><strong>Fecha:</strong> <span>'+(imageData.fecha||'N/A')+'</span></p><p><strong>Tipo:</strong> <span>'+(imageData.tipo||'photo')+'</span></p><p><strong>Dimensiones:</strong> <span>'+(imageData.width||0)+'x'+(imageData.height||0)+'</span></p></div><div class="image-actions"><a href="'+imageUrl+'" download="'+filename+'" class="btn-download">⬇️ Descargar</a></div>';
                gallery.appendChild(card);
              }
              loading.classList.add('hidden');
              gallery.classList.remove('hidden');
              return;
            }
          }catch(e2){}
          throw new Error('No se encontró el ZIP o la carpeta de imágenes');
        }
        if(zip){
          const imgFolder=zip.folder('imagenes-facebook');
          if(!imgFolder)throw new Error('No se encontró la carpeta de imágenes');
          const imageFiles=Object.keys(imgFolder.files).filter(n=>n.endsWith('.jpg')||n.endsWith('.png')||n.endsWith('.jpeg')).sort();
          if(imageFiles.length===0)throw new Error('No se encontraron imágenes');
          gallery.innerHTML='';
          for(const[index,filename]of imageFiles.entries()){
            const imageData=imagesData[index]||{};
            try{
              const file=imgFolder.file(filename),blob=await file.async('blob'),imageUrl=URL.createObjectURL(blob);
              const card=document.createElement('div');
              card.className='image-card';
              card.innerHTML='<img src="'+imageUrl+'" alt="Imagen '+(index+1)+'" loading="lazy"><div class="image-info"><h3>Imagen '+(index+1)+'</h3><p><strong>Post ID:</strong> <span>'+(imageData.postId||'N/A')+'</span></p><p><strong>Fecha:</strong> <span>'+(imageData.fecha||'N/A')+'</span></p><p><strong>Tipo:</strong> <span>'+(imageData.tipo||'photo')+'</span></p><p><strong>Dimensiones:</strong> <span>'+(imageData.width||0)+'x'+(imageData.height||0)+'</span></p></div><div class="image-actions"><a href="'+imageUrl+'" download="'+filename+'" class="btn-download">⬇️ Descargar</a></div>';
              gallery.appendChild(card);
            }catch(imgError){console.error('Error cargando imagen '+filename,imgError);}
          }
          loading.classList.add('hidden');
          gallery.classList.remove('hidden');
        }
      }catch(error){
        console.error('Error cargando imágenes:',error);
        loading.classList.add('hidden');
        error.classList.remove('hidden');
        error.innerHTML='<p>⚠️ '+error.message+'</p>';
      }
    }
    if(document.readyState==='loading'){document.addEventListener('DOMContentLoaded',loadImagesFromZip);}else{loadImagesFromZip();}
  </script>
</body>
</html>`;
}

// Event Listeners
btnExport.addEventListener('click', startExtraction);
btnDownloadImages.addEventListener('click', startDownloadImages);
btnStop.addEventListener('click', stopExtraction);

// Inicializar
init();

console.log('✅ popup.js cargado - UI lista');
