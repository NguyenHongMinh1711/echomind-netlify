import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter, Routes, Route, MemoryRouter } from 'react-router-dom';
import { AuthProvider } from '../../contexts/AuthContext';
import { SupabaseProvider } from '../../contexts/SupabaseContext';

// Mock the chat service
vi.mock('../../services/chatService', () => ({
  chat: {
    getChatSessions: vi.fn().mockResolvedValue([
      { 
        id: 'session-1', 
        title: 'Test Chat 1', 
        created_at: '2023-05-13T10:00:00Z',
        updated_at: '2023-05-13T10:30:00Z',
        user_id: 'test-user-id',
        last_message: 'Hello there'
      },
      { 
        id: 'session-2', 
        title: 'Test Chat 2', 
        created_at: '2023-05-14T10:00:00Z',
        updated_at: '2023-05-14T10:30:00Z',
        user_id: 'test-user-id',
        last_message: 'How are you?'
      }
    ]),
    getChatMessages: vi.fn().mockResolvedValue([
      {
        id: 'msg-1',
        session_id: 'session-1',
        content: 'Hello',
        role: 'user',
        created_at: '2023-05-13T10:00:00Z',
        user_id: 'test-user-id'
      },
      {
        id: 'msg-2',
        session_id: 'session-1',
        content: 'Hi there! How can I help you today?',
        role: 'assistant',
        created_at: '2023-05-13T10:00:10Z'
      },
      {
        id: 'msg-3',
        session_id: 'session-1',
        content: 'I\'m feeling a bit anxious today',
        role: 'user',
        created_at: '2023-05-13T10:00:20Z',
        user_id: 'test-user-id'
      },
      {
        id: 'msg-4',
        session_id: 'session-1',
        content: 'I\'m sorry to hear that. Can you tell me more about what\'s causing your anxiety?',
        role: 'assistant',
        created_at: '2023-05-13T10:00:30Z'
      }
    ]),
    createChatSession: vi.fn().mockResolvedValue({
      id: 'session-3', 
      title: 'New Chat', 
      created_at: '2023-05-15T10:00:00Z',
      updated_at: '2023-05-15T10:00:00Z',
      user_id: 'test-user-id',
      last_message: ''
    }),
    sendMessage: vi.fn().mockImplementation((sessionId, content) => {
      return Promise.resolve({
        id: 'new-msg',
        session_id: sessionId,
        content: content,
        role: 'user',
        created_at: new Date().toISOString(),
        user_id: 'test-user-id'
      });
    }),
    deleteChatSession: vi.fn().mockResolvedValue(true)
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
const ChatListPage = () => (
  <div data-testid="chat-list">
    <h1>My Chats</h1>
    <button data-testid="new-chat-button">New Chat</button>
    <div data-testid="chat-item-1">
      <h2>Test Chat 1</h2>
      <p>Last message: Hello there</p>
      <button data-testid="open-chat-1">Open</button>
      <button data-testid="delete-chat-1">Delete</button>
    </div>
    <div data-testid="chat-item-2">
      <h2>Test Chat 2</h2>
      <p>Last message: How are you?</p>
      <button data-testid="open-chat-2">Open</button>
      <button data-testid="delete-chat-2">Delete</button>
    </div>
  </div>
);

const ChatInterfacePage = () => (
  <div data-testid="chat-interface">
    <h1>Test Chat 1</h1>
    <div data-testid="chat-messages">
      <div data-testid="message-1" className="user-message">Hello</div>
      <div data-testid="message-2" className="assistant-message">Hi there! How can I help you today?</div>
      <div data-testid="message-3" className="user-message">I'm feeling a bit anxious today</div>
      <div data-testid="message-4" className="assistant-message">I'm sorry to hear that. Can you tell me more about what's causing your anxiety?</div>
    </div>
    <form data-testid="message-form">
      <input 
        type="text" 
        data-testid="message-input" 
        placeholder="Type a message..." 
      />
      <button data-testid="send-button" type="submit">Send</button>
    </form>
    <button data-testid="back-button">Back to Chats</button>
  </div>
);

const NewChatPage = () => (
  <div data-testid="new-chat">
    <h1>New Chat</h1>
    <form data-testid="new-chat-form">
      <input 
        type="text" 
        data-testid="chat-title" 
        placeholder="Chat title (optional)" 
      />
      <input 
        type="text" 
        data-testid="initial-message" 
        placeholder="Type your first message..." 
        required
      />
      <button data-testid="start-chat-button" type="submit">Start Chat</button>
    </form>
    <button data-testid="cancel-button">Cancel</button>
  </div>
);

describe('Chat Flow', () => {
  beforeEach(() => {
    // Reset mocks before each test
    vi.clearAllMocks();
  });

  afterEach(() => {
    // Clean up after each test
    vi.resetAllMocks();
  });

  it('should render the chat list', async () => {
    render(
      <MemoryRouter initialEntries={['/chats']}>
        <AuthProvider>
          <SupabaseProvider>
            <Routes>
              <Route path="/chats" element={<ChatListPage />} />
            </Routes>
          </SupabaseProvider>
        </AuthProvider>
      </MemoryRouter>
    );

    expect(screen.getByTestId('chat-list')).toBeInTheDocument();
    expect(screen.getByTestId('chat-item-1')).toBeInTheDocument();
    expect(screen.getByTestId('chat-item-2')).toBeInTheDocument();
  });

  it('should navigate to chat interface', async () => {
    render(
      <MemoryRouter initialEntries={['/chats']}>
        <AuthProvider>
          <SupabaseProvider>
            <Routes>
              <Route path="/chats" element={<ChatListPage />} />
              <Route path="/chats/:id" element={<ChatInterfacePage />} />
            </Routes>
          </SupabaseProvider>
        </AuthProvider>
      </MemoryRouter>
    );

    // Click the open button for the first chat
    fireEvent.click(screen.getByTestId('open-chat-1'));

    // Should navigate to the chat interface
    await waitFor(() => {
      expect(screen.getByTestId('chat-interface')).toBeInTheDocument();
    });
  });

  it('should navigate to new chat page', async () => {
    render(
      <MemoryRouter initialEntries={['/chats']}>
        <AuthProvider>
          <SupabaseProvider>
            <Routes>
              <Route path="/chats" element={<ChatListPage />} />
              <Route path="/chats/new" element={<NewChatPage />} />
            </Routes>
          </SupabaseProvider>
        </AuthProvider>
      </MemoryRouter>
    );

    // Click the new chat button
    fireEvent.click(screen.getByTestId('new-chat-button'));

    // Should navigate to the new chat page
    await waitFor(() => {
      expect(screen.getByTestId('new-chat')).toBeInTheDocument();
    });
  });

  it('should create a new chat', async () => {
    const chatService = require('../../services/chatService').chat;

    render(
      <MemoryRouter initialEntries={['/chats/new']}>
        <AuthProvider>
          <SupabaseProvider>
            <Routes>
              <Route path="/chats/new" element={<NewChatPage />} />
              <Route path="/chats/:id" element={<ChatInterfacePage />} />
            </Routes>
          </SupabaseProvider>
        </AuthProvider>
      </MemoryRouter>
    );

    // Fill out the form
    fireEvent.change(screen.getByTestId('chat-title'), {
      target: { value: 'New Chat' }
    });
    fireEvent.change(screen.getByTestId('initial-message'), {
      target: { value: 'Hello, I need some help today' }
    });

    // Submit the form
    fireEvent.click(screen.getByTestId('start-chat-button'));

    // Verify that createChatSession was called
    await waitFor(() => {
      expect(chatService.createChatSession).toHaveBeenCalled();
    });
  });

  it('should send a message in a chat', async () => {
    const chatService = require('../../services/chatService').chat;

    render(
      <MemoryRouter initialEntries={['/chats/session-1']}>
        <AuthProvider>
          <SupabaseProvider>
            <Routes>
              <Route path="/chats/:id" element={<ChatInterfacePage />} />
            </Routes>
          </SupabaseProvider>
        </AuthProvider>
      </MemoryRouter>
    );

    // Type a message
    fireEvent.change(screen.getByTestId('message-input'), {
      target: { value: 'I\'m worried about my upcoming exam' }
    });

    // Send the message
    fireEvent.click(screen.getByTestId('send-button'));

    // Verify that sendMessage was called with the correct parameters
    await waitFor(() => {
      expect(chatService.sendMessage).toHaveBeenCalledWith(
        'session-1',
        'I\'m worried about my upcoming exam'
      );
    });
  });

  it('should delete a chat session', async () => {
    const chatService = require('../../services/chatService').chat;

    render(
      <MemoryRouter initialEntries={['/chats']}>
        <AuthProvider>
          <SupabaseProvider>
            <Routes>
              <Route path="/chats" element={<ChatListPage />} />
            </Routes>
          </SupabaseProvider>
        </AuthProvider>
      </MemoryRouter>
    );

    // Click the delete button for the first chat
    fireEvent.click(screen.getByTestId('delete-chat-1'));

    // Verify that deleteChatSession was called with the correct ID
    await waitFor(() => {
      expect(chatService.deleteChatSession).toHaveBeenCalledWith('session-1');
    });
  });
});
