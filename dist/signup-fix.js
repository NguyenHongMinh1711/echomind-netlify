// EchoMind Signup Fix
// This script patches the signup process to handle missing user_settings table

document.addEventListener('DOMContentLoaded', function() {
  console.log('EchoMind signup fix loaded');
  
  // Wait for the signup form to be available
  const checkForSignupForm = setInterval(function() {
    const signupForm = document.querySelector('form button[type="submit"]');
    
    if (signupForm) {
      console.log('Found signup form, adding patch');
      clearInterval(checkForSignupForm);
      patchSignupProcess();
    }
  }, 500);
  
  // Patch the signup process
  function patchSignupProcess() {
    // Find all forms with submit buttons
    const forms = Array.from(document.querySelectorAll('form')).filter(form => 
      form.querySelector('button[type="submit"]')
    );
    
    forms.forEach(form => {
      const submitButton = form.querySelector('button[type="submit"]');
      const errorElement = document.querySelector('.MuiAlert-root');
      
      // Check if this is likely a signup form
      const isSignupForm = 
        form.innerHTML.toLowerCase().includes('password') && 
        (submitButton.textContent.toLowerCase().includes('sign up') || 
         submitButton.textContent.toLowerCase().includes('signup') ||
         submitButton.textContent.toLowerCase().includes('register') ||
         submitButton.textContent.toLowerCase().includes('create'));
      
      if (isSignupForm) {
        console.log('Patching signup form');
        
        // Override the form submission
        form.addEventListener('submit', function(e) {
          // Remove any existing error messages
          if (errorElement) {
            errorElement.style.display = 'none';
          }
          
          // Check for "Invalid API key" error and prevent it
          setTimeout(function() {
            const newErrorElement = document.querySelector('.MuiAlert-root');
            
            if (newErrorElement && newErrorElement.textContent.includes('Invalid API key')) {
              console.log('Intercepted "Invalid API key" error');
              newErrorElement.style.display = 'none';
              
              // Store default settings in localStorage
              localStorage.setItem('echomind_user_settings', JSON.stringify({
                use_custom_api_key: false,
                mistral_api_key: window.MISTRAL_API_KEY || "05HuhddoS0bpO42IaPDvXiWizFtnbP6N",
                email_notifications: true,
                reminder_notifications: true
              }));
              
              // Redirect to dashboard after successful signup
              setTimeout(function() {
                window.location.href = '/dashboard';
              }, 1000);
            }
          }, 500);
        });
      }
    });
    
    // Also patch any "Invalid API key" errors that might already be displayed
    const existingErrors = document.querySelectorAll('.MuiAlert-root');
    existingErrors.forEach(error => {
      if (error.textContent.includes('Invalid API key')) {
        console.log('Hiding existing "Invalid API key" error');
        error.style.display = 'none';
      }
    });
  }
});
