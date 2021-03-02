
const cache_version = 3;
const CACHE_STATIC_NAME = 'precache-v' + cache_version;
const CACHE_DYNAMIC_NAME = 'dynamic-v' + cache_version;

//SW PUSH NOTIFICATIONS

self.addEventListener('push', e => {
  console.log('Push Notification received');

  if (e.data) {
    const data = JSON.parse(e.data.text());

    const options = {
      body: data.content,
      data: {
        url: data.openUrl
      }
    };

    e.waitUntil(
      self.registration.showNotification(data.title, options)
    );
  }
});

self.addEventListener('notificationclick', e => {
  // console.log(e.notification.data);
  e.waitUntil(
    clients.matchAll()
      .then( results => {
        const client = results.find( c => c.visiblityState==='visible');
        const url = (e.notification.data && e.notification.data.url) ? e.notification.data.url : '/pwa.html';
        if (client) {
          client.navigate(url);
          client.focus();
        } else {
          clients.openWindow(url);
        }
        e.notification.close();
      })
  )
});

//SW INSTALL, ACTIVATE AND FETCH

self.addEventListener('install', e => {
  console.log('*Service Worker* :', 'Installing SW...', e);
  e.waitUntil(
    caches.open(CACHE_STATIC_NAME).then( cache => {
      console.log('*Service worker* :', 'Precaching...');
      cache.addAll([
        '/pwa.html',
        './js/pwa.js',
        '/img/logo800.png',
        '/html/offline.html'
      ]);
    })
  );
});

self.addEventListener('activate', e => {
  console.log('*Service Worker* :', 'SW activated!', e);
  
  e.waitUntil(
    caches.keys().then( keys => {
      return Promise.all(keys.map( key => {
        if (key !== CACHE_STATIC_NAME && key !== CACHE_DYNAMIC_NAME) {
          console.log('*Service Worker* :', 'Cleaning cache...', key);
          return caches.delete(key);
        }
      }));
    })
  );

  return self.clients.claim();
});


/**
 * Classic Cache Strategy (Cache-first strategy)
 * Check if the request has been saved in the cache and returns it if so.
 * Otherwise, it fetches the request to the network
 * Problem: not the best solution in case we want a page always updated
 */
self.addEventListener('fetch', e => {
  e.respondWith(
    //check if a resource is in the cache and return it if so
    caches.match(e.request).then( response => {
      //if the response is not null, we return it
      if (response) {
        return response;
      } else {
        return fetch(e.request)
          .then( res => {
            return caches.open(CACHE_DYNAMIC_NAME).then( cache => {
              cache.put(e.request.url, res.clone());
              return res;
            })
          })
          .catch( err => {
            return caches.open(CACHE_STATIC_NAME).then( cache => {
              return cache.match('/html/offline.html');
            });
          });
      }
    })
  );
});

/**
 * Network with Cache Fallback Strategy (Network-first strategy)
 * It fetches the request to the network, if there isn't an internet connection it searches in the cache.
 * Problem: fetches could require a lot of time before searching in the cache (as with really bad connection)
 */
// self.addEventListener('fetch', e => {
//   e.respondWith(
//     fetch(e.request)
//       .catch(err => {
//         return caches.match(e.request);
//       })
//   );
// });

/**
 * Cache then Network Strategy
 * When we fetch an URL we search in the cache and in the network simultaneously.
 * Every time we update the cache with the last version of the data fetched.
 * Problem: it doesn't work offline
 */
// self.addEventListener('fetch', e => {
//   e.respondWith(
//     caches.open(CACHE_DYNAMIC_NAME).then( cache => {
//       return fetch(e.request).then(res => {
//         cache.put(e.request, res.clone());
//         return res;
//       })
//     })
//   )
// }); 