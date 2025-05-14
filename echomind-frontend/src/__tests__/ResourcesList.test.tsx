import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import ResourcesList from '../components/resources/ResourcesList';
import { SupabaseProvider } from '../contexts/SupabaseContext';

// Mock the Supabase context
jest.mock('../contexts/SupabaseContext', () => ({
  useSupabase: () => ({
    supabase: {
      from: jest.fn().mockReturnValue({
        select: jest.fn().mockReturnValue({
          data: [
            {
              id: '1',
              title: 'Test Resource',
              description: 'Test Description',
              type: 'article',
              tags: ['test', 'mock'],
              is_saved: false
            }
          ],
          error: null
        })
      })
    }
  }),
  SupabaseProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>
}));

describe('ResourcesList Component', () => {
  it('renders the component title', async () => {
    render(
      <SupabaseProvider>
        <ResourcesList />
      </SupabaseProvider>
    );
    
    expect(screen.getByText('Resources')).toBeInTheDocument();
  });
  
  it('displays loading state initially', async () => {
    render(
      <SupabaseProvider>
        <ResourcesList />
      </SupabaseProvider>
    );
    
    // CircularProgress component doesn't have text, so we check for role="progressbar"
    const loadingIndicator = screen.getByRole('progressbar');
    expect(loadingIndicator).toBeInTheDocument();
    
    // Wait for loading to finish
    await waitFor(() => {
      expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
    });
  });
  
  it('displays resources after loading', async () => {
    render(
      <SupabaseProvider>
        <ResourcesList />
      </SupabaseProvider>
    );
    
    // Wait for resources to load
    await waitFor(() => {
      expect(screen.getByText('Test Resource')).toBeInTheDocument();
      expect(screen.getByText('Test Description')).toBeInTheDocument();
      expect(screen.getByText('article')).toBeInTheDocument();
    });
  });
});
