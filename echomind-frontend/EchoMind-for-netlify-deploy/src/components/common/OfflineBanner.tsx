import React from 'react';
import { Alert, Collapse, Box, Typography } from '@mui/material';
import WifiOffIcon from '@mui/icons-material/WifiOff';
import { useNetwork } from '../../contexts/NetworkContext';

interface OfflineBannerProps {
  position?: 'top' | 'bottom';
  showMessage?: boolean;
}

/**
 * A component that displays a banner when the application is offline.
 */
const OfflineBanner: React.FC<OfflineBannerProps> = ({
  position = 'top',
  showMessage = true
}) => {
  const { isOnline } = useNetwork();

  return (
    <Collapse in={!isOnline}>
      <Alert
        severity="warning"
        icon={<WifiOffIcon />}
        sx={{
          borderRadius: 0,
          position: 'sticky',
          [position]: 0,
          zIndex: 1100,
          width: '100%',
          justifyContent: 'center',
          py: 0.5
        }}
      >
        {showMessage ? (
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Typography variant="body2">
              You are currently offline. Some features may be limited.
            </Typography>
          </Box>
        ) : (
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Typography variant="body2">
              Offline
            </Typography>
          </Box>
        )}
      </Alert>
    </Collapse>
  );
};

export default OfflineBanner;
