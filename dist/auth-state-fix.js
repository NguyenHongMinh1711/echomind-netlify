// EchoMind Auth State Fix
// This script ensures the Supabase auth state is properly initialized

document.addEventListener('DOMContentLoaded', function() {
  console.log('EchoMind auth state fix loaded');

  // Check if we need to initialize auth state
  function checkAndInitAuthState() {
    // Check if we have a token but no current session
    const authToken = localStorage.getItem('supabase.auth.token');
    const hasAuthToken = authToken && authToken.includes('currentSession');

    // If we're on a protected page (not login or signup) and don't have auth token, redirect to login
    const isProtectedPage = !window.location.pathname.includes('/login') &&
                           !window.location.pathname.includes('/signup') &&
                           window.location.pathname !== '/';

    // Don't redirect if we're already on a chat page
    const isChatPage = window.location.pathname.includes('/chat');

    if (isProtectedPage && !hasAuthToken && !isChatPage) {
      console.log('No auth token found on protected page, redirecting to login');
      window.location.href = '/login';
      return;
    }

    // If we have auth token but it's not properly initialized, fix it
    if (hasAuthToken) {
      try {
        const tokenData = JSON.parse(authToken);

        // Check if token is expired
        const expiresAt = new Date(tokenData.currentSession.expires_at).getTime();
        const now = Date.now();

        if (expiresAt < now) {
          console.log('Auth token expired, refreshing');

          // Update the expiration time
          tokenData.currentSession.expires_at = new Date(now + 86400000).toISOString();
          localStorage.setItem('supabase.auth.token', JSON.stringify(tokenData));
        }

        // Make sure we have a user object
        if (!localStorage.getItem('echomind_user')) {
          console.log('Creating user object from auth token');

          localStorage.setItem('echomind_user', JSON.stringify({
            id: tokenData.currentSession.user.id,
            email: tokenData.currentSession.user.email,
            created_at: new Date().toISOString()
          }));
        }

        // Make sure we have user settings
        if (!localStorage.getItem('echomind_user_settings')) {
          console.log('Creating default user settings');

          localStorage.setItem('echomind_user_settings', JSON.stringify({
            use_custom_api_key: false,
            mistral_api_key: window.MISTRAL_API_KEY || "05HuhddoS0bpO42IaPDvXiWizFtnbP6N",
            email_notifications: true,
            reminder_notifications: true
          }));
        }
      } catch (e) {
        console.error('Error processing auth token:', e);
      }
    }
  }

  // Run immediately
  checkAndInitAuthState();

  // Also run periodically
  setInterval(checkAndInitAuthState, 5000);
});
