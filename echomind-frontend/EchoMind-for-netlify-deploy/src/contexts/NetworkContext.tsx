import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import SyncService from '../services/SyncService';
import { useSupabase } from './SupabaseContext';

// Define the context type
interface NetworkContextType {
  isOnline: boolean;
  isSyncing: boolean;
  lastSyncTime: Date | null;
  syncData: () => Promise<void>;
}

// Create the context
const NetworkContext = createContext<NetworkContextType | undefined>(undefined);

// Provider component
interface NetworkProviderProps {
  children: ReactNode;
}

export const NetworkProvider: React.FC<NetworkProviderProps> = ({ children }) => {
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null);
  const { supabase } = useSupabase();

  // Initialize network listeners
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      // Trigger sync when coming back online
      syncData();
    };

    const handleOffline = () => {
      setIsOnline(false);
    };

    // Add event listeners
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Initialize sync service
    SyncService.initNetworkListeners();

    // Clean up
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      SyncService.removeNetworkListeners();
    };
  }, []);

  // Sync data with backend
  const syncData = async (): Promise<void> => {
    if (!isOnline) {
      console.log('Cannot sync while offline');
      return;
    }

    try {
      setIsSyncing(true);

      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        // Pull data from Supabase to IndexedDB
        await SyncService.pullData(user.id);
        
        // Sync pending changes from IndexedDB to Supabase
        await SyncService.syncData();
        
        // Update last sync time
        setLastSyncTime(new Date());
      }
    } catch (error) {
      console.error('Error during sync:', error);
    } finally {
      setIsSyncing(false);
    }
  };

  // Context value
  const value: NetworkContextType = {
    isOnline,
    isSyncing,
    lastSyncTime,
    syncData,
  };

  return (
    <NetworkContext.Provider value={value}>
      {children}
    </NetworkContext.Provider>
  );
};

// Custom hook to use the network context
export const useNetwork = (): NetworkContextType => {
  const context = useContext(NetworkContext);
  if (context === undefined) {
    throw new Error('useNetwork must be used within a NetworkProvider');
  }
  return context;
};

export default NetworkContext;
