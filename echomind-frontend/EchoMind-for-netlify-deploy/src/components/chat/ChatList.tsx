import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  IconButton,
  Menu,
  MenuItem,
  TextField,
  InputAdornment,
  Button,
  CircularProgress,
  Alert,
  Divider
} from '@mui/material';
import {
  Add as AddIcon,
  Search as SearchIcon,
  MoreVert as MoreVertIcon,
  Delete as DeleteIcon,
  Chat as ChatIcon,
  AccessTime as TimeIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useSupabase } from '../../contexts/SupabaseContext';
import { useAuth } from '../../contexts/AuthContext';

interface ChatSession {
  id: string;
  title: string;
  user_id: string;
  created_at: string;
  updated_at: string;
  last_message: string | null;
  last_message_timestamp: string | null;
}

const ChatList: React.FC = () => {
  const navigate = useNavigate();
  const { supabase } = useSupabase();
  const { user } = useAuth();
  
  const [chats, setChats] = useState<ChatSession[]>([]);
  const [filteredChats, setFilteredChats] = useState<ChatSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedChat, setSelectedChat] = useState<string | null>(null);
  
  useEffect(() => {
    const fetchChats = async () => {
      if (!user) return;
      
      try {
        setLoading(true);
        
        const { data, error } = await supabase
          .from('chat_sessions')
          .select('*')
          .eq('user_id', user.id)
          .order('updated_at', { ascending: false });
        
        if (error) throw error;
        
        setChats(data || []);
        setFilteredChats(data || []);
      } catch (err) {
        console.error('Error fetching chats:', err);
        setError('Failed to load chat sessions. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchChats();
  }, [supabase, user]);
  
  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredChats(chats);
    } else {
      const term = searchTerm.toLowerCase();
      const filtered = chats.filter(chat => 
        chat.title.toLowerCase().includes(term) || 
        (chat.last_message && chat.last_message.toLowerCase().includes(term))
      );
      setFilteredChats(filtered);
    }
  }, [chats, searchTerm]);
  
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };
  
  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, chatId: string) => {
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
    setSelectedChat(chatId);
  };
  
  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedChat(null);
  };
  
  const handleDelete = async () => {
    if (!selectedChat) return;
    
    try {
      const { error } = await supabase
        .from('chat_sessions')
        .delete()
        .eq('id', selectedChat)
        .eq('user_id', user?.id);
      
      if (error) throw error;
      
      // Update local state
      setChats(prev => prev.filter(chat => chat.id !== selectedChat));
    } catch (err) {
      console.error('Error deleting chat:', err);
      setError('Failed to delete chat. Please try again.');
    }
    
    handleMenuClose();
  };
  
  const handleCreateNew = () => {
    navigate('/chat/new');
  };
  
  const handleChatClick = (id: string) => {
    navigate(`/chat/${id}`);
  };
  
  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'No messages yet';
    
    const date = new Date(dateString);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      return date.toLocaleTimeString('en-US', { 
        hour: 'numeric', 
        minute: '2-digit' 
      });
    } else if (diffDays === 1) {
      return 'Yesterday';
    } else if (diffDays < 7) {
      return date.toLocaleDateString('en-US', { weekday: 'long' });
    } else {
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric' 
      });
    }
  };
  
  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          Conversations
        </Typography>
        
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={handleCreateNew}
        >
          New Chat
        </Button>
      </Box>
      
      <TextField
        fullWidth
        placeholder="Search conversations..."
        value={searchTerm}
        onChange={handleSearchChange}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon />
            </InputAdornment>
          ),
        }}
        variant="outlined"
        sx={{ mb: 3 }}
      />
      
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}
      
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
          <CircularProgress />
        </Box>
      ) : filteredChats.length === 0 ? (
        <Alert severity="info">
          {searchTerm ? 'No conversations match your search.' : 'You have no conversations yet. Start a new chat!'}
        </Alert>
      ) : (
        <Grid container spacing={2}>
          {filteredChats.map((chat) => (
            <Grid item xs={12} key={chat.id}>
              <Card 
                sx={{ 
                  display: 'flex', 
                  flexDirection: 'column',
                  cursor: 'pointer',
                  '&:hover': {
                    boxShadow: 3
                  }
                }}
                onClick={() => handleChatClick(chat.id)}
              >
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <ChatIcon sx={{ mr: 1, color: 'primary.main' }} />
                      <Typography variant="h6">
                        {chat.title}
                      </Typography>
                    </Box>
                    
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Typography variant="caption" color="text.secondary" sx={{ mr: 1 }}>
                        <TimeIcon fontSize="small" sx={{ mr: 0.5, fontSize: '1rem', verticalAlign: 'middle' }} />
                        {formatDate(chat.last_message_timestamp)}
                      </Typography>
                      
                      <IconButton 
                        size="small" 
                        onClick={(e) => handleMenuOpen(e, chat.id)}
                      >
                        <MoreVertIcon />
                      </IconButton>
                    </Box>
                  </Box>
                  
                  <Divider sx={{ my: 1 }} />
                  
                  <Typography 
                    variant="body2" 
                    color="text.secondary"
                    sx={{ 
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap'
                    }}
                  >
                    {chat.last_message || 'No messages yet'}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
      
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={handleDelete}>
          <DeleteIcon fontSize="small" sx={{ mr: 1 }} />
          Delete
        </MenuItem>
      </Menu>
    </Box>
  );
};

export default ChatList;
