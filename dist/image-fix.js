// Fix for image loading issues
document.addEventListener('DOMContentLoaded', function() {
  // Create fallback images
  const fallbackResourceImage = '/assets/fallback-resource.svg';
  const fallbackProfileImage = '/assets/fallback-profile.svg';

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
  document.querySelectorAll('img').forEach(addErrorHandler);

  // Function to add error handler to an image
  function addErrorHandler(img) {
    img.addEventListener('error', function() {
      // Check if the image is already using a fallback
      if (!this.src.includes('fallback') && !this.src.includes('placeholder')) {
        console.log('Image failed to load, using fallback:', this.src);

        // Set fallback image based on context
        if (this.closest('[class*="resource"], [class*="Resource"]')) {
          this.src = fallbackResourceImage;
        } else if (this.closest('[class*="profile"], [class*="Profile"], [class*="avatar"], [class*="Avatar"]')) {
          this.src = fallbackProfileImage;
        } else {
          // Create a data URL for a colored rectangle with text
          const canvas = document.createElement('canvas');
          canvas.width = this.width || 300;
          canvas.height = this.height || 200;

          const ctx = canvas.getContext('2d');
          ctx.fillStyle = '#3f51b5';
          ctx.fillRect(0, 0, canvas.width, canvas.height);

          ctx.fillStyle = '#ffffff';
          ctx.font = '16px Arial';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText('Image Not Available', canvas.width / 2, canvas.height / 2);

          this.src = canvas.toDataURL('image/png');
        }

        // Add a class to indicate this is a fallback image
        this.classList.add('fallback-image');
      }
    });
  }

  // Create fallback images if they don't exist
  function createFallbackImage(path, color, text) {
    const img = new Image();
    img.src = path;

    img.onerror = function() {
      const canvas = document.createElement('canvas');
      canvas.width = 300;
      canvas.height = 200;

      const ctx = canvas.getContext('2d');
      ctx.fillStyle = color;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.fillStyle = '#ffffff';
      ctx.font = '20px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(text, canvas.width / 2, canvas.height / 2);

      const dataUrl = canvas.toDataURL('image/png');

      // Create a link element to download the image
      const link = document.createElement('link');
      link.rel = 'preload';
      link.href = dataUrl;
      link.as = 'image';
      document.head.appendChild(link);

      // Store the URL in localStorage
      localStorage.setItem(path, dataUrl);
    };
  }

  // Create the fallback images
  createFallbackImage(fallbackResourceImage, '#3f51b5', 'Resource Image');
  createFallbackImage(fallbackProfileImage, '#f50057', 'Profile Image');
});
