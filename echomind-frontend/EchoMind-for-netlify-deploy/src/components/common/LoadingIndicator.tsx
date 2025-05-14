import React from 'react';
import { 
  CircularProgress, 
  Box, 
  Typography, 
  Paper,
  LinearProgress,
  useTheme
} from '@mui/material';

interface LoadingIndicatorProps {
  message?: string;
  fullScreen?: boolean;
  variant?: 'circular' | 'linear';
  size?: number | string;
  overlay?: boolean;
  transparent?: boolean;
}

/**
 * A reusable loading indicator component that can be displayed in various ways.
 */
const LoadingIndicator: React.FC<LoadingIndicatorProps> = ({
  message = 'Loading...',
  fullScreen = false,
  variant = 'circular',
  size = 40,
  overlay = false,
  transparent = false
}) => {
  const theme = useTheme();

  // Content of the loading indicator
  const content = (
    <>
      {variant === 'circular' ? (
        <CircularProgress size={size} />
      ) : (
        <Box sx={{ width: '100%', maxWidth: 300 }}>
          <LinearProgress />
        </Box>
      )}
      
      {message && (
        <Typography 
          variant="body2" 
          color="text.secondary" 
          sx={{ mt: 2 }}
        >
          {message}
        </Typography>
      )}
    </>
  );

  // Full screen loading indicator
  if (fullScreen) {
    return (
      <Box
        sx={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: theme.zIndex.modal + 1,
          bgcolor: transparent 
            ? 'rgba(255, 255, 255, 0.7)' 
            : 'background.paper'
        }}
      >
        {transparent ? (
          content
        ) : (
          <Paper
            elevation={4}
            sx={{
              p: 4,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              borderRadius: 2
            }}
          >
            {content}
          </Paper>
        )}
      </Box>
    );
  }

  // Overlay loading indicator
  if (overlay) {
    return (
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: theme.zIndex.appBar + 1,
          bgcolor: transparent 
            ? 'rgba(255, 255, 255, 0.7)' 
            : 'rgba(255, 255, 255, 0.9)'
        }}
      >
        {content}
      </Box>
    );
  }

  // Inline loading indicator
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        p: 2
      }}
    >
      {content}
    </Box>
  );
};

export default LoadingIndicator;
