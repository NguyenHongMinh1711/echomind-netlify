// src/test/config.test.js
import { describe, it, expect, vi } from 'vitest';

describe('Test Configuration', () => {
  it('should pass a basic test', () => {
    expect(true).toBe(true);
  });

  it('should have access to DOM testing utilities', () => {
    const element = document.createElement('div');
    document.body.appendChild(element);
    expect(element).toBeInTheDocument();
    document.body.removeChild(element);
  });

  it('should have mocked environment variables', () => {
    expect(import.meta.env.VITE_SUPABASE_URL).toBe('https://test-supabase-url.com');
    expect(import.meta.env.VITE_SUPABASE_ANON_KEY).toBe('test-anon-key');
  });

  it('should have mocked localStorage', () => {
    localStorage.setItem('test', 'value');
    expect(localStorage.getItem('test')).toBe('value');
  });

  it('should have mocked fetch', () => {
    expect(global.fetch).toBeDefined();
    expect(typeof global.fetch).toBe('function');
  });
});
