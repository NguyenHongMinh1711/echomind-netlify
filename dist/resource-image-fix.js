// EchoMind Resource Image Fix
// This script directly fixes resource images by replacing them with known working URLs

document.addEventListener('DOMContentLoaded', function() {
  console.log('EchoMind resource image fix loaded');

  // Define resource image URLs that we know should work
  const resourceImageUrls = {
    'Understanding Depression': 'https://images.unsplash.com/photo-1576091160550-2173dba999ef',
    'Mindfulness Meditation for Anxiety': 'https://images.unsplash.com/photo-1506126613408-eca07ce68773',
    'The Upward Spiral': 'https://images.unsplash.com/photo-1544947950-fa07a98d237f',
    'Crisis Text Line': 'https://images.unsplash.com/photo-1516387938699-a93567ec168e',
    'EchoMind Community Chat': 'https://images.unsplash.com/photo-1577563908411-5077b6dc7624'
  };

  // Function to fix resource images
  function fixResourceImages() {
    // Find all resource cards
    const resourceCards = document.querySelectorAll('.MuiCard-root');
    
    resourceCards.forEach(card => {
      // Skip if already processed
      if (card.dataset.resourceImageFixed === 'true') return;
      
      // Mark as processed
      card.dataset.resourceImageFixed = 'true';
      
      // Find the title element
      const titleElement = card.querySelector('h1, h2, h3, h4, h5, h6');
      if (!titleElement) return;
      
      const title = titleElement.textContent.trim();
      
      // Check if we have a matching URL for this title
      if (resourceImageUrls[title]) {
        // Find the image element
        const imgElement = card.querySelector('img');
        if (!imgElement) return;
        
        console.log('Fixing resource image for:', title);
        
        // Set the correct image URL
        imgElement.src = resourceImageUrls[title];
        
        // Add CORS attributes
        imgElement.crossOrigin = 'anonymous';
        
        // Remove any fallback classes
        imgElement.classList.remove('fallback-image');
      }
    });
  }

  // Run immediately
  setTimeout(fixResourceImages, 500);
  
  // Also run periodically
  setInterval(fixResourceImages, 2000);
});
