import React, { useState, useEffect } from 'react';
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
  Chip,
  Divider,
  Grid
} from '@mui/material';
import {
  Save as SaveIcon,
  ArrowBack as ArrowBackIcon,
  Delete as DeleteIcon,
  Lightbulb as LightbulbIcon,
  Analytics as AnalyticsIcon
} from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';
import { useSupabase } from '../../contexts/SupabaseContext';
import { useAuth } from '../../contexts/AuthContext';
import { saveJournalOffline } from '../../services/IndexedDBService';
import { v4 as uuidv4 } from 'uuid';

interface JournalEntry {
  id: string;
  title: string;
  content: string;
  created_at: string;
  updated_at: string;
  user_id: string;
  is_analyzed: boolean;
  sentiment_analysis?: string;
  themes?: string[];
  suggestions?: string[];
}

const JournalEditor: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const isNewJournal = id === 'new';
  const navigate = useNavigate();
  const { supabase } = useSupabase();
  const { user } = useAuth();
  
  const [journal, setJournal] = useState<JournalEntry>({
    id: isNewJournal ? uuidv4() : id || '',
    title: '',
    content: '',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    user_id: user?.id || '',
    is_analyzed: false
  });
  
  const [loading, setLoading] = useState(!isNewJournal);
  const [saving, setSaving] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
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
  
  // Fetch journal if editing existing one
  useEffect(() => {
    const fetchJournal = async () => {
      if (isNewJournal || !user) return;
      
      try {
        setLoading(true);
        
        const { data, error } = await supabase
          .from('journals')
          .select('*')
          .eq('id', id)
          .eq('user_id', user.id)
          .single();
        
        if (error) throw error;
        
        if (data) {
          setJournal(data);
        } else {
          setError('Journal not found');
          navigate('/journals');
        }
      } catch (err) {
        console.error('Error fetching journal:', err);
        setError('Failed to load journal. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchJournal();
  }, [id, isNewJournal, supabase, user, navigate]);
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setJournal(prev => ({
      ...prev,
      [name]: value,
      updated_at: new Date().toISOString()
    }));
  };
  
  const handleSave = async () => {
    if (!journal.title.trim()) {
      setError('Please enter a title for your journal');
      return;
    }
    
    if (!journal.content.trim()) {
      setError('Please enter some content for your journal');
      return;
    }
    
    try {
      setSaving(true);
      
      if (!isOnline) {
        // Save offline
        await saveJournalOffline({
          ...journal,
          user_id: user?.id,
          updated_at: new Date().toISOString()
        });
        
        setSuccess('Journal saved offline. It will sync when you are back online.');
        setSaving(false);
        
        // Navigate back after a short delay
        setTimeout(() => {
          navigate('/journals');
        }, 2000);
        
        return;
      }
      
      // Save online
      const { error } = await supabase
        .from('journals')
        .upsert({
          ...journal,
          user_id: user?.id,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'id'
        });
      
      if (error) throw error;
      
      setSuccess('Journal saved successfully');
      
      // Navigate back after a short delay
      setTimeout(() => {
        navigate('/journals');
      }, 1500);
    } catch (err) {
      console.error('Error saving journal:', err);
      setError('Failed to save journal. Please try again.');
    } finally {
      setSaving(false);
    }
  };
  
  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this journal?')) {
      return;
    }
    
    try {
      setSaving(true);
      
      const { error } = await supabase
        .from('journals')
        .delete()
        .eq('id', journal.id)
        .eq('user_id', user?.id);
      
      if (error) throw error;
      
      setSuccess('Journal deleted successfully');
      
      // Navigate back after a short delay
      setTimeout(() => {
        navigate('/journals');
      }, 1500);
    } catch (err) {
      console.error('Error deleting journal:', err);
      setError('Failed to delete journal. Please try again.');
    } finally {
      setSaving(false);
    }
  };
  
  const handleAnalyze = async () => {
    if (!journal.content.trim()) {
      setError('Please enter some content to analyze');
      return;
    }
    
    try {
      setAnalyzing(true);
      
      // First save the journal
      const { error: saveError } = await supabase
        .from('journals')
        .upsert({
          ...journal,
          user_id: user?.id,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'id'
        });
      
      if (saveError) throw saveError;
      
      // Then trigger analysis
      const { error: analysisError } = await supabase
        .rpc('analyze_journal', {
          journal_id: journal.id
        });
      
      if (analysisError) throw analysisError;
      
      setSuccess('Analysis requested. Results will be available soon.');
      
      // Refresh the journal data after a short delay
      setTimeout(async () => {
        const { data, error } = await supabase
          .from('journals')
          .select('*')
          .eq('id', journal.id)
          .single();
        
        if (!error && data) {
          setJournal(data);
        }
      }, 3000);
    } catch (err) {
      console.error('Error analyzing journal:', err);
      setError('Failed to analyze journal. Please try again.');
    } finally {
      setAnalyzing(false);
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
    <Box sx={{ p: 3, maxWidth: 1200, mx: 'auto' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <IconButton onClick={() => navigate('/journals')} sx={{ mr: 2 }}>
          <ArrowBackIcon />
        </IconButton>
        
        <Typography variant="h4" component="h1">
          {isNewJournal ? 'New Journal Entry' : 'Edit Journal Entry'}
        </Typography>
      </Box>
      
      {!isOnline && (
        <Alert severity="warning" sx={{ mb: 3 }}>
          You are currently offline. Your changes will be saved locally and synced when you're back online.
        </Alert>
      )}
      
      <Paper sx={{ p: 3, mb: 3 }}>
        <TextField
          fullWidth
          label="Title"
          name="title"
          value={journal.title}
          onChange={handleInputChange}
          variant="outlined"
          sx={{ mb: 3 }}
          placeholder="Give your journal entry a title..."
        />
        
        <TextField
          fullWidth
          label="Content"
          name="content"
          value={journal.content}
          onChange={handleInputChange}
          variant="outlined"
          multiline
          rows={12}
          placeholder="Write your thoughts here..."
        />
      </Paper>
      
      {journal.is_analyzed && (
        <Paper sx={{ p: 3, mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            <AnalyticsIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
            Analysis Results
          </Typography>
          
          <Divider sx={{ mb: 2 }} />
          
          <Grid container spacing={3}>
            <Grid item xs={12} md={4}>
              <Typography variant="subtitle1" gutterBottom>
                Sentiment
              </Typography>
              <Chip 
                label={journal.sentiment_analysis || 'Neutral'} 
                color={
                  journal.sentiment_analysis?.includes('POSITIVE') ? 'success' :
                  journal.sentiment_analysis?.includes('NEGATIVE') ? 'error' : 'default'
                }
                sx={{ mt: 1 }}
              />
            </Grid>
            
            <Grid item xs={12} md={4}>
              <Typography variant="subtitle1" gutterBottom>
                Themes
              </Typography>
              <Box>
                {journal.themes?.map((theme, index) => (
                  <Chip 
                    key={index} 
                    label={theme} 
                    sx={{ mr: 1, mt: 1 }} 
                  />
                ))}
                {(!journal.themes || journal.themes.length === 0) && (
                  <Typography variant="body2" color="text.secondary">
                    No themes identified
                  </Typography>
                )}
              </Box>
            </Grid>
            
            <Grid item xs={12} md={4}>
              <Typography variant="subtitle1" gutterBottom>
                Suggestions
              </Typography>
              <Box>
                {journal.suggestions?.map((suggestion, index) => (
                  <Typography key={index} variant="body2" sx={{ mb: 1 }}>
                    • {suggestion}
                  </Typography>
                ))}
                {(!journal.suggestions || journal.suggestions.length === 0) && (
                  <Typography variant="body2" color="text.secondary">
                    No suggestions available
                  </Typography>
                )}
              </Box>
            </Grid>
          </Grid>
        </Paper>
      )}
      
      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
        <Button
          variant="outlined"
          color="error"
          startIcon={<DeleteIcon />}
          onClick={handleDelete}
          disabled={isNewJournal || saving || analyzing}
        >
          Delete
        </Button>
        
        <Box>
          <Button
            variant="outlined"
            startIcon={<LightbulbIcon />}
            onClick={handleAnalyze}
            disabled={!journal.content.trim() || saving || analyzing || !isOnline}
            sx={{ mr: 2 }}
          >
            {analyzing ? <CircularProgress size={24} /> : 'Analyze'}
          </Button>
          
          <Button
            variant="contained"
            color="primary"
            startIcon={saving ? <CircularProgress size={24} color="inherit" /> : <SaveIcon />}
            onClick={handleSave}
            disabled={saving || analyzing}
          >
            Save
          </Button>
        </Box>
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

export default JournalEditor;
