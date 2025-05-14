import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  TextField,
  Button,
  Switch,
  FormControlLabel,
  Divider,
  Alert,
  CircularProgress,
  Grid,
  InputAdornment,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Snackbar,
  useTheme,
  Accordion,
  AccordionSummary,
  AccordionDetails
} from '@mui/material';
import {
  Visibility,
  VisibilityOff,
  Save as SaveIcon,
  Delete as DeleteIcon,
  ExpandMore as ExpandMoreIcon,
  Notifications as NotificationsIcon,
  Security as SecurityIcon,
  Palette as PaletteIcon,
  Api as ApiIcon,
  Download as DownloadIcon
} from '@mui/icons-material';
import { useSupabase } from '../contexts/SupabaseContext';
import { useTheme as useAppTheme } from '../contexts/ThemeContext';
import MainLayout from '../layouts/MainLayout';

const Settings: React.FC = () => {
  const { supabase, session } = useSupabase();
  const { darkMode, toggleDarkMode } = useAppTheme();
  const theme = useTheme();

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Profile settings
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');

  // Password settings
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);

  // Notification settings
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [reminderNotifications, setReminderNotifications] = useState(true);

  // API Key settings
  const [geminiApiKey, setGeminiApiKey] = useState('');
  const [mistralApiKey, setMistralApiKey] = useState('');
  const [useCustomGeminiApiKey, setUseCustomGeminiApiKey] = useState(false);
  const [useCustomMistralApiKey, setUseCustomMistralApiKey] = useState(false);

  // Delete account dialog
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');

  // Load user settings
  useEffect(() => {
    const loadUserSettings = async () => {
      if (!session?.user) return;

      try {
        setLoading(true);

        // This would be replaced with actual Supabase queries
        // For profile data:
        // const { data: profileData, error: profileError } = await supabase
        //   .from('profiles')
        //   .select('*')
        //   .eq('id', session.user.id)
        //   .single();

        // For notification settings:
        // const { data: notifData, error: notifError } = await supabase
        //   .from('user_settings')
        //   .select('*')
        //   .eq('user_id', session.user.id)
        //   .single();

        // For API key:
        // const { data: apiKeyData, error: apiKeyError } = await supabase
        //   .from('user_api_keys')
        //   .select('*')
        //   .eq('user_id', session.user.id)
        //   .single();

        // For now, just use placeholder data
        setName(session.user.email?.split('@')[0] || '');
        setEmail(session.user.email || '');
        setEmailNotifications(true);
        setReminderNotifications(true);
        setGeminiApiKey('');
        setMistralApiKey('');
        setUseCustomGeminiApiKey(false);
        setUseCustomMistralApiKey(false);
      } catch (error) {
        console.error('Error loading user settings:', error);
        setError('Failed to load user settings. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    loadUserSettings();
  }, [session, supabase]);

  const handleUpdateProfile = async () => {
    if (!session?.user) return;

    try {
      setLoading(true);
      setError(null);

      // This would be replaced with actual Supabase update
      // const { error } = await supabase
      //   .from('profiles')
      //   .update({ name })
      //   .eq('id', session.user.id);

      setSuccess('Profile updated successfully');
      setTimeout(() => setSuccess(null), 3000);
    } catch (error) {
      console.error('Error updating profile:', error);
      setError('Failed to update profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async () => {
    if (!session?.user) return;

    if (newPassword !== confirmPassword) {
      setError('New passwords do not match');
      return;
    }

    if (newPassword.length < 6) {
      setError('New password must be at least 6 characters long');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // This would be replaced with actual Supabase password update
      // const { error } = await supabase.auth.updateUser({
      //   password: newPassword
      // });

      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setSuccess('Password updated successfully');
      setTimeout(() => setSuccess(null), 3000);
    } catch (error) {
      console.error('Error changing password:', error);
      setError('Failed to change password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateNotifications = async () => {
    if (!session?.user) return;

    try {
      setLoading(true);
      setError(null);

      // This would be replaced with actual Supabase update
      // const { error } = await supabase
      //   .from('user_settings')
      //   .update({
      //     email_notifications: emailNotifications,
      //     reminder_notifications: reminderNotifications
      //   })
      //   .eq('user_id', session.user.id);

      setSuccess('Notification settings updated successfully');
      setTimeout(() => setSuccess(null), 3000);
    } catch (error) {
      console.error('Error updating notification settings:', error);
      setError('Failed to update notification settings. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateApiKey = async () => {
    if (!session?.user) return;

    try {
      setLoading(true);
      setError(null);

      // This would be replaced with actual Supabase update
      // const { error } = await supabase
      //   .from('user_api_keys')
      //   .upsert({
      //     user_id: session.user.id,
      //     gemini_api_key: geminiApiKey,
      //     mistral_api_key: mistralApiKey,
      //     use_custom_gemini_key: useCustomGeminiApiKey,
      //     use_custom_mistral_key: useCustomMistralApiKey
      //   });

      setSuccess('API key settings updated successfully');
      setTimeout(() => setSuccess(null), 3000);
    } catch (error) {
      console.error('Error updating API key settings:', error);
      setError('Failed to update API key settings. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!session?.user) return;

    if (deleteConfirmText !== 'delete my account') {
      setError('Please type "delete my account" to confirm');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // This would be replaced with actual Supabase delete
      // First delete user data
      // await supabase
      //   .from('profiles')
      //   .delete()
      //   .eq('id', session.user.id);

      // Then delete auth user
      // await supabase.auth.admin.deleteUser(session.user.id);

      // Sign out
      // await supabase.auth.signOut();

      setDeleteDialogOpen(false);
      setSuccess('Account deleted successfully');
      setTimeout(() => {
        window.location.href = '/';
      }, 2000);
    } catch (error) {
      console.error('Error deleting account:', error);
      setError('Failed to delete account. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleExportData = async () => {
    if (!session?.user) return;

    try {
      setLoading(true);

      // This would be replaced with actual Supabase queries to get all user data
      // const { data: journalData } = await supabase
      //   .from('journal_entries')
      //   .select('*')
      //   .eq('user_id', session.user.id);

      // const { data: chatData } = await supabase
      //   .from('chat_messages')
      //   .select('*')
      //   .eq('user_id', session.user.id);

      // For now, just use placeholder data
      const userData = {
        profile: {
          name,
          email
        },
        journals: [
          { id: '1', title: 'Sample Journal', content: 'Sample content', created_at: new Date() }
        ],
        chats: [
          { id: '1', message: 'Sample message', created_at: new Date() }
        ]
      };

      // Create a downloadable JSON file
      const dataStr = JSON.stringify(userData, null, 2);
      const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);

      const exportFileDefaultName = `echomind-data-${new Date().toISOString().split('T')[0]}.json`;

      const linkElement = document.createElement('a');
      linkElement.setAttribute('href', dataUri);
      linkElement.setAttribute('download', exportFileDefaultName);
      linkElement.click();

      setSuccess('Data exported successfully');
      setTimeout(() => setSuccess(null), 3000);
    } catch (error) {
      console.error('Error exporting data:', error);
      setError('Failed to export data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <MainLayout>
      <Box>
        <Typography variant="h4" component="h1" gutterBottom>
          Settings
        </Typography>

        <Typography variant="body1" color="text.secondary" paragraph>
          Manage your account settings and preferences.
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {success && (
          <Alert severity="success" sx={{ mb: 3 }}>
            {success}
          </Alert>
        )}

        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Accordion defaultExpanded>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <SecurityIcon sx={{ mr: 1 }} />
                  <Typography variant="h6">Account Settings</Typography>
                </Box>
              </AccordionSummary>
              <AccordionDetails>
                <Paper elevation={0} sx={{ p: 3 }}>
                  <Typography variant="h6" gutterBottom>
                    Profile Information
                  </Typography>

                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        margin="normal"
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Email"
                        value={email}
                        disabled
                        margin="normal"
                        helperText="Email cannot be changed"
                      />
                    </Grid>
                  </Grid>

                  <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
                    <Button
                      variant="contained"
                      color="primary"
                      startIcon={loading ? <CircularProgress size={20} /> : <SaveIcon />}
                      onClick={handleUpdateProfile}
                      disabled={loading || !name.trim()}
                    >
                      Save Profile
                    </Button>
                  </Box>

                  <Divider sx={{ my: 3 }} />

                  <Typography variant="h6" gutterBottom>
                    Change Password
                  </Typography>

                  <TextField
                    fullWidth
                    label="Current Password"
                    type={showCurrentPassword ? 'text' : 'password'}
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    margin="normal"
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                            edge="end"
                          >
                            {showCurrentPassword ? <VisibilityOff /> : <Visibility />}
                          </IconButton>
                        </InputAdornment>
                      )
                    }}
                  />

                  <TextField
                    fullWidth
                    label="New Password"
                    type={showNewPassword ? 'text' : 'password'}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    margin="normal"
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            onClick={() => setShowNewPassword(!showNewPassword)}
                            edge="end"
                          >
                            {showNewPassword ? <VisibilityOff /> : <Visibility />}
                          </IconButton>
                        </InputAdornment>
                      )
                    }}
                  />

                  <TextField
                    fullWidth
                    label="Confirm New Password"
                    type={showNewPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    margin="normal"
                    error={newPassword !== confirmPassword && confirmPassword !== ''}
                    helperText={
                      newPassword !== confirmPassword && confirmPassword !== ''
                        ? 'Passwords do not match'
                        : ''
                    }
                  />

                  <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={handleChangePassword}
                      disabled={
                        loading ||
                        !currentPassword ||
                        !newPassword ||
                        !confirmPassword ||
                        newPassword !== confirmPassword
                      }
                    >
                      Change Password
                    </Button>
                  </Box>
                </Paper>
              </AccordionDetails>
            </Accordion>
          </Grid>

          <Grid item xs={12}>
            <Accordion>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <PaletteIcon sx={{ mr: 1 }} />
                  <Typography variant="h6">Appearance</Typography>
                </Box>
              </AccordionSummary>
              <AccordionDetails>
                <Paper elevation={0} sx={{ p: 3 }}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={darkMode}
                        onChange={toggleDarkMode}
                        color="primary"
                      />
                    }
                    label="Dark Mode"
                  />
                </Paper>
              </AccordionDetails>
            </Accordion>
          </Grid>

          <Grid item xs={12}>
            <Accordion>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <NotificationsIcon sx={{ mr: 1 }} />
                  <Typography variant="h6">Notifications</Typography>
                </Box>
              </AccordionSummary>
              <AccordionDetails>
                <Paper elevation={0} sx={{ p: 3 }}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={emailNotifications}
                        onChange={(e) => setEmailNotifications(e.target.checked)}
                        color="primary"
                      />
                    }
                    label="Email Notifications"
                  />

                  <Typography variant="body2" color="text.secondary" sx={{ ml: 4, mb: 2 }}>
                    Receive email notifications about important updates and reminders.
                  </Typography>

                  <FormControlLabel
                    control={
                      <Switch
                        checked={reminderNotifications}
                        onChange={(e) => setReminderNotifications(e.target.checked)}
                        color="primary"
                      />
                    }
                    label="Daily Reminders"
                  />

                  <Typography variant="body2" color="text.secondary" sx={{ ml: 4, mb: 2 }}>
                    Receive daily reminders to journal and respond to prompts.
                  </Typography>

                  <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={handleUpdateNotifications}
                      disabled={loading}
                    >
                      Save Notification Settings
                    </Button>
                  </Box>
                </Paper>
              </AccordionDetails>
            </Accordion>
          </Grid>

          <Grid item xs={12}>
            <Accordion>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <ApiIcon sx={{ mr: 1 }} />
                  <Typography variant="h6">API Settings</Typography>
                </Box>
              </AccordionSummary>
              <AccordionDetails>
                <Paper elevation={0} sx={{ p: 3 }}>
                  <Typography variant="h6" gutterBottom>
                    Gemini API Settings
                  </Typography>

                  <FormControlLabel
                    control={
                      <Switch
                        checked={useCustomGeminiApiKey}
                        onChange={(e) => setUseCustomGeminiApiKey(e.target.checked)}
                        color="primary"
                      />
                    }
                    label="Use Custom Gemini API Key"
                  />

                  <Typography variant="body2" color="text.secondary" sx={{ ml: 4, mb: 2 }}>
                    Use your own Gemini API key instead of the shared one.
                  </Typography>

                  {useCustomGeminiApiKey && (
                    <TextField
                      fullWidth
                      label="Gemini API Key"
                      value={geminiApiKey}
                      onChange={(e) => setGeminiApiKey(e.target.value)}
                      margin="normal"
                      helperText="Enter your Gemini API key from Google AI Studio"
                    />
                  )}

                  <Divider sx={{ my: 3 }} />

                  <Typography variant="h6" gutterBottom>
                    Mistral API Settings
                  </Typography>

                  <FormControlLabel
                    control={
                      <Switch
                        checked={useCustomMistralApiKey}
                        onChange={(e) => setUseCustomMistralApiKey(e.target.checked)}
                        color="primary"
                      />
                    }
                    label="Use Custom Mistral API Key"
                  />

                  <Typography variant="body2" color="text.secondary" sx={{ ml: 4, mb: 2 }}>
                    Use your own Mistral API key instead of the shared one.
                  </Typography>

                  {useCustomMistralApiKey && (
                    <TextField
                      fullWidth
                      label="Mistral API Key"
                      value={mistralApiKey}
                      onChange={(e) => setMistralApiKey(e.target.value)}
                      margin="normal"
                      helperText="Enter your Mistral API key from Mistral AI platform"
                    />
                  )}

                  <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={handleUpdateApiKey}
                      disabled={loading ||
                        (useCustomGeminiApiKey && !geminiApiKey) ||
                        (useCustomMistralApiKey && !mistralApiKey)}
                    >
                      Save API Settings
                    </Button>
                  </Box>
                </Paper>
              </AccordionDetails>
            </Accordion>
          </Grid>

          <Grid item xs={12}>
            <Accordion>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <DownloadIcon sx={{ mr: 1 }} />
                  <Typography variant="h6">Data Management</Typography>
                </Box>
              </AccordionSummary>
              <AccordionDetails>
                <Paper elevation={0} sx={{ p: 3 }}>
                  <Button
                    variant="outlined"
                    color="primary"
                    startIcon={<DownloadIcon />}
                    onClick={handleExportData}
                    disabled={loading || !session}
                    sx={{ mb: 3 }}
                  >
                    Export Your Data
                  </Button>

                  <Typography variant="body2" color="text.secondary" paragraph>
                    Download all your data in JSON format, including journal entries, chat history, and settings.
                  </Typography>

                  <Divider sx={{ my: 3 }} />

                  <Typography variant="h6" color="error" gutterBottom>
                    Danger Zone
                  </Typography>

                  <Button
                    variant="outlined"
                    color="error"
                    startIcon={<DeleteIcon />}
                    onClick={() => setDeleteDialogOpen(true)}
                    disabled={loading || !session}
                  >
                    Delete Account
                  </Button>

                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                    Permanently delete your account and all associated data. This action cannot be undone.
                  </Typography>
                </Paper>
              </AccordionDetails>
            </Accordion>
          </Grid>
        </Grid>

        {/* Delete Account Dialog */}
        <Dialog
          open={deleteDialogOpen}
          onClose={() => setDeleteDialogOpen(false)}
        >
          <DialogTitle color="error">Delete Account</DialogTitle>
          <DialogContent>
            <DialogContentText>
              This action will permanently delete your account and all associated data. This cannot be undone.
            </DialogContentText>
            <DialogContentText sx={{ mt: 2 }}>
              To confirm, please type "delete my account" below:
            </DialogContentText>
            <TextField
              fullWidth
              value={deleteConfirmText}
              onChange={(e) => setDeleteConfirmText(e.target.value)}
              margin="normal"
              variant="outlined"
              error={deleteConfirmText !== '' && deleteConfirmText !== 'delete my account'}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
            <Button
              color="error"
              onClick={handleDeleteAccount}
              disabled={deleteConfirmText !== 'delete my account' || loading}
            >
              {loading ? <CircularProgress size={24} /> : 'Delete Account'}
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </MainLayout>
  );
};

export default Settings;
