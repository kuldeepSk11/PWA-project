//version 
var appVersion = 'V1.04';

// file to cache
var files = [
        '/',
        '/index.html',
        '/css/style.css',
        '/css/bootstrap.min.css',
        '/js/jquery-3.3.1.js',
        '/js/bootstrap.min.js',
        '/js/main.js',
        '/images/favicon.ico',
        '/images/favicon.png',
        '/images/**.png',
        '/images/**.jpg',
        
        'https://fonts.googleapis.com/css?family=Roboto:300,400,500,700'
]

// The install handler takes care of precaching the resources we always need.
self.addEventListener('install', function(event) {
  //console.log("service worker install")
  // event.waitUntil(
  //   caches.open(appVersion).then(function(cache) {
  //     return cache.addAll(files);
  //    }).catch(function(error){ 
  //       console.log('error', error) 
  //   })
  // )

//var indexPage = new Request('index.html');
  event.waitUntil(
    fetch(files).then(function(response) {
      return caches.open('appVersion').then(function(cache) {
        console.log('[PWA Builder] Cached index page during Install'+ response.url);
        return cache.put(files, response);
      });
  }));

   self.skipWaiting();
});

// The activate handler takes care of cleaning up old caches.
self.addEventListener('activate', function(event) {
    console.log("service worker activate");
    event.waitUntil(
    caches.keys().then(function(cacheName) {
      return Promise.all(cacheName.map(function(cache) {
        if (cache !== appVersion) {
            console.log("cache is deleting");
          return caches.delete(cache);
        }
      })
     )
    }).catch(function(error){ 
        console.log('error', error) 
    })
  );
    return self.clients.claim();
});

// The fetch handler serves responses for same-origin resources from a cache.
// If no response is found, it populates the runtime cache with the response
// from the network before returning it to the page.
self.addEventListener('fetch', function(event) {

     console.log("service worker fetch");

    var updateCache = function(request){
    return caches.open('appVersion').then(function (cache) {
      return fetch(request).then(function (response) {
        console.log('[PWA Builder] add page to offline'+response.url)
        return cache.put(request, response);
      });
    });
  };

  event.waitUntil(updateCache(event.request));

  event.respondWith(
    fetch(event.request).catch(function(error) {
      console.log( '[PWA Builder] Network request Failed. Serving content from cache: ' + error );

      //Check to see if you have it in the cache
      //Return response
      //If not in the cache, then return error page
      return caches.open('appVersion').then(function (cache) {
        return cache.match(event.request).then(function (matching) {
          var report =  !matching || matching.status == 404?Promise.reject('no-match'): matching;
          return report
        });
      });
    })
  );
  

  //  event.respondWith(
  //   caches.match(event.request).then(function(response) {
  //       return response || fetch(event.request);
        
  //   })
  // );
});
