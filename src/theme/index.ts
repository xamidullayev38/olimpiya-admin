import { extendTheme, type ThemeConfig } from "@chakra-ui/react";

// ---------------------------------------------------------------------------
// QR Badge Tizimi — "Credential Console" design tokens
//
// Direction: this is an operations console for accreditation staff and
// security checkpoints during a live event — not a marketing surface.
// It borrows its palette and materials from the badges themselves: a
// graphite control-room base, a credential-gold accent (the metallic
// foil you'd see on an accreditation card), and the hard green/red signal
// colors used on real turnstile & access-control displays.
// ---------------------------------------------------------------------------

const config: ThemeConfig = {
  initialColorMode: "dark",
  useSystemColorMode: false,
};

const colors = {
  canvas: {
    900: "#0E1015",
    800: "#12151B",
    700: "#171B22",
  },
  surface: {
    900: "#171B22",
    800: "#1B2028",
    700: "#212632",
    600: "#2A303D",
  },
  line: {
    900: "#252B37",
    800: "#2E3543",
    700: "#3A4254",
  },
  ink: {
    900: "#F2F4F8",
    700: "#C7CEDA",
    500: "#8D96A8",
    300: "#5C6577",
  },
  gold: {
    50: "#FBF3E2",
    200: "#EAC988",
    400: "#D4A853",
    500: "#C1953F",
    600: "#9C7830",
  },
  signal: {
    green: "#3FB67F",
    greenDim: "#1E3B2F",
    red: "#E5484D",
    redDim: "#3E2124",
    amber: "#E8A23D",
    amberDim: "#3D3120",
    blue: "#4C8DFF",
    blueDim: "#1C2A47",
  },
};

const fonts = {
  heading: "var(--font-display), 'Space Grotesk', sans-serif",
  body: "var(--font-body), 'Inter', sans-serif",
  mono: "var(--font-mono), 'IBM Plex Mono', monospace",
};

const styles = {
  global: {
    "html, body": {
      background: "canvas.800",
      color: "ink.900",
    },
    "*::selection": {
      background: "gold.400",
      color: "canvas.900",
    },
    "*::-webkit-scrollbar": { width: "10px", height: "10px" },
    "*::-webkit-scrollbar-track": { background: "transparent" },
    "*::-webkit-scrollbar-thumb": {
      background: "line.700",
      borderRadius: "8px",
    },
  },
};

const components = {
  Button: {
    baseStyle: {
      fontWeight: "600",
      borderRadius: "6px",
      letterSpacing: "0.01em",
    },
    variants: {
      solid: {
        bg: "gold.400",
        color: "canvas.900",
        _hover: { bg: "gold.200", _disabled: { bg: "gold.400" } },
        _active: { bg: "gold.500" },
      },
      outline: {
        borderColor: "line.700",
        color: "ink.900",
        _hover: { bg: "surface.700" },
      },
      ghost: {
        color: "ink.700",
        _hover: { bg: "surface.700", color: "ink.900" },
      },
      danger: {
        bg: "signal.redDim",
        color: "signal.red",
        border: "1px solid",
        borderColor: "signal.red",
        _hover: { bg: "signal.red", color: "canvas.900" },
      },
    },
  },
  Badge: {
    baseStyle: {
      borderRadius: "4px",
      textTransform: "none",
      fontWeight: "600",
      letterSpacing: "0.02em",
    },
  },
  Table: {
    variants: {
      console: {
        table: { borderCollapse: "separate", borderSpacing: 0 },
        th: {
          borderBottom: "1px solid",
          borderColor: "line.900",
          color: "ink.500",
          textTransform: "uppercase",
          fontSize: "11px",
          letterSpacing: "0.08em",
          fontWeight: "600",
          bg: "surface.900",
        },
        td: {
          borderBottom: "1px solid",
          borderColor: "line.900",
          color: "ink.700",
          fontSize: "14px",
        },
      },
    },
    defaultProps: { variant: "console" },
  },
};

const theme = extendTheme({
  config,
  colors,
  fonts,
  styles,
  components,
  shadows: {
    panel: "0 1px 0 rgba(0,0,0,0.4)",
    focus: "0 0 0 2px #D4A853",
  },
  radii: {
    sm: "4px",
    md: "6px",
    lg: "10px",
  },
});

export default theme;
