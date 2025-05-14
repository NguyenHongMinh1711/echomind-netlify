import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  CircularProgress,
  Alert,
  Snackbar,
  IconButton,
  Avatar,
  Divider,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  InputAdornment
} from '@mui/material';
import {
  Send as SendIcon,
  ArrowBack as ArrowBackIcon,
  SmartToy as BotIcon,
  Person as PersonIcon,
  Mic as MicIcon,
  MoreVert as MoreVertIcon
} from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';
import { useSupabase } from '../../contexts/SupabaseContext';
import { useAuth } from '../../contexts/AuthContext';
import { saveMessageOffline } from '../../services/IndexedDBService';
import { v4 as uuidv4 } from 'uuid';

interface Message {
  id: string;
  session_id: string;
  content: string;
  sender: 'user' | 'bot';
  timestamp: string;
  is_read: boolean;
}

interface ChatSession {
  id: string;
  title: string;
  user_id: string;
  created_at: string;
  updated_at: string;
}

const ChatInterface: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const isNewChat = id === 'new';
  const navigate = useNavigate();
  const { supabase } = useSupabase();
  const { user } = useAuth();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const [session, setSession] = useState<ChatSession>({
    id: isNewChat ? uuidv4() : id || '',
    title: isNewChat ? 'New Conversation' : '',
    user_id: user?.id || '',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  });
  
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(!isNewChat);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  
  // Check online status
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);
  
  // Fetch chat session and messages if not new
  useEffect(() => {
    const fetchChatData = async () => {
      if (isNewChat || !user) return;
      
      try {
        setLoading(true);
        
        // Fetch session
        const { data: sessionData, error: sessionError } = await supabase
          .from('chat_sessions')
          .select('*')
          .eq('id', id)
          .eq('user_id', user.id)
          .single();
        
        if (sessionError) throw sessionError;
        
        if (sessionData) {
          setSession(sessionData);
        } else {
          setError('Chat session not found');
          navigate('/chat');
          return;
        }
        
        // Fetch messages
        const { data: messagesData, error: messagesError } = await supabase
          .from('chat_messages')
          .select('*')
          .eq('session_id', id)
          .order('timestamp', { ascending: true });
        
        if (messagesError) throw messagesError;
        
        setMessages(messagesData || []);
      } catch (err) {
        console.error('Error fetching chat data:', err);
        setError('Failed to load chat. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchChatData();
  }, [id, isNewChat, supabase, user, navigate]);
  
  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);
  
  // Add welcome message for new chats
  useEffect(() => {
    if (isNewChat && messages.length === 0) {
      setMessages([
        {
          id: uuidv4(),
          session_id: session.id,
          content: "Hello! I'm EchoMind, your mental wellness companion. How are you feeling today?",
          sender: 'bot',
          timestamp: new Date().toISOString(),
          is_read: true
        }
      ]);
    }
  }, [isNewChat, messages.length, session.id]);
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewMessage(e.target.value);
  };
  
  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;
    
    const userMessage: Message = {
      id: uuidv4(),
      session_id: session.id,
      content: newMessage.trim(),
      sender: 'user',
      timestamp: new Date().toISOString(),
      is_read: true
    };
    
    // Update UI immediately
    setMessages(prev => [...prev, userMessage]);
    setNewMessage('');
    
    try {
      setSending(true);
      
      // If this is a new chat, create the session first
      if (isNewChat) {
        // Update session title based on first message
        const newTitle = newMessage.length > 30 
          ? `${newMessage.substring(0, 30)}...` 
          : newMessage;
        
        const updatedSession = {
          ...session,
          title: newTitle
        };
        
        setSession(updatedSession);
        
        if (isOnline) {
          // Save session to database
          const { error: sessionError } = await supabase
            .from('chat_sessions')
            .insert(updatedSession);
          
          if (sessionError) throw sessionError;
        }
      }
      
      if (!isOnline) {
        // Save message offline
        await saveMessageOffline(userMessage);
        
        // Simulate bot response for offline mode
        const offlineBotMessage: Message = {
          id: uuidv4(),
          session_id: session.id,
          content: "I'm currently offline, but I'll respond to your message when you're back online. Your message has been saved.",
          sender: 'bot',
          timestamp: new Date(Date.now() + 1000).toISOString(),
          is_read: true
        };
        
        setTimeout(() => {
          setMessages(prev => [...prev, offlineBotMessage]);
          setSending(false);
        }, 1500);
        
        return;
      }
      
      // Save user message to database
      const { error: messageError } = await supabase
        .from('chat_messages')
        .insert(userMessage);
      
      if (messageError) throw messageError;
      
      // Get bot response
      const { data: botResponseData, error: botError } = await supabase
        .rpc('get_chat_response', {
          session_id: session.id,
          user_message: newMessage.trim()
        });
      
      if (botError) throw botError;
      
      // Create bot message
      const botMessage: Message = {
        id: uuidv4(),
        session_id: session.id,
        content: botResponseData || "I'm sorry, I couldn't process your message right now. Please try again later.",
        sender: 'bot',
        timestamp: new Date().toISOString(),
        is_read: true
      };
      
      // Save bot message to database
      const { error: botMessageError } = await supabase
        .from('chat_messages')
        .insert(botMessage);
      
      if (botMessageError) throw botMessageError;
      
      // Update UI with bot message
      setMessages(prev => [...prev, botMessage]);
    } catch (err) {
      console.error('Error sending message:', err);
      setError('Failed to send message. Please try again.');
    } finally {
      setSending(false);
    }
  };
  
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };
  
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }
  
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 64px)' }}>
      {/* Chat Header */}
      <Box sx={{ 
        p: 2, 
        borderBottom: '1px solid', 
        borderColor: 'divider',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <IconButton onClick={() => navigate('/chat')} sx={{ mr: 2 }}>
            <ArrowBackIcon />
          </IconButton>
          
          <Avatar sx={{ bgcolor: 'primary.main', mr: 2 }}>
            <BotIcon />
          </Avatar>
          
          <Typography variant="h6">
            {session.title}
          </Typography>
        </Box>
        
        <IconButton>
          <MoreVertIcon />
        </IconButton>
      </Box>
      
      {/* Offline Warning */}
      {!isOnline && (
        <Alert severity="warning" sx={{ borderRadius: 0 }}>
          You are currently offline. Your messages will be saved locally and sent when you're back online.
        </Alert>
      )}
      
      {/* Messages List */}
      <Box sx={{ 
        flexGrow: 1, 
        overflowY: 'auto', 
        p: 2,
        display: 'flex',
        flexDirection: 'column'
      }}>
        <List sx={{ width: '100%' }}>
          {messages.map((message) => (
            <ListItem
              key={message.id}
              alignItems="flex-start"
              sx={{
                flexDirection: message.sender === 'user' ? 'row-reverse' : 'row',
                mb: 2
              }}
            >
              <ListItemAvatar>
                <Avatar sx={{ 
                  bgcolor: message.sender === 'user' ? 'secondary.main' : 'primary.main',
                  ml: message.sender === 'user' ? 2 : 0,
                  mr: message.sender === 'user' ? 0 : 2
                }}>
                  {message.sender === 'user' ? <PersonIcon /> : <BotIcon />}
                </Avatar>
              </ListItemAvatar>
              
              <Paper sx={{ 
                p: 2, 
                maxWidth: '70%',
                bgcolor: message.sender === 'user' ? 'secondary.light' : 'grey.100',
                borderRadius: 2
              }}>
                <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
                  {message.content}
                </Typography>
                
                <Typography variant="caption" color="text.secondary" sx={{ 
                  display: 'block', 
                  mt: 1,
                  textAlign: message.sender === 'user' ? 'right' : 'left'
                }}>
                  {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </Typography>
              </Paper>
            </ListItem>
          ))}
        </List>
        
        {/* Auto-scroll anchor */}
        <div ref={messagesEndRef} />
        
        {/* Typing indicator */}
        {sending && (
          <Box sx={{ display: 'flex', alignItems: 'center', ml: 7, mb: 2 }}>
            <CircularProgress size={16} sx={{ mr: 1 }} />
            <Typography variant="body2" color="text.secondary">
              EchoMind is typing...
            </Typography>
          </Box>
        )}
      </Box>
      
      {/* Message Input */}
      <Box sx={{ 
        p: 2, 
        borderTop: '1px solid', 
        borderColor: 'divider',
        bgcolor: 'background.paper'
      }}>
        <TextField
          fullWidth
          placeholder="Type your message..."
          value={newMessage}
          onChange={handleInputChange}
          onKeyPress={handleKeyPress}
          disabled={sending}
          multiline
          maxRows={4}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton sx={{ mr: 1 }}>
                  <MicIcon />
                </IconButton>
                <Button
                  variant="contained"
                  color="primary"
                  endIcon={<SendIcon />}
                  onClick={handleSendMessage}
                  disabled={!newMessage.trim() || sending}
                >
                  Send
                </Button>
              </InputAdornment>
            ),
          }}
        />
      </Box>
      
      <Snackbar
        open={!!error}
        autoHideDuration={6000}
        onClose={() => setError(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={() => setError(null)} severity="error">
          {error}
        </Alert>
      </Snackbar>
      
      <Snackbar
        open={!!success}
        autoHideDuration={6000}
        onClose={() => setSuccess(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={() => setSuccess(null)} severity="success">
          {success}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default ChatInterface;
