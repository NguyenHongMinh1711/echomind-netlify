/**
 * IndexedDB Service for offline data storage
 * 
 * This service provides methods to interact with IndexedDB for offline data storage
 * and synchronization when the app comes back online.
 */

const DB_NAME = 'echomind-offline-db';
const DB_VERSION = 1;

// Store names
const STORES = {
  JOURNALS: 'offline-journals',
  MESSAGES: 'offline-messages',
  RESOURCES: 'cached-resources',
  USER_DATA: 'user-data'
};

/**
 * Initialize the IndexedDB database
 */
export const initDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    
    request.onerror = (event) => {
      console.error('IndexedDB error:', request.error);
      reject(request.error);
    };
    
    request.onsuccess = (event) => {
      const db = request.result;
      resolve(db);
    };
    
    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      
      // Create object stores if they don't exist
      if (!db.objectStoreNames.contains(STORES.JOURNALS)) {
        db.createObjectStore(STORES.JOURNALS, { keyPath: 'id' });
      }
      
      if (!db.objectStoreNames.contains(STORES.MESSAGES)) {
        db.createObjectStore(STORES.MESSAGES, { keyPath: 'id' });
      }
      
      if (!db.objectStoreNames.contains(STORES.RESOURCES)) {
        db.createObjectStore(STORES.RESOURCES, { keyPath: 'id' });
      }
      
      if (!db.objectStoreNames.contains(STORES.USER_DATA)) {
        db.createObjectStore(STORES.USER_DATA, { keyPath: 'id' });
      }
    };
  });
};

/**
 * Save a journal entry to IndexedDB for offline storage
 */
export const saveJournalOffline = async (journal: any): Promise<void> => {
  try {
    const db = await initDB();
    const tx = db.transaction(STORES.JOURNALS, 'readwrite');
    const store = tx.objectStore(STORES.JOURNALS);
    
    await store.put(journal);
    
    // Register for background sync if available
    if ('serviceWorker' in navigator && 'SyncManager' in window) {
      const registration = await navigator.serviceWorker.ready;
      await registration.sync.register('sync-journals');
    }
    
    db.close();
  } catch (error) {
    console.error('Error saving journal offline:', error);
    throw error;
  }
};

/**
 * Get all offline journal entries
 */
export const getOfflineJournals = async (): Promise<any[]> => {
  try {
    const db = await initDB();
    const tx = db.transaction(STORES.JOURNALS, 'readonly');
    const store = tx.objectStore(STORES.JOURNALS);
    
    const journals = await store.getAll();
    
    db.close();
    return journals;
  } catch (error) {
    console.error('Error getting offline journals:', error);
    return [];
  }
};

/**
 * Save a chat message to IndexedDB for offline storage
 */
export const saveMessageOffline = async (message: any): Promise<void> => {
  try {
    const db = await initDB();
    const tx = db.transaction(STORES.MESSAGES, 'readwrite');
    const store = tx.objectStore(STORES.MESSAGES);
    
    await store.put(message);
    
    // Register for background sync if available
    if ('serviceWorker' in navigator && 'SyncManager' in window) {
      const registration = await navigator.serviceWorker.ready;
      await registration.sync.register('sync-chat-messages');
    }
    
    db.close();
  } catch (error) {
    console.error('Error saving message offline:', error);
    throw error;
  }
};

/**
 * Get all offline chat messages
 */
export const getOfflineMessages = async (): Promise<any[]> => {
  try {
    const db = await initDB();
    const tx = db.transaction(STORES.MESSAGES, 'readonly');
    const store = tx.objectStore(STORES.MESSAGES);
    
    const messages = await store.getAll();
    
    db.close();
    return messages;
  } catch (error) {
    console.error('Error getting offline messages:', error);
    return [];
  }
};

/**
 * Cache resources for offline use
 */
export const cacheResources = async (resources: any[]): Promise<void> => {
  try {
    const db = await initDB();
    const tx = db.transaction(STORES.RESOURCES, 'readwrite');
    const store = tx.objectStore(STORES.RESOURCES);
    
    // Clear existing resources
    await store.clear();
    
    // Add all resources
    for (const resource of resources) {
      await store.add(resource);
    }
    
    db.close();
  } catch (error) {
    console.error('Error caching resources:', error);
    throw error;
  }
};

/**
 * Get cached resources
 */
export const getCachedResources = async (): Promise<any[]> => {
  try {
    const db = await initDB();
    const tx = db.transaction(STORES.RESOURCES, 'readonly');
    const store = tx.objectStore(STORES.RESOURCES);
    
    const resources = await store.getAll();
    
    db.close();
    return resources;
  } catch (error) {
    console.error('Error getting cached resources:', error);
    return [];
  }
};

/**
 * Save user data for offline access
 */
export const saveUserData = async (userData: any): Promise<void> => {
  try {
    const db = await initDB();
    const tx = db.transaction(STORES.USER_DATA, 'readwrite');
    const store = tx.objectStore(STORES.USER_DATA);
    
    // Use a fixed ID for the user data
    const data = { ...userData, id: 'current-user' };
    await store.put(data);
    
    db.close();
  } catch (error) {
    console.error('Error saving user data:', error);
    throw error;
  }
};

/**
 * Get user data for offline access
 */
export const getUserData = async (): Promise<any | null> => {
  try {
    const db = await initDB();
    const tx = db.transaction(STORES.USER_DATA, 'readonly');
    const store = tx.objectStore(STORES.USER_DATA);
    
    const userData = await store.get('current-user');
    
    db.close();
    return userData || null;
  } catch (error) {
    console.error('Error getting user data:', error);
    return null;
  }
};

/**
 * Clear all offline data (useful for logout)
 */
export const clearOfflineData = async (): Promise<void> => {
  try {
    const db = await initDB();
    
    // Clear all stores except cached resources
    const tx1 = db.transaction(STORES.JOURNALS, 'readwrite');
    await tx1.objectStore(STORES.JOURNALS).clear();
    
    const tx2 = db.transaction(STORES.MESSAGES, 'readwrite');
    await tx2.objectStore(STORES.MESSAGES).clear();
    
    const tx3 = db.transaction(STORES.USER_DATA, 'readwrite');
    await tx3.objectStore(STORES.USER_DATA).clear();
    
    db.close();
  } catch (error) {
    console.error('Error clearing offline data:', error);
    throw error;
  }
};
