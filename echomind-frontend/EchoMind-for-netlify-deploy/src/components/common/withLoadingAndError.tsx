import React from 'react';
import LoadingIndicator from './LoadingIndicator';
import ErrorAlert from './ErrorAlert';
import { Box } from '@mui/material';

interface WithLoadingAndErrorProps {
  isLoading?: boolean;
  loadingMessage?: string;
  error?: string | null;
  errorDetails?: string;
  onErrorClose?: () => void;
  fullScreenLoading?: boolean;
  retry?: () => void;
}

/**
 * A higher-order component that handles loading and error states.
 * It wraps the provided component and displays loading indicators or error messages as needed.
 */
const withLoadingAndError = <P extends object>(
  Component: React.ComponentType<P>
): React.FC<P & WithLoadingAndErrorProps> => {
  return ({
    isLoading = false,
    loadingMessage = 'Loading...',
    error = null,
    errorDetails,
    onErrorClose,
    fullScreenLoading = false,
    retry,
    ...props
  }: WithLoadingAndErrorProps) => {
    // If loading, show loading indicator
    if (isLoading) {
      return (
        <LoadingIndicator 
          message={loadingMessage} 
          fullScreen={fullScreenLoading} 
        />
      );
    }

    // If error, show error message with the component below
    if (error) {
      return (
        <Box sx={{ width: '100%' }}>
          <ErrorAlert
            message={error}
            details={errorDetails}
            severity="error"
            onClose={onErrorClose}
            action={
              retry ? (
                <Box 
                  component="span" 
                  sx={{ 
                    cursor: 'pointer',
                    textDecoration: 'underline',
                    mr: 1,
                    '&:hover': { opacity: 0.8 }
                  }}
                  onClick={retry}
                >
                  Retry
                </Box>
              ) : undefined
            }
          />
          <Box sx={{ mt: 2 }}>
            <Component {...(props as P)} />
          </Box>
        </Box>
      );
    }

    // Otherwise, render the component normally
    return <Component {...(props as P)} />;
  };
};

export default withLoadingAndError;
