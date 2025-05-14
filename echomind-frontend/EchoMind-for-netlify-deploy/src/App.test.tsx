import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import App from './App';

// Mock all the context providers and components
vi.mock('./contexts/ThemeContext', () => ({
  ThemeProvider: ({ children }: { children: React.ReactNode }) => <div data-testid="theme-provider">{children}</div>,
}));

vi.mock('./contexts/AuthContext', () => ({
  AuthProvider: ({ children }: { children: React.ReactNode }) => <div data-testid="auth-provider">{children}</div>,
}));

vi.mock('./contexts/SupabaseContext', () => ({
  SupabaseProvider: ({ children }: { children: React.ReactNode }) => <div data-testid="supabase-provider">{children}</div>,
}));

vi.mock('./contexts/NetworkContext', () => ({
  NetworkProvider: ({ children }: { children: React.ReactNode }) => <div data-testid="network-provider">{children}</div>,
}));

vi.mock('./contexts/AnalyticsContext', () => ({
  AnalyticsProvider: ({ children }: { children: React.ReactNode }) => <div data-testid="analytics-provider">{children}</div>,
}));

vi.mock('./components/common/ErrorBoundary', () => ({
  default: ({ children }: { children: React.ReactNode }) => <div data-testid="error-boundary">{children}</div>,
}));

vi.mock('./components/common/OfflineIndicator', () => ({
  default: () => <div data-testid="offline-indicator" />,
}));

vi.mock('./components/common/AccessibilityMenu', () => ({
  default: () => <div data-testid="accessibility-menu" />,
}));

vi.mock('react-router-dom', () => ({
  BrowserRouter: ({ children }: { children: React.ReactNode }) => <div data-testid="browser-router">{children}</div>,
  Routes: ({ children }: { children: React.ReactNode }) => <div data-testid="routes">{children}</div>,
  Route: () => <div data-testid="route" />,
  Navigate: () => <div data-testid="navigate" />,
}));

vi.mock('./serviceWorkerRegistration', () => ({
  registerServiceWorker: vi.fn(),
}));

describe('App', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders without crashing', () => {
    render(<App />);
    
    // Check if all providers are rendered
    expect(screen.getByTestId('error-boundary')).toBeInTheDocument();
    expect(screen.getByTestId('supabase-provider')).toBeInTheDocument();
    expect(screen.getByTestId('theme-provider')).toBeInTheDocument();
    expect(screen.getByTestId('auth-provider')).toBeInTheDocument();
    expect(screen.getByTestId('network-provider')).toBeInTheDocument();
    expect(screen.getByTestId('browser-router')).toBeInTheDocument();
    expect(screen.getByTestId('analytics-provider')).toBeInTheDocument();
    
    // Check if components are rendered
    expect(screen.getByTestId('offline-indicator')).toBeInTheDocument();
    expect(screen.getByTestId('accessibility-menu')).toBeInTheDocument();
    expect(screen.getByTestId('routes')).toBeInTheDocument();
  });
});
