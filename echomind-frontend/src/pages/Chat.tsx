import React, { useState, useRef, useEffect } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  List,
  ListItem,
  ListItemText,
  CircularProgress,
  Divider,
  IconButton,
  useTheme,
  Alert,
  Snackbar
} from '@mui/material';
import { Send as SendIcon, Delete as DeleteIcon, History as HistoryIcon } from '@mui/icons-material';
import { useSupabase } from '../contexts/SupabaseContext';
import { useNavigate, useParams } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';
import { sendMessageToMistral } from '../utils/simpleMistralClient';
import { chat } from '../services/chatService';

const Chat: React.FC = () => {
  const { supabase, session } = useSupabase();
  const theme = useTheme();
  const navigate = useNavigate();
  const { conversationId } = useParams<{ conversationId?: string }>();
  const [message, setMessage] = useState('');
  // Local message type with Date object for timestamp
  interface LocalMessage {
    id: string;
    text: string;
    sender: 'user' | 'assistant';
    timestamp: Date;
    session_id?: string;
  }

  const [messages, setMessages] = useState<LocalMessage[]>([]);
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Load chat history
  useEffect(() => {
    const loadChatHistory = async () => {
      try {
        setLoading(true);

        if (conversationId && conversationId !== 'new') {
          // Load existing conversation
          setCurrentConversationId(conversationId);

          try {
            const chatMessages = await chat.getChatMessages(conversationId);

            // Convert to local message format
            const localMessages: LocalMessage[] = chatMessages.map(msg => ({
              id: msg.id,
              text: msg.content,
              sender: msg.role,
              timestamp: new Date(msg.timestamp),
              session_id: msg.session_id
            }));

            setMessages(localMessages);
          } catch (error) {
            console.error('Error loading messages:', error);
            setError('Failed to load conversation messages');
          }
        } else {
          // Create a new conversation if needed
          try {
            if (!session?.user) {
              // If not logged in, use a placeholder conversation
              setCurrentConversationId('placeholder-conversation');
            } else {
              // Create a new conversation in the database
              const newConversation = await chat.createChatSession({ title: 'New Conversation' });
              setCurrentConversationId(newConversation.id);
            }

            // Set welcome message
            setMessages([
              {
                id: 'welcome',
                text: 'Hello! How can I help you today?',
                sender: 'assistant',
                timestamp: new Date(),
                session_id: currentConversationId || undefined
              }
            ]);
          } catch (error) {
            console.error('Error creating conversation:', error);
            setError('Failed to create a new conversation');

            // Fallback to placeholder
            setCurrentConversationId('placeholder-conversation');
            setMessages([
              {
                id: 'welcome',
                text: 'Hello! How can I help you today?',
                sender: 'assistant',
                timestamp: new Date(),
                session_id: 'placeholder-conversation'
              }
            ]);
          }
        }
      } catch (error) {
        console.error('Error loading chat history:', error);
        setError('Failed to load chat history');
      } finally {
        setLoading(false);
      }
    };

    loadChatHistory();
  }, [conversationId, session]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!message.trim() || !currentConversationId) return;

    // Add user message to UI immediately for better UX
    const userMessage: LocalMessage = {
      id: `user-${Date.now()}`,
      text: message,
      sender: 'user',
      timestamp: new Date(),
      session_id: currentConversationId
    };

    setMessages(prev => [...prev, userMessage]);
    setMessage('');
    setLoading(true);

    try {
      // Get conversation history for context (last 6 messages)
      const conversationHistory = messages.slice(-6).map(msg => ({
        role: msg.sender === 'user' ? 'user' : 'assistant',
        content: msg.text
      }));

      // Call Mistral API
      const mistralResponse = await sendMessageToMistral(message, conversationHistory);

      // Add AI response to UI
      const aiResponse: LocalMessage = {
        id: `ai-${Date.now()}`,
        text: mistralResponse,
        sender: 'assistant',
        timestamp: new Date(),
        session_id: currentConversationId
      };

      setMessages(prev => [...prev, aiResponse]);
    } catch (error) {
      console.error('Error in chat:', error);

      // Add error message to UI
      const errorResponse: LocalMessage = {
        id: `error-${Date.now()}`,
        text: 'Sorry, I encountered an error. Please try again.',
        sender: 'assistant',
        timestamp: new Date(),
        session_id: currentConversationId
      };

      setMessages(prev => [...prev, errorResponse]);
      setError('Failed to get response from AI. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleClearChat = async () => {
    if (!currentConversationId) return;

    if (window.confirm('Are you sure you want to clear the chat history? This will delete the current conversation.')) {
      try {
        setLoading(true);

        // Reset conversation
        setCurrentConversationId('placeholder-conversation');

        // Reset messages with welcome message
        setMessages([
          {
            id: 'welcome',
            text: 'Hello! How can I help you today?',
            sender: 'assistant',
            timestamp: new Date(),
            session_id: 'placeholder-conversation'
          }
        ]);
      } catch (error) {
        console.error('Error clearing chat:', error);
      } finally {
        setLoading(false);
      }
    }
  };

  // Handle closing error snackbar
  const handleCloseError = () => {
    setError(null);
  };

  const handleViewHistory = () => {
    navigate('/chat/history');
  };

  // Loading indicator
  if (loading) {
    return (
      <MainLayout>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
          <CircularProgress size={60} />
        </Box>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <Box sx={{ height: 'calc(100vh - 120px)', display: 'flex', flexDirection: 'column' }}>
        {/* Error Snackbar */}
        <Snackbar
          open={!!error}
          autoHideDuration={6000}
          onClose={handleCloseError}
          anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        >
          <Alert onClose={handleCloseError} severity="error" sx={{ width: '100%' }}>
            {error}
          </Alert>
        </Snackbar>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h4" component="h1">
            Chat Support
          </Typography>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              variant="outlined"
              color="primary"
              startIcon={<HistoryIcon />}
              onClick={handleViewHistory}
              title="View chat history"
            >
              History
            </Button>
            <IconButton
              color="error"
              onClick={handleClearChat}
              disabled={messages.length === 0}
              title="Clear chat history"
            >
              <DeleteIcon />
            </IconButton>
          </Box>
        </Box>

        <Typography variant="body1" color="text.secondary" paragraph>
          Talk with our AI assistant for emotional support and guidance.
        </Typography>

        <Paper
          elevation={3}
          sx={{
            flexGrow: 1,
            mb: 2,
            p: 2,
            overflow: 'auto',
            bgcolor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.02)'
          }}
        >
          {messages.length === 0 ? (
            <Box sx={{
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
              color: 'text.secondary'
            }}>
              <Typography variant="body1" align="center">
                No messages yet. Start a conversation!
              </Typography>
            </Box>
          ) : (
            <List>
              {messages.map((msg, index) => (
                <React.Fragment key={msg.id}>
                  <ListItem
                    alignItems="flex-start"
                    sx={{
                      flexDirection: msg.sender === 'user' ? 'row-reverse' : 'row',
                      px: 1
                    }}
                  >
                    <Paper
                      elevation={1}
                      sx={{
                        p: 2,
                        maxWidth: '80%',
                        bgcolor: msg.sender === 'user'
                          ? theme.palette.primary.main
                          : theme.palette.mode === 'dark'
                            ? 'rgba(255, 255, 255, 0.1)'
                            : 'rgba(0, 0, 0, 0.05)',
                        color: msg.sender === 'user'
                          ? theme.palette.primary.contrastText
                          : 'text.primary'
                      }}
                    >
                      <ListItemText
                        primary={msg.text}
                        secondary={msg.timestamp.toLocaleTimeString()}
                        secondaryTypographyProps={{
                          color: msg.sender === 'user' ? 'rgba(255, 255, 255, 0.7)' : 'text.secondary',
                          fontSize: '0.75rem'
                        }}
                      />
                    </Paper>
                  </ListItem>
                  {index < messages.length - 1 && (
                    <Box sx={{ my: 1 }} />
                  )}
                </React.Fragment>
              ))}
              <div ref={messagesEndRef} />
            </List>
          )}
        </Paper>

        <Box component="form" onSubmit={handleSendMessage} sx={{ display: 'flex', gap: 1 }}>
          <TextField
            fullWidth
            placeholder="Type your message..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            disabled={loading}
            variant="outlined"
            size="medium"
            autoComplete="off"
          />
          <Button
            type="submit"
            variant="contained"
            color="primary"
            disabled={!message.trim() || loading}
            sx={{ minWidth: '100px' }}
            endIcon={loading ? <CircularProgress size={20} color="inherit" /> : <SendIcon />}
          >
            Send
          </Button>
        </Box>
      </Box>
    </MainLayout>
  );
};

export default Chat;
