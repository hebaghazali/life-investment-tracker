// Life Investment Tracker - Service Worker
// Version: 1.0.0

const CACHE_VERSION = 'v1.0.0';
const CACHE_NAME = `life-investment-tracker-${CACHE_VERSION}`;

// Core shell routes to precache
const CORE_ROUTES = [
  '/',
  '/today',
  '/calendar',
  '/insights',
];

// Assets that should be cached
const STATIC_ASSETS = [
  '/manifest.webmanifest',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png',
  '/icons/apple-touch-icon.png',
];

// Install event - precache core assets
self.addEventListener('install', (event) => {
  console.log('[Service Worker] Installing version:', CACHE_VERSION);
  
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[Service Worker] Precaching core assets');
      // Precache static assets, but don't fail installation if routes fail
      return cache.addAll(STATIC_ASSETS).catch((err) => {
        console.warn('[Service Worker] Failed to precache some assets:', err);
      });
    })
  );
  
  // Activate worker immediately
  self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('[Service Worker] Activating version:', CACHE_VERSION);
  
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME && cacheName.startsWith('life-investment-tracker-')) {
            console.log('[Service Worker] Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  
  // Take control of all clients immediately
  return self.clients.claim();
});

// Fetch event - implement caching strategies
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);
  
  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }
  
  // Skip chrome-extension and other non-http(s) requests
  if (!url.protocol.startsWith('http')) {
    return;
  }
  
  // Skip Stack Auth requests to avoid auth issues
  if (url.pathname.startsWith('/api/auth') || url.pathname.startsWith('/handler')) {
    return;
  }
  
  // Strategy 1: Cache-first for static assets (JS, CSS, fonts, images, icons)
  if (
    url.pathname.match(/\.(js|css|woff2?|ttf|eot|svg|png|jpg|jpeg|gif|webp|ico)$/) ||
    url.pathname.startsWith('/icons/') ||
    url.pathname === '/manifest.webmanifest' ||
    url.pathname === '/logo.png'
  ) {
    event.respondWith(cacheFirst(request));
    return;
  }
  
  // Strategy 2: Network-first with cache fallback for HTML/navigation and API routes
  if (
    request.mode === 'navigate' ||
    url.pathname.startsWith('/_next/data/') ||
    CORE_ROUTES.includes(url.pathname) ||
    url.pathname.startsWith('/day/')
  ) {
    event.respondWith(networkFirstWithCacheFallback(request));
    return;
  }
  
  // Strategy 3: Stale-while-revalidate for everything else
  event.respondWith(staleWhileRevalidate(request));
});

// Cache-first strategy: Check cache first, fall back to network
async function cacheFirst(request) {
  const cache = await caches.open(CACHE_NAME);
  const cached = await cache.match(request);
  
  if (cached) {
    return cached;
  }
  
  try {
    const response = await fetch(request);
    if (response.ok) {
      cache.put(request, response.clone());
    }
    return response;
  } catch (error) {
    console.warn('[Service Worker] Cache-first fetch failed:', request.url, error);
    throw error;
  }
}

// Network-first with cache fallback: Try network first, use cache as fallback
async function networkFirstWithCacheFallback(request) {
  const cache = await caches.open(CACHE_NAME);
  
  try {
    const response = await fetch(request);
    if (response.ok) {
      cache.put(request, response.clone());
    }
    return response;
  } catch (error) {
    console.warn('[Service Worker] Network-first fetch failed, trying cache:', request.url);
    const cached = await cache.match(request);
    
    if (cached) {
      return cached;
    }
    
    // If we're offline and have no cache for a navigation request, show offline page
    if (request.mode === 'navigate') {
      return new Response(
        `
        <!DOCTYPE html>
        <html lang="en">
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1">
            <title>Offline - Life Investment Tracker</title>
            <style>
              body {
                font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
                display: flex;
                align-items: center;
                justify-content: center;
                min-height: 100vh;
                margin: 0;
                background: #f0f6f9;
                color: #1a202c;
                text-align: center;
                padding: 1rem;
              }
              .container {
                max-width: 400px;
              }
              h1 {
                font-size: 1.5rem;
                margin-bottom: 1rem;
                color: #0891b2;
              }
              p {
                margin-bottom: 1.5rem;
                line-height: 1.6;
              }
              button {
                background: #0891b2;
                color: white;
                border: none;
                padding: 0.75rem 1.5rem;
                border-radius: 0.5rem;
                font-size: 1rem;
                cursor: pointer;
              }
              button:hover {
                background: #0e7490;
              }
            </style>
          </head>
          <body>
            <div class="container">
              <h1>You're Offline</h1>
              <p>
                It looks like you're not connected to the internet. 
                Please check your connection and try again.
              </p>
              <button onclick="window.location.reload()">Retry</button>
            </div>
          </body>
        </html>
        `,
        {
          headers: { 'Content-Type': 'text/html' },
          status: 503,
          statusText: 'Service Unavailable',
        }
      );
    }
    
    throw error;
  }
}

// Stale-while-revalidate: Return cache immediately, update cache in background
async function staleWhileRevalidate(request) {
  const cache = await caches.open(CACHE_NAME);
  const cached = await cache.match(request);
  
  // Fetch fresh version in background
  const fetchPromise = fetch(request)
    .then((response) => {
      if (response.ok) {
        cache.put(request, response.clone());
      }
      return response;
    })
    .catch((error) => {
      console.warn('[Service Worker] Background fetch failed:', request.url, error);
    });
  
  // Return cached version immediately if available
  if (cached) {
    return cached;
  }
  
  // Otherwise wait for network
  return fetchPromise;
}

