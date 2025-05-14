import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Divider,
  IconButton,
  TextField,
  InputAdornment,
  CircularProgress,
  Paper,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Snackbar,
  Alert
} from '@mui/material';
import {
  Chat as ChatIcon,
  Search as SearchIcon,
  Delete as DeleteIcon,
  Add as AddIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';
import { chat } from '../services/chatService';

interface ChatSession {
  id: string;
  title: string;
  created_at: string;
  updated_at: string;
  last_message?: string;
  last_message_timestamp?: string;
}

const ChatHistory: React.FC = () => {
  const navigate = useNavigate();

  const [chatSessions, setChatSessions] = useState<ChatSession[]>([]);
  const [filteredSessions, setFilteredSessions] = useState<ChatSession[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [sessionToDelete, setSessionToDelete] = useState<string | null>(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });

  useEffect(() => {
    fetchChatSessions();
  }, []);

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredSessions(chatSessions);
    } else {
      const filtered = chatSessions.filter(session =>
        session.title.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredSessions(filtered);
    }
  }, [searchQuery, chatSessions]);

  const fetchChatSessions = async () => {
    try {
      setLoading(true);
      const sessions = await chat.getChatSessions();
      setChatSessions(sessions);
      setFilteredSessions(sessions);
    } catch (error) {
      console.error('Error fetching chat sessions:', error);
      setSnackbar({
        open: true,
        message: 'Failed to load chat history',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDeleteDialog = (e: React.MouseEvent, sessionId: string) => {
    e.stopPropagation();
    setSessionToDelete(sessionId);
    setDeleteDialogOpen(true);
  };

  const handleCloseDeleteDialog = () => {
    setDeleteDialogOpen(false);
    setSessionToDelete(null);
  };

  const handleDeleteSession = async () => {
    if (!sessionToDelete) return;

    try {
      await chat.deleteChatSession(sessionToDelete);

      // Update the local state
      setChatSessions(prev => prev.filter(session => session.id !== sessionToDelete));

      setSnackbar({
        open: true,
        message: 'Conversation deleted successfully',
        severity: 'success'
      });
    } catch (error) {
      console.error('Error deleting chat session:', error);
      setSnackbar({
        open: true,
        message: 'Failed to delete conversation',
        severity: 'error'
      });
    } finally {
      handleCloseDeleteDialog();
    }
  };

  const handleContinueChat = (sessionId: string) => {
    navigate(`/chat/${sessionId}`);
  };

  const handleStartNewChat = () => {
    navigate('/chat');
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  if (loading) {
    return (
      <MainLayout>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
          <CircularProgress />
        </Box>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <Box sx={{ height: 'calc(100vh - 120px)', display: 'flex', flexDirection: 'column' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4" component="h1">
            Conversation History
          </Typography>
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={handleStartNewChat}
          >
            New Conversation
          </Button>
        </Box>

        <Paper sx={{ mb: 3, p: 1 }}>
          <TextField
            fullWidth
            placeholder="Search conversations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
            size="small"
          />
        </Paper>

        {filteredSessions.length === 0 ? (
          <Paper sx={{ p: 3, textAlign: 'center' }}>
            <Typography variant="body1" color="textSecondary">
              {searchQuery.trim() !== ''
                ? 'No conversations match your search.'
                : 'You haven\'t started any conversations yet.'}
            </Typography>
            {searchQuery.trim() === '' && (
              <Button
                variant="contained"
                color="primary"
                sx={{ mt: 2 }}
                onClick={handleStartNewChat}
              >
                Start a Conversation
              </Button>
            )}
          </Paper>
        ) : (
          <List sx={{ bgcolor: 'background.paper', flexGrow: 1, overflow: 'auto' }}>
            {filteredSessions.map((session, index) => (
              <React.Fragment key={session.id}>
                <ListItem
                  alignItems="flex-start"
                  button
                  onClick={() => handleContinueChat(session.id)}
                  secondaryAction={
                    <IconButton
                      edge="end"
                      aria-label="delete"
                      onClick={(e) => handleOpenDeleteDialog(e, session.id)}
                    >
                      <DeleteIcon />
                    </IconButton>
                  }
                >
                  <ListItemAvatar>
                    <Avatar sx={{ bgcolor: 'secondary.main' }}>
                      <ChatIcon />
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={session.title}
                    secondary={
                      <React.Fragment>
                        {`Last updated ${formatDate(session.updated_at || session.created_at)}`}
                      </React.Fragment>
                    }
                  />
                </ListItem>
                {index < filteredSessions.length - 1 && <Divider variant="inset" component="li" />}
              </React.Fragment>
            ))}
          </List>
        )}

        {/* Delete Confirmation Dialog */}
        <Dialog
          open={deleteDialogOpen}
          onClose={handleCloseDeleteDialog}
        >
          <DialogTitle>Delete Conversation</DialogTitle>
          <DialogContent>
            <DialogContentText>
              Are you sure you want to delete this conversation? This action cannot be undone.
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDeleteDialog}>Cancel</Button>
            <Button onClick={handleDeleteSession} color="error">Delete</Button>
          </DialogActions>
        </Dialog>

        {/* Snackbar for notifications */}
        <Snackbar open={snackbar.open} autoHideDuration={6000} onClose={() => setSnackbar({ ...snackbar, open: false })}>
          <Alert onClose={() => setSnackbar({ ...snackbar, open: false })} severity={snackbar.severity} sx={{ width: '100%' }}>
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Box>
    </MainLayout>
  );
};

export default ChatHistory;
