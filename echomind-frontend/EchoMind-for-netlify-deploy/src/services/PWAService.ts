/**
 * PWA Service
 *
 * This service handles the registration and management of the service worker
 * for Progressive Web App functionality. It provides a unified interface for:
 *
 * - Detecting if the app is installed or can be installed
 * - Prompting the user to install the app
 * - Managing service worker updates
 * - Notifying the app when updates are available
 * - Communicating with the service worker
 *
 * The service uses the Vite PWA plugin's registerSW function to register
 * the service worker and handle its lifecycle events. It also provides
 * a subscription mechanism for components to react to PWA status changes.
 */

import { registerSW } from 'virtual:pwa-register';
import { Workbox, messageSW } from 'workbox-window';

/**
 * Interface for the BeforeInstallPromptEvent
 * This is not yet standardized in TypeScript, so we define it here
 */
interface BeforeInstallPromptEvent extends Event {
  /**
   * Returns a Promise that resolves to a DOMString,
   * one of: 'accepted' or 'dismissed'.
   */
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;

  /**
   * Allows a developer to show the install prompt at a time of their own choosing.
   * This method returns a Promise.
   */
  prompt(): Promise<void>;
}

/**
 * Interface representing the current status of the PWA
 */
interface PWAStatus {
  /** Whether the app is already installed as a PWA */
  isInstalled: boolean;

  /** Whether the app can be installed (install prompt available) */
  canInstall: boolean;

  /** Whether a new version of the app is available */
  needsRefresh: boolean;

  /** The service worker registration object */
  registration: ServiceWorkerRegistration | null;

  /** Function to update the service worker */
  updateFunction: (() => Promise<void>) | null;
}

// Event listeners
let installPromptEvent: BeforeInstallPromptEvent | null = null;
let listeners: Array<(status: PWAStatus) => void> = [];

// Initial status
const status: PWAStatus = {
  isInstalled: false,
  canInstall: false,
  needsRefresh: false,
  registration: null,
  updateFunction: null,
};

/**
 * Initialize the PWA service
 *
 * This function sets up the PWA environment by:
 * 1. Detecting if the app is already installed
 * 2. Setting up listeners for installation events
 * 3. Registering the service worker
 * 4. Configuring update checks and notifications
 *
 * It should be called as early as possible in the application lifecycle,
 * typically in the main entry point or in a context provider.
 */
export const initPWA = (): void => {
  // Step 1: Check if the app is already installed as a PWA
  // This uses two methods:
  // - display-mode: standalone - Works on Chrome, Edge, etc.
  // - navigator.standalone - Works on Safari iOS
  if (window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone === true) {
    status.isInstalled = true;
  }

  // Step 2: Listen for the beforeinstallprompt event
  // This event is fired when the app can be installed
  // It's only fired if the app meets the installability criteria:
  // - Has a web manifest with required fields
  // - Served over HTTPS
  // - Has a registered service worker
  // - Meets other browser-specific criteria
  window.addEventListener('beforeinstallprompt', (e) => {
    // Prevent the default browser install prompt
    // This allows us to show our custom prompt later
    e.preventDefault();

    // Store the event for later use when the user clicks "Install"
    installPromptEvent = e as BeforeInstallPromptEvent;

    // Update status to indicate the app can be installed
    status.canInstall = true;

    // Notify all listeners about the status change
    notifyListeners();
  });

  // Step 3: Register the service worker if supported
  if ('serviceWorker' in navigator) {
    // Use the Vite PWA plugin's registerSW function
    // This handles the registration and provides lifecycle callbacks
    const updateSW = registerSW({
      // Called when a new service worker has been installed and waiting to activate
      // This means a new version of the app is available
      onNeedRefresh() {
        // Update status to indicate a refresh is needed
        status.needsRefresh = true;

        // Create a function to apply the update when the user confirms
        status.updateFunction = async () => {
          // This triggers the waiting service worker to become active
          await updateSW(true);

          // Reset the refresh flag after update
          status.needsRefresh = false;

          // Notify listeners that the update is complete
          notifyListeners();
        };

        // Notify listeners that an update is available
        notifyListeners();
      },

      // Called when the service worker is ready for offline use
      // This means the app has been successfully cached
      onOfflineReady() {
        console.log('App is ready for offline use');
        // We could notify the user here if desired
      },

      // Called when the service worker has been successfully registered
      onRegistered(registration) {
        // Store the registration for later use
        status.registration = registration;

        if (registration) {
          // Set up periodic update checks
          // This ensures the app stays up-to-date even during long sessions
          setInterval(() => {
            // Check for updates every hour
            registration.update().catch(console.error);
          }, 60 * 60 * 1000); // 60 minutes * 60 seconds * 1000 milliseconds
        }
      },

      // Called when there's an error registering the service worker
      onRegisterError(error) {
        console.error('Service worker registration error:', error);
        // We could notify the user here if desired
      },
    });

    // Step 4: Handle service worker lifecycle events
    // The controllerchange event fires when a new service worker takes control
    // This happens after a successful update
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      console.log('Service worker controller changed');
      // The page has a new service worker controller
      // At this point, the new version of the app is active
    });
  }
};

/**
 * Subscribe to PWA status changes
 */
export const subscribeToPWAStatus = (callback: (status: PWAStatus) => void): () => void => {
  listeners.push(callback);

  // Call the callback immediately with the current status
  callback({ ...status });

  // Return an unsubscribe function
  return () => {
    listeners = listeners.filter(listener => listener !== callback);
  };
};

/**
 * Notify all listeners of status changes
 */
const notifyListeners = (): void => {
  listeners.forEach(listener => listener({ ...status }));
};

/**
 * Prompt the user to install the app
 *
 * This function triggers the browser's native install prompt using the
 * stored BeforeInstallPromptEvent. It should be called in response to
 * a user action (like clicking an "Install" button) for the best user experience.
 *
 * The function handles the entire installation flow:
 * 1. Shows the browser's install prompt
 * 2. Waits for the user's response
 * 3. Updates the PWA status based on the outcome
 * 4. Notifies all listeners of the status change
 *
 * @returns {Promise<boolean>} A promise that resolves to true if the app was installed,
 *                            false if the installation was rejected or failed
 */
export const promptInstall = async (): Promise<boolean> => {
  // Safety check: ensure we have a valid install prompt event
  // If not, the app can't be installed right now
  if (!installPromptEvent) {
    console.warn('No install prompt event available. The app cannot be installed right now.');
    return false;
  }

  try {
    // Step 1: Show the browser's native install prompt
    // This displays the browser's built-in PWA installation dialog
    await installPromptEvent.prompt();

    // Step 2: Wait for the user's response to the prompt
    // This promise resolves when the user either accepts or dismisses the prompt
    const choiceResult = await installPromptEvent.userChoice;

    // Step 3: Clean up and update status
    // Clear the stored event since it can only be used once
    installPromptEvent = null;

    // Update the status to reflect that the app can no longer be installed
    // (at least until the next beforeinstallprompt event)
    status.canInstall = false;

    // If the user accepted, the app is now installed
    // We'll detect this on the next page load via display-mode

    // Step 4: Notify all listeners of the status change
    notifyListeners();

    // Return true if the user accepted the installation, false otherwise
    const wasInstalled = choiceResult.outcome === 'accepted';

    // Log the outcome for debugging
    console.log(`Installation ${wasInstalled ? 'accepted' : 'rejected'} by user`);

    return wasInstalled;
  } catch (error) {
    // Handle any errors that occurred during the installation process
    console.error('Error prompting for install:', error);

    // Return false to indicate the installation failed
    return false;
  }
};

/**
 * Update the service worker
 */
export const updateServiceWorker = async (): Promise<boolean> => {
  if (status.updateFunction) {
    try {
      await status.updateFunction();
      return true;
    } catch (error) {
      console.error('Error updating service worker:', error);
      return false;
    }
  }
  return false;
};

/**
 * Send a message to the service worker
 */
export const sendMessageToSW = async (message: any): Promise<any> => {
  if (!status.registration || !status.registration.active) {
    return null;
  }

  try {
    return await messageSW(status.registration.active, message);
  } catch (error) {
    console.error('Error sending message to service worker:', error);
    return null;
  }
};

// Export default object
export default {
  initPWA,
  subscribeToPWAStatus,
  promptInstall,
  updateServiceWorker,
  sendMessageToSW,
};
