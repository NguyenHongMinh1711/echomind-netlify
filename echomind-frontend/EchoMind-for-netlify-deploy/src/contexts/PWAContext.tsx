import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import * as PWAService from '../services/PWAService';

// Define the context type
interface PWAContextType {
  isInstalled: boolean;
  canInstall: boolean;
  needsRefresh: boolean;
  promptInstall: () => Promise<boolean>;
  updateServiceWorker: () => Promise<boolean>;
}

// Create the context
const PWAContext = createContext<PWAContextType | undefined>(undefined);

// Provider component
interface PWAProviderProps {
  children: ReactNode;
}

export const PWAProvider: React.FC<PWAProviderProps> = ({ children }) => {
  const [isInstalled, setIsInstalled] = useState<boolean>(false);
  const [canInstall, setCanInstall] = useState<boolean>(false);
  const [needsRefresh, setNeedsRefresh] = useState<boolean>(false);

  // Initialize PWA service and subscribe to status changes
  useEffect(() => {
    // Initialize the PWA service
    PWAService.initPWA();

    // Subscribe to status changes
    const unsubscribe = PWAService.subscribeToPWAStatus((status) => {
      setIsInstalled(status.isInstalled);
      setCanInstall(status.canInstall);
      setNeedsRefresh(status.needsRefresh);
    });

    // Clean up subscription
    return () => {
      unsubscribe();
    };
  }, []);

  // Prompt the user to install the app
  const promptInstall = async (): Promise<boolean> => {
    return await PWAService.promptInstall();
  };

  // Update the service worker
  const updateServiceWorker = async (): Promise<boolean> => {
    return await PWAService.updateServiceWorker();
  };

  // Context value
  const value: PWAContextType = {
    isInstalled,
    canInstall,
    needsRefresh,
    promptInstall,
    updateServiceWorker,
  };

  return (
    <PWAContext.Provider value={value}>
      {children}
    </PWAContext.Provider>
  );
};

// Custom hook to use the PWA context
export const usePWA = (): PWAContextType => {
  const context = useContext(PWAContext);
  if (context === undefined) {
    throw new Error('usePWA must be used within a PWAProvider');
  }
  return context;
};

export default PWAContext;
