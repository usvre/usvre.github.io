const statusDiv = document.getElementById('status');
const startBtn = document.getElementById('start-btn');
const installBtn = document.getElementById('install-btn');

let userLat, userLon;
let deferredPrompt;

// 1. Registrar el Service Worker
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('sw.js')
      .then(reg => console.log('Service Worker registrado', reg))
      .catch(err => console.error('Error al registrar SW', err));
  });
}

// 2. Manejar el botón de "Instalar App"
window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  deferredPrompt = e;
  installBtn.style.display = 'block'; // Mostrar el botón
});

installBtn.addEventListener('click', async () => {
  if (deferredPrompt) {
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      installBtn.style.display = 'none';
    }
    deferredPrompt = null;
  }
});

// 3. Iniciar Monitoreo (Pedir permisos)
startBtn.addEventListener('click', async () => {
  // Pedir permiso de notificaciones
  let permission = Notification.permission;
  if (permission !== 'granted') {
    permission = await Notification.requestPermission();
  }

  if (permission === 'granted') {
    // Obtener ubicación
    if (navigator.geolocation) {
      statusDiv.innerText = "Obteniendo ubicación...";
      navigator.geolocation.getCurrentPosition(
        (position) => {
          userLat = position.coords.latitude;
          userLon = position.coords.longitude;
          statusDiv.innerText = "Monitoreando sismos en tu zona...";
          startBtn.disabled = true;
          
          // Consultar API de inmediato y luego cada 5 minutos
          checkEarthquakes();
          setInterval(checkEarthquakes, 5 * 60 * 1000);
        },
        (error) => {
          statusDiv.innerText = "Error: Activa tu GPS para recibir alertas.";
        }
      );
    } else {
      statusDiv.innerText = "Tu navegador no soporta geolocalización.";
    }
  } else {
    statusDiv.innerText = "Necesitas aceptar las notificaciones para recibir alertas.";
  }
});

// 4. Consultar API de USGS
async function checkEarthquakes() {
  if (!userLat || !userLon) return;

  // Fecha actual menos 24 horas (formato ISO)
  const yesterday = new Date(Date.now() - 86400000).toISOString();

  // API de USGS: Sismos de magnitud >= 4.0 en un radio de 200km
  const url = `https://earthquake.usgs.gov/fdsnws/event/1/query?format=geojson&starttime=${yesterday}&latitude=${userLat}&longitude=${userLon}&maxradiuskm=200&minmagnitude=4.0`;

  try {
    const response = await fetch(url);
    const data = await response.json();
    
    const earthquakesDiv = document.getElementById('earthquakes');
    earthquakesDiv.innerHTML = ''; 

    if (data.features.length > 0) {
      // Tomamos el sismo más reciente
      const latestQuake = data.features[0];
      const mag = latestQuake.properties.mag;
      const place = latestQuake.properties.place;

      earthquakesDiv.innerHTML = `<p style="color:red;"><b>Último sismo:</b> Magnitud ${mag} - ${place}</p>`;

      // Enviar Notificación
      sendNotification(`¡Alerta de Sismo! Magnitud: ${mag}`, `Ubicación: ${place}`);
    } else {
      earthquakesDiv.innerHTML = '<p>No se registran sismos fuertes recientes cerca de ti.</p>';
    }
  } catch (error) {
    console.error("Error consultando la API:", error);
  }
}

// 5. Enviar la notificación
function sendNotification(title, body) {
  if (Notification.permission === 'granted') {
    navigator.serviceWorker.ready.then(registration => {
      registration.showNotification(title, {
        body: body,
        icon: 'icons/icon-192x192.png',
        vibrate: [200, 100, 200, 100, 200],
        requireInteraction: true // Evita que la notificación desaparezca sola
      });
    });
  }
}
