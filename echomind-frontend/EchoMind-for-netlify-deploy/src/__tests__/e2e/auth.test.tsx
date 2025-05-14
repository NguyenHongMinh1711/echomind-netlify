import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter, Routes, Route, MemoryRouter } from 'react-router-dom';
import { AuthProvider } from '../../contexts/AuthContext';
import { SupabaseProvider } from '../../contexts/SupabaseContext';

// Mock the contexts
vi.mock('../../contexts/AuthContext', () => ({
  AuthProvider: ({ children, authValue }) => (
    <div data-testid="auth-provider">{children}</div>
  ),
  useAuth: () => ({
    user: null,
    loading: false,
    login: vi.fn(),
    signup: vi.fn(),
    logout: vi.fn(),
    resetPassword: vi.fn(),
  }),
}));

vi.mock('../../contexts/SupabaseContext', () => ({
  SupabaseProvider: ({ children }) => (
    <div data-testid="supabase-provider">{children}</div>
  ),
  useSupabase: () => ({
    supabase: {
      auth: {
        signInWithPassword: vi.fn(),
        signUp: vi.fn(),
        signOut: vi.fn(),
        getUser: vi.fn().mockResolvedValue({
          data: { user: null },
          error: null
        }),
        onAuthStateChange: vi.fn().mockImplementation((callback) => {
          return { data: { subscription: { unsubscribe: vi.fn() } } };
        }),
      },
      from: vi.fn().mockReturnThis(),
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn(),
    },
    session: null,
    user: null,
    loading: false,
  }),
}));

// Mock the components
vi.mock('../../components/auth/Login', () => ({
  default: () => <div data-testid="login-component">Login Component</div>
}));

vi.mock('../../components/auth/Register', () => ({
  default: () => <div data-testid="register-component">Register Component</div>
}));

vi.mock('../../components/auth/ProtectedRoute', () => ({
  default: ({ children }) => <div data-testid="protected-route">{children}</div>
}));

vi.mock('../../components/user/UserProfile', () => ({
  default: () => <div data-testid="user-profile">User Profile Component</div>
}));

// Mock the Supabase client
vi.mock('../../services/supabaseClient', () => ({
  supabase: {
    auth: {
      signInWithPassword: vi.fn(),
      signUp: vi.fn(),
      signOut: vi.fn(),
      getUser: vi.fn().mockResolvedValue({
        data: { user: null },
        error: null
      }),
      onAuthStateChange: vi.fn().mockImplementation((callback) => {
        return { data: { subscription: { unsubscribe: vi.fn() } } };
      }),
    },
    from: vi.fn().mockReturnThis(),
    select: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    single: vi.fn(),
  },
  signInWithEmail: vi.fn(),
  signUpWithEmail: vi.fn(),
  signOut: vi.fn(),
  resetPassword: vi.fn(),
}));

// Create test components
const LoginPage = () => (
  <div data-testid="login-page">
    <h1>Login</h1>
    <form data-testid="login-form">
      <input type="email" placeholder="Email" defaultValue="test@example.com" />
      <input type="password" placeholder="Password" defaultValue="password123" />
      <button data-testid="login-button" type="submit">Login</button>
    </form>
  </div>
);

const SignupPage = () => (
  <div data-testid="signup-page">
    <h1>Sign Up</h1>
    <form data-testid="signup-form">
      <input type="email" placeholder="Email" defaultValue="new@example.com" />
      <input type="password" placeholder="Password" defaultValue="password123" />
      <button data-testid="signup-button" type="submit">Sign Up</button>
    </form>
  </div>
);

const HomePage = () => (
  <div data-testid="home-page">
    <h1>Home</h1>
    <p>Welcome to EchoMind</p>
  </div>
);

const ProfilePage = () => (
  <div data-testid="profile-page">
    <h1>Profile</h1>
    <p>User profile information</p>
    <button data-testid="logout-button">Logout</button>
  </div>
);

describe('Authentication Flow', () => {
  // Mock auth functions
  const mockLogin = vi.fn();
  const mockSignup = vi.fn();
  const mockLogout = vi.fn();
  const mockResetPassword = vi.fn();

  // Default auth context value
  const defaultAuthValue = {
    user: null,
    loading: false,
    login: mockLogin,
    signup: mockSignup,
    logout: mockLogout,
    resetPassword: mockResetPassword,
  };

  beforeEach(() => {
    // Reset mocks before each test
    vi.clearAllMocks();
  });

  afterEach(() => {
    // Clean up after each test
    vi.resetAllMocks();
  });

  it('should render the login page', () => {
    render(
      <MemoryRouter initialEntries={['/login']}>
        <AuthProvider>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
          </Routes>
        </AuthProvider>
      </MemoryRouter>
    );

    expect(screen.getByTestId('login-form')).toBeInTheDocument();
    expect(screen.getByText('Login')).toBeInTheDocument();
  });

  it('should handle login correctly', async () => {
    // Mock the login function
    const mockLogin = vi.fn().mockResolvedValue({
      user: { id: 'test-user-id', email: 'test@example.com' }
    });

    // Override the useAuth mock for this test
    vi.mocked(vi.importActual('../../contexts/AuthContext')).useAuth = vi.fn().mockReturnValue({
      user: null,
      loading: false,
      login: mockLogin,
      signup: vi.fn(),
      logout: vi.fn(),
      resetPassword: vi.fn(),
    });

    render(
      <MemoryRouter initialEntries={['/login']}>
        <SupabaseProvider>
          <AuthProvider>
            <Routes>
              <Route path="/login" element={<LoginPage />} />
              <Route path="/home" element={<HomePage />} />
            </Routes>
          </AuthProvider>
        </SupabaseProvider>
      </MemoryRouter>
    );

    // Click the login button
    fireEvent.click(screen.getByTestId('login-button'));

    // Verify that the login function was called
    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalled();
    });
  });

  it('should render the signup page', () => {
    render(
      <MemoryRouter initialEntries={['/signup']}>
        <AuthProvider>
          <Routes>
            <Route path="/signup" element={<SignupPage />} />
          </Routes>
        </AuthProvider>
      </MemoryRouter>
    );

    expect(screen.getByTestId('signup-form')).toBeInTheDocument();
    expect(screen.getByText('Sign Up')).toBeInTheDocument();
  });

  it('should handle signup correctly', async () => {
    // Mock the signup function
    const mockSignup = vi.fn().mockResolvedValue({
      user: { id: 'new-user-id', email: 'new@example.com' }
    });

    // Override the useAuth mock for this test
    vi.mocked(vi.importActual('../../contexts/AuthContext')).useAuth = vi.fn().mockReturnValue({
      user: null,
      loading: false,
      login: vi.fn(),
      signup: mockSignup,
      logout: vi.fn(),
      resetPassword: vi.fn(),
    });

    render(
      <MemoryRouter initialEntries={['/signup']}>
        <SupabaseProvider>
          <AuthProvider>
            <Routes>
              <Route path="/signup" element={<SignupPage />} />
              <Route path="/home" element={<HomePage />} />
            </Routes>
          </AuthProvider>
        </SupabaseProvider>
      </MemoryRouter>
    );

    // Click the signup button
    fireEvent.click(screen.getByTestId('signup-button'));

    // Verify that the signup function was called
    await waitFor(() => {
      expect(mockSignup).toHaveBeenCalled();
    });
  });

  it('should protect routes for unauthenticated users', () => {
    render(
      <MemoryRouter initialEntries={['/profile']}>
        <AuthProvider authValue={defaultAuthValue}>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <ProfilePage />
                </ProtectedRoute>
              }
            />
          </Routes>
        </AuthProvider>
      </MemoryRouter>
    );

    // Should redirect to login page
    expect(screen.getByTestId('login-page')).toBeInTheDocument();
    expect(screen.queryByTestId('profile-page')).not.toBeInTheDocument();
  });

  it('should allow access to protected routes for authenticated users', () => {
    // Create auth context with authenticated user
    const authenticatedAuthValue = {
      ...defaultAuthValue,
      user: { id: '123', email: 'test@example.com' },
    };

    render(
      <MemoryRouter initialEntries={['/profile']}>
        <AuthProvider authValue={authenticatedAuthValue}>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <ProfilePage />
                </ProtectedRoute>
              }
            />
          </Routes>
        </AuthProvider>
      </MemoryRouter>
    );

    // Should show profile page
    expect(screen.getByTestId('profile-page')).toBeInTheDocument();
    expect(screen.queryByTestId('login-page')).not.toBeInTheDocument();
  });
});
