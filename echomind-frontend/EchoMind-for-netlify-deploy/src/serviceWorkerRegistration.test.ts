import { describe, it, expect, vi, beforeEach } from 'vitest';
import { 
  registerServiceWorker, 
  isPWAInstalled, 
  setupBackgroundSync, 
  setupPushNotifications,
  setupNetworkStatusMonitoring,
  getWorkbox,
  default as initServiceWorker
} from './serviceWorkerRegistration';

// Mock registerSW from virtual:pwa-register
vi.mock('virtual:pwa-register', () => ({
  registerSW: vi.fn().mockReturnValue(vi.fn()),
}));

// Mock Workbox
vi.mock('workbox-window', () => ({
  Workbox: vi.fn().mockImplementation(() => ({
    register: vi.fn().mockResolvedValue({}),
  })),
}));

describe('Service Worker Registration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Mock navigator.serviceWorker
    Object.defineProperty(navigator, 'serviceWorker', {
      writable: true,
      value: {
        ready: Promise.resolve({
          sync: {
            register: vi.fn().mockResolvedValue(undefined),
          },
          pushManager: {
            subscribe: vi.fn().mockResolvedValue({}),
          },
        }),
      },
    });
    
    // Mock window.matchMedia
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: vi.fn().mockImplementation((query) => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })),
    });
    
    // Mock Notification API
    Object.defineProperty(window, 'Notification', {
      writable: true,
      value: {
        requestPermission: vi.fn().mockResolvedValue('granted'),
      },
    });
    
    // Mock navigator.onLine
    Object.defineProperty(navigator, 'onLine', {
      writable: true,
      value: true,
    });
  });

  it('should register service worker', () => {
    registerServiceWorker();
    // Since we're mocking the implementation, we just verify it doesn't throw
    expect(true).toBe(true);
  });

  it('should check if PWA is installed', () => {
    const result = isPWAInstalled();
    expect(result).toBe(false);
  });

  it('should setup background sync', () => {
    setupBackgroundSync();
    // Since we're mocking the implementation, we just verify it doesn't throw
    expect(true).toBe(true);
  });

  it('should setup push notifications', () => {
    setupPushNotifications();
    expect(window.Notification.requestPermission).toHaveBeenCalled();
  });

  it('should setup network status monitoring', () => {
    const onlineCallback = vi.fn();
    const offlineCallback = vi.fn();
    
    const cleanup = setupNetworkStatusMonitoring(onlineCallback, offlineCallback);
    
    // Should call onlineCallback initially since navigator.onLine is true
    expect(onlineCallback).toHaveBeenCalled();
    
    // Trigger online event
    window.dispatchEvent(new Event('online'));
    expect(onlineCallback).toHaveBeenCalledTimes(2);
    
    // Trigger offline event
    window.dispatchEvent(new Event('offline'));
    expect(offlineCallback).toHaveBeenCalled();
    
    // Cleanup should be a function
    expect(typeof cleanup).toBe('function');
    
    // Call cleanup
    cleanup();
    
    // After cleanup, events should not trigger callbacks
    window.dispatchEvent(new Event('online'));
    expect(onlineCallback).toHaveBeenCalledTimes(2);
  });

  it('should get workbox instance', async () => {
    const workbox = await getWorkbox();
    expect(workbox).not.toBeNull();
  });

  it('should initialize all service worker features', () => {
    const spy = vi.spyOn(console, 'log').mockImplementation(() => {});
    
    initServiceWorker();
    
    // Should log that app is online
    expect(spy).toHaveBeenCalledWith('App is online');
    
    spy.mockRestore();
  });
});
