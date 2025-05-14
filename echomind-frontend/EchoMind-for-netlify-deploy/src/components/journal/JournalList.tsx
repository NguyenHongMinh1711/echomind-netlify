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
  Chip,
  CircularProgress,
  Alert
} from '@mui/material';
import {
  Add as AddIcon,
  Search as SearchIcon,
  MoreVert as MoreVertIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  SentimentSatisfied as SentimentIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useSupabase } from '../../contexts/SupabaseContext';
import { useAuth } from '../../contexts/AuthContext';

interface Journal {
  id: string;
  title: string;
  content: string;
  created_at: string;
  updated_at: string;
  user_id: string;
  is_analyzed: boolean;
  sentiment_analysis?: string;
  themes?: string[];
}

const JournalList: React.FC = () => {
  const navigate = useNavigate();
  const { supabase } = useSupabase();
  const { user } = useAuth();
  
  const [journals, setJournals] = useState<Journal[]>([]);
  const [filteredJournals, setFilteredJournals] = useState<Journal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedJournal, setSelectedJournal] = useState<string | null>(null);
  
  useEffect(() => {
    const fetchJournals = async () => {
      if (!user) return;
      
      try {
        setLoading(true);
        
        const { data, error } = await supabase
          .from('journals')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });
        
        if (error) throw error;
        
        setJournals(data || []);
        setFilteredJournals(data || []);
      } catch (err) {
        console.error('Error fetching journals:', err);
        setError('Failed to load journals. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchJournals();
  }, [supabase, user]);
  
  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredJournals(journals);
    } else {
      const term = searchTerm.toLowerCase();
      const filtered = journals.filter(journal => 
        journal.title.toLowerCase().includes(term) || 
        journal.content.toLowerCase().includes(term)
      );
      setFilteredJournals(filtered);
    }
  }, [journals, searchTerm]);
  
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };
  
  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, journalId: string) => {
    setAnchorEl(event.currentTarget);
    setSelectedJournal(journalId);
  };
  
  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedJournal(null);
  };
  
  const handleEdit = () => {
    if (selectedJournal) {
      navigate(`/journal/edit/${selectedJournal}`);
    }
    handleMenuClose();
  };
  
  const handleDelete = async () => {
    if (!selectedJournal) return;
    
    try {
      const { error } = await supabase
        .from('journals')
        .delete()
        .eq('id', selectedJournal)
        .eq('user_id', user?.id);
      
      if (error) throw error;
      
      // Update local state
      setJournals(prev => prev.filter(journal => journal.id !== selectedJournal));
    } catch (err) {
      console.error('Error deleting journal:', err);
      setError('Failed to delete journal. Please try again.');
    }
    
    handleMenuClose();
  };
  
  const handleCreateNew = () => {
    navigate('/journal/new');
  };
  
  const handleJournalClick = (id: string) => {
    navigate(`/journal/${id}`);
  };
  
  const getSentimentColor = (sentiment?: string) => {
    if (!sentiment) return '#9e9e9e'; // Gray for neutral/unknown
    
    switch (sentiment.toUpperCase()) {
      case 'VERY_POSITIVE':
        return '#4caf50'; // Green
      case 'POSITIVE':
        return '#8bc34a'; // Light Green
      case 'NEUTRAL':
        return '#9e9e9e'; // Gray
      case 'NEGATIVE':
        return '#ff9800'; // Orange
      case 'VERY_NEGATIVE':
        return '#f44336'; // Red
      default:
        return '#9e9e9e'; // Gray
    }
  };
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };
  
  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          Journals
        </Typography>
        
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={handleCreateNew}
        >
          New Journal
        </Button>
      </Box>
      
      <TextField
        fullWidth
        placeholder="Search journals..."
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
      ) : filteredJournals.length === 0 ? (
        <Alert severity="info">
          {searchTerm ? 'No journals match your search.' : 'You have no journals yet. Create your first one!'}
        </Alert>
      ) : (
        <Grid container spacing={3}>
          {filteredJournals.map((journal) => (
            <Grid item xs={12} sm={6} md={4} key={journal.id}>
              <Card 
                sx={{ 
                  height: '100%', 
                  display: 'flex', 
                  flexDirection: 'column',
                  cursor: 'pointer',
                  '&:hover': {
                    boxShadow: 6
                  }
                }}
                onClick={() => handleJournalClick(journal.id)}
              >
                <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <Typography variant="h6" component="h2" gutterBottom>
                      {journal.title}
                    </Typography>
                    
                    <IconButton 
                      size="small" 
                      onClick={(e) => {
                        e.stopPropagation();
                        handleMenuOpen(e, journal.id);
                      }}
                    >
                      <MoreVertIcon />
                    </IconButton>
                  </Box>
                  
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    {formatDate(journal.created_at)}
                  </Typography>
                  
                  <Typography 
                    variant="body2" 
                    sx={{ 
                      mb: 2,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      display: '-webkit-box',
                      WebkitLineClamp: 3,
                      WebkitBoxOrient: 'vertical',
                    }}
                  >
                    {journal.content}
                  </Typography>
                  
                  {journal.is_analyzed && (
                    <Box sx={{ mt: 'auto' }}>
                      <Chip 
                        label={journal.sentiment_analysis || 'Neutral'} 
                        size="small" 
                        sx={{ 
                          mr: 1, 
                          backgroundColor: getSentimentColor(journal.sentiment_analysis),
                          color: 'white'
                        }} 
                      />
                      {journal.themes && journal.themes.slice(0, 2).map((theme, index) => (
                        <Chip 
                          key={index} 
                          label={theme} 
                          size="small" 
                          sx={{ mr: 1, mt: 1 }} 
                        />
                      ))}
                    </Box>
                  )}
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
        <MenuItem onClick={handleEdit}>
          <EditIcon fontSize="small" sx={{ mr: 1 }} />
          Edit
        </MenuItem>
        <MenuItem onClick={handleDelete}>
          <DeleteIcon fontSize="small" sx={{ mr: 1 }} />
          Delete
        </MenuItem>
      </Menu>
    </Box>
  );
};

export default JournalList;
