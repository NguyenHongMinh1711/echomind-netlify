import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { 
  setupKeyboardNavigation, 
  createSkipToContentLink, 
  addMainContentId, 
  setupAccessibility 
} from './keyboardNavigation';

describe('keyboardNavigation', () => {
  beforeEach(() => {
    // Create a clean body element for each test
    document.body.innerHTML = '';
    document.body.classList.remove('user-is-tabbing');
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('setupKeyboardNavigation', () => {
    it('should add user-is-tabbing class on Tab key press', () => {
      // Setup keyboard navigation
      const cleanup = setupKeyboardNavigation();

      // Simulate Tab key press
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Tab' }));

      // Check if class was added
      expect(document.body.classList.contains('user-is-tabbing')).toBe(true);

      // Cleanup
      cleanup();
    });

    it('should remove user-is-tabbing class on mouse down', () => {
      // Setup keyboard navigation
      const cleanup = setupKeyboardNavigation();

      // Simulate Tab key press to add the class
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Tab' }));

      // Simulate mouse down to remove the class
      window.dispatchEvent(new MouseEvent('mousedown'));

      // Check if class was removed
      expect(document.body.classList.contains('user-is-tabbing')).toBe(false);

      // Cleanup
      cleanup();
    });

    it('should not add user-is-tabbing class on other key press', () => {
      // Setup keyboard navigation
      const cleanup = setupKeyboardNavigation();

      // Simulate Enter key press
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }));

      // Check if class was not added
      expect(document.body.classList.contains('user-is-tabbing')).toBe(false);

      // Cleanup
      cleanup();
    });

    it('should clean up event listeners when cleanup function is called', () => {
      // Spy on addEventListener and removeEventListener
      const addSpy = vi.spyOn(window, 'addEventListener');
      const removeSpy = vi.spyOn(window, 'removeEventListener');

      // Setup keyboard navigation
      const cleanup = setupKeyboardNavigation();

      // Call cleanup function
      cleanup();

      // Check if event listeners were removed
      expect(removeSpy).toHaveBeenCalled();

      // Reset spies
      addSpy.mockRestore();
      removeSpy.mockRestore();
    });
  });

  describe('createSkipToContentLink', () => {
    it('should create a skip link and add it to the body', () => {
      // Create skip link
      const cleanup = createSkipToContentLink();

      // Check if skip link was added to the body
      const skipLink = document.querySelector('.skip-link');
      expect(skipLink).not.toBeNull();
      expect(skipLink?.textContent).toBe('Skip to content');
      expect(skipLink?.getAttribute('href')).toBe('#main-content');

      // Cleanup
      cleanup();
    });

    it('should remove the skip link when cleanup function is called', () => {
      // Create skip link
      const cleanup = createSkipToContentLink();

      // Call cleanup function
      cleanup();

      // Check if skip link was removed
      const skipLink = document.querySelector('.skip-link');
      expect(skipLink).toBeNull();
    });
  });

  describe('addMainContentId', () => {
    it('should add main-content id to main element', () => {
      // Create a main element
      const main = document.createElement('main');
      document.body.appendChild(main);

      // Add main content id
      addMainContentId();

      // Check if id was added
      expect(main.id).toBe('main-content');
    });

    it('should use custom selector if provided', () => {
      // Create a div element
      const div = document.createElement('div');
      div.className = 'content';
      document.body.appendChild(div);

      // Add main content id with custom selector
      addMainContentId('.content');

      // Check if id was added
      expect(div.id).toBe('main-content');
    });

    it('should do nothing if element is not found', () => {
      // Add main content id with non-existent selector
      addMainContentId('.non-existent');

      // No errors should be thrown
      expect(true).toBe(true);
    });
  });

  describe('setupAccessibility', () => {
    it('should set up keyboard navigation and skip link', () => {
      // Mock setTimeout
      vi.useFakeTimers();

      // Setup accessibility
      const cleanup = setupAccessibility();

      // Check if keyboard navigation and skip link were set up
      expect(document.querySelector('.skip-link')).not.toBeNull();

      // Simulate Tab key press
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Tab' }));
      expect(document.body.classList.contains('user-is-tabbing')).toBe(true);

      // Fast-forward timers
      vi.runAllTimers();

      // Cleanup
      cleanup();

      // Check if everything was cleaned up
      expect(document.querySelector('.skip-link')).toBeNull();
      
      // Reset timers
      vi.useRealTimers();
    });
  });
});
