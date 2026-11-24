/* Racconti di ispirazione: funziona anche senza rete.
   La pagina e il numero di versione si chiedono sempre alla rete (così gli aggiornamenti arrivano), e si usa la copia salvata solo se la rete non c'è.
   Suoni, immagini e caratteri si salvano la prima volta e poi si prendono da lì. */
var STATIC='racconti-static-v2', PAGE='racconti-page-v1';
self.addEventListener('install',function(e){ self.skipWaiting(); });
self.addEventListener('activate',function(e){ e.waitUntil(caches.keys().then(function(ks){ return Promise.all(ks.filter(function(k){ return k.indexOf('racconti-static-')===0&&k!==STATIC; }).map(function(k){ return caches.delete(k); })); }).then(function(){ return self.clients.claim(); })); });   // i suoni vecchi si buttano
self.addEventListener('fetch',function(e){
  var u=new URL(e.request.url); if(e.request.method!=='GET'||u.origin!==location.origin) return;
  if(e.request.headers.get('range')) return;
  var asset=/\/(stems|img|fonts)\//.test(u.pathname)||/\.(png|webmanifest)$/.test(u.pathname);
  if(asset){ e.respondWith(caches.open(STATIC).then(function(c){ return c.match(e.request,{ignoreSearch:true}).then(function(hit){ return hit||fetch(e.request).then(function(r){ if(r.ok) c.put(e.request,r.clone()); return r; }); }); })); return; }
  e.respondWith(fetch(e.request).then(function(r){ if(r.ok&&u.pathname.indexOf('version.json')<0){ var cp=r.clone(); caches.open(PAGE).then(function(c){ c.put(u.pathname,cp); }); } return r; }).catch(function(){ return caches.open(PAGE).then(function(c){ return c.match(u.pathname).then(function(hit){ return hit||c.match(u.pathname.replace(/[^\/]*$/,'')+'index.html')||Response.error(); }); }); }));
});
