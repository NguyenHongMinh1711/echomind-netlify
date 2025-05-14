import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  Grid,
  Card,
  CardContent,
  CardActions,
  IconButton,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  useTheme,
  Divider,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Mood as MoodIcon,
  MoodBad as MoodBadIcon,
  SentimentSatisfied as NeutralIcon,
  SentimentVerySatisfied as HappyIcon,
  SentimentVeryDissatisfied as SadIcon
} from '@mui/icons-material';
import { useSupabase } from '../contexts/SupabaseContext';
import MainLayout from '../layouts/MainLayout';
// Import services when needed
// import * as services from '../services';

// Mood types
type Mood = 'very_happy' | 'happy' | 'neutral' | 'sad' | 'very_sad';

// Journal entry type
interface JournalEntry {
  id: string;
  title: string;
  content: string;
  mood: Mood;
  created_at: Date;
}

const Journal: React.FC = () => {
  const { supabase, session } = useSupabase();
  const theme = useTheme();

  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [currentEntry, setCurrentEntry] = useState<JournalEntry | null>(null);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [mood, setMood] = useState<Mood>('neutral');
  const [filter, setFilter] = useState<Mood | 'all'>('all');

  // Load journal entries
  useEffect(() => {
    const loadEntries = async () => {
      try {
        setLoading(true);
        console.log('Loading journal entries...');

        // For now, just use placeholder data
        const placeholderData = [
          {
            id: '1',
            title: 'First Journal Entry',
            content: 'This is a sample journal entry to demonstrate the UI. I felt pretty good today after going for a walk in the park and meeting a friend for coffee. These small activities really helped improve my mood.',
            mood: 'happy' as Mood,
            created_at: new Date(Date.now() - 86400000)
          },
          {
            id: '2',
            title: 'Feeling Down Today',
            content: 'Today was challenging. I struggled with motivation and found it hard to focus on my tasks. I think I need to be more gentle with myself and remember that progress isn\'t always linear.',
            mood: 'sad' as Mood,
            created_at: new Date(Date.now() - 172800000)
          },
          {
            id: '3',
            title: 'Mixed Emotions',
            content: 'I had both ups and downs today. Started with anxiety about my upcoming presentation, but after practicing it went much better than expected. Reminder to self: most things aren\'t as scary as they seem beforehand.',
            mood: 'neutral' as Mood,
            created_at: new Date(Date.now() - 259200000)
          },
          {
            id: '4',
            title: 'Great Achievement',
            content: 'I finally completed that project I\'ve been working on for weeks! The sense of accomplishment is amazing. I should celebrate these victories more often, even the small ones.',
            mood: 'very_happy' as Mood,
            created_at: new Date(Date.now() - 345600000)
          }
        ];

        console.log('Setting journal entries:', placeholderData);
        setEntries(placeholderData);
      } catch (error) {
        console.error('Error loading journal entries:', error);
      } finally {
        setLoading(false);
      }
    };

    // Call the function immediately
    loadEntries();
  }, []);

  const handleOpenDialog = (entry: JournalEntry | null = null) => {
    if (entry) {
      setCurrentEntry(entry);
      setTitle(entry.title);
      setContent(entry.content);
      setMood(entry.mood);
    } else {
      setCurrentEntry(null);
      setTitle('');
      setContent('');
      setMood('neutral');
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  const handleSaveEntry = async () => {
    if (!title.trim() || !content.trim()) return;

    try {
      setLoading(true);

      if (currentEntry) {
        // Update existing entry
        const updatedEntry = {
          ...currentEntry,
          title,
          content,
          mood
        };

        // This would be replaced with actual Supabase update
        // const updatedEntryData = await services.updateJournalEntry(currentEntry.id, {
        //   title,
        //   content,
        //   mood
        // });

        setEntries(prev =>
          prev.map(entry => entry.id === currentEntry.id ? updatedEntry : entry)
        );
      } else {
        // Create new entry
        const newEntry: JournalEntry = {
          id: Date.now().toString(),
          title,
          content,
          mood,
          created_at: new Date()
        };

        // This would be replaced with actual Supabase insert
        // const newEntryData = await services.createJournalEntry({
        //   title,
        //   content,
        //   mood
        // });

        setEntries(prev => [newEntry, ...prev]);
      }

      handleCloseDialog();
    } catch (error) {
      console.error('Error saving journal entry:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteEntry = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this journal entry?')) return;

    try {
      setLoading(true);

      // This would be replaced with actual Supabase delete
      // await services.deleteJournalEntry(id);

      setEntries(prev => prev.filter(entry => entry.id !== id));
    } catch (error) {
      console.error('Error deleting journal entry:', error);
    } finally {
      setLoading(false);
    }
  };

  // Get mood icon based on mood value
  const getMoodIcon = (mood: Mood) => {
    switch (mood) {
      case 'very_happy': return <HappyIcon color="success" />;
      case 'happy': return <MoodIcon color="success" />;
      case 'neutral': return <NeutralIcon color="info" />;
      case 'sad': return <MoodBadIcon color="warning" />;
      case 'very_sad': return <SadIcon color="error" />;
      default: return <NeutralIcon />;
    }
  };

  // Filter entries based on selected mood
  const filteredEntries = filter === 'all'
    ? entries
    : entries.filter(entry => entry.mood === filter);

  return (
    <MainLayout>
      <Box>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h4" component="h1">
            Journal
          </Typography>
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={() => handleOpenDialog()}
          >
            New Entry
          </Button>
        </Box>

        <Typography variant="body1" color="text.secondary" paragraph>
          Record your thoughts and track your mood over time.
        </Typography>

        <Box sx={{ mb: 3 }}>
          <FormControl variant="outlined" size="small" sx={{ minWidth: 200 }}>
            <InputLabel>Filter by Mood</InputLabel>
            <Select
              value={filter}
              onChange={(e) => setFilter(e.target.value as Mood | 'all')}
              label="Filter by Mood"
            >
              <MenuItem value="all">All Entries</MenuItem>
              <MenuItem value="very_happy">Very Happy</MenuItem>
              <MenuItem value="happy">Happy</MenuItem>
              <MenuItem value="neutral">Neutral</MenuItem>
              <MenuItem value="sad">Sad</MenuItem>
              <MenuItem value="very_sad">Very Sad</MenuItem>
            </Select>
          </FormControl>
        </Box>

        {loading && entries.length === 0 ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress />
          </Box>
        ) : filteredEntries.length === 0 ? (
          <Paper sx={{ p: 3, textAlign: 'center' }}>
            <Typography variant="body1">
              {filter === 'all'
                ? 'No journal entries yet. Create your first entry!'
                : 'No entries found with the selected mood filter.'}
            </Typography>
          </Paper>
        ) : (
          <Grid container spacing={3}>
            {filteredEntries.map(entry => (
              <Grid item xs={12} sm={6} md={4} key={entry.id}>
                <Card
                  elevation={2}
                  sx={{
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: 4
                    }
                  }}
                >
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="h6" component="h2" noWrap>
                        {entry.title}
                      </Typography>
                      {getMoodIcon(entry.mood)}
                    </Box>
                    <Typography variant="caption" color="text.secondary" component="p">
                      {entry.created_at.toLocaleDateString()}
                    </Typography>
                    <Divider sx={{ my: 1 }} />
                    <Typography
                      variant="body2"
                      sx={{
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        display: '-webkit-box',
                        WebkitLineClamp: 4,
                        WebkitBoxOrient: 'vertical'
                      }}
                    >
                      {entry.content}
                    </Typography>
                  </CardContent>
                  <CardActions>
                    <IconButton
                      size="small"
                      onClick={() => handleOpenDialog(entry)}
                      title="Edit entry"
                    >
                      <EditIcon fontSize="small" />
                    </IconButton>
                    <IconButton
                      size="small"
                      color="error"
                      onClick={() => handleDeleteEntry(entry.id)}
                      title="Delete entry"
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}

        {/* Journal Entry Dialog */}
        <Dialog
          open={openDialog}
          onClose={handleCloseDialog}
          fullWidth
          maxWidth="md"
        >
          <DialogTitle>
            {currentEntry ? 'Edit Journal Entry' : 'New Journal Entry'}
          </DialogTitle>
          <DialogContent>
            <TextField
              autoFocus
              margin="dense"
              label="Title"
              fullWidth
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              sx={{ mb: 2 }}
            />
            <TextField
              label="Content"
              multiline
              rows={8}
              fullWidth
              value={content}
              onChange={(e) => setContent(e.target.value)}
              required
              sx={{ mb: 2 }}
            />
            <FormControl fullWidth>
              <InputLabel>Mood</InputLabel>
              <Select
                value={mood}
                onChange={(e) => setMood(e.target.value as Mood)}
                label="Mood"
              >
                <MenuItem value="very_happy">Very Happy</MenuItem>
                <MenuItem value="happy">Happy</MenuItem>
                <MenuItem value="neutral">Neutral</MenuItem>
                <MenuItem value="sad">Sad</MenuItem>
                <MenuItem value="very_sad">Very Sad</MenuItem>
              </Select>
            </FormControl>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog}>Cancel</Button>
            <Button
              onClick={handleSaveEntry}
              variant="contained"
              color="primary"
              disabled={!title.trim() || !content.trim() || loading}
            >
              {loading ? <CircularProgress size={24} /> : 'Save'}
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </MainLayout>
  );
};

export default Journal;
