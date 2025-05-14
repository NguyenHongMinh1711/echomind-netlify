import { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Box, CircularProgress } from '@mui/material';
import './App.css';

// Context Providers
import { ThemeProvider } from './contexts/ThemeContext';
import { SupabaseProvider } from './contexts/SupabaseContext';

// Lazy-loaded components
const Home = lazy(() => import('./pages/Home'));
const Login = lazy(() => import('./pages/Login'));
const Signup = lazy(() => import('./pages/Signup'));
const Journal = lazy(() => import('./pages/Journal'));
const Chat = lazy(() => import('./pages/Chat'));
const ChatHistory = lazy(() => import('./pages/ChatHistory'));
const Resources = lazy(() => import('./pages/Resources'));
const Prompts = lazy(() => import('./pages/Prompts'));
const Settings = lazy(() => import('./pages/Settings'));
const NotFound = lazy(() => import('./components/common/NotFound'));

// Loading component
const LoadingFallback = () => (
  <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
    <CircularProgress size={60} />
  </Box>
);

function App() {
  return (
    <SupabaseProvider>
      <ThemeProvider>
        <Router>
          <Suspense fallback={<LoadingFallback />}>
            <Routes>
              {/* Home route */}
              <Route path="/" element={<Home />} />

              {/* Dashboard route */}
              <Route path="/dashboard" element={<Home />} />

              {/* Feature routes */}
              <Route path="/journal/*" element={<Journal />} />
              <Route path="/chat/history" element={<ChatHistory />} />
              <Route path="/chat/:conversationId" element={<Chat />} />
              <Route path="/chat" element={<Chat />} />
              <Route path="/resources/*" element={<Resources />} />
              <Route path="/prompts/*" element={<Prompts />} />

              {/* Auth routes */}
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/profile" element={<Settings />} />
              <Route path="/settings" element={<Settings />} />

              {/* 404 Page - This must be the last route */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </Router>
      </ThemeProvider>
    </SupabaseProvider>
  );
}

export default App;
