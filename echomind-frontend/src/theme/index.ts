import { createTheme, responsiveFontSizes } from '@mui/material/styles';
import type { Theme as MuiTheme } from '@mui/material/styles';
import type { PaletteMode } from '@mui/material';

// EchoMind color palette
const primaryBlue = {
  light: '#7a9fd3',
  main: '#4A6FA5',
  dark: '#2a4875',
  contrastText: '#ffffff',
};

const secondaryTeal = {
  light: '#7ad3d3',
  main: '#47B8B8',
  dark: '#2a8787',
  contrastText: '#ffffff',
};

const tertiaryLavender = {
  light: '#bdb5f7',
  main: '#9D8DF1',
  dark: '#7062d0',
  contrastText: '#ffffff',
};

// Create theme function
export const createAppTheme = (mode: PaletteMode = 'light'): MuiTheme => {
  const isDark = mode === 'dark';

  const themeOptions = {
    palette: {
      mode,
      primary: primaryBlue,
      secondary: secondaryTeal,
      info: {
        main: '#2196F3',
      },
      success: {
        main: '#4CAF50',
      },
      warning: {
        main: '#FFC107',
      },
      error: {
        main: '#F44336',
      },
      background: {
        default: isDark ? '#121212' : '#F8F9FA',
        paper: isDark ? '#1E1E1E' : '#FFFFFF',
      },
      text: {
        primary: isDark ? '#E0E0E0' : '#333333',
        secondary: isDark ? '#AAAAAA' : '#757575',
      },
      divider: isDark ? '#424242' : '#E0E0E0',
    },
    typography: {
      fontFamily: '"Open Sans", "Helvetica", "Arial", sans-serif',
      fontWeightLight: 300,
      fontWeightRegular: 400,
      fontWeightMedium: 600,
      fontWeightBold: 700,
      h1: {
        fontSize: '2.5rem',
        fontWeight: 600,
        lineHeight: 1.2,
      },
      h2: {
        fontSize: '2rem',
        fontWeight: 600,
        lineHeight: 1.3,
      },
      h3: {
        fontSize: '1.75rem',
        fontWeight: 600,
        lineHeight: 1.4,
      },
      h4: {
        fontSize: '1.5rem',
        fontWeight: 600,
        lineHeight: 1.4,
      },
      h5: {
        fontSize: '1.25rem',
        fontWeight: 600,
        lineHeight: 1.4,
      },
      h6: {
        fontSize: '1rem',
        fontWeight: 600,
        lineHeight: 1.4,
      },
      subtitle1: {
        fontSize: '1rem',
        fontWeight: 500,
      },
      subtitle2: {
        fontSize: '0.875rem',
        fontWeight: 500,
      },
      body1: {
        fontSize: '1rem',
        lineHeight: 1.6,
      },
      body2: {
        fontSize: '0.875rem',
        lineHeight: 1.6,
      },
      button: {
        textTransform: 'none',
        fontWeight: 600,
      },
    },
    shape: {
      borderRadius: 8,
    },
    shadows: [
      'none',
      '0px 2px 1px -1px rgba(0,0,0,0.05), 0px 1px 1px 0px rgba(0,0,0,0.03), 0px 1px 3px 0px rgba(0,0,0,0.05)',
      '0px 3px 3px -2px rgba(0,0,0,0.06), 0px 2px 6px 0px rgba(0,0,0,0.04), 0px 1px 8px 0px rgba(0,0,0,0.06)',
      '0px 3px 4px -2px rgba(0,0,0,0.07), 0px 3px 8px 0px rgba(0,0,0,0.05), 0px 1px 12px 0px rgba(0,0,0,0.07)',
      '0px 4px 5px -2px rgba(0,0,0,0.08), 0px 4px 10px 0px rgba(0,0,0,0.06), 0px 1px 14px 0px rgba(0,0,0,0.08)',
      '0px 5px 6px -3px rgba(0,0,0,0.09), 0px 5px 12px 0px rgba(0,0,0,0.07), 0px 1px 18px 0px rgba(0,0,0,0.09)',
      '0px 6px 7px -4px rgba(0,0,0,0.1), 0px 6px 14px 0px rgba(0,0,0,0.08), 0px 1px 20px 0px rgba(0,0,0,0.1)',
      '0px 7px 8px -4px rgba(0,0,0,0.11), 0px 7px 16px 0px rgba(0,0,0,0.09), 0px 2px 22px 0px rgba(0,0,0,0.11)',
      '0px 8px 9px -5px rgba(0,0,0,0.12), 0px 8px 18px 0px rgba(0,0,0,0.1), 0px 3px 24px 0px rgba(0,0,0,0.12)',
      '0px 9px 10px -6px rgba(0,0,0,0.13), 0px 9px 20px 0px rgba(0,0,0,0.11), 0px 4px 26px 0px rgba(0,0,0,0.13)',
      '0px 10px 11px -6px rgba(0,0,0,0.14), 0px 10px 22px 0px rgba(0,0,0,0.12), 0px 5px 28px 0px rgba(0,0,0,0.14)',
      '0px 11px 12px -7px rgba(0,0,0,0.15), 0px 11px 24px 0px rgba(0,0,0,0.13), 0px 6px 30px 0px rgba(0,0,0,0.15)',
      '0px 12px 13px -8px rgba(0,0,0,0.16), 0px 12px 26px 0px rgba(0,0,0,0.14), 0px 7px 32px 0px rgba(0,0,0,0.16)',
      '0px 13px 14px -8px rgba(0,0,0,0.17), 0px 13px 28px 0px rgba(0,0,0,0.15), 0px 8px 34px 0px rgba(0,0,0,0.17)',
      '0px 14px 15px -9px rgba(0,0,0,0.18), 0px 14px 30px 0px rgba(0,0,0,0.16), 0px 9px 36px 0px rgba(0,0,0,0.18)',
      '0px 15px 16px -10px rgba(0,0,0,0.19), 0px 15px 32px 0px rgba(0,0,0,0.17), 0px 10px 38px 0px rgba(0,0,0,0.19)',
      '0px 16px 17px -10px rgba(0,0,0,0.2), 0px 16px 34px 0px rgba(0,0,0,0.18), 0px 11px 40px 0px rgba(0,0,0,0.2)',
      '0px 17px 18px -11px rgba(0,0,0,0.21), 0px 17px 36px 0px rgba(0,0,0,0.19), 0px 12px 42px 0px rgba(0,0,0,0.21)',
      '0px 18px 19px -12px rgba(0,0,0,0.22), 0px 18px 38px 0px rgba(0,0,0,0.2), 0px 13px 44px 0px rgba(0,0,0,0.22)',
      '0px 19px 20px -12px rgba(0,0,0,0.23), 0px 19px 40px 0px rgba(0,0,0,0.21), 0px 14px 46px 0px rgba(0,0,0,0.23)',
      '0px 20px 21px -13px rgba(0,0,0,0.24), 0px 20px 42px 0px rgba(0,0,0,0.22), 0px 15px 48px 0px rgba(0,0,0,0.24)',
      '0px 21px 22px -14px rgba(0,0,0,0.25), 0px 21px 44px 0px rgba(0,0,0,0.23), 0px 16px 50px 0px rgba(0,0,0,0.25)',
      '0px 22px 23px -14px rgba(0,0,0,0.26), 0px 22px 46px 0px rgba(0,0,0,0.24), 0px 17px 52px 0px rgba(0,0,0,0.26)',
      '0px 23px 24px -15px rgba(0,0,0,0.27), 0px 23px 48px 0px rgba(0,0,0,0.25), 0px 18px 54px 0px rgba(0,0,0,0.27)',
      '0px 24px 25px -16px rgba(0,0,0,0.28), 0px 24px 50px 0px rgba(0,0,0,0.26), 0px 19px 56px 0px rgba(0,0,0,0.28)',
    ],
    components: {
      MuiCssBaseline: {
        styleOverrides: {
          html: {
            scrollBehavior: 'smooth',
          },
          '*, *::before, *::after': {
            margin: 0,
            padding: 0,
          },
          'a, a:link, a:visited': {
            textDecoration: 'none !important',
          },
          body: {
            backgroundColor: isDark ? '#121212' : '#F8F9FA',
            color: isDark ? '#E0E0E0' : '#333333',
          },
        },
      },
      MuiButton: {
        styleOverrides: {
          root: {
            borderRadius: 8,
            padding: '8px 16px',
            boxShadow: 'none',
            '&:hover': {
              boxShadow: isDark ? 'none' : '0px 2px 4px rgba(0, 0, 0, 0.1)',
            },
          },
          contained: {
            '&:hover': {
              boxShadow: isDark ? 'none' : '0px 2px 4px rgba(0, 0, 0, 0.2)',
            },
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            borderRadius: 12,
            boxShadow: isDark
              ? '0px 2px 8px rgba(0, 0, 0, 0.2)'
              : '0px 2px 8px rgba(0, 0, 0, 0.05)',
          },
        },
      },
      MuiPaper: {
        styleOverrides: {
          rounded: {
            borderRadius: 12,
          },
        },
      },
      MuiTextField: {
        styleOverrides: {
          root: {
            '& .MuiOutlinedInput-root': {
              borderRadius: 8,
            },
          },
        },
      },
      MuiChip: {
        styleOverrides: {
          root: {
            borderRadius: 16,
          },
        },
      },
      MuiAvatar: {
        styleOverrides: {
          root: {
            boxShadow: isDark
              ? 'none'
              : '0px 2px 4px rgba(0, 0, 0, 0.1)',
          },
        },
      },
      MuiAppBar: {
        defaultProps: {
          color: 'transparent',
        },
        styleOverrides: {
          root: {
            boxShadow: 'none',
          },
        },
      },
    },
  };

  let theme = createTheme(themeOptions);

  // Make fonts responsive
  theme = responsiveFontSizes(theme);

  return theme;
};

export default createAppTheme;
