import { createTheme } from "@mui/material/styles";

const theme = createTheme({
  palette: {
    mode: "light",
    primary: { 
      main: "#1e3a8a",
      light: "#3b5fcc",
      dark: "#1e293b"
    },
    secondary: { 
      main: "#7c3aed",
      light: "#a78bfa",
      dark: "#5b21b6"
    },
    background: { 
      default: "#f8fafc", 
      paper: "#FFFFFF" 
    },
    success: { 
      main: "#16a34a",
      light: "#22c55e",
      dark: "#15803d"
    },
    warning: { 
      main: "#ea580c",
      light: "#fb923c",
      dark: "#c2410c"
    },
    error: { 
      main: "#dc2626",
      light: "#ef4444",
      dark: "#b91c1c"
    },
    info: {
      main: "#0284c7",
      light: "#38bdf8",
      dark: "#075985"
    },
    text: { 
      primary: "#0f172a", 
      secondary: "#64748b" 
    },
    divider: "#e2e8f0",
    grey: {
      50: "#f8fafc",
      100: "#f1f5f9",
      200: "#e2e8f0",
      300: "#cbd5e1",
      400: "#94a3b8",
      500: "#64748b",
      600: "#475569",
      700: "#334155",
      800: "#1e293b",
      900: "#0f172a"
    }
  },
  typography: {
    fontFamily: "'Inter', 'Roboto', 'Helvetica', 'Arial', sans-serif",
    h1: { fontWeight: 800, letterSpacing: "-0.03em" },
    h2: { fontWeight: 800, letterSpacing: "-0.03em" },
    h3: { fontWeight: 700, letterSpacing: "-0.02em" },
    h4: { fontWeight: 700, letterSpacing: "-0.02em" },
    h5: { fontWeight: 700, letterSpacing: "-0.01em" },
    h6: { fontWeight: 600, letterSpacing: "-0.01em" },
    subtitle1: { fontWeight: 600 },
    subtitle2: { fontWeight: 600 },
    button: { fontWeight: 600, textTransform: "none" },
  },
  shape: { borderRadius: 12 },
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          backgroundImage: "none",
          border: "1px solid #e2e8f0",
          boxShadow: "0 1px 3px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.04)",
          transition: "all 0.2s ease-in-out",
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: { 
          fontWeight: 600, 
          fontSize: "0.75rem",
          letterSpacing: "0.02em"
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: "none",
          fontWeight: 600,
          borderRadius: 8,
          boxShadow: "none",
          "&:hover": {
            boxShadow: "0 2px 8px rgba(0,0,0,0.15)"
          }
        },
        contained: {
          boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
          "&:hover": {
            boxShadow: "0 4px 12px rgba(0,0,0,0.2)"
          }
        }
      }
    },
    MuiTableHead: {
      styleOverrides: {
        root: {
          "& .MuiTableCell-head": {
            backgroundColor: "#f8fafc",
            color: "#475569",
            fontWeight: 700,
            fontSize: "0.75rem",
            textTransform: "uppercase",
            letterSpacing: "0.05em",
            borderBottom: "2px solid #e2e8f0"
          },
        },
      },
    },
    MuiTableRow: {
      styleOverrides: {
        root: {
          "&:hover": {
            backgroundColor: "#f8fafc"
          }
        }
      }
    },
    MuiTableCell: {
      styleOverrides: {
        root: {
          borderBottom: "1px solid #f1f5f9"
        }
      }
    },
    MuiAccordion: {
      styleOverrides: {
        root: {
          border: "1px solid #e2e8f0",
          boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
          "&:before": { display: "none" },
          "&.Mui-expanded": {
            margin: "16px 0"
          }
        },
      },
    },
    MuiAccordionSummary: {
      styleOverrides: {
        root: {
          backgroundColor: "#f8fafc",
          fontWeight: 600,
          "&.Mui-expanded": {
            borderBottom: "1px solid #e2e8f0"
          }
        }
      }
    },
    MuiPaper: {
      styleOverrides: {
        root: { 
          backgroundImage: "none"
        },
      },
    },
    MuiAlert: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          fontWeight: 500
        },
        standardSuccess: {
          backgroundColor: "#f0fdf4",
          color: "#15803d",
          "& .MuiAlert-icon": {
            color: "#16a34a"
          }
        },
        standardError: {
          backgroundColor: "#fef2f2",
          color: "#b91c1c",
          "& .MuiAlert-icon": {
            color: "#dc2626"
          }
        },
        standardWarning: {
          backgroundColor: "#fff7ed",
          color: "#c2410c",
          "& .MuiAlert-icon": {
            color: "#ea580c"
          }
        },
        standardInfo: {
          backgroundColor: "#f0f9ff",
          color: "#075985",
          "& .MuiAlert-icon": {
            color: "#0284c7"
          }
        }
      }
    },
    MuiLinearProgress: {
      styleOverrides: {
        root: {
          borderRadius: 4,
          backgroundColor: "#e2e8f0"
        },
        bar: {
          borderRadius: 4
        }
      }
    }
  },
});

export default theme;
