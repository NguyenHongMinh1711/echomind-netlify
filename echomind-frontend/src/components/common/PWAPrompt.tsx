import React, { useState } from 'react';
import { 
  Snackbar, 
  Button, 
  Alert, 
  AlertTitle, 
  Box, 
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  useTheme,
  useMediaQuery
} from '@mui/material';
import GetAppIcon from '@mui/icons-material/GetApp';
import UpdateIcon from '@mui/icons-material/Update';
import CloseIcon from '@mui/icons-material/Close';
import { usePWA } from '../../contexts/PWAContext';

interface PWAPromptProps {
  installPromptDelay?: number;
}

/**
 * A component that displays prompts for PWA installation and updates.
 */
const PWAPrompt: React.FC<PWAPromptProps> = ({
  installPromptDelay = 30000 // 30 seconds
}) => {
  const { isInstalled, canInstall, needsRefresh, promptInstall, updateServiceWorker } = usePWA();
  const [showInstallPrompt, setShowInstallPrompt] = useState<boolean>(false);
  const [showInstallDialog, setShowInstallDialog] = useState<boolean>(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  // Show install prompt after delay
  React.useEffect(() => {
    if (canInstall && !isInstalled) {
      const timer = setTimeout(() => {
        setShowInstallPrompt(true);
      }, installPromptDelay);
      
      return () => clearTimeout(timer);
    }
  }, [canInstall, isInstalled, installPromptDelay]);

  // Handle install prompt close
  const handleInstallPromptClose = () => {
    setShowInstallPrompt(false);
  };

  // Handle install dialog open
  const handleInstallDialogOpen = () => {
    setShowInstallPrompt(false);
    setShowInstallDialog(true);
  };

  // Handle install dialog close
  const handleInstallDialogClose = () => {
    setShowInstallDialog(false);
  };

  // Handle install button click
  const handleInstall = async () => {
    const installed = await promptInstall();
    if (installed) {
      setShowInstallDialog(false);
    }
  };

  // Handle update button click
  const handleUpdate = async () => {
    await updateServiceWorker();
  };

  return (
    <>
      {/* Install Prompt Snackbar */}
      <Snackbar
        open={showInstallPrompt}
        onClose={handleInstallPromptClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          severity="info" 
          onClose={handleInstallPromptClose}
          action={
            <Button 
              color="inherit" 
              size="small" 
              onClick={handleInstallDialogOpen}
              startIcon={<GetAppIcon />}
            >
              Install
            </Button>
          }
        >
          Install EchoMind for a better experience
        </Alert>
      </Snackbar>

      {/* Install Dialog */}
      <Dialog
        open={showInstallDialog}
        onClose={handleInstallDialogClose}
        aria-labelledby="install-dialog-title"
        maxWidth="sm"
        fullWidth
        fullScreen={isMobile}
      >
        <DialogTitle id="install-dialog-title">
          Install EchoMind
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mb: 2 }}>
            <Typography variant="body1" paragraph>
              Install EchoMind as an app on your device for a better experience:
            </Typography>
            <Box component="ul" sx={{ pl: 2 }}>
              <Typography component="li" variant="body2">
                Faster access from your home screen
              </Typography>
              <Typography component="li" variant="body2">
                Full-screen experience without browser controls
              </Typography>
              <Typography component="li" variant="body2">
                Work offline when you don't have an internet connection
              </Typography>
              <Typography component="li" variant="body2">
                Better performance and smoother experience
              </Typography>
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleInstallDialogClose} startIcon={<CloseIcon />}>
            Not Now
          </Button>
          <Button 
            onClick={handleInstall} 
            variant="contained" 
            color="primary"
            startIcon={<GetAppIcon />}
          >
            Install
          </Button>
        </DialogActions>
      </Dialog>

      {/* Update Prompt */}
      <Snackbar
        open={needsRefresh}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert 
          severity="info"
          action={
            <Button 
              color="inherit" 
              size="small" 
              onClick={handleUpdate}
              startIcon={<UpdateIcon />}
            >
              Update
            </Button>
          }
        >
          <AlertTitle>Update Available</AlertTitle>
          A new version of EchoMind is available. Click update to refresh.
        </Alert>
      </Snackbar>
    </>
  );
};

export default PWAPrompt;
