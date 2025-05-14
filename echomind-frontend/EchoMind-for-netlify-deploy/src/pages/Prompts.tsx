import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  TextField,
  Button,
  Card,
  CardContent,
  CardActions,
  Grid,
  Divider,
  CircularProgress,
  Chip,
  useTheme,
  IconButton
} from '@mui/material';
import {
  Send as SendIcon,
  History as HistoryIcon,
  Refresh as RefreshIcon,
  FormatQuote as QuoteIcon,
  Bookmark as BookmarkIcon,
  BookmarkBorder as BookmarkBorderIcon,
  Delete as DeleteIcon
} from '@mui/icons-material';
import { useSupabase } from '../contexts/SupabaseContext';
import MainLayout from '../layouts/MainLayout';

// Prompt response interface
interface PromptResponse {
  id: string;
  prompt: string;
  response: string;
  created_at: Date;
  is_bookmarked: boolean;
}

const Prompts: React.FC = () => {
  const { supabase, session } = useSupabase();
  const theme = useTheme();

  const [currentPrompt, setCurrentPrompt] = useState('');
  const [response, setResponse] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [promptHistory, setPromptHistory] = useState<PromptResponse[]>([]);

  // Load current prompt and history
  useEffect(() => {
    const loadPromptData = async () => {
      try {
        setIsLoading(true);

        // For now, just use placeholder data
        setCurrentPrompt('What are three things you are grateful for today?');

        const placeholderHistory: PromptResponse[] = [
          {
            id: '1',
            prompt: 'What is one small step you can take today to improve your mood?',
            response: 'I can take a 15-minute walk outside to get some fresh air and sunlight.',
            created_at: new Date(Date.now() - 86400000),
            is_bookmarked: true
          },
          {
            id: '2',
            prompt: 'Describe a moment when you felt proud of yourself recently.',
            response: 'I felt proud when I finished that difficult project at work despite all the challenges.',
            created_at: new Date(Date.now() - 172800000),
            is_bookmarked: false
          }
        ];

        setPromptHistory(placeholderHistory);
      } catch (error) {
        console.error('Error loading prompt data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadPromptData();
  }, []);

  const handleSubmitResponse = async () => {
    if (!response.trim()) return;

    try {
      setIsSubmitting(true);

      // This would be replaced with actual Supabase insert
      // const { error } = await supabase
      //   .from('prompt_responses')
      //   .insert([{
      //     prompt: currentPrompt,
      //     response,
      //     user_id: session.user.id
      //   }]);

      // Add to history
      const newResponse: PromptResponse = {
        id: Date.now().toString(),
        prompt: currentPrompt,
        response,
        created_at: new Date(),
        is_bookmarked: false
      };

      setPromptHistory(prev => [newResponse, ...prev]);
      setResponse('');
      setShowHistory(true);
    } catch (error) {
      console.error('Error submitting prompt response:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRefreshPrompt = async () => {
    try {
      setIsLoading(true);

      // This would be replaced with actual Supabase query
      // const { data, error } = await supabase
      //   .from('daily_prompts')
      //   .select('*')
      //   .order('created_at', { ascending: false })
      //   .limit(5);

      // For now, just rotate through some sample prompts
      const samplePrompts = [
        'What are three things you are grateful for today?',
        'Describe a challenge you are facing and one step you can take to address it.',
        'What is something kind you can do for yourself today?',
        'Reflect on a recent positive interaction you had with someone.',
        'What is one thing you are looking forward to this week?'
      ];

      const randomIndex = Math.floor(Math.random() * samplePrompts.length);
      setCurrentPrompt(samplePrompts[randomIndex]);
      setResponse('');
    } catch (error) {
      console.error('Error refreshing prompt:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleBookmark = async (id: string) => {
    // No need to check for user session in demo

    try {
      // This would be replaced with actual Supabase update
      // const { error } = await supabase
      //   .from('prompt_responses')
      //   .update({ is_bookmarked: !promptHistory.find(p => p.id === id)?.is_bookmarked })
      //   .eq('id', id);

      setPromptHistory(prev =>
        prev.map(item =>
          item.id === id
            ? { ...item, is_bookmarked: !item.is_bookmarked }
            : item
        )
      );
    } catch (error) {
      console.error('Error toggling bookmark:', error);
    }
  };

  const handleDeletePromptResponse = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this reflection? This action cannot be undone.')) {
      return;
    }

    try {
      // This would be replaced with actual Supabase delete
      // const { error } = await supabase
      //   .from('prompt_responses')
      //   .delete()
      //   .eq('id', id);

      // Remove from local state
      setPromptHistory(prev => prev.filter(item => item.id !== id));
    } catch (error) {
      console.error('Error deleting prompt response:', error);
    }
  };

  return (
    <MainLayout>
      <Box>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h4" component="h1">
            Daily Prompts
          </Typography>
          <Box>
            <Button
              variant={showHistory ? 'outlined' : 'contained'}
              color="primary"
              startIcon={<HistoryIcon />}
              onClick={() => setShowHistory(!showHistory)}
              sx={{ mr: 1 }}
            >
              {showHistory ? 'Hide History' : 'Show History'}
            </Button>
            <Button
              variant="outlined"
              color="primary"
              startIcon={<RefreshIcon />}
              onClick={handleRefreshPrompt}
              disabled={isLoading}
            >
              New Prompt
            </Button>
          </Box>
        </Box>

        <Typography variant="body1" color="text.secondary" paragraph>
          Respond to daily reflection prompts to practice mindfulness and self-awareness.
        </Typography>

        {!showHistory && (
          <Paper
            elevation={3}
            sx={{
              p: 3,
              mb: 4,
              backgroundColor: theme.palette.mode === 'dark'
                ? 'rgba(74, 111, 165, 0.1)'
                : 'rgba(74, 111, 165, 0.05)'
            }}
          >
            {isLoading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                <CircularProgress />
              </Box>
            ) : (
              <>
                <Box sx={{ display: 'flex', mb: 2 }}>
                  <QuoteIcon color="primary" sx={{ mr: 1, fontSize: 30 }} />
                  <Typography variant="h5" component="h2" gutterBottom>
                    {currentPrompt}
                  </Typography>
                </Box>

                <TextField
                  fullWidth
                  multiline
                  rows={6}
                  placeholder="Type your response here..."
                  value={response}
                  onChange={(e) => setResponse(e.target.value)}
                  variant="outlined"
                  sx={{ mb: 2 }}
                />

                <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <Button
                    variant="contained"
                    color="primary"
                    endIcon={isSubmitting ? <CircularProgress size={20} /> : <SendIcon />}
                    onClick={handleSubmitResponse}
                    disabled={!response.trim() || isSubmitting}
                  >
                    Submit
                  </Button>
                </Box>
              </>
            )}
          </Paper>
        )}

        {showHistory && (
          <>
            <Typography variant="h5" component="h2" gutterBottom>
              Your Reflection History
            </Typography>

            {promptHistory.length === 0 ? (
              <Paper sx={{ p: 3, textAlign: 'center' }}>
                <Typography variant="body1">
                  You haven't responded to any prompts yet.
                </Typography>
              </Paper>
            ) : (
              <Grid container spacing={3}>
                {promptHistory.map((item) => (
                  <Grid item xs={12} key={item.id}>
                    <Card elevation={2}>
                      <CardContent>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                          <Box sx={{ display: 'flex', mb: 1 }}>
                            <QuoteIcon color="primary" sx={{ mr: 1 }} />
                            <Typography variant="h6" component="h3">
                              {item.prompt}
                            </Typography>
                          </Box>
                          <Chip
                            label={item.created_at.toLocaleDateString()}
                            size="small"
                            variant="outlined"
                          />
                        </Box>

                        <Divider sx={{ my: 1 }} />

                        <Typography variant="body1" paragraph>
                          {item.response}
                        </Typography>
                      </CardContent>
                      <CardActions sx={{ justifyContent: 'flex-end' }}>
                        <IconButton
                          color="error"
                          onClick={() => handleDeletePromptResponse(item.id)}
                          title="Delete this reflection"
                        >
                          <DeleteIcon />
                        </IconButton>
                        <IconButton
                          color={item.is_bookmarked ? 'primary' : 'default'}
                          onClick={() => handleToggleBookmark(item.id)}
                          title={item.is_bookmarked ? 'Remove bookmark' : 'Bookmark this reflection'}
                        >
                          {item.is_bookmarked ? <BookmarkIcon /> : <BookmarkBorderIcon />}
                        </IconButton>
                      </CardActions>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            )}
          </>
        )}
      </Box>
    </MainLayout>
  );
};

export default Prompts;
