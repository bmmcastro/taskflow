//service worker simples do taskflow (para a PWA)

//mudamos o nome quando ha alteracoes para apagar a cache antiga
const CACHE = 'taskflow-v5';

//os ficheiros do frontend que guardamos para a app abrir mesmo sem net
const ficheiros = [
    './',
    './index.html',
    './app.js',
    './logo.svg',
    './manifest.json'
];

//ao instalar, guardamos os ficheiros e assumimos logo o controlo
self.addEventListener('install', (e) => {
    self.skipWaiting();
    e.waitUntil(
        caches.open(CACHE).then((cache) => cache.addAll(ficheiros))
    );
});

//ao ativar, apagamos as caches antigas (versoes anteriores)
self.addEventListener('activate', (e) => {
    e.waitUntil(
        caches.keys().then((nomes) =>
            Promise.all(nomes.filter((n) => n !== CACHE).map((n) => caches.delete(n)))
        )
    );
    self.clients.claim();
});

//em cada pedido decidimos de onde vem a resposta
self.addEventListener('fetch', (e) => {
    const url = new URL(e.request.url);

    //os pedidos a api vao sempre a rede (os dados tem de estar atualizados)
    if (url.pathname.startsWith('/tarefas') || url.pathname.startsWith('/projetos') || url.pathname.startsWith('/utilizadores')) {
        return;
    }

    //o frontend tenta primeiro a rede (para apanhar sempre a versao nova)
    //e so usa a cache se nao houver internet
    e.respondWith(
        fetch(e.request)
            .then((resposta) => {
                const copia = resposta.clone();
                caches.open(CACHE).then((cache) => cache.put(e.request, copia));
                return resposta;
            })
            .catch(() => caches.match(e.request))
    );
});
