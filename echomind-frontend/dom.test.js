// dom.test.js
import { describe, it, expect } from 'vitest';

describe('DOM Test', () => {
  it('should create a DOM element', () => {
    const element = document.createElement('div');
    element.innerHTML = 'Test';
    document.body.appendChild(element);
    
    expect(element).toBeInTheDocument();
    expect(element.textContent).toBe('Test');
  });
});
