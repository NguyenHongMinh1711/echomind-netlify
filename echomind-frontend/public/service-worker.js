// Service Worker for EchoMind PWA

const CACHE_NAME = 'echomind-cache-v1';
const OFFLINE_URL = '/offline.html';

// Resources to cache
const RESOURCES_TO_CACHE = [
  '/',
  '/index.html',
  '/offline.html',
  '/manifest.json',
  '/favicon.ico',
  '/assets/logo.png',
  '/assets/index.css',
  '/assets/index.js'
];

// Install event - cache resources
self.addEventListener('install', (event) => {
  console.log('[Service Worker] Install');
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[Service Worker] Caching resources');
        return cache.addAll(RESOURCES_TO_CACHE);
      })
      .then(() => {
        console.log('[Service Worker] Cached resources');
        return self.skipWaiting();
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('[Service Worker] Activate');
  
  event.waitUntil(
    caches.keys().then((keyList) => {
      return Promise.all(keyList.map((key) => {
        if (key !== CACHE_NAME) {
          console.log('[Service Worker] Removing old cache', key);
          return caches.delete(key);
        }
      }));
    })
    .then(() => {
      console.log('[Service Worker] Claiming clients');
      return self.clients.claim();
    })
  );
});

// Fetch event - serve from cache or network
self.addEventListener('fetch', (event) => {
  // Skip cross-origin requests
  if (!event.request.url.startsWith(self.location.origin)) {
    return;
  }
  
  // Skip Supabase API requests (let them go directly to network)
  if (event.request.url.includes('supabase.co')) {
    return;
  }
  
  // Handle API requests differently - network first, then offline response
  if (event.request.url.includes('/api/')) {
    event.respondWith(
      fetch(event.request)
        .catch(() => {
          return new Response(
            JSON.stringify({ error: 'You are offline' }),
            {
              status: 503,
              headers: { 'Content-Type': 'application/json' }
            }
          );
        })
    );
    return;
  }
  
  // For navigation requests (HTML pages), use network first strategy
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .catch(() => {
          return caches.match(OFFLINE_URL);
        })
    );
    return;
  }
  
  // For other requests, use cache first, falling back to network
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Cache hit - return the response
        if (response) {
          return response;
        }
        
        // Clone the request because it's a one-time use stream
        const fetchRequest = event.request.clone();
        
        return fetch(fetchRequest)
          .then((response) => {
            // Check if we received a valid response
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }
            
            // Clone the response because it's a one-time use stream
            const responseToCache = response.clone();
            
            // Cache the fetched resource
            caches.open(CACHE_NAME)
              .then((cache) => {
                cache.put(event.request, responseToCache);
              });
            
            return response;
          })
          .catch(() => {
            // If both cache and network fail, return offline page for HTML
            if (event.request.headers.get('Accept').includes('text/html')) {
              return caches.match(OFFLINE_URL);
            }
          });
      })
  );
});

// Background sync for offline data
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-journals') {
    event.waitUntil(syncJournals());
  } else if (event.tag === 'sync-chat-messages') {
    event.waitUntil(syncChatMessages());
  }
});

// Function to sync journals when back online
async function syncJournals() {
  try {
    const db = await openIndexedDB();
    const tx = db.transaction('offline-journals', 'readwrite');
    const store = tx.objectStore('offline-journals');
    
    const journals = await store.getAll();
    
    for (const journal of journals) {
      try {
        // Attempt to send to server
        const response = await fetch('/api/journals', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(journal)
        });
        
        if (response.ok) {
          // If successful, remove from IndexedDB
          await store.delete(journal.id);
        }
      } catch (error) {
        console.error('Failed to sync journal:', error);
      }
    }
    
    db.close();
  } catch (error) {
    console.error('Error syncing journals:', error);
  }
}

// Function to sync chat messages when back online
async function syncChatMessages() {
  try {
    const db = await openIndexedDB();
    const tx = db.transaction('offline-messages', 'readwrite');
    const store = tx.objectStore('offline-messages');
    
    const messages = await store.getAll();
    
    for (const message of messages) {
      try {
        // Attempt to send to server
        const response = await fetch('/api/chat/messages', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(message)
        });
        
        if (response.ok) {
          // If successful, remove from IndexedDB
          await store.delete(message.id);
        }
      } catch (error) {
        console.error('Failed to sync message:', error);
      }
    }
    
    db.close();
  } catch (error) {
    console.error('Error syncing messages:', error);
  }
}

// Helper function to open IndexedDB
function openIndexedDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('echomind-offline-db', 1);
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
    
    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      
      // Create object stores if they don't exist
      if (!db.objectStoreNames.contains('offline-journals')) {
        db.createObjectStore('offline-journals', { keyPath: 'id' });
      }
      
      if (!db.objectStoreNames.contains('offline-messages')) {
        db.createObjectStore('offline-messages', { keyPath: 'id' });
      }
    };
  });
}
