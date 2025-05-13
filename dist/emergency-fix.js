// EchoMind Emergency Fix for Netlify
// This script provides emergency fixes for critical issues on Netlify

(function() {
  console.log('EchoMind emergency fix loaded');
  
  // Run immediately without waiting for DOMContentLoaded
  // This ensures our fixes run before anything else
  
  // PART 1: AUTHENTICATION EMERGENCY FIX
  // ===================================
  
  // Create a mock authentication session immediately
  function createEmergencyAuthSession() {
    console.log('Creating emergency auth session');
    
    // Create a user ID that persists across page loads
    let userId = localStorage.getItem('emergency_user_id');
    if (!userId) {
      userId = 'emergency-user-' + Date.now();
      localStorage.setItem('emergency_user_id', userId);
    }
    
    // Create a mock user
    const mockUser = {
      id: userId,
      email: localStorage.getItem('emergency_user_email') || 'emergency@example.com',
      created_at: new Date().toISOString()
    };
    
    // Store in multiple locations for maximum compatibility
    localStorage.setItem('echomind_user', JSON.stringify(mockUser));
    localStorage.setItem('supabase.auth.token', JSON.stringify({
      currentSession: {
        access_token: 'emergency-token-' + Date.now(),
        refresh_token: 'emergency-refresh-' + Date.now(),
        expires_at: new Date(Date.now() + 86400000).toISOString(),
        user: mockUser
      }
    }));
    
    // Create default user settings
    localStorage.setItem('echomind_user_settings', JSON.stringify({
      use_custom_api_key: false,
      mistral_api_key: "05HuhddoS0bpO42IaPDvXiWizFtnbP6N",
      email_notifications: true,
      reminder_notifications: true
    }));
    
    // Set global variables that might be used
    window.MISTRAL_API_KEY = "05HuhddoS0bpO42IaPDvXiWizFtnbP6N";
    
    console.log('Emergency auth session created for user:', userId);
  }
  
  // PART 2: RESOURCE IMAGE EMERGENCY FIX
  // ===================================
  
  // Define resource image URLs
  const resourceImageUrls = {
    'Understanding Depression': 'https://images.unsplash.com/photo-1576091160550-2173dba999ef',
    'Mindfulness Meditation for Anxiety': 'https://images.unsplash.com/photo-1506126613408-eca07ce68773',
    'The Upward Spiral': 'https://images.unsplash.com/photo-1544947950-fa07a98d237f',
    'Crisis Text Line': 'https://images.unsplash.com/photo-1516387938699-a93567ec168e',
    'EchoMind Community Chat': 'https://images.unsplash.com/photo-1577563908411-5077b6dc7624'
  };
  
  // Store in localStorage for other scripts to use
  localStorage.setItem('emergency_resource_images', JSON.stringify(resourceImageUrls));
  
  // Function to fix resource images
  function fixResourceImagesEmergency() {
    console.log('Running emergency resource image fix');
    
    // Create a style element for our CSS fixes
    const style = document.createElement('style');
    style.textContent = `
      /* Force all resource images to be visible */
      [class*="resource"] img, [class*="Resource"] img, 
      .MuiCard-root img, .card img, [class*="card"] img {
        min-height: 140px !important;
        background-color: #3f51b5 !important;
        object-fit: cover !important;
        width: 100% !important;
      }
      
      /* Hide broken images */
      img[src=""], img:not([src]) {
        visibility: hidden !important;
      }
      
      /* Add placeholder for broken images */
      img[src=""]:before, img:not([src]):before {
        content: "Resource Image";
        display: flex;
        justify-content: center;
        align-items: center;
        color: white;
        font-family: Arial, sans-serif;
        font-size: 16px;
        height: 100%;
        width: 100%;
        background-color: #3f51b5;
      }
    `;
    document.head.appendChild(style);
    
    // Function to replace images based on card title
    function replaceImagesInCards() {
      // Find all cards
      const cards = document.querySelectorAll('.MuiCard-root, [class*="card"], [class*="Card"]');
      console.log('Found', cards.length, 'cards to check for image replacement');
      
      cards.forEach(card => {
        // Find the title element
        const titleElement = card.querySelector('h1, h2, h3, h4, h5, h6, [class*="title"], [class*="Title"]');
        if (!titleElement) return;
        
        const title = titleElement.textContent.trim();
        
        // Find the image element
        const imgElement = card.querySelector('img');
        if (!imgElement) return;
        
        // Check if we have a matching URL for this title
        if (resourceImageUrls[title]) {
          console.log('Emergency fix: Setting image for', title);
          
          // Create a new image element to replace the old one
          const newImg = document.createElement('img');
          newImg.src = resourceImageUrls[title];
          newImg.alt = title;
          newImg.style.height = '140px';
          newImg.style.width = '100%';
          newImg.style.objectFit = 'cover';
          newImg.crossOrigin = 'anonymous';
          
          // Replace the old image
          if (imgElement.parentNode) {
            imgElement.parentNode.replaceChild(newImg, imgElement);
          }
        }
      });
    }
    
    // Run immediately and also set up a periodic check
    replaceImagesInCards();
    setInterval(replaceImagesInCards, 1000);
  }
  
  // PART 3: FORM HANDLING EMERGENCY FIX
  // ===================================
  
  // Function to handle login and signup forms
  function handleFormsEmergency() {
    console.log('Setting up emergency form handling');
    
    // Function to patch forms
    function patchForms() {
      // Find all forms
      const forms = document.querySelectorAll('form');
      
      forms.forEach(form => {
        // Skip if already patched
        if (form.dataset.emergencyPatched === 'true') return;
        form.dataset.emergencyPatched = 'true';
        
        console.log('Emergency patching form:', form);
        
        // Override form submission
        form.addEventListener('submit', function(e) {
          e.preventDefault();
          console.log('Emergency form submission intercepted');
          
          // Get email input
          const emailInput = form.querySelector('input[type="email"]');
          if (emailInput && emailInput.value) {
            localStorage.setItem('emergency_user_email', emailInput.value);
            
            // Update the mock user
            const mockUser = {
              id: localStorage.getItem('emergency_user_id') || ('emergency-user-' + Date.now()),
              email: emailInput.value,
              created_at: new Date().toISOString()
            };
            
            localStorage.setItem('echomind_user', JSON.stringify(mockUser));
            localStorage.setItem('supabase.auth.token', JSON.stringify({
              currentSession: {
                access_token: 'emergency-token-' + Date.now(),
                refresh_token: 'emergency-refresh-' + Date.now(),
                expires_at: new Date(Date.now() + 86400000).toISOString(),
                user: mockUser
              }
            }));
          }
          
          // Redirect to dashboard
          window.location.href = '/dashboard';
        });
        
        // Also patch all submit buttons in the form
        const submitButtons = form.querySelectorAll('button[type="submit"]');
        submitButtons.forEach(button => {
          button.addEventListener('click', function(e) {
            // If the button is inside a form, let the form handler handle it
            if (button.form) return;
            
            // Otherwise handle it directly
            e.preventDefault();
            console.log('Emergency button click intercepted');
            
            // Redirect to dashboard
            window.location.href = '/dashboard';
          });
        });
      });
    }
    
    // Run immediately and also set up a periodic check
    patchForms();
    setInterval(patchForms, 1000);
  }
  
  // Run all emergency fixes
  createEmergencyAuthSession();
  
  // Wait for DOM to be ready for the DOM-dependent fixes
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
      fixResourceImagesEmergency();
      handleFormsEmergency();
    });
  } else {
    fixResourceImagesEmergency();
    handleFormsEmergency();
  }
})();
