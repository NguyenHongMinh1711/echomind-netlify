import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import { theme } from '../../theme';
import ChatInterface from './ChatInterface';
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
      order: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue({
        data: {
          id: 'test-session-id',
          title: 'Test Chat',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          last_message: 'Hello',
          last_message_timestamp: new Date().toISOString(),
        },
        error: null,
      }),
      insert: jest.fn().mockResolvedValue({
        data: {
          id: 'test-message-id',
          session_id: 'test-session-id',
          content: 'Test message',
          role: 'user',
          timestamp: new Date().toISOString(),
        },
        error: null,
      }),
    }),
    rpc: jest.fn().mockResolvedValue({
      data: 'I am EchoMind, how can I help you today?',
      error: null,
    }),
  },
}));

// Mock the useNavigate hook
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
  useParams: () => ({ id: 'test-session-id' }),
}));

// Mock the chatService
jest.mock('../../services/chatService', () => ({
  chat: {
    getChatSession: jest.fn().mockResolvedValue({
      id: 'test-session-id',
      title: 'Test Chat',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      lastMessage: 'Hello',
      lastMessageTimestamp: new Date().toISOString(),
    }),
    getChatMessages: jest.fn().mockResolvedValue([
      {
        id: 'message-1',
        chatId: 'test-session-id',
        content: 'Hello',
        role: 'user',
        timestamp: new Date(Date.now() - 1000).toISOString(),
      },
      {
        id: 'message-2',
        chatId: 'test-session-id',
        content: 'Hi there! How can I help you today?',
        role: 'assistant',
        timestamp: new Date().toISOString(),
      },
    ]),
    sendMessage: jest.fn().mockResolvedValue({
      userMessage: {
        id: 'message-3',
        chatId: 'test-session-id',
        content: 'Test message',
        role: 'user',
        timestamp: new Date().toISOString(),
      },
      aiMessage: {
        id: 'message-4',
        chatId: 'test-session-id',
        content: 'I am EchoMind, how can I help you today?',
        role: 'assistant',
        timestamp: new Date().toISOString(),
      },
      suggestions: ['How are you feeling today?', 'Tell me about your day'],
    }),
  },
}));

// Mock the useOnlineStatus hook
jest.mock('../../hooks/useOnlineStatus', () => ({
  __esModule: true,
  default: () => ({ isOnline: true }),
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

describe('ChatInterface Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the chat interface', async () => {
    renderWithProviders(<ChatInterface />);
    
    // Wait for the chat to load
    await waitFor(() => {
      expect(screen.getByText('Test Chat')).toBeInTheDocument();
    });
    
    // Check that the messages are displayed
    expect(screen.getByText('Hello')).toBeInTheDocument();
    expect(screen.getByText('Hi there! How can I help you today?')).toBeInTheDocument();
  });

  it('allows sending a message', async () => {
    renderWithProviders(<ChatInterface />);
    
    // Wait for the chat to load
    await waitFor(() => {
      expect(screen.getByText('Test Chat')).toBeInTheDocument();
    });
    
    // Type a message
    const messageInput = screen.getByPlaceholderText(/type a message/i);
    fireEvent.change(messageInput, { target: { value: 'Test message' } });
    
    // Send the message
    const sendButton = screen.getByRole('button', { name: /send/i });
    fireEvent.click(sendButton);
    
    // Check that the chat service was called with the message
    await waitFor(() => {
      expect(require('../../services/chatService').chat.sendMessage).toHaveBeenCalledWith(
        'test-session-id',
        'Test message'
      );
    });
    
    // Check that the new messages are displayed
    await waitFor(() => {
      expect(screen.getByText('Test message')).toBeInTheDocument();
      expect(screen.getByText('I am EchoMind, how can I help you today?')).toBeInTheDocument();
    });
  });

  it('displays suggested responses', async () => {
    renderWithProviders(<ChatInterface />);
    
    // Wait for the chat to load
    await waitFor(() => {
      expect(screen.getByText('Test Chat')).toBeInTheDocument();
    });
    
    // Send a message to trigger suggestions
    const messageInput = screen.getByPlaceholderText(/type a message/i);
    fireEvent.change(messageInput, { target: { value: 'Test message' } });
    
    const sendButton = screen.getByRole('button', { name: /send/i });
    fireEvent.click(sendButton);
    
    // Check that the suggestions are displayed
    await waitFor(() => {
      expect(screen.getByText('How are you feeling today?')).toBeInTheDocument();
      expect(screen.getByText('Tell me about your day')).toBeInTheDocument();
    });
    
    // Click a suggestion
    fireEvent.click(screen.getByText('How are you feeling today?'));
    
    // Check that the chat service was called with the suggestion
    await waitFor(() => {
      expect(require('../../services/chatService').chat.sendMessage).toHaveBeenCalledWith(
        'test-session-id',
        'How are you feeling today?'
      );
    });
  });

  it('handles errors when loading the chat', async () => {
    // Mock the chat service to return an error
    require('../../services/chatService').chat.getChatSession.mockRejectedValueOnce(new Error('Failed to load chat'));
    
    renderWithProviders(<ChatInterface />);
    
    // Wait for the error message to be displayed
    await waitFor(() => {
      expect(screen.getByText(/error loading chat/i)).toBeInTheDocument();
    });
  });

  it('handles errors when sending a message', async () => {
    // Mock the chat service to return an error when sending a message
    require('../../services/chatService').chat.sendMessage.mockRejectedValueOnce(new Error('Failed to send message'));
    
    renderWithProviders(<ChatInterface />);
    
    // Wait for the chat to load
    await waitFor(() => {
      expect(screen.getByText('Test Chat')).toBeInTheDocument();
    });
    
    // Type a message
    const messageInput = screen.getByPlaceholderText(/type a message/i);
    fireEvent.change(messageInput, { target: { value: 'Test message' } });
    
    // Send the message
    const sendButton = screen.getByRole('button', { name: /send/i });
    fireEvent.click(sendButton);
    
    // Wait for the error message to be displayed
    await waitFor(() => {
      expect(screen.getByText(/error sending message/i)).toBeInTheDocument();
    });
  });
});
