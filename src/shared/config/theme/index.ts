import { extendTheme, type ThemeConfig } from "@chakra-ui/react";

// ---------------------------------------------------------------------------
// QR Badge Tizimi — Premium "Credential Console" design tokens
// Features glassmorphism, rich dark tones, gold accents, and fluid interactions
// ---------------------------------------------------------------------------

const config: ThemeConfig = {
  initialColorMode: "dark",
  useSystemColorMode: false,
};

const colors = {
  canvas: {
    900: "#090A0F",
    800: "#0D1117",
    700: "#161B22",
  },
  surface: {
    900: "rgba(22, 27, 34, 0.6)", // Glass background
    800: "rgba(27, 32, 40, 0.7)",
    700: "rgba(33, 38, 50, 0.8)",
    600: "rgba(42, 48, 61, 0.9)",
  },
  line: {
    900: "rgba(255, 255, 255, 0.06)",
    800: "rgba(255, 255, 255, 0.1)",
    700: "rgba(255, 255, 255, 0.15)",
  },
  ink: {
    900: "#FFFFFF",
    700: "#D1D5DB",
    500: "#9CA3AF",
    300: "#6B7280",
  },
  gold: {
    50: "#FDF8F0",
    200: "#F1D495",
    400: "#E3B341",
    500: "#CF9B2A",
    600: "#A87A19",
  },
  signal: {
    green: "#10B981",
    greenDim: "rgba(16, 185, 129, 0.15)",
    red: "#EF4444",
    redDim: "rgba(239, 68, 68, 0.15)",
    amber: "#F59E0B",
    amberDim: "rgba(245, 158, 11, 0.15)",
    blue: "#3B82F6",
    blueDim: "rgba(59, 130, 246, 0.15)",
  },
};

const fonts = {
  heading: "var(--font-display), 'Outfit', 'Space Grotesk', sans-serif",
  body: "var(--font-body), 'Inter', sans-serif",
  mono: "var(--font-mono), 'IBM Plex Mono', monospace",
};

const styles = {
  global: {
    "html, body": {
      background: "radial-gradient(circle at top left, #121826 0%, #090A0F 100%)",
      color: "ink.900",
      minHeight: "100vh",
    },
    ".glass-panel": {
      background: "surface.900",
      backdropFilter: "blur(12px)",
      WebkitBackdropFilter: "blur(12px)",
      border: "1px solid",
      borderColor: "line.900",
      borderRadius: "xl",
      boxShadow: "0 4px 30px rgba(0, 0, 0, 0.1)",
    },
    "*::selection": {
      background: "gold.400",
      color: "canvas.900",
    },
    "*::-webkit-scrollbar": { width: "8px", height: "8px" },
    "*::-webkit-scrollbar-track": { background: "transparent" },
    "*::-webkit-scrollbar-thumb": {
      background: "line.700",
      borderRadius: "8px",
    },
    "*::-webkit-scrollbar-thumb:hover": {
      background: "ink.500",
    },
  },
};

const components = {
  Button: {
    baseStyle: {
      fontWeight: "500",
      borderRadius: "8px",
      letterSpacing: "0.02em",
      transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
    },
    variants: {
      solid: {
        bg: "gold.400",
        color: "canvas.900",
        boxShadow: "0 0 15px rgba(227, 179, 65, 0.15)",
        _hover: { 
          bg: "gold.200", 
          transform: "translateY(-1px)",
          boxShadow: "0 4px 20px rgba(227, 179, 65, 0.3)",
          _disabled: { bg: "gold.400", transform: "none", boxShadow: "none" } 
        },
        _active: { bg: "gold.500", transform: "translateY(0)" },
      },
      outline: {
        borderColor: "line.800",
        color: "ink.900",
        backdropFilter: "blur(4px)",
        _hover: { bg: "surface.700", borderColor: "line.700" },
      },
      ghost: {
        color: "ink.700",
        _hover: { bg: "surface.700", color: "ink.900" },
      },
      danger: {
        bg: "signal.redDim",
        color: "signal.red",
        border: "1px solid",
        borderColor: "rgba(239, 68, 68, 0.3)",
        _hover: { 
          bg: "signal.red", 
          color: "white",
          boxShadow: "0 0 20px rgba(239, 68, 68, 0.4)",
        },
      },
    },
  },
  Input: {
    variants: {
      outline: {
        field: {
          bg: "canvas.800",
          borderColor: "line.800",
          _hover: { borderColor: "line.700" },
          _focus: { borderColor: "gold.400", boxShadow: "0 0 0 1px #E3B341" },
        }
      }
    },
    defaultProps: {
      focusBorderColor: "gold.400"
    }
  },
  Select: {
    variants: {
      outline: {
        field: {
          bg: "canvas.800",
          borderColor: "line.800",
          _hover: { borderColor: "line.700" },
          _focus: { borderColor: "gold.400", boxShadow: "0 0 0 1px #E3B341" },
        }
      }
    }
  },
  Badge: {
    baseStyle: {
      borderRadius: "6px",
      textTransform: "none",
      fontWeight: "500",
      letterSpacing: "0.01em",
      px: 2.5,
      py: 1,
    },
  },
  Table: {
    variants: {
      console: {
        table: { borderCollapse: "separate", borderSpacing: 0 },
        th: {
          borderBottom: "1px solid",
          borderColor: "line.800",
          color: "ink.500",
          textTransform: "uppercase",
          fontSize: "11px",
          letterSpacing: "0.08em",
          fontWeight: "600",
          bg: "surface.900",
          backdropFilter: "blur(8px)",
        },
        td: {
          borderBottom: "1px solid",
          borderColor: "line.900",
          color: "ink.900",
          fontSize: "14px",
          transition: "background 0.2s",
        },
        tr: {
          _hover: {
            td: {
              bg: "surface.800"
            }
          }
        }
      },
    },
    defaultProps: { variant: "console" },
  },
  Modal: {
    baseStyle: {
      dialog: {
        bg: "surface.900",
        backdropFilter: "blur(16px)",
        border: "1px solid",
        borderColor: "line.800",
        borderRadius: "xl",
        boxShadow: "0 20px 40px rgba(0, 0, 0, 0.4)",
      }
    }
  },
  Drawer: {
    baseStyle: {
      dialog: {
        bg: "surface.900",
        backdropFilter: "blur(16px)",
        borderLeft: "1px solid",
        borderColor: "line.800",
      }
    }
  }
};

const theme = extendTheme({
  config,
  colors,
  fonts,
  styles,
  components,
  shadows: {
    panel: "0 4px 20px rgba(0,0,0,0.2)",
    focus: "0 0 0 2px rgba(227, 179, 65, 0.6)",
  },
  radii: {
    sm: "6px",
    md: "8px",
    lg: "12px",
    xl: "16px",
  },
});

export default theme;
