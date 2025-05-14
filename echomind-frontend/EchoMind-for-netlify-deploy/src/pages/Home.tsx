import React, { useState, useRef } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  Paper,
  Container,
  useTheme,
  TextField
} from '@mui/material';
import {
  Book as JournalIcon,
  Chat as ChatIcon,
  LibraryBooks as ResourcesIcon,
  Lightbulb as PromptIcon
} from '@mui/icons-material';
import { Link } from 'react-router-dom';
import { useSupabase } from '../contexts/SupabaseContext';
import MainLayout from '../layouts/MainLayout';

function Home() {
  const { session } = useSupabase();
  const theme = useTheme();
  const isAuthenticated = !!session;

  const [message, setMessage] = useState('');
  const [response, setResponse] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  // Feature cards for authenticated users
  const featureCards = [
    {
      title: 'Journal',
      description: 'Record your thoughts and track your mood over time.',
      icon: <JournalIcon fontSize="large" color="primary" />,
      path: '/journal',
    },
    {
      title: 'Chat',
      description: 'Talk with our AI assistant for emotional support.',
      icon: <ChatIcon fontSize="large" color="primary" />,
      path: '/chat',
    },
    {
      title: 'Resources',
      description: 'Access a library of mental health resources.',
      icon: <ResourcesIcon fontSize="large" color="primary" />,
      path: '/resources',
    },
    {
      title: 'Daily Prompts',
      description: 'Respond to daily reflection prompts for mindfulness.',
      icon: <PromptIcon fontSize="large" color="primary" />,
      path: '/prompts',
    },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!message.trim()) return;

    try {
      // Generate a more meaningful response based on the message
      const responseMessages = [
        "Thank you for sharing. Remember that it's okay to feel this way.",
        "I've noted how you're feeling. Taking time to reflect is important.",
        "Thanks for checking in today. Your emotional awareness is valuable.",
        "I appreciate you sharing your thoughts. This helps track your mental well-being journey."
      ];

      // Select a random response
      const randomResponse = responseMessages[Math.floor(Math.random() * responseMessages.length)];

      // Create a journal entry with the message
      const journalEntry = {
        id: Date.now().toString(),
        title: 'Quick Mood Entry',
        content: message,
        mood: 'neutral',
        created_at: new Date()
      };

      console.log('Created journal entry:', journalEntry);

      // Update state
      setResponse(randomResponse);
      setMessage('');

      // Focus the input field after a short delay
      setTimeout(() => {
        if (inputRef.current) {
          inputRef.current.focus();
        }
      }, 10);
    } catch (error) {
      console.error('Error:', error);
      setResponse('An error occurred. Please try again.');
    }
  };

  // Landing page for non-authenticated users
  const LandingPage = () => (
    <Box sx={{ py: 4 }}>
      <Container maxWidth="lg">
        <Grid container spacing={6} alignItems="center">
          <Grid item xs={12} md={6}>
            <Typography variant="h3" component="h1" gutterBottom>
              Your Mental Well-being Companion
            </Typography>
            <Typography variant="h6" color="textSecondary" paragraph>
              EchoMind helps you track your mental health journey through journaling,
              AI-powered conversations, and personalized resources.
            </Typography>
            <Box sx={{ mt: 4 }}>
              <Button
                variant="contained"
                color="primary"
                size="large"
                component={Link}
                to="/signup"
                sx={{ mr: 2 }}
              >
                Sign Up
              </Button>
              <Button
                variant="outlined"
                color="primary"
                size="large"
                component={Link}
                to="/login"
              >
                Login
              </Button>
            </Box>
          </Grid>
          <Grid item xs={12} md={6}>
            <Paper elevation={3} sx={{ p: 4 }}>
              <Typography variant="h4" component="h2" gutterBottom>
                How are you feeling today?
              </Typography>
              <Box component="form" onSubmit={handleSubmit} sx={{ mt: 3 }}>
                <TextField
                  fullWidth
                  label="Share your thoughts..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  margin="normal"
                  variant="outlined"
                  multiline
                  rows={4}
                  autoFocus
                  inputRef={inputRef}
                />
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  sx={{ mt: 2 }}
                >
                  Submit
                </Button>
              </Box>
              {response && (
                <Paper elevation={1} sx={{ p: 2, mt: 3, bgcolor: 'primary.light', color: 'primary.contrastText' }}>
                  <Typography variant="body1">{response}</Typography>
                </Paper>
              )}
            </Paper>
          </Grid>
        </Grid>

        <Box sx={{ mt: 8 }}>
          <Typography variant="h4" component="h2" align="center" gutterBottom>
            Features
          </Typography>
          <Grid container spacing={4} sx={{ mt: 4 }}>
            {featureCards.map((card) => (
              <Grid item xs={12} sm={6} md={3} key={card.title}>
                <Card
                  sx={{
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    transition: 'transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out',
                    '&:hover': {
                      transform: 'translateY(-5px)',
                      boxShadow: '0 8px 16px rgba(0,0,0,0.1)',
                    },
                  }}
                >
                  <Box
                    sx={{
                      p: 2,
                      display: 'flex',
                      justifyContent: 'center',
                      backgroundColor: theme.palette.mode === 'dark'
                        ? 'rgba(74, 111, 165, 0.1)'
                        : 'rgba(74, 111, 165, 0.05)',
                    }}
                  >
                    {card.icon}
                  </Box>
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Typography gutterBottom variant="h5" component="h3">
                      {card.title}
                    </Typography>
                    <Typography>
                      {card.description}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>

        <Box sx={{ mt: 8, mb: 4 }}>
          <Paper
            sx={{
              p: 4,
              textAlign: 'center',
              borderRadius: 4,
              backgroundColor: theme.palette.mode === 'dark'
                ? 'rgba(74, 111, 165, 0.1)'
                : 'rgba(74, 111, 165, 0.05)',
            }}
          >
            <Typography variant="h4" component="h2" gutterBottom>
              Ready to start your mental well-being journey?
            </Typography>
            <Typography variant="body1" paragraph sx={{ maxWidth: 700, mx: 'auto' }}>
              Join EchoMind today and take the first step towards better mental health.
              Our platform provides the tools you need to track, understand, and improve your well-being.
            </Typography>
            <Button
              variant="contained"
              color="primary"
              size="large"
              component={Link}
              to="/signup"
              sx={{ mt: 2 }}
            >
              Get Started
            </Button>
          </Paper>
        </Box>
      </Container>
    </Box>
  );

  // Dashboard for authenticated users
  const Dashboard = () => (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        Welcome back, {session?.user.email?.split('@')[0]}
      </Typography>
      <Typography variant="body1" paragraph>
        Continue your mental well-being journey with EchoMind.
      </Typography>

      <Grid container spacing={4} sx={{ mt: 2 }}>
        {featureCards.map((card) => (
          <Grid item xs={12} sm={6} md={3} key={card.title}>
            <Card
              sx={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                transition: 'transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out',
                '&:hover': {
                  transform: 'translateY(-5px)',
                  boxShadow: '0 8px 16px rgba(0,0,0,0.1)',
                },
              }}
            >
              <Box
                sx={{
                  p: 2,
                  display: 'flex',
                  justifyContent: 'center',
                  backgroundColor: theme.palette.mode === 'dark'
                    ? 'rgba(74, 111, 165, 0.1)'
                    : 'rgba(74, 111, 165, 0.05)',
                }}
              >
                {card.icon}
              </Box>
              <CardContent sx={{ flexGrow: 1 }}>
                <Typography gutterBottom variant="h5" component="h2">
                  {card.title}
                </Typography>
                <Typography>
                  {card.description}
                </Typography>
              </CardContent>
              <CardActions>
                <Button
                  size="small"
                  color="primary"
                  component={Link}
                  to={card.path}
                >
                  Go to {card.title}
                </Button>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );

  return (
    <MainLayout>
      {isAuthenticated ? <Dashboard /> : <LandingPage />}
    </MainLayout>
  );
}

export default Home;
