// EchoMind Image Loading Fix
// This script handles image loading issues and provides fallbacks

document.addEventListener('DOMContentLoaded', function() {
  console.log('EchoMind image fix loaded');

  // Create fallback images
  const fallbackResourceImage = createDataUrl('#3f51b5', 'Resource Image');
  const fallbackProfileImage = createDataUrl('#f50057', 'Profile Image');
  const fallbackGenericImage = createDataUrl('#00bcd4', 'Image Not Available');

  // Store fallbacks in localStorage for persistence
  localStorage.setItem('echomind_fallback_resource', fallbackResourceImage);
  localStorage.setItem('echomind_fallback_profile', fallbackProfileImage);
  localStorage.setItem('echomind_fallback_generic', fallbackGenericImage);

  // Create a MutationObserver to watch for new images
  const observer = new MutationObserver(function(mutations) {
    mutations.forEach(function(mutation) {
      if (mutation.type === 'childList') {
        mutation.addedNodes.forEach(function(node) {
          if (node.nodeName === 'IMG') {
            addErrorHandler(node);
          } else if (node.querySelectorAll) {
            node.querySelectorAll('img').forEach(addErrorHandler);
          }
        });
      }
    });
  });

  // Start observing the document
  observer.observe(document.body, {
    childList: true,
    subtree: true
  });

  // Add error handler to existing images
  setTimeout(function() {
    document.querySelectorAll('img').forEach(addErrorHandler);
    console.log('Added error handlers to', document.querySelectorAll('img').length, 'images');
  }, 500);

  // Function to add error handler to an image
  function addErrorHandler(img) {
    // Skip if already processed
    if (img.dataset.fallbackAdded) return;

    // Mark as processed
    img.dataset.fallbackAdded = 'true';

    // Add error handler
    img.addEventListener('error', function(e) {
      // Prevent infinite loops
      if (this.dataset.usingFallback === 'true') return;

      // Mark as using fallback
      this.dataset.usingFallback = 'true';

      console.log('Image failed to load, using fallback:', this.src);

      // Determine image type from context
      let fallbackSrc;

      if (this.closest('[class*="resource"], [class*="Resource"]') ||
          this.src.includes('unsplash') ||
          this.src.includes('resource')) {
        fallbackSrc = localStorage.getItem('echomind_fallback_resource');
      } else if (this.closest('[class*="profile"], [class*="Profile"], [class*="avatar"], [class*="Avatar"]') ||
                this.src.includes('profile') ||
                this.src.includes('avatar')) {
        fallbackSrc = localStorage.getItem('echomind_fallback_profile');
      } else {
        fallbackSrc = localStorage.getItem('echomind_fallback_generic');
      }

      // Set fallback image
      this.src = fallbackSrc;

      // Add fallback class for styling
      this.classList.add('fallback-image');
    });

    // Force error check for already loaded images
    if (img.complete) {
      if (!img.naturalWidth) {
        img.dispatchEvent(new Event('error'));
      }
    }
  }

  // Function to create a data URL for a fallback image
  function createDataUrl(color, text) {
    const canvas = document.createElement('canvas');
    canvas.width = 300;
    canvas.height = 200;

    const ctx = canvas.getContext('2d');

    // Background
    ctx.fillStyle = color;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Text
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 20px Arial, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, canvas.width / 2, canvas.height / 2);

    return canvas.toDataURL('image/png');
  }

  // Fix for resources page images
  function fixResourceImages() {
    const resourceImages = document.querySelectorAll('[class*="resource"] img, [class*="Resource"] img');
    console.log('Found', resourceImages.length, 'resource images to check');

    resourceImages.forEach(img => {
      // Add CORS attributes
      img.crossOrigin = 'anonymous';

      // Add specific error handler for resource images
      img.addEventListener('error', function() {
        if (this.dataset.resourceFixed) return;
        this.dataset.resourceFixed = 'true';

        // Try with a proxy if it's an external URL
        if (this.src.includes('unsplash.com') || this.src.includes('images.')) {
          const originalSrc = this.src;
          console.log('Trying proxy for resource image:', originalSrc);

          // Use a CORS proxy
          this.src = 'https://images.weserv.nl/?url=' + encodeURIComponent(originalSrc);
        }
      });
    });
  }

  // Run resource image fix periodically
  setInterval(fixResourceImages, 2000);

  // Initial run
  setTimeout(fixResourceImages, 1000);
});
