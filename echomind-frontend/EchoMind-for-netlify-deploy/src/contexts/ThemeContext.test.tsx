import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ThemeProvider, useTheme } from './ThemeContext';

// Mock the createAppTheme function
vi.mock('../theme', () => ({
  createAppTheme: vi.fn((mode) => ({ palette: { mode } })),
}));

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
};
Object.defineProperty(window, 'localStorage', { value: localStorageMock });

// Mock matchMedia
Object.defineProperty(window, 'matchMedia', {
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

// Test component that uses the theme context
const TestComponent = () => {
  const { darkMode, toggleDarkMode } = useTheme();
  return (
    <div>
      <div data-testid="mode">{darkMode ? 'dark' : 'light'}</div>
      <button data-testid="toggle" onClick={toggleDarkMode}>
        Toggle
      </button>
    </div>
  );
};

describe('ThemeContext', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorageMock.getItem.mockReturnValue(null);
  });

  it('should provide light theme by default when no preference is stored', () => {
    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    );

    expect(screen.getByTestId('mode')).toHaveTextContent('light');
  });

  it('should toggle theme when toggle button is clicked', () => {
    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    );

    const toggleButton = screen.getByTestId('toggle');
    fireEvent.click(toggleButton);

    expect(screen.getByTestId('mode')).toHaveTextContent('dark');
    expect(localStorageMock.setItem).toHaveBeenCalledWith('darkMode', 'true');
  });

  it('should use stored preference from localStorage', () => {
    localStorageMock.getItem.mockReturnValue('true');

    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    );

    expect(screen.getByTestId('mode')).toHaveTextContent('dark');
  });
});
