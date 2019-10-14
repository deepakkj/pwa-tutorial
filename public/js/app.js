if('serviceWorker' in navigator) {
    var SERVICE_WORKER_FILE_PATH = '/sw.js';
    navigator.serviceWorker.register(SERVICE_WORKER_FILE_PATH)
    .then((reg) => console.log('Service worker registered', reg))
    .catch((err) => console.warn('Service worker not registered', err));
}