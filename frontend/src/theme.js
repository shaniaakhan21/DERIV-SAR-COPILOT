import { createTheme } from "@mui/material/styles";

const C = {
  bgMain:     "#0A0B0F",
  bgCard:     "#111118",
  bgElevated: "#17171F",
  bgSurface:  "#0D0E14",
  orange:       "#F97316",
  orangeLight:  "#FB923C",
  orangeDark:   "#EA580C",
  red:        "#E53935",
  redLight:   "#EF5350",
  amber:      "#FFB300",
  amberLight: "#FFD54F",
  green:      "#00C853",
  greenLight: "#69F0AE",
  purple:     "#7C3AED",
  purpleLight:"#A78BFA",
  textPrimary:   "#F1F5F9",
  textSecondary: "#94A3B8",
  textMuted:     "#475569",
  border:        "rgba(255,255,255,0.06)",
  borderStrong:  "rgba(255,255,255,0.12)",
};

const theme = createTheme({
  palette: {
    mode: "dark",
    primary:   { main: C.orange,   light: C.orangeLight,   dark: C.orangeDark  },
    secondary: { main: C.purple, light: C.purpleLight,  dark: "#5B21B6"  },
    background:{ default: C.bgMain, paper: C.bgCard },
    error:     { main: C.red,   light: C.redLight,   dark: "#B71C1C" },
    warning:   { main: C.amber, light: C.amberLight, dark: "#E65100" },
    success:   { main: C.green, light: C.greenLight, dark: "#00701A" },
    info:      { main: C.orange,  light: C.orangeLight,  dark: C.orangeDark },
    text: {
      primary:   C.textPrimary,
      secondary: C.textSecondary,
      disabled:  C.textMuted,
    },
    divider: C.border,
    grey: {
      50:  "#141418",
      100: "#17171F",
      200: "#1C1C26",
      300: "#2A2A38",
      400: "#475569",
      500: "#64748b",
      600: "#94a3b8",
      700: "#cbd5e1",
      800: "#e2e8f0",
      900: "#f1f5f9",
    },
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
    button:    { fontWeight: 600, textTransform: "none" },
  },

  shape: { borderRadius: 6 },

  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: { backgroundColor: C.bgMain, backgroundImage: "none" },
      },
    },

    MuiCard: {
      styleOverrides: {
        root: {
          backgroundImage: "none",
          backgroundColor: C.bgCard,
          border: `1px solid ${C.border}`,
          boxShadow: "0 1px 3px rgba(0,0,0,0.4)",
          transition: "transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease",
          "&:hover": {
            transform: "translateY(-2px)",
            boxShadow: "0 8px 24px rgba(0,0,0,0.5)",
            borderColor: C.borderStrong,
          },
        },
      },
    },

    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: "none",
          backgroundColor: C.bgCard,
        },
      },
    },

    MuiAppBar: {
      styleOverrides: {
        root: { backgroundImage: "none" },
      },
    },

    MuiChip: {
      styleOverrides: {
        root: {
          fontWeight: 600,
          fontSize: "0.72rem",
          letterSpacing: "0.02em",
          borderRadius: 4,
        },
      },
    },

    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: "none",
          fontWeight: 600,
          borderRadius: 6,
          boxShadow: "none",
          "&:hover": { boxShadow: "none" },
        },
        contained: {
          "&:hover": { boxShadow: "0 4px 12px rgba(249,115,22,0.3)" },
        },
        containedPrimary: {
          background: C.orange,
          color: "#fff",
          "&:hover": { background: C.orangeLight },
        },
        outlinedPrimary: {
          borderColor: `rgba(249,115,22,0.4)`,
          color: C.orange,
          "&:hover": {
            borderColor: C.orange,
            background: "rgba(249,115,22,0.08)",
          },
        },
      },
    },

    MuiTableHead: {
      styleOverrides: {
        root: {
          "& .MuiTableCell-head": {
            backgroundColor: C.bgSurface,
            color: C.textMuted,
            fontWeight: 600,
            fontSize: "0.65rem",
            textTransform: "uppercase",
            letterSpacing: "0.08em",
            borderBottom: `1px solid ${C.border}`,
            whiteSpace: "nowrap",
          },
        },
      },
    },

    MuiTableRow: {
      styleOverrides: {
        root: {
          "&:nth-of-type(even)": {
            backgroundColor: "rgba(255,255,255,0.015)",
          },
          "&:hover": {
            backgroundColor: "rgba(249,115,22,0.05) !important",
            cursor: "pointer",
          },
          transition: "background-color 0.12s ease",
        },
      },
    },

    MuiTableCell: {
      styleOverrides: {
        root: {
          borderBottom: `1px solid ${C.border}`,
          color: C.textSecondary,
          fontSize: "0.82rem",
          padding: "10px 14px",
        },
      },
    },

    MuiTableContainer: {
      styleOverrides: {
        root: { backgroundColor: C.bgCard },
      },
    },

    MuiAccordion: {
      styleOverrides: {
        root: {
          backgroundColor: C.bgCard,
          border: `1px solid ${C.border}`,
          boxShadow: "none",
          "&:before": { display: "none" },
          "&.Mui-expanded": { margin: "8px 0" },
        },
      },
    },

    MuiAccordionSummary: {
      styleOverrides: {
        root: {
          backgroundColor: C.bgElevated,
          fontWeight: 600,
          minHeight: 48,
          "&.Mui-expanded": {
            borderBottom: `1px solid ${C.border}`,
            minHeight: 48,
          },
        },
      },
    },

    MuiAccordionDetails: {
      styleOverrides: {
        root: { backgroundColor: C.bgCard },
      },
    },

    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          backgroundColor: C.bgElevated,
          "& .MuiOutlinedInput-notchedOutline": {
            borderColor: C.border,
          },
          "&:hover .MuiOutlinedInput-notchedOutline": {
            borderColor: C.borderStrong,
          },
          "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
            borderColor: C.orange,
          },
          color: C.textPrimary,
        },
      },
    },

    MuiInputLabel: {
      styleOverrides: {
        root: { color: C.textMuted, fontSize: "0.82rem" },
      },
    },

    MuiSlider: {
      styleOverrides: {
        root: { color: C.orange },
        rail: { backgroundColor: C.border, opacity: 1 },
        track: { backgroundColor: C.orange },
        thumb: {
          backgroundColor: C.orange,
          boxShadow: `0 0 0 4px rgba(249,115,22,0.16)`,
        },
      },
    },

    MuiDivider: {
      styleOverrides: {
        root: { borderColor: C.border },
      },
    },

    MuiAlert: {
      styleOverrides: {
        root: { borderRadius: 6, fontWeight: 500, fontSize: "0.82rem" },
        standardError:   { backgroundColor: "rgba(229,57,53,0.08)",  color: C.redLight,   border: `1px solid rgba(229,57,53,0.2)`  },
        standardWarning: { backgroundColor: "rgba(255,179,0,0.08)",  color: C.amberLight, border: `1px solid rgba(255,179,0,0.2)`  },
        standardSuccess: { backgroundColor: "rgba(0,200,83,0.08)",   color: C.greenLight, border: `1px solid rgba(0,200,83,0.2)`   },
        standardInfo:    { backgroundColor: "rgba(249,115,22,0.08)", color: C.orangeLight,  border: `1px solid rgba(249,115,22,0.2)` },
        outlinedError:   { borderColor: "rgba(229,57,53,0.3)",  color: C.redLight   },
        outlinedWarning: { borderColor: "rgba(255,179,0,0.3)",  color: C.amberLight },
        outlinedSuccess: { borderColor: "rgba(0,200,83,0.3)",   color: C.greenLight },
        outlinedInfo:    { borderColor: "rgba(249,115,22,0.3)", color: C.orangeLight  },
        filledError:     { backgroundColor: C.red   },
        filledSuccess:   { backgroundColor: "#00701A" },
      },
    },

    MuiLinearProgress: {
      styleOverrides: {
        root: { borderRadius: 4, backgroundColor: C.border },
        bar:  { borderRadius: 4 },
      },
    },

    MuiToggleButton: {
      styleOverrides: {
        root: {
          color: C.textSecondary,
          borderColor: C.border,
          backgroundColor: C.bgElevated,
          fontSize: "0.78rem",
          fontWeight: 600,
          padding: "5px 14px",
          "&.Mui-selected": {
            backgroundColor: C.orange,
            color: "#fff",
            borderColor: C.orange,
            "&:hover": { backgroundColor: C.orangeLight },
          },
          "&:hover": { backgroundColor: "rgba(249,115,22,0.1)" },
        },
      },
    },

    MuiTab: {
      styleOverrides: {
        root: {
          color: C.textMuted,
          fontWeight: 600,
          fontSize: "0.82rem",
          textTransform: "none",
          minHeight: 44,
          padding: "10px 16px",
          "&.Mui-selected": { color: C.orange },
        },
      },
    },

    MuiTabs: {
      styleOverrides: {
        root: { minHeight: 44 },
        indicator: { backgroundColor: C.orange, height: 2, borderRadius: 1 },
      },
    },

    MuiTooltip: {
      styleOverrides: {
        tooltip: {
          backgroundColor: C.bgElevated,
          border: `1px solid ${C.borderStrong}`,
          color: C.textPrimary,
          fontSize: "0.72rem",
          borderRadius: 4,
        },
        arrow: { color: C.bgElevated },
      },
    },

    MuiSnackbar: {
      styleOverrides: {
        root: { top: "60px !important" },
      },
    },

    MuiSkeleton: {
      styleOverrides: {
        root: { backgroundColor: "rgba(255,255,255,0.06)" },
      },
    },
  },
});

export default theme;
