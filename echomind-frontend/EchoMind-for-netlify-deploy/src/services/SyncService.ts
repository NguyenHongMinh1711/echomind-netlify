/**
 * Sync Service
 *
 * This service handles bidirectional synchronization between the local IndexedDB database
 * and the Supabase backend. It ensures data consistency when the application
 * goes offline and comes back online.
 *
 * Key features:
 * - Detects network status changes and triggers sync automatically
 * - Queues operations while offline for later synchronization
 * - Pulls remote data to local storage when coming online
 * - Pushes local changes to the remote database
 * - Handles conflicts with a "last write wins" strategy
 *
 * The sync process follows these steps:
 * 1. When a user performs an action, it's saved to IndexedDB
 * 2. If online, the change is immediately pushed to Supabase
 * 3. If offline, the change is marked for sync and queued
 * 4. When the app comes back online, all queued changes are processed
 * 5. Periodically, data is pulled from Supabase to ensure consistency
 */

import { supabase } from './SupabaseService';
import * as IndexedDBService from './IndexedDBService';
import { STORES } from './IndexedDBService';

// Types for sync operations
interface SyncOperation {
  id: string;
  operation: 'add' | 'update' | 'delete';
  store_name: string;
  data: any;
  timestamp: number;
  attempts: number;
}

// Network status tracking
let isOnline = navigator.onLine;

// Initialize network status listeners
export const initNetworkListeners = () => {
  window.addEventListener('online', handleOnline);
  window.addEventListener('offline', handleOffline);
};

// Remove network status listeners
export const removeNetworkListeners = () => {
  window.removeEventListener('online', handleOnline);
  window.removeEventListener('offline', handleOffline);
};

// Handle online event
const handleOnline = () => {
  console.log('App is online. Starting sync...');
  isOnline = true;
  syncData();
};

// Handle offline event
const handleOffline = () => {
  console.log('App is offline. Data will be synced when connection is restored.');
  isOnline = false;
};

/**
 * Check if the application is online
 */
export const checkOnlineStatus = (): boolean => {
  return isOnline;
};

/**
 * Synchronize data between IndexedDB and Supabase
 *
 * This function is the core of the sync process. It:
 * 1. Retrieves all pending operations from IndexedDB
 * 2. Processes each operation in sequence (to maintain order)
 * 3. Removes successfully processed operations from the queue
 * 4. Handles errors for individual operations without failing the entire sync
 *
 * The function is called:
 * - Automatically when the app comes online
 * - Manually when the user triggers a sync
 * - Periodically by the NetworkContext
 *
 * @returns {Promise<void>} A promise that resolves when sync is complete
 */
export const syncData = async (): Promise<void> => {
  // Safety check - don't attempt to sync while offline
  if (!isOnline) {
    console.log('Cannot sync while offline');
    return;
  }

  try {
    // Get all pending sync operations from IndexedDB
    // These are operations that were performed while offline
    const pendingOperations = await IndexedDBService.getPendingSyncOperations();

    // If there's nothing to sync, exit early
    if (pendingOperations.length === 0) {
      console.log('No pending operations to sync');
      return;
    }

    console.log(`Found ${pendingOperations.length} operations to sync`);

    // Process each operation in sequence to maintain order
    // This is important for operations that depend on each other
    for (const operation of pendingOperations) {
      try {
        // Process the operation based on its type and store
        await processSyncOperation(operation);

        // Remove the operation from the queue after successful processing
        // This prevents duplicate processing if sync is triggered again
        await IndexedDBService.removeSyncOperation(operation.id);
      } catch (error) {
        // Log the error but continue processing other operations
        // This ensures one failed operation doesn't block the entire sync
        console.error(`Failed to process sync operation ${operation.id}:`, error);

        // TODO: Implement retry logic with exponential backoff
        // Increment attempt count and update the operation
        // If attempts > MAX_ATTEMPTS, mark as failed or notify user
      }
    }

    console.log('Sync completed successfully');
  } catch (error) {
    // This catches errors in the sync process itself, not individual operations
    console.error('Error during sync:', error);
  }
};

/**
 * Process a single sync operation
 */
const processSyncOperation = async (operation: any): Promise<void> => {
  const { operation: opType, store_name: storeName, data } = operation;

  console.log(`Processing ${opType} operation for ${storeName}`);

  switch (storeName) {
    case STORES.JOURNALS:
      await syncJournal(opType, data);
      break;
    case STORES.CHAT_MESSAGES:
      await syncChatMessage(opType, data);
      break;
    default:
      console.warn(`Unknown store: ${storeName}`);
  }
};

/**
 * Sync a journal entry
 */
const syncJournal = async (opType: string, data: any): Promise<void> => {
  switch (opType) {
    case 'add':
    case 'update':
      // Remove local-only fields
      const { sync_status, ...journalData } = data;

      // Update or insert the journal in Supabase
      const { error } = await supabase
        .from('journals')
        .upsert(journalData, { onConflict: 'id' });

      if (error) {
        throw error;
      }

      // Update the sync status in IndexedDB
      await IndexedDBService.updateSyncStatus(STORES.JOURNALS, data.id, 'synced');
      break;

    case 'delete':
      // Delete the journal from Supabase
      const { error: deleteError } = await supabase
        .from('journals')
        .delete()
        .eq('id', data.id);

      if (deleteError) {
        throw deleteError;
      }
      break;
  }
};

/**
 * Sync a chat message
 */
const syncChatMessage = async (opType: string, data: any): Promise<void> => {
  switch (opType) {
    case 'add':
    case 'update':
      // Remove local-only fields
      const { sync_status, ...messageData } = data;

      // Update or insert the message in Supabase
      const { error } = await supabase
        .from('chat_messages')
        .upsert(messageData, { onConflict: 'id' });

      if (error) {
        throw error;
      }

      // Update the sync status in IndexedDB
      await IndexedDBService.updateSyncStatus(STORES.CHAT_MESSAGES, data.id, 'synced');
      break;

    case 'delete':
      // Delete the message from Supabase
      const { error: deleteError } = await supabase
        .from('chat_messages')
        .delete()
        .eq('id', data.id);

      if (deleteError) {
        throw deleteError;
      }
      break;
  }
};

/**
 * Pull data from Supabase to IndexedDB
 *
 * This function fetches the latest data from Supabase and stores it in IndexedDB.
 * It's essential for:
 * - Initial data loading when the app starts
 * - Refreshing local data when coming back online
 * - Ensuring the user has the most recent data
 *
 * The function follows these steps:
 * 1. Fetch all journals for the user
 * 2. Store them in IndexedDB with 'synced' status
 * 3. Fetch all chat sessions for the user
 * 4. For each chat session, fetch all messages
 * 5. Store all messages in IndexedDB with 'synced' status
 *
 * Note: This uses a "last write wins" strategy. If there are conflicts
 * between local and remote data, the remote data will overwrite local changes.
 * To prevent data loss, always call syncData() before pullData().
 *
 * @param {string} userId - The ID of the current user
 * @returns {Promise<void>} A promise that resolves when pull is complete
 */
export const pullData = async (userId: string): Promise<void> => {
  // Safety check - we need a user ID to fetch user-specific data
  if (!userId) {
    console.warn('Cannot pull data without a user ID');
    return;
  }

  try {
    // Step 1: Pull all journals for the current user
    // This gets all journal entries that belong to this user
    const { data: journals, error: journalsError } = await supabase
      .from('journals')
      .select('*')
      .eq('user_id', userId);

    // Handle errors from the journals query
    if (journalsError) {
      throw journalsError;
    }

    // Step 2: Store all journals in IndexedDB
    // For each journal, mark it as synced and save to local storage
    for (const journal of journals || []) {
      // Add sync_status field to indicate this data is in sync with the server
      // This prevents it from being unnecessarily synced back to the server
      journal.sync_status = 'synced';
      await IndexedDBService.updateItem(STORES.JOURNALS, journal);
    }

    // Step 3: Pull all chat sessions for the current user
    // We only need the IDs to fetch messages for each chat
    const { data: chats, error: chatsError } = await supabase
      .from('chat_sessions')
      .select('id')
      .eq('user_id', userId);

    // Handle errors from the chat sessions query
    if (chatsError) {
      throw chatsError;
    }

    // Step 4: For each chat session, fetch all messages
    for (const chat of chats || []) {
      const { data: messages, error: messagesError } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('chat_id', chat.id);

      // Handle errors from the messages query
      if (messagesError) {
        throw messagesError;
      }

      // Step 5: Store all messages in IndexedDB
      for (const message of messages || []) {
        // Mark as synced to prevent unnecessary sync back to server
        message.sync_status = 'synced';
        await IndexedDBService.updateItem(STORES.CHAT_MESSAGES, message);
      }
    }

    console.log('Data pull completed successfully');
  } catch (error) {
    // Log any errors that occurred during the pull process
    console.error('Error during data pull:', error);
    // In a production app, we might want to notify the user or retry
  }
};

// Export default object
export default {
  initNetworkListeners,
  removeNetworkListeners,
  checkOnlineStatus,
  syncData,
  pullData,
};
