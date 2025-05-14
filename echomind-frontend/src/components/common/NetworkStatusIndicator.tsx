import React from 'react';
import {
  Chip,
  Tooltip,
  CircularProgress,
  Box,
  Typography,
  useTheme
} from '@mui/material';
import WifiIcon from '@mui/icons-material/Wifi';
import WifiOffIcon from '@mui/icons-material/WifiOff';
import SyncIcon from '@mui/icons-material/Sync';
import { useNetwork } from '../../contexts/NetworkContext';

interface NetworkStatusIndicatorProps {
  showLabel?: boolean;
  variant?: 'filled' | 'outlined';
  size?: 'small' | 'medium';
}

/**
 * A component that displays the current network status and sync state.
 */
const NetworkStatusIndicator: React.FC<NetworkStatusIndicatorProps> = ({
  showLabel = false,
  variant = 'filled',
  size = 'medium'
}) => {
  const { isOnline, isSyncing, lastSyncTime, syncData } = useNetwork();
  const theme = useTheme();

  // Format the last sync time
  const formattedLastSyncTime = lastSyncTime
    ? new Date(lastSyncTime).toLocaleString()
    : 'Never';

  // Determine the icon and color based on the network status
  const getStatusDetails = () => {
    if (isSyncing) {
      return {
        icon: <SyncIcon />,
        label: 'Syncing',
        color: 'warning' as const,
        tooltipTitle: 'Synchronizing data with the server'
      };
    }

    if (isOnline) {
      return {
        icon: <WifiIcon />,
        label: 'Online',
        color: 'success' as const,
        tooltipTitle: `Connected to the server. Last sync: ${formattedLastSyncTime}`
      };
    }

    return {
      icon: <WifiOffIcon />,
      label: 'Offline',
      color: 'error' as const,
      tooltipTitle: 'Working offline. Changes will be synchronized when you reconnect.'
    };
  };

  const { icon, label, color, tooltipTitle } = getStatusDetails();

  // Handle manual sync
  const handleSync = () => {
    if (isOnline && !isSyncing) {
      syncData();
    }
  };

  return (
    <Tooltip
      title={
        <Box sx={{ p: 1 }}>
          <Typography variant="body2">{tooltipTitle}</Typography>
          {isOnline && !isSyncing && (
            <Typography variant="caption" sx={{ display: 'block', mt: 1 }}>
              Click to manually synchronize data
            </Typography>
          )}
        </Box>
      }
      arrow
    >
      <Chip
        icon={
          isSyncing ? (
            <CircularProgress
              size={size === 'small' ? 16 : 20}
              thickness={5}
              sx={{ color: theme.palette.warning.main }}
            />
          ) : (
            icon
          )
        }
        label={showLabel ? label : undefined}
        color={color}
        variant={variant}
        size={size}
        onClick={handleSync}
        sx={{
          cursor: isOnline && !isSyncing ? 'pointer' : 'default',
          '& .MuiChip-icon': {
            ml: showLabel ? undefined : '0px',
            mr: showLabel ? undefined : '0px',
          },
        }}
      />
    </Tooltip>
  );
};

export default NetworkStatusIndicator;
