// EchoMind Image Loading Fix - Enhanced Version 2
// This script handles image loading issues and provides fallbacks

document.addEventListener('DOMContentLoaded', function() {
  console.log('EchoMind image fix loaded - enhanced version 2');

  // Define resource image URLs that we know should work
  const resourceImageUrls = {
    'Understanding Depression': 'https://images.unsplash.com/photo-1576091160550-2173dba999ef',
    'Mindfulness Meditation for Anxiety': 'https://images.unsplash.com/photo-1506126613408-eca07ce68773',
    'The Upward Spiral': 'https://images.unsplash.com/photo-1544947950-fa07a98d237f',
    'Crisis Text Line': 'https://images.unsplash.com/photo-1516387938699-a93567ec168e',
    'EchoMind Community Chat': 'https://images.unsplash.com/photo-1577563908411-5077b6dc7624'
  };

  // Create SVG fallback images
  const fallbackResourceSvg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="300" height="200" viewBox="0 0 300 200">
      <rect width="300" height="200" fill="#3f51b5"/>
      <text x="150" y="100" font-family="Arial" font-size="20" fill="white" text-anchor="middle">Resource Image</text>
    </svg>
  `;

  const fallbackProfileSvg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="300" height="200" viewBox="0 0 300 200">
      <rect width="300" height="200" fill="#f50057"/>
      <text x="150" y="100" font-family="Arial" font-size="20" fill="white" text-anchor="middle">Profile Image</text>
    </svg>
  `;

  const fallbackGenericSvg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="300" height="200" viewBox="0 0 300 200">
      <rect width="300" height="200" fill="#00bcd4"/>
      <text x="150" y="100" font-family="Arial" font-size="20" fill="white" text-anchor="middle">Image Not Available</text>
    </svg>
  `;

  // Create fallback images (both SVG and canvas-based)
  const fallbackResourceImage = createDataUrl('#3f51b5', 'Resource Image');
  const fallbackProfileImage = createDataUrl('#f50057', 'Profile Image');
  const fallbackGenericImage = createDataUrl('#00bcd4', 'Image Not Available');

  // Store fallbacks in localStorage for persistence
  localStorage.setItem('echomind_fallback_resource', fallbackResourceImage);
  localStorage.setItem('echomind_fallback_profile', fallbackProfileImage);
  localStorage.setItem('echomind_fallback_generic', fallbackGenericImage);
  localStorage.setItem('echomind_fallback_resource_svg', 'data:image/svg+xml;base64,' + btoa(fallbackResourceSvg));
  localStorage.setItem('echomind_fallback_profile_svg', 'data:image/svg+xml;base64,' + btoa(fallbackProfileSvg));
  localStorage.setItem('echomind_fallback_generic_svg', 'data:image/svg+xml;base64,' + btoa(fallbackGenericSvg));

  // Store resource image URLs in localStorage
  localStorage.setItem('echomind_resource_image_urls', JSON.stringify(resourceImageUrls));

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

  // Add error handler to existing images immediately
  document.querySelectorAll('img').forEach(addErrorHandler);

  // And check again after a delay to catch any that might have been missed
  setTimeout(function() {
    document.querySelectorAll('img').forEach(addErrorHandler);
    console.log('Added error handlers to', document.querySelectorAll('img').length, 'images');
    fixResourceImages();
  }, 500);

  // Function to add error handler to an image
  function addErrorHandler(img) {
    // Skip if already processed
    if (img.dataset.fallbackAdded) return;

    // Mark as processed
    img.dataset.fallbackAdded = 'true';

    // Add crossOrigin attribute to all images
    img.crossOrigin = 'anonymous';

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
        fallbackSrc = localStorage.getItem('echomind_fallback_resource_svg') ||
                      localStorage.getItem('echomind_fallback_resource');
      } else if (this.closest('[class*="profile"], [class*="Profile"], [class*="avatar"], [class*="Avatar"]') ||
                this.src.includes('profile') ||
                this.src.includes('avatar')) {
        fallbackSrc = localStorage.getItem('echomind_fallback_profile_svg') ||
                      localStorage.getItem('echomind_fallback_profile');
      } else {
        fallbackSrc = localStorage.getItem('echomind_fallback_generic_svg') ||
                      localStorage.getItem('echomind_fallback_generic');
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
    // Target both resource cards and any images that might be resources
    const resourceImages = document.querySelectorAll(
      '[class*="resource"] img, [class*="Resource"] img, ' +
      '.MuiCard-root img, .card img, [class*="card"] img'
    );

    console.log('Found', resourceImages.length, 'potential resource images to check');

    // Get resource image URLs from localStorage
    let resourceImageUrls = {};
    try {
      resourceImageUrls = JSON.parse(localStorage.getItem('echomind_resource_image_urls') || '{}');
    } catch (e) {
      console.error('Error parsing resource image URLs:', e);
    }

    // Function to find the correct image URL for a resource
    function findResourceImageUrl(img) {
      // Try to find the title in the parent elements
      const card = img.closest('.MuiCard-root') || img.closest('[class*="card"]');
      if (!card) return null;

      // Look for heading elements that might contain the title
      const headings = card.querySelectorAll('h1, h2, h3, h4, h5, h6, [class*="title"], [class*="Title"]');
      for (const heading of headings) {
        const title = heading.textContent.trim();
        if (resourceImageUrls[title]) {
          console.log('Found matching resource title:', title);
          return resourceImageUrls[title];
        }
      }

      return null;
    }

    resourceImages.forEach(img => {
      // Skip if already fixed with a real image (not a fallback)
      if (img.dataset.resourceFixed === 'true' && !img.classList.contains('fallback-image')) return;

      // Try to find the correct image URL for this resource
      const correctImageUrl = findResourceImageUrl(img);

      if (correctImageUrl) {
        console.log('Setting correct image URL:', correctImageUrl);
        img.dataset.resourceFixed = 'true';
        img.dataset.originalSrc = img.src; // Save original source
        img.crossOrigin = 'anonymous';

        // Set the correct image URL
        img.src = correctImageUrl;

        // Remove fallback class if it was added
        img.classList.remove('fallback-image');
      } else {
        // If we couldn't find a matching URL, proceed with the original fix

        // Skip if already fixed
        if (img.dataset.resourceFixed === 'true') return;

        // Mark as fixed
        img.dataset.resourceFixed = 'true';

        // Add CORS attributes
        img.crossOrigin = 'anonymous';

        // Check if image is already broken
        if (img.complete && !img.naturalWidth) {
          console.log('Found broken image, applying fix:', img.src);

          // Try with a proxy if it's an external URL
          if (img.src.includes('unsplash.com') || img.src.includes('images.')) {
            const originalSrc = img.src;
            console.log('Trying proxy for resource image:', originalSrc);

            // Use a CORS proxy
            img.src = 'https://images.weserv.nl/?url=' + encodeURIComponent(originalSrc);
          } else {
            // Use fallback
            img.src = localStorage.getItem('echomind_fallback_resource_svg') ||
                      localStorage.getItem('echomind_fallback_resource');
            img.classList.add('fallback-image');
          }
        }
      }

      // Add specific error handler for resource images
      img.addEventListener('error', function() {
        // Skip if already using fallback
        if (this.dataset.usingFallback === 'true') return;

        // Mark as using fallback
        this.dataset.usingFallback = 'true';

        // Try with a proxy if it's an external URL
        if (this.src.includes('unsplash.com') || this.src.includes('images.')) {
          const originalSrc = this.src;
          console.log('Trying proxy for resource image:', originalSrc);

          // Use a CORS proxy
          this.src = 'https://images.weserv.nl/?url=' + encodeURIComponent(originalSrc);
        } else {
          // Use fallback
          this.src = localStorage.getItem('echomind_fallback_resource_svg') ||
                     localStorage.getItem('echomind_fallback_resource');
          this.classList.add('fallback-image');
        }
      });
    });
  }

  // Run resource image fix periodically
  setInterval(fixResourceImages, 1000);

  // Initial run
  fixResourceImages();

  // Add CSS for fallback images
  const style = document.createElement('style');
  style.textContent = `
    .fallback-image {
      object-fit: contain;
      background-color: #f5f5f5;
      border-radius: 4px;
    }
  `;
  document.head.appendChild(style);
});
