import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter, Routes, Route, MemoryRouter } from 'react-router-dom';
import { AuthProvider } from '../../contexts/AuthContext';
import { SupabaseProvider } from '../../contexts/SupabaseContext';

// Mock the resources service
vi.mock('../../services/resourceService', () => ({
  resources: {
    getPodcasts: vi.fn().mockResolvedValue([
      { 
        id: 'podcast-1', 
        title: 'Mindfulness Meditation', 
        description: 'A guided meditation for anxiety relief',
        url: 'https://example.com/podcast1',
        image_url: 'https://example.com/images/podcast1.jpg',
        duration: '15:00',
        category: 'meditation',
        tags: ['anxiety', 'mindfulness', 'meditation']
      },
      { 
        id: 'podcast-2', 
        title: 'Understanding Depression', 
        description: 'Expert insights on managing depression',
        url: 'https://example.com/podcast2',
        image_url: 'https://example.com/images/podcast2.jpg',
        duration: '25:30',
        category: 'education',
        tags: ['depression', 'mental health', 'education']
      }
    ]),
    getStories: vi.fn().mockResolvedValue([
      {
        id: 'story-1',
        title: 'Finding Hope',
        content: 'A story about finding hope in difficult times...',
        author: 'Jane Doe',
        image_url: 'https://example.com/images/story1.jpg',
        category: 'inspirational',
        tags: ['hope', 'inspiration', 'recovery']
      },
      {
        id: 'story-2',
        title: 'The Journey to Self-Acceptance',
        content: 'A personal journey of self-discovery and acceptance...',
        author: 'John Smith',
        image_url: 'https://example.com/images/story2.jpg',
        category: 'personal',
        tags: ['self-acceptance', 'journey', 'growth']
      }
    ]),
    getResourceById: vi.fn().mockImplementation((type, id) => {
      if (type === 'podcasts' && id === 'podcast-1') {
        return Promise.resolve({ 
          id: 'podcast-1', 
          title: 'Mindfulness Meditation', 
          description: 'A guided meditation for anxiety relief',
          url: 'https://example.com/podcast1',
          image_url: 'https://example.com/images/podcast1.jpg',
          duration: '15:00',
          category: 'meditation',
          tags: ['anxiety', 'mindfulness', 'meditation'],
          content: 'Full transcript of the meditation...'
        });
      } else if (type === 'stories' && id === 'story-1') {
        return Promise.resolve({
          id: 'story-1',
          title: 'Finding Hope',
          content: 'A story about finding hope in difficult times...',
          author: 'Jane Doe',
          image_url: 'https://example.com/images/story1.jpg',
          category: 'inspirational',
          tags: ['hope', 'inspiration', 'recovery'],
          full_content: 'The complete story text goes here...'
        });
      }
      return Promise.resolve(null);
    }),
    searchResources: vi.fn().mockImplementation((query) => {
      if (query.includes('meditation')) {
        return Promise.resolve({
          podcasts: [{ 
            id: 'podcast-1', 
            title: 'Mindfulness Meditation', 
            description: 'A guided meditation for anxiety relief',
            url: 'https://example.com/podcast1',
            image_url: 'https://example.com/images/podcast1.jpg',
            duration: '15:00',
            category: 'meditation',
            tags: ['anxiety', 'mindfulness', 'meditation']
          }],
          stories: []
        });
      }
      return Promise.resolve({ podcasts: [], stories: [] });
    })
  }
}));

// Mock the Supabase client
vi.mock('../../services/supabaseClient', () => ({
  supabase: {
    auth: {
      getUser: vi.fn().mockResolvedValue({
        data: { user: { id: 'test-user-id', email: 'test@example.com' } },
        error: null
      }),
      onAuthStateChange: vi.fn().mockImplementation((callback) => {
        return { data: { subscription: { unsubscribe: vi.fn() } } };
      }),
    },
    from: vi.fn().mockReturnThis(),
    select: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    order: vi.fn().mockReturnThis(),
    single: vi.fn(),
  },
}));

// Create test components
const ResourcesListPage = () => (
  <div data-testid="resources-list">
    <h1>Resources</h1>
    <div data-testid="search-bar">
      <input 
        type="text" 
        data-testid="search-input" 
        placeholder="Search resources..." 
      />
      <button data-testid="search-button">Search</button>
    </div>
    <div data-testid="filter-options">
      <button data-testid="filter-all" className="active">All</button>
      <button data-testid="filter-podcasts">Podcasts</button>
      <button data-testid="filter-stories">Stories</button>
    </div>
    <div data-testid="podcasts-section">
      <h2>Podcasts</h2>
      <div data-testid="podcast-item-1">
        <h3>Mindfulness Meditation</h3>
        <p>A guided meditation for anxiety relief</p>
        <span>15:00</span>
        <button data-testid="view-podcast-1">Listen</button>
      </div>
      <div data-testid="podcast-item-2">
        <h3>Understanding Depression</h3>
        <p>Expert insights on managing depression</p>
        <span>25:30</span>
        <button data-testid="view-podcast-2">Listen</button>
      </div>
    </div>
    <div data-testid="stories-section">
      <h2>Stories</h2>
      <div data-testid="story-item-1">
        <h3>Finding Hope</h3>
        <p>By Jane Doe</p>
        <button data-testid="view-story-1">Read</button>
      </div>
      <div data-testid="story-item-2">
        <h3>The Journey to Self-Acceptance</h3>
        <p>By John Smith</p>
        <button data-testid="view-story-2">Read</button>
      </div>
    </div>
  </div>
);

const PodcastDetailPage = () => (
  <div data-testid="podcast-detail">
    <h1>Mindfulness Meditation</h1>
    <div data-testid="podcast-info">
      <img 
        src="https://example.com/images/podcast1.jpg" 
        alt="Podcast cover" 
      />
      <p>A guided meditation for anxiety relief</p>
      <span>Duration: 15:00</span>
      <div>Category: meditation</div>
      <div>Tags: anxiety, mindfulness, meditation</div>
    </div>
    <div data-testid="audio-player">
      <audio controls src="https://example.com/podcast1"></audio>
    </div>
    <div data-testid="podcast-transcript">
      <h3>Transcript</h3>
      <p>Full transcript of the meditation...</p>
    </div>
    <button data-testid="back-button">Back to Resources</button>
  </div>
);

const StoryDetailPage = () => (
  <div data-testid="story-detail">
    <h1>Finding Hope</h1>
    <div data-testid="story-info">
      <img 
        src="https://example.com/images/story1.jpg" 
        alt="Story cover" 
      />
      <p>By Jane Doe</p>
      <div>Category: inspirational</div>
      <div>Tags: hope, inspiration, recovery</div>
    </div>
    <div data-testid="story-content">
      <p>The complete story text goes here...</p>
    </div>
    <button data-testid="back-button">Back to Resources</button>
  </div>
);

describe('Resources Flow', () => {
  beforeEach(() => {
    // Reset mocks before each test
    vi.clearAllMocks();
  });

  afterEach(() => {
    // Clean up after each test
    vi.resetAllMocks();
  });

  it('should render the resources list', async () => {
    render(
      <MemoryRouter initialEntries={['/resources']}>
        <AuthProvider>
          <SupabaseProvider>
            <Routes>
              <Route path="/resources" element={<ResourcesListPage />} />
            </Routes>
          </SupabaseProvider>
        </AuthProvider>
      </MemoryRouter>
    );

    expect(screen.getByTestId('resources-list')).toBeInTheDocument();
    expect(screen.getByTestId('podcasts-section')).toBeInTheDocument();
    expect(screen.getByTestId('stories-section')).toBeInTheDocument();
    expect(screen.getByTestId('podcast-item-1')).toBeInTheDocument();
    expect(screen.getByTestId('story-item-1')).toBeInTheDocument();
  });

  it('should navigate to podcast detail page', async () => {
    render(
      <MemoryRouter initialEntries={['/resources']}>
        <AuthProvider>
          <SupabaseProvider>
            <Routes>
              <Route path="/resources" element={<ResourcesListPage />} />
              <Route path="/resources/podcasts/:id" element={<PodcastDetailPage />} />
            </Routes>
          </SupabaseProvider>
        </AuthProvider>
      </MemoryRouter>
    );

    // Click the view button for the first podcast
    fireEvent.click(screen.getByTestId('view-podcast-1'));

    // Should navigate to the podcast detail page
    await waitFor(() => {
      expect(screen.getByTestId('podcast-detail')).toBeInTheDocument();
    });
  });

  it('should navigate to story detail page', async () => {
    render(
      <MemoryRouter initialEntries={['/resources']}>
        <AuthProvider>
          <SupabaseProvider>
            <Routes>
              <Route path="/resources" element={<ResourcesListPage />} />
              <Route path="/resources/stories/:id" element={<StoryDetailPage />} />
            </Routes>
          </SupabaseProvider>
        </AuthProvider>
      </MemoryRouter>
    );

    // Click the view button for the first story
    fireEvent.click(screen.getByTestId('view-story-1'));

    // Should navigate to the story detail page
    await waitFor(() => {
      expect(screen.getByTestId('story-detail')).toBeInTheDocument();
    });
  });

  it('should filter resources by type', async () => {
    render(
      <MemoryRouter initialEntries={['/resources']}>
        <AuthProvider>
          <SupabaseProvider>
            <Routes>
              <Route path="/resources" element={<ResourcesListPage />} />
            </Routes>
          </SupabaseProvider>
        </AuthProvider>
      </MemoryRouter>
    );

    // Click the podcasts filter button
    fireEvent.click(screen.getByTestId('filter-podcasts'));

    // Should show only podcasts section
    await waitFor(() => {
      expect(screen.getByTestId('podcasts-section')).toBeInTheDocument();
      expect(screen.queryByTestId('stories-section')).not.toBeVisible();
    });

    // Click the stories filter button
    fireEvent.click(screen.getByTestId('filter-stories'));

    // Should show only stories section
    await waitFor(() => {
      expect(screen.queryByTestId('podcasts-section')).not.toBeVisible();
      expect(screen.getByTestId('stories-section')).toBeInTheDocument();
    });

    // Click the all filter button
    fireEvent.click(screen.getByTestId('filter-all'));

    // Should show both sections
    await waitFor(() => {
      expect(screen.getByTestId('podcasts-section')).toBeInTheDocument();
      expect(screen.getByTestId('stories-section')).toBeInTheDocument();
    });
  });

  it('should search resources', async () => {
    const resourceService = require('../../services/resourceService').resources;

    render(
      <MemoryRouter initialEntries={['/resources']}>
        <AuthProvider>
          <SupabaseProvider>
            <Routes>
              <Route path="/resources" element={<ResourcesListPage />} />
            </Routes>
          </SupabaseProvider>
        </AuthProvider>
      </MemoryRouter>
    );

    // Type a search query
    fireEvent.change(screen.getByTestId('search-input'), {
      target: { value: 'meditation' }
    });

    // Click the search button
    fireEvent.click(screen.getByTestId('search-button'));

    // Verify that searchResources was called with the correct query
    await waitFor(() => {
      expect(resourceService.searchResources).toHaveBeenCalledWith('meditation');
    });
  });
});
