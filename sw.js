var DYNAMIC_CACHE = 'dynamic-cache-v1'; // only used without connection
var STATIC_CACHE = 'static-cache-v1';

var toCache = [
    '',
    'lib/onsen/css/onsenui.min.css',
    'lib/onsen/css/onsen-css-components.min.css',
    'css/index.css',
    'https://cdn.polyfill.io/v2/polyfill.min.js',
    'cordova.js',
    'lib/onsen/js/onsenui.min.js',
    'js/core.js',
    'js/index.js',
    'cordova_plugins.js',
    'plugins/cordova-plugin-admobpro/www/AdMob.js',
    'plugins/cordova-plugin-device/www/device.js',
    'plugins/cordova-plugin-device/src/browser/DeviceProxy.js',
    'plugins/cordova-plugin-dialogs/www/notification.js',
    'plugins/cordova-plugin-dialogs/www/browser/notification.js',
    'js/browser.js',
];

// listen for outgoing network request
self.addEventListener('fetch', function (event) {
    // try to find response object in the cache
    // associated with current request
    event.respondWith(
        caches.open(STATIC_CACHE).then(function (cache) {
            return cache.match(event.request).then(function (response) {
                if (response) return response;

                return fetch(event.request).then(function (networkResponse) {
                    var networkRequestFailed = !networkResponse || (networkResponse.status !== 200 && !networkResponse.ok);
                    if (networkRequestFailed) {
                        return caches.open(DYNAMIC_CACHE)
                        .then(function (dynCache) {
                            return dynCache.match(event.request);
                        }).then(function (dynResponse) {
                            if (dynResponse) return dynResponse;
                            else return networkResponse;
                        });
                    }
                    else {
                        var shouldCache = /(manifest\.json|sw\.js|\.png$|\.jpg$|\.jpeg$)/i
                            .test(event.request.url) === false && isStaticCacheUrl(event.request.url) === false;
                        if (shouldCache) {
                            var cachedResponse = networkResponse.clone();
                            caches.open(DYNAMIC_CACHE).then(function (dynCache) {
                                dynCache.put(event.request, cachedResponse);
                            });
                        }
                        return networkResponse;
                    }
                });
            });
        })
    );
});

self.addEventListener('activate', function (event) {
    console.log('service worker activate');
});

self.addEventListener('install', function (event) {
    event.waitUntil(
        caches.open(STATIC_CACHE).then(function (cache) {
            return cache.addAll(toCache);
        })
    );
});

function isStaticCacheUrl(url) {
    for(var i = 0; i < toCache.length; i++) {
        if (url.indexOf(toCache[i]) !== -1) return true;
    }
    return false;
}

