import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Mock the environment variables
vi.mock('import.meta.env', () => ({
  VITE_SUPABASE_URL: 'https://test-supabase-url.com',
  VITE_SUPABASE_ANON_KEY: 'test-anon-key',
  VITE_GEMINI_API_KEY: 'test-gemini-api-key',
  VITE_APP_ENV: 'test',
  MODE: 'test'
}));

// Mock the service worker registration
Object.defineProperty(window, 'navigator', {
  value: {
    ...window.navigator,
    serviceWorker: {
      register: vi.fn().mockResolvedValue({ scope: '/' })
    }
  },
  writable: true
});

// Mock the Intersection Observer
class MockIntersectionObserver {
  observe = vi.fn();
  unobserve = vi.fn();
  disconnect = vi.fn();
  constructor() {}
}

Object.defineProperty(window, 'IntersectionObserver', {
  value: MockIntersectionObserver,
  writable: true
});

// Mock the ResizeObserver
class MockResizeObserver {
  observe = vi.fn();
  unobserve = vi.fn();
  disconnect = vi.fn();
  constructor() {}
}

Object.defineProperty(window, 'ResizeObserver', {
  value: MockResizeObserver,
  writable: true
});

// Mock fetch
global.fetch = vi.fn().mockImplementation(() => 
  Promise.resolve({
    json: () => Promise.resolve({}),
    ok: true,
    status: 200,
    text: () => Promise.resolve(''),
    blob: () => Promise.resolve(new Blob())
  })
);

// Mock IndexedDB
const indexedDB = {
  open: vi.fn().mockReturnValue({
    result: {
      transaction: vi.fn().mockReturnValue({
        objectStore: vi.fn().mockReturnValue({
          put: vi.fn(),
          get: vi.fn(),
          getAll: vi.fn().mockResolvedValue([]),
          clear: vi.fn()
        })
      }),
      createObjectStore: vi.fn(),
      objectStoreNames: {
        contains: vi.fn().mockReturnValue(true)
      },
      close: vi.fn()
    },
    onupgradeneeded: null,
    onsuccess: null,
    onerror: null
  })
};

Object.defineProperty(window, 'indexedDB', {
  value: indexedDB,
  writable: true
});

// Clean up mocks after each test
afterEach(() => {
  vi.clearAllMocks();
});
