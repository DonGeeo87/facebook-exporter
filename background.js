/**
 * background.js - Service Worker para Facebook Exporter
 * Maneja operaciones en segundo plano
 * Código Guerrero Dev
 */

// Escuchar instalación de la extensión
chrome.runtime.onInstalled.addListener((details) => {
  console.log('🎉 Facebook Exporter instalado:', details.reason);
  
  if (details.reason === 'install') {
    // Mostrar página de bienvenida (opcional)
    console.log('Gracias por instalar Facebook Exporter - Código Guerrero Dev');
  }
});

// Escuchar mensajes del popup o content scripts
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  // Manejar solicitudes de descarga
  if (request.action === 'downloadData') {
    handleDownload(request.data, request.filename)
      .then(() => sendResponse({ success: true }))
      .catch(error => sendResponse({ success: false, error: error.message }));
    
    return true; // Mantener canal abierto para respuesta asíncrona
  }
});

/**
 * Maneja la descarga de datos
 * @param {Object} data - Datos a descargar
 * @param {string} filename - Nombre del archivo
 */
async function handleDownload(data, filename) {
  try {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    await chrome.downloads.download({
      url: url,
      filename: filename,
      saveAs: false
    });
    
    console.log('✅ Archivo descargado:', filename);
  } catch (error) {
    console.error('❌ Error en descarga:', error);
    throw error;
  }
}

// Limpiar recursos periódicamente
setInterval(() => {
  // Limpieza de memoria si es necesaria
  console.debug('🧹 Limpieza periódica del service worker');
}, 60000); // Cada minuto

console.log('✅ background.js cargado - Service Worker activo');
