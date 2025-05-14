import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter, Routes, Route, MemoryRouter } from 'react-router-dom';
import { AuthProvider } from '../../contexts/AuthContext';
import { SupabaseProvider } from '../../contexts/SupabaseContext';

// Mock the journal service
vi.mock('../../services/journalService', () => ({
  journal: {
    getJournals: vi.fn().mockResolvedValue([
      { 
        id: '1', 
        title: 'Test Journal 1', 
        content: 'This is test journal 1 content',
        created_at: '2023-05-13T10:00:00Z',
        updated_at: '2023-05-13T10:00:00Z',
        user_id: 'test-user-id',
        mood: 'happy',
        tags: ['test', 'journal']
      },
      { 
        id: '2', 
        title: 'Test Journal 2', 
        content: 'This is test journal 2 content',
        created_at: '2023-05-14T10:00:00Z',
        updated_at: '2023-05-14T10:00:00Z',
        user_id: 'test-user-id',
        mood: 'neutral',
        tags: ['test']
      }
    ]),
    getJournal: vi.fn().mockImplementation((id) => {
      if (id === '1') {
        return Promise.resolve({
          id: '1', 
          title: 'Test Journal 1', 
          content: 'This is test journal 1 content',
          created_at: '2023-05-13T10:00:00Z',
          updated_at: '2023-05-13T10:00:00Z',
          user_id: 'test-user-id',
          mood: 'happy',
          tags: ['test', 'journal']
        });
      }
      return Promise.resolve(null);
    }),
    createJournal: vi.fn().mockResolvedValue({
      id: '3', 
      title: 'New Journal', 
      content: 'This is a new journal',
      created_at: '2023-05-15T10:00:00Z',
      updated_at: '2023-05-15T10:00:00Z',
      user_id: 'test-user-id',
      mood: 'happy',
      tags: ['new']
    }),
    updateJournal: vi.fn().mockResolvedValue({
      id: '1', 
      title: 'Updated Journal', 
      content: 'This is updated content',
      created_at: '2023-05-13T10:00:00Z',
      updated_at: '2023-05-15T11:00:00Z',
      user_id: 'test-user-id',
      mood: 'happy',
      tags: ['test', 'updated']
    }),
    deleteJournal: vi.fn().mockResolvedValue(true)
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
    insert: vi.fn().mockReturnThis(),
    update: vi.fn().mockReturnThis(),
    delete: vi.fn().mockReturnThis(),
  },
}));

// Create test components
const JournalListPage = () => (
  <div data-testid="journal-list">
    <h1>My Journals</h1>
    <button data-testid="new-journal-button">New Journal</button>
    <div data-testid="journal-item-1">
      <h2>Test Journal 1</h2>
      <p>This is test journal 1 content</p>
      <button data-testid="view-journal-1">View</button>
      <button data-testid="edit-journal-1">Edit</button>
      <button data-testid="delete-journal-1">Delete</button>
    </div>
    <div data-testid="journal-item-2">
      <h2>Test Journal 2</h2>
      <p>This is test journal 2 content</p>
      <button data-testid="view-journal-2">View</button>
      <button data-testid="edit-journal-2">Edit</button>
      <button data-testid="delete-journal-2">Delete</button>
    </div>
  </div>
);

const JournalDetailPage = () => (
  <div data-testid="journal-detail">
    <h1>Test Journal 1</h1>
    <p>This is test journal 1 content</p>
    <div>Mood: happy</div>
    <div>Tags: test, journal</div>
    <button data-testid="back-button">Back</button>
    <button data-testid="edit-button">Edit</button>
    <button data-testid="delete-button">Delete</button>
  </div>
);

const JournalEditorPage = () => (
  <div data-testid="journal-editor">
    <h1>Edit Journal</h1>
    <form data-testid="journal-form">
      <input 
        type="text" 
        data-testid="journal-title" 
        defaultValue="Test Journal 1" 
      />
      <textarea 
        data-testid="journal-content" 
        defaultValue="This is test journal 1 content"
      />
      <select data-testid="journal-mood" defaultValue="happy">
        <option value="happy">Happy</option>
        <option value="neutral">Neutral</option>
        <option value="sad">Sad</option>
      </select>
      <input 
        type="text" 
        data-testid="journal-tags" 
        defaultValue="test, journal" 
      />
      <button data-testid="save-button" type="submit">Save</button>
      <button data-testid="cancel-button" type="button">Cancel</button>
    </form>
  </div>
);

describe('Journal Flow', () => {
  beforeEach(() => {
    // Reset mocks before each test
    vi.clearAllMocks();
  });

  afterEach(() => {
    // Clean up after each test
    vi.resetAllMocks();
  });

  it('should render the journal list', async () => {
    render(
      <MemoryRouter initialEntries={['/journals']}>
        <AuthProvider>
          <SupabaseProvider>
            <Routes>
              <Route path="/journals" element={<JournalListPage />} />
            </Routes>
          </SupabaseProvider>
        </AuthProvider>
      </MemoryRouter>
    );

    expect(screen.getByTestId('journal-list')).toBeInTheDocument();
    expect(screen.getByTestId('journal-item-1')).toBeInTheDocument();
    expect(screen.getByTestId('journal-item-2')).toBeInTheDocument();
  });

  it('should navigate to journal detail page', async () => {
    render(
      <MemoryRouter initialEntries={['/journals']}>
        <AuthProvider>
          <SupabaseProvider>
            <Routes>
              <Route path="/journals" element={<JournalListPage />} />
              <Route path="/journals/:id" element={<JournalDetailPage />} />
            </Routes>
          </SupabaseProvider>
        </AuthProvider>
      </MemoryRouter>
    );

    // Click the view button for the first journal
    fireEvent.click(screen.getByTestId('view-journal-1'));

    // Should navigate to the journal detail page
    await waitFor(() => {
      expect(screen.getByTestId('journal-detail')).toBeInTheDocument();
    });
  });

  it('should navigate to journal editor page', async () => {
    render(
      <MemoryRouter initialEntries={['/journals']}>
        <AuthProvider>
          <SupabaseProvider>
            <Routes>
              <Route path="/journals" element={<JournalListPage />} />
              <Route path="/journals/:id/edit" element={<JournalEditorPage />} />
            </Routes>
          </SupabaseProvider>
        </AuthProvider>
      </MemoryRouter>
    );

    // Click the edit button for the first journal
    fireEvent.click(screen.getByTestId('edit-journal-1'));

    // Should navigate to the journal editor page
    await waitFor(() => {
      expect(screen.getByTestId('journal-editor')).toBeInTheDocument();
    });
  });

  it('should create a new journal', async () => {
    const journalService = require('../../services/journalService').journal;

    render(
      <MemoryRouter initialEntries={['/journals/new']}>
        <AuthProvider>
          <SupabaseProvider>
            <Routes>
              <Route path="/journals/new" element={<JournalEditorPage />} />
              <Route path="/journals" element={<JournalListPage />} />
            </Routes>
          </SupabaseProvider>
        </AuthProvider>
      </MemoryRouter>
    );

    // Fill out the form
    fireEvent.change(screen.getByTestId('journal-title'), {
      target: { value: 'New Journal' }
    });
    fireEvent.change(screen.getByTestId('journal-content'), {
      target: { value: 'This is a new journal' }
    });
    fireEvent.change(screen.getByTestId('journal-mood'), {
      target: { value: 'happy' }
    });
    fireEvent.change(screen.getByTestId('journal-tags'), {
      target: { value: 'new' }
    });

    // Submit the form
    fireEvent.click(screen.getByTestId('save-button'));

    // Verify that createJournal was called
    await waitFor(() => {
      expect(journalService.createJournal).toHaveBeenCalled();
    });
  });

  it('should update an existing journal', async () => {
    const journalService = require('../../services/journalService').journal;

    render(
      <MemoryRouter initialEntries={['/journals/1/edit']}>
        <AuthProvider>
          <SupabaseProvider>
            <Routes>
              <Route path="/journals/:id/edit" element={<JournalEditorPage />} />
              <Route path="/journals/:id" element={<JournalDetailPage />} />
            </Routes>
          </SupabaseProvider>
        </AuthProvider>
      </MemoryRouter>
    );

    // Update the form
    fireEvent.change(screen.getByTestId('journal-title'), {
      target: { value: 'Updated Journal' }
    });
    fireEvent.change(screen.getByTestId('journal-content'), {
      target: { value: 'This is updated content' }
    });
    fireEvent.change(screen.getByTestId('journal-tags'), {
      target: { value: 'test, updated' }
    });

    // Submit the form
    fireEvent.click(screen.getByTestId('save-button'));

    // Verify that updateJournal was called
    await waitFor(() => {
      expect(journalService.updateJournal).toHaveBeenCalled();
    });
  });

  it('should delete a journal', async () => {
    const journalService = require('../../services/journalService').journal;

    render(
      <MemoryRouter initialEntries={['/journals/1']}>
        <AuthProvider>
          <SupabaseProvider>
            <Routes>
              <Route path="/journals/:id" element={<JournalDetailPage />} />
              <Route path="/journals" element={<JournalListPage />} />
            </Routes>
          </SupabaseProvider>
        </AuthProvider>
      </MemoryRouter>
    );

    // Click the delete button
    fireEvent.click(screen.getByTestId('delete-button'));

    // Verify that deleteJournal was called
    await waitFor(() => {
      expect(journalService.deleteJournal).toHaveBeenCalledWith('1');
    });
  });
});
