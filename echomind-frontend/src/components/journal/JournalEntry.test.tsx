import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import { theme } from '../../theme';
import JournalEntry from './JournalEntry';
import { AuthProvider } from '../../contexts/AuthContext';
import { SnackbarProvider } from '../../contexts/SnackbarContext';

// Mock the Supabase client
jest.mock('../../services/supabaseClient', () => ({
  supabase: {
    auth: {
      getUser: jest.fn().mockResolvedValue({
        data: { user: { id: 'test-user-id' } },
        error: null,
      }),
    },
    from: jest.fn().mockReturnValue({
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue({
        data: {
          id: 'test-journal-id',
          title: 'Test Journal',
          content: 'Test content',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          analysis: {
            sentiment: 'positive',
            themes: ['gratitude', 'happiness'],
          },
        },
        error: null,
      }),
      update: jest.fn().mockReturnThis(),
      delete: jest.fn().mockResolvedValue({ error: null }),
    }),
  },
}));

// Mock the useNavigate hook
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
  useParams: () => ({ id: 'test-journal-id' }),
}));

// Mock the journalService
jest.mock('../../services/journalService', () => ({
  journals: {
    getJournal: jest.fn().mockResolvedValue({
      id: 'test-journal-id',
      title: 'Test Journal',
      content: 'Test content',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      sentimentAnalysis: {
        sentiment: 'positive',
        explanation: 'The journal shows positive emotions',
      },
      themes: ['gratitude', 'happiness'],
    }),
    updateJournal: jest.fn().mockResolvedValue({}),
    deleteJournal: jest.fn().mockResolvedValue({}),
  },
}));

const renderWithProviders = (ui: React.ReactElement) => {
  return render(
    <BrowserRouter>
      <ThemeProvider theme={theme}>
        <AuthProvider>
          <SnackbarProvider>
            {ui}
          </SnackbarProvider>
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
};

describe('JournalEntry Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the journal entry', async () => {
    renderWithProviders(<JournalEntry />);
    
    // Wait for the journal to load
    await waitFor(() => {
      expect(screen.getByText('Test Journal')).toBeInTheDocument();
    });
    
    // Check that the content is displayed
    expect(screen.getByText('Test content')).toBeInTheDocument();
  });

  it('allows editing the journal entry', async () => {
    renderWithProviders(<JournalEntry />);
    
    // Wait for the journal to load
    await waitFor(() => {
      expect(screen.getByText('Test Journal')).toBeInTheDocument();
    });
    
    // Click the edit button
    const editButton = screen.getByRole('button', { name: /edit/i });
    fireEvent.click(editButton);
    
    // Check that the form is displayed
    const titleInput = screen.getByLabelText(/title/i);
    const contentInput = screen.getByLabelText(/content/i);
    
    // Update the form fields
    fireEvent.change(titleInput, { target: { value: 'Updated Title' } });
    fireEvent.change(contentInput, { target: { value: 'Updated content' } });
    
    // Submit the form
    const saveButton = screen.getByRole('button', { name: /save/i });
    fireEvent.click(saveButton);
    
    // Check that the journal service was called with the updated values
    await waitFor(() => {
      expect(require('../../services/journalService').journals.updateJournal).toHaveBeenCalledWith(
        'test-journal-id',
        expect.objectContaining({
          title: 'Updated Title',
          content: 'Updated content',
        })
      );
    });
  });

  it('allows deleting the journal entry', async () => {
    renderWithProviders(<JournalEntry />);
    
    // Wait for the journal to load
    await waitFor(() => {
      expect(screen.getByText('Test Journal')).toBeInTheDocument();
    });
    
    // Click the delete button
    const deleteButton = screen.getByRole('button', { name: /delete/i });
    fireEvent.click(deleteButton);
    
    // Confirm the deletion
    const confirmButton = screen.getByRole('button', { name: /confirm/i });
    fireEvent.click(confirmButton);
    
    // Check that the journal service was called to delete the entry
    await waitFor(() => {
      expect(require('../../services/journalService').journals.deleteJournal).toHaveBeenCalledWith('test-journal-id');
    });
    
    // Check that we navigated back to the journals list
    expect(mockNavigate).toHaveBeenCalledWith('/journals');
  });

  it('handles errors when loading the journal', async () => {
    // Mock the journal service to return an error
    require('../../services/journalService').journals.getJournal.mockRejectedValueOnce(new Error('Failed to load journal'));
    
    renderWithProviders(<JournalEntry />);
    
    // Wait for the error message to be displayed
    await waitFor(() => {
      expect(screen.getByText(/error loading journal/i)).toBeInTheDocument();
    });
  });

  it('handles errors when updating the journal', async () => {
    // Mock the journal service to return an error when updating
    require('../../services/journalService').journals.updateJournal.mockRejectedValueOnce(new Error('Failed to update journal'));
    
    renderWithProviders(<JournalEntry />);
    
    // Wait for the journal to load
    await waitFor(() => {
      expect(screen.getByText('Test Journal')).toBeInTheDocument();
    });
    
    // Click the edit button
    const editButton = screen.getByRole('button', { name: /edit/i });
    fireEvent.click(editButton);
    
    // Submit the form
    const saveButton = screen.getByRole('button', { name: /save/i });
    fireEvent.click(saveButton);
    
    // Wait for the error message to be displayed
    await waitFor(() => {
      expect(screen.getByText(/error updating journal/i)).toBeInTheDocument();
    });
  });
});
