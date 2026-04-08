// ==========================
// CONFIGURAÇÃO DO CACHE
// ==========================

const CACHE_NAME = 'vibecoding-v1';
const urlsToCache = [
    '/',
    '/index.html',
    '/style.css',
    '/app.js',
    '/manifest.json'
];

// ==========================
// EVENTO: INSTALL
// ==========================
// Executa quando o Service Worker é instalado pela primeira vez

self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('✅ Cache criado:', CACHE_NAME);
                return cache.addAll(urlsToCache);
            })
            .catch(error => {
                console.error('❌ Erro ao criar cache:', error);
            })
    );
    
    // Force o Service Worker a ativar imediatamente
    self.skipWaiting();
});

// ==========================
// EVENTO: ACTIVATE
// ==========================
// Executa quando o Service Worker é ativado
// Limpa caches antigos

self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys()
            .then(cacheNames => {
                return Promise.all(
                    cacheNames.map(cacheName => {
                        // Se o cache não é o atual, deleta
                        if (cacheName !== CACHE_NAME) {
                            console.log('🗑️ Deletando cache antigo:', cacheName);
                            return caches.delete(cacheName);
                        }
                    })
                );
            })
    );
    
    // Force o cliente a usar o novo Service Worker
    self.clients.claim();
});

// ==========================
// EVENTO: FETCH
// ==========================
// Intercepta todas as requisições da rede
// Estratégia: Cache First, depois Network

self.addEventListener('fetch', event => {
    const { request } = event;
    
    // Ignora requisições POST (como formulários)
    if (request.method !== 'GET') {
        return;
    }
    
    event.respondWith(
        caches.match(request)
            .then(response => {
                // Se encontrou no cache, retorna
                if (response) {
                    console.log('📦 Servindo do cache:', request.url);
                    return response;
                }
                
                // Se não encontrou, tenta buscar da rede
                return fetch(request)
                    .then(response => {
                        // Valida a resposta
                        if (!response || response.status !== 200 || response.type === 'error') {
                            return response;
                        }
                        
                        // Clona a resposta para colocar no cache
                        const responseToCache = response.clone();
                        
                        caches.open(CACHE_NAME)
                            .then(cache => {
                                cache.put(request, responseToCache);
                                console.log('💾 Adicionado ao cache:', request.url);
                            });
                        
                        return response;
                    })
                    .catch(error => {
                        // Se offline e não tem cache, retorna erro
                        console.error('❌ Erro de rede:', error);
                        return new Response('Offline - Conteúdo não disponível', {
                            status: 503,
                            statusText: 'Service Unavailable'
                        });
                    });
            })
    );
});

// ==========================
// NOTIFICAÇÃO DE ATUALIZAÇÃO
// ==========================
// Avisa o cliente quando há nova versão

self.addEventListener('message', event => {
    if (event.data && event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }
});