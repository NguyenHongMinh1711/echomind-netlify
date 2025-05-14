import React, { useState, useEffect } from 'react';
import { 
  Alert, 
  AlertTitle, 
  Collapse, 
  IconButton, 
  Box,
  Typography,
  Snackbar
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

export type ErrorSeverity = 'error' | 'warning' | 'info';

interface ErrorAlertProps {
  message: string;
  details?: string;
  severity?: ErrorSeverity;
  onClose?: () => void;
  action?: React.ReactNode;
  autoHideDuration?: number | null;
  variant?: 'standard' | 'filled' | 'outlined';
  showAsSnackbar?: boolean;
}

/**
 * A reusable error alert component that can be displayed inline or as a snackbar.
 */
const ErrorAlert: React.FC<ErrorAlertProps> = ({
  message,
  details,
  severity = 'error',
  onClose,
  action,
  autoHideDuration = null,
  variant = 'filled',
  showAsSnackbar = false
}) => {
  const [open, setOpen] = useState(true);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    if (autoHideDuration !== null) {
      const timer = setTimeout(() => {
        handleClose();
      }, autoHideDuration);
      
      return () => clearTimeout(timer);
    }
  }, [autoHideDuration]);

  const handleClose = (event?: React.SyntheticEvent | Event, reason?: string) => {
    if (reason === 'clickaway') {
      return;
    }
    
    setOpen(false);
    
    if (onClose) {
      onClose();
    }
  };

  const toggleDetails = () => {
    setShowDetails(prev => !prev);
  };

  const alertContent = (
    <Alert
      severity={severity}
      variant={variant}
      action={
        <Box>
          {action}
          <IconButton
            aria-label="close"
            color="inherit"
            size="small"
            onClick={handleClose}
          >
            <CloseIcon fontSize="inherit" />
          </IconButton>
        </Box>
      }
      sx={{ 
        width: '100%',
        alignItems: 'flex-start'
      }}
    >
      <AlertTitle>{severity === 'error' ? 'Error' : severity === 'warning' ? 'Warning' : 'Information'}</AlertTitle>
      {message}
      
      {details && (
        <Box sx={{ mt: 1 }}>
          <Typography
            variant="body2"
            component="span"
            sx={{ 
              cursor: 'pointer',
              textDecoration: 'underline',
              '&:hover': { opacity: 0.8 }
            }}
            onClick={toggleDetails}
          >
            {showDetails ? 'Hide details' : 'Show details'}
          </Typography>
          
          <Collapse in={showDetails}>
            <Box
              component="pre"
              sx={{
                mt: 1,
                p: 1,
                bgcolor: 'rgba(0, 0, 0, 0.1)',
                borderRadius: 1,
                fontSize: '0.75rem',
                overflow: 'auto',
                maxHeight: '200px',
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-word'
              }}
            >
              {details}
            </Box>
          </Collapse>
        </Box>
      )}
    </Alert>
  );

  if (showAsSnackbar) {
    return (
      <Snackbar
        open={open}
        autoHideDuration={autoHideDuration}
        onClose={handleClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        {alertContent}
      </Snackbar>
    );
  }

  return (
    <Collapse in={open}>
      {alertContent}
    </Collapse>
  );
};

export default ErrorAlert;
