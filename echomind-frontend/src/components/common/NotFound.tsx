import React from 'react';
import { Box, Typography, Button, Container, Paper } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { Home as HomeIcon } from '@mui/icons-material';
import MainLayout from '../../layouts/MainLayout';

const NotFound: React.FC = () => {
  const navigate = useNavigate();

  return (
    <MainLayout>
      <Container maxWidth="md">
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            textAlign: 'center',
            py: 5,
          }}
        >
          <Paper elevation={3} sx={{ p: 4, width: '100%', maxWidth: 500 }}>
            <Typography variant="h1" component="h1" gutterBottom>
              404
            </Typography>
            <Typography variant="h4" component="h2" gutterBottom>
              Page Not Found
            </Typography>
            <Typography variant="body1" color="textSecondary" paragraph>
              The page you are looking for might have been removed, had its name changed,
              or is temporarily unavailable.
            </Typography>
            <Button
              variant="contained"
              color="primary"
              startIcon={<HomeIcon />}
              onClick={() => navigate('/')}
              sx={{ mt: 3 }}
            >
              Back to Home
            </Button>
          </Paper>
        </Box>
      </Container>
    </MainLayout>
  );
};

export default NotFound;
