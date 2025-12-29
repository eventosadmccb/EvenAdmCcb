
const CACHE_NAME = 'pwa-eventos-cache-v1';
const urlsToCache = [
    '/',
    '/index.html',
    '/estilos.css',
    '/app.js',
    '/ui.js',
    '/components.js'
    // Adicionar ícones e manifest.json se desejar
];

// Evento de Instalação: Salva os arquivos estáticos no cache.
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('Cache aberto');
                return cache.addAll(urlsToCache);
            })
    );
});

// Evento de Ativação: Limpa caches antigos.
self.addEventListener('activate', event => {
    const cacheWhitelist = [CACHE_NAME];
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    if (cacheWhitelist.indexOf(cacheName) === -1) {
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
});

// Evento de Fetch: Intercepta as requisições de rede.
// Estratégia: Cache first, then network.
self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request)
            .then(response => {
                // Retorna a resposta do cache se encontrada
                if (response) {
                    return response;
                }
                // Caso contrário, busca na rede
                return fetch(event.request);
            })
    );
});
